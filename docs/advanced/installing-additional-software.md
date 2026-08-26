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

Harvester's operating system is immutable, which means that aside from certain configuration directories, the contents of the OS image can't ordinarily be changed. This enhances system security and stability. The operating system image includes all the dependencies necessary for Harvester to function, along with other useful administrative tools such as `k9s`. The tools included are intended to help most people with most common administrative and diagnostic tasks, while keeping a reasonably small and stable footprint.

There are however some circumstances in which it may be desirable or necessary to use or install additional software. There are three broad areas here:

1. Additional diagnostic, utilitiy, monitoring or alerting tools are required for site-specific reasons.
2. Additional kernel modules are required to support certain hardware, e.g. network interfaces or storage systems.
3. Additional software packages must be installed in order to use third-party CSI storage drivers.

In general, for any additional software, the recommened option is to run that software inside a container. This means no changes are required to Harvester's operating system image, and that additional software can be managed separately to Harvester's regular upgrade and installation process.

### General Diagnostic, Utility, Monitoring and Alerting Tools

Harvester provides add-ons for logging, and for monitoring and alerting using Prometheus, Grafana and Alertmanager. For details on how to enable and configure these add-ons, see:

* [rancher-logging](../logging/harvester-logging.md)
* [rancher-monitoring](../monitoring/harvester-monitoring.md)

If additional monitoring and alerting tools are required beyond the above, it is strongly recommened they be run containerized. Prefer tools that are easy to install in Kubernetes by applying a manifest or helm chart. If container images aren't published for the tool you need, consider creating your own container images for those tools.

