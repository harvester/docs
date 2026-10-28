---
id: installing-additional-software
sidebar_position: 15
sidebar_label: Installing Additional Software
title: "Installing Additional Software"
Description: How to install additional software packages and kernel modules
---

<head>
  <link rel="canonical" href="https://docs.harvesterhci.io/v1.9/advanced/installing-additional-software"/>
</head>

Harvester uses an immutable operating system that prevents direct modifications to the core system image outside designated configuration directories. This architecture enhances security and stability while providing built-in tools such as `k9s` to support common administrative and diagnostic tasks within a minimal, stable footprint.

However, some circumstances require usage or installation of additional software:

- Specialized utilities: Diagnostic, monitoring, or alerting tools for site-specific needs.
- Hardware support: Custom kernel modules for network interfaces, storage solutions, and other hardware.
- Storage integration: Supplementary packages required by third-party CSI storage drivers.

Whenever possible, run additional software inside a container. This approach requires no changes to Harvester’s immutable operating system image and allows the software to be managed independently of Harvester's standard installation and upgrade process.

## General Diagnostic, Monitoring, and Alerting Tools

Harvester provides add-ons for logging, monitoring, and alerting using Prometheus, Grafana, and Alertmanager. For setup instructions, see [Logging](../logging/harvester-logging.md) and [Monitoring](../monitoring/harvester-monitoring.md).

If you require additional tools beyond these add-ons, run them inside a container.