For additional interactive utilities, it is recommended to [make a toolbox container](https://harvesterhci.io/kb/package_your_own_toolbox_image/) which includes the necessary software. If you start with the [SUSE Linux BCI 16.0 Base Container Image](https://registry.suse.com/repositories/bci-bci-base-16-0) you'll have access to the free `SLE_BCI` software repository which provides the latest versions of a subset of packages from SUSE Linux Enterprise Server.

### Building and Installing Kernel Modules

Starting with Harvester v1.9.0, the [rancher/harvester-kernel-module-devel](https://hub.docker.com/r/rancher/harvester-kernel-module-devel/tags) container image can be used to build kernel modules against the exact version of the Linux kernel included in Harvester's operating system image. This image includes the complete kernel source, gcc and other build tools, and also has access to the free `SLE_BCI` software repository in case any additional tools need to be installed inside that container for build purposes.


To determine the correct image tag to use, check the `osRelease` field in `/etc/harvester-release.yaml` on a Harvester host. For example, in Harvester v1.9.0-rc6, we see the following:

```
# yq .osImage /etc/harvester-release.yaml 
rancher/harvester-os:v1.9-20260819
```

This means to build kernel modules for Harvester v1.9.0-rc6, we should should use the [rancher/harvester-kernel-module-devel:v1.9-20260819](https://hub.docker.com/layers/rancher/harvester-kernel-module-devel/v1.9-20260819) image.

#### Building And Loading Out-of-Tree Kernel Modules At Runtime

For building out-of-tree kernel modules, the recommended approach is to configure a DaemonSet that builds the required modules, then runs `modprobe` to load them after they are built. Here's an example of the general concept with DRBD source downloaded from linbit.com:

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
````

When upgrading to a newer version of Harvester, the `image` tag above will need to be updated to match the newer Harvester OS image.

#### Building Kernel Modules In Advance to be Loaded During System Boot

Using DRBD as an example again, start by building the kernel module. Be sure to use the correct image tag for your Harvester version:

```
> docker run --rm -it --name drbd-builder rancher/harvester-kernel-module-devel:v1.9-20260819
# curl -Lsf -o - https://pkg.linbit.com/downloads/drbd/9/drbd-9.3.3.tar.gz | tar -xzf -
# cd drbd-9.3.3/
# make -C drbd all KDIR=/usr/src/linux
```

Then, in another terminal, copy the module binary out of the container:

```
> docker cp drbd-builder:/drbd-9.3.3/drbd/build-current/drbd.ko .
```

From there, the kernel module can be copied to `/var/lib/third-party/` on each Harvester node, then loaded at boot time by adding a [CloudInit CR](cloudinitcrd.md) similar to the following:

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

In this case, Harvester upgrades would require re-building and re-copying the module to each host.

#### Building and Loading In-Tree Kernel Modules

As the complete kernel source is included in [rancher/harvester-kernel-module-devel](https://hub.docker.com/r/rancher/harvester-kernel-module-devel/tags), any desired in-tree kernel module can also be built and loaded using either of the above techniques.

#### Secure Boot / Module Signing

On hosts with secure boot enabled, kernel modules must be digially signed in order to load, and the signing key's certificate needs to be loaded into the host's trust store. Without this, you will see errors similar to the following:

```
# modprobe --allow-unsupported ./drbd.ko
modprobe: ERROR: could not insert 'drbd': Key was rejected by service

# dmesg|tail
[  625.228390] [  T51097] Loading of unsigned module is rejected
```

A signing key and certificate can be generated with the following command:

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

The private key `signing_key.pem` must be kept secure. Do not leave it lying around on random Harvester hosts.

The certificate `signing_key.x509` needs to be loaded onto every host that will be loading your signed modules. Run the following command:

```
# mokutil --import /root/signing_key.x509
input password:
input password again:
```

Then reboot, access the console, and when prompted select "Perform MOK Management" and go through the prompts to import the key.

Kernel modules can be signed by running the following command from inside the `rancher/harvester-kernel-module-devel` image:

```
# /usr/src/linux/scripts/sign-file sha256 /path/to/signing_key.pem /path/to/signing_key.x509 /path/to/module/to/be/signed.ko
```

The Piraeus Datastore project has a clever way of using Kubernetes secrets to pass signing keys to a module loader (see https://piraeus.io/docs/v2.11.0/how-to/secure-boot/). A similar approach could be used in general for anyone building kernel modules using a DaemonSet and our `rancher/harvester-kernel-module-devel` image. The manual step to enrol the MOK remains necessary on each node (this is unavoidable due to the nature of secure boot).

### Installing RPMs or Other Binaries During System Installation and Upgrade

If necessary, it is possible to install software packages into Harvester's operating system image, but this can only be done during initial system install, and during system upgrade - it cannot be done on an ad-hoc basis.

This is facilitated by Elemental Toolkit's [after-install-chroot and after-upgrade chroot stages](https://rancher.github.io/elemental-toolkit/docs/customizing/runtime_persistent_changes/). During initial installation, when the OS image is being written to the system disk, the `after-install-chroot` stage runs, and any command executed in this stage will be applied to the OS image while it's still in a writable state.

When you later upgrade to a newer version of Harvester, when the new upgraded OS image is being written, the changes made during original installation are lost. To apply commands to the OS image during upgrade, you need to use the `after-upgrade-chroot` stage.

You will thus usually need to use a similar set of commands in both the `after-install-chroot` and `after-upgrade-chroot` stages.

:::caution

- If any commands run in these stages fail, their output will be logged, but this will _not_ abort the installation or upgrade. Always check the logs after installation or upgrade to ensure there were no errors following "Running after-install-chroot hook" or "Running after-upgrade-chroot hook".
- Output of successful commands will _not_ be logged.
- DNS resolution is unavailable in the `after-install-chroot` and `after-upgrade-chroot` stages. If you need to access a domain name to install a package using a URL, create a temporary `/etc/resolv.conf` file first, for example `echo nameserver '8.8.8.8' > /etc/resolv.conf`, then later `rm -f /etc/resolv.conf`.

:::

#### Using the `after-install-chroot` Stage

To install additional software during initial system installation, you need to add a set of commands via the [`os.after_install_chroot_commands`](../install/harvester-configuration.md#osafter_install_chroot_commands) configuration file option.

The exact commands to use will depend on the software you need to install. For example, an individual RPM can be installed with `rpm -ivh <the url of rpm package>`.

Starting with Harvester v1.8.0, Harvester's operating system is built on SL Micro 6.2, which shares the same codebase as SUSE Linux Enterprise Server 16.0. This means that any packages built for SLE 16.0 will be compatible, and it's possible to install additional packages from the free `SLE-BCI/16.0` repository. For example, if the `bzip2` package was required, the following configuration could be used:

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

#### Using the `after-upgrade-chroot` Stage

To install additional software during upgrades, you need to add a set of commands to the `after-upgrade-chroot` stage of a [CloudInit CR](cloudinitcrd.md).

As with `after-install-chroot`, the exact commands to use will depend on the software you need to install. Additionally, the OS version you are upgrading _to_ must be taken into account. Harvester v1.8.x and v1.9.x are based on SL Micro 6.2, which is equivalent to SLE 16.0. Future versions of Harvester will bump to future versions of SLE, so be sure to check the target OS version prior to upgrade.

Using the above `os.after_install_chroot_commands` commands as a base, a complimentary `after-upgrade-chroot` CloudInit CRD might look like this:

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