- Deployment: Select tools that offer native Kubernetes manifests or Helm charts for easy deployment. If official images are unavailable, build a custom container image.
- Interactive utilities: Create a [toolbox container](https://harvesterhci.io/kb/package_your_own_toolbox_image/) containing the required utilities. Building from the [SUSE Linux BCI 16.0 Base Container Image](https://registry.suse.com/repositories/bci-bci-base-16-0) provides access to the free `SLE_BCI` repository, which includes up-to-date packages from SUSE Linux Enterprise Server.

## Building Kernel Modules

Starting with Harvester v1.9.0, you can use the [`rancher/harvester-kernel-module-devel`](https://hub.docker.com/r/rancher/harvester-kernel-module-devel/tags) container image to build kernel modules for Harvester's specific Linux kernel version. This image includes the complete kernel source, GCC, and essential build tools. It also provides access to the free `SLE_BCI` software repository if your build process requires additional dependencies.


To determine the correct image tag, check the `osImage` field in `/etc/harvester-release.yaml` on a Harvester host. The following example shows the image tag for Harvester v1.9.0-rc6. To build kernel modules for this version, use the matching image: [rancher/harvester-kernel-module-devel:v1.9-20260819](https://hub.docker.com/layers/rancher/harvester-kernel-module-devel/v1.9-20260819).

```
# yq .osImage /etc/harvester-release.yaml
rancher/harvester-os:v1.9-20260819
```

### Building and Loading Out-of-Tree Kernel Modules at Runtime

To build out-of-tree kernel modules, configure a DaemonSet that compiles the required modules in an `initContainer` and loads them using `modprobe`. The following example demonstrates this concept using DRBD source code from [LINBIT](https://linbit.com):

```yaml
apiVersion: apps/v1
kind: DaemonSet
metadata:
  name: drbd-builder
spec:
  selector:
    matchLabels:
      app.kubernetes.io/name: drbd-builder
  template:
    metadata:
      labels:
        app.kubernetes.io/name: drbd-builder
    spec:
      containers:
      - name: pause
        image: registry.k8s.io/pause
      initContainers:
      - name: builder
        image: rancher/harvester-kernel-module-devel:v1.9-20260819
        securityContext:
          privileged: true
        command:
        - sh
        - -c
        - |
          if lsmod | grep -q '^drbd' ; then
              echo "drbd kernel module is already loaded"
              exit 0
          fi
          curl -Lsf -o - https://pkg.linbit.com/downloads/drbd/9/drbd-9.3.3.tar.gz | tar -xzf -
          cd drbd-9.3.3/
          make -C drbd all KDIR=/usr/src/linux
          modprobe --allow-unsupported ./drbd/build-current/drbd.ko && echo "drbd module loaded"
```

When upgrading Harvester, update the `builder` container image tag to match the new Harvester operating system image.

### Building Kernel Modules for System Boot

The following example uses DRBD source code from [LINBIT](https://linbit.com):

1. Build the kernel module inside an interactive container using the image tag that matches your Harvester version.

   ```
   > docker run --rm -it --name drbd-builder rancher/harvester-kernel-module-devel:v1.9-20260819
   # curl -Lsf -o - https://pkg.linbit.com/downloads/drbd/9/drbd-9.3.3.tar.gz | tar -xzf -
   # cd drbd-9.3.3/
   # make -C drbd all KDIR=/usr/src/linux
   ```

1. In a separate terminal on your host, copy the compiled module binary out of the running container.

   ```
   > docker cp drbd-builder:/drbd-9.3.3/drbd/build-current/drbd.ko .
   ```

1. Copy the kernel module binary to `/var/lib/third-party/` on each Harvester node.

1. To load the module at boot time, create a CloudInit custom resource similar to the following:

   ```yaml
   apiVersion: node.harvesterhci.io/v1beta1
   kind: CloudInit
   metadata:
     name: drbd-loader
   spec:
     matchSelector:
       harvesterhci.io/managed: "true"
     filename: 99_drbd_loader
     contents: |
       stages:
         initramfs:
           - name: "load drbd.ko"
             commands:
             - modprobe --allow-unsupported /var/lib/third-party/drbd.ko
   ```

:::note

When upgrading Harvester, you must rebuild the module against the new kernel version and copy it to each host again.

:::

### Building and Loading In-Tree Kernel Modules

Because the complete kernel source is included in [rancher/harvester-kernel-module-devel](https://hub.docker.com/r/rancher/harvester-kernel-module-devel/tags), you can build and load any in-tree kernel module using either of the previously outlined methods.

### Secure Boot / Module Signing

On hosts with Secure Boot enabled, kernel modules must be digitally signed before they can be loaded, and the public certificate must be enrolled in the host's Machine Owner Key (MOK) trust store.

1. Generate a signing key and certificate with the following command:
   ```
   openssl req -x509 -new -nodes -utf8 -sha256 -days 36500 -batch -outform DER \
       -out signing_key.x509 -keyout signing_key.pem -config - <<EOF
   [ req ]
   default_bits = 4096
   distinguished_name = req_distinguished_name
   prompt = no
   string_mask = utf8only
   x509_extensions = myexts
   [ req_distinguished_name ]
   # update the below as desired for your site
   #O = Unspecified company
   CN = My kernel module signing key
   #emailAddress = unspecified.user@unspecified.company
   [ myexts ]
   basicConstraints=critical,CA:FALSE
   keyUsage=digitalSignature
   subjectKeyIdentifier=hash
   authorityKeyIdentifier=keyid
   extendedKeyUsage=codeSigning
   EOF
   ```

   :::info important

    Keep the private key (`signing_key.pem`) secure. Do not store unencrypted private keys on general-purpose Harvester hosts.

   :::

1. Sign each kernel module by running the following command inside the `rancher/harvester-kernel-module-devel` image.

   ```
   # /usr/src/linux/scripts/sign-file sha256 /path/to/signing_key.pem /path/to/signing_key.x509 /path/to/module/to/be/signed.ko
   ```

   Unsigned modules will fail to load with an error similar to the following:
   ```
   # modprobe --allow-unsupported ./drbd.ko
   modprobe: ERROR: could not insert 'drbd': Key was rejected by service
   # dmesg|tail
   [  625.228390] [  T51097] Loading of unsigned module is rejected
   ```

1. Load the public certificate (`signing_key.x509`) onto every host that requires the signed modules.

   ```
   # mokutil --import /root/signing_key.x509
   input password:
   input password again:
   ```

1. Reboot the host and access the console.

1. When prompted during startup, select **Perform MOK Management** and follow the prompts to enroll the key.

:::note

If you are building modules using a DaemonSet and the `rancher/harvester-kernel-module-devel` image, consider storing signing keys as Kubernetes secrets, similar to the approach used by the [Piraeus Datastore project](https://piraeus.io/docs/v2.11.0/how-to/secure-boot/). Note that manual MOK enrollment on each host is required by Secure Boot architecture.

:::

## Installing Packages During Installation and Upgrades

If necessary, you can install software packages directly into Harvester's operating system image. However, this can only occur during initial system installation or system upgrades, not on an ad-hoc basis.

This capability is provided by the Elemental Toolkit's [`after-install-chroot` and `after-upgrade chroot` stages](https://rancher.github.io/elemental-toolkit/docs/customizing/runtime_persistent_changes/). You will typically define identical command sets in both stages.

When the operating system image is written to disk during initial installation, the `after-install-chroot` stage executes commands while the file system is still writable. Because upgrades replace the operating system image completely, any modifications made during initial installation are lost. To retain your custom packages across updates, the same commands must be executed during the `after-upgrade-chroot` stage.

:::info important

- Command failures in these stages are logged but do not abort the installation or upgrade. Always check system logs after an installation or upgrade for errors following `Running after-install-chroot hook` or `Running after-upgrade-chroot hook`.
- Successful command outputs are not logged.
- DNS resolution is unavailable during the `after-install-chroot` and `after-upgrade-chroot` stages. If you need domain name access to fetch packages, create a temporary `/etc/resolv.conf` file before downloading (`echo nameserver '8.8.8.8' > /etc/resolv.conf`) and remove it afterward (`rm -f /etc/resolv.conf`).

:::

### Using the `after-install-chroot` Stage

To install additional software during initial installation, you must add specific commands to the configuration file using the [`os.after_install_chroot_commands`](../install/harvester-configuration.md#osafter_install_chroot_commands) setting. The required commands depend on the software you are installing. For example, a standalone RPM package can be installed using `rpm -ivh <RPM_URL>`.

Harvester's operating system is built on SUSE Linux Micro 6.2, which shares the same codebase as SUSE Linux Enterprise (SLE) 16.0. Packages built for SLE 16.0 are compatible and can be installed from the free `SLE-BCI/16.0` repository. For example, you can install the `bzip2` package using the following configuration:

```yaml
os:
  after_install_chroot_commands:
    # configure temporary nameserver
    - echo 'nameserver 8.8.8.8' > /etc/resolv.conf
    # add free SLE-BCI/16.0 software repository
    - zypper -n ar --refresh --gpgcheck --priority 100 --enable 'https://public-dl.suse.com/SUSE/Products/SLE-BCI/16.0/$basearch/product/' SLE_BCI
    # refresh repo and import GPG keys
    - zypper -n --gpg-auto-import-keys ref
    # install required packages
    - zypper -n in bzip2
    # cleanup (remove software repo added above)
    - zypper rr 1
    # cleanup (remove temporary nameserver)
    - rm -f /etc/resolv.conf
```

### Using the `after-upgrade-chroot` Stage

To install additional software during upgrades, add specific commands to the `after-upgrade-chroot` stage of a [CloudInit CR](cloudinitcrd.md).

As with `after-install-chroot`, the required commands depend on the specific software you are installing. Additionally, you must consider the target operating system version. Harvester v1.8.x and v1.9.x are based on SUSE Linux Micro 6.2, which shares the same codebase as SUSE Linux Enterprise (SLE) 16.0. Because future Harvester releases will update the underlying SLE base, verify operating system compatibility before upgrading.

Using the previous `os.after_install_chroot_commands` example as a base, you can structure the complementary `after-upgrade-chroot` CloudInit manifest as follows:

```yaml
apiVersion: node.harvesterhci.io/v1beta1
kind: CloudInit
metadata:
  name: upgrade-install-pkg
spec:
  matchSelector:
    harvesterhci.io/managed: "true"
  filename: 91_upgrade_install_pkg
  contents: |
    stages:
      after-upgrade-chroot:
        - name: "Run after-upgrade-chroot commands"
          commands:
          # configure temporary nameserver
          - echo 'nameserver 8.8.8.8' > /etc/resolv.conf
          # add free SLE-BCI/16.0 software repository
          - zypper -n ar --refresh --gpgcheck --priority 100 --enable 'https://public-dl.suse.com/SUSE/Products/SLE-BCI/16.0/$basearch/product/' SLE_BCI
          # refresh repo and import GPG keys
          - zypper -n --gpg-auto-import-keys ref
          # install required packages
          - zypper -n in bzip2
          # cleanup (remove software repo added above)
          - zypper rr 1
          # cleanup (remove temporary nameserver)
          - rm -f /etc/resolv.conf
```
