---
sidebar_position: 5
sidebar_label: Harvester Configuration
title: "Harvester Configuration"
keywords:
  - Harvester
  - harvester
  - Rancher
  - rancher
  - Harvester Configuration
description: Harvester configuration file can be provided during manual or automatic installation to configure various settings.
---

<head>
  <link rel="canonical" href="https://docs.harvesterhci.io/v1.1/install/harvester-configuration"/>
</head>

## Configuration Example

Harvester configuration file can be provided during manual or automatic installation to configure various settings. The following is a configuration example:

```yaml
scheme_version: 1
server_url: https://cluster-VIP:443
token: TOKEN_VALUE
os:
  ssh_authorized_keys:
    - ssh-rsa AAAAB3NzaC1yc2EAAAADAQAB...
    - github:username
  write_files:
  - encoding: ""
    content: test content
    owner: root
    path: /etc/test.txt
    permissions: '0755'
  hostname: myhost
  modules:
    - kvm
    - nvme
  sysctls:
    kernel.printk: "4 4 1 7"
    kernel.kptr_restrict: "1"
  dns_nameservers:
    - 8.8.8.8
    - 1.1.1.1
  ntp_servers:
    - 0.suse.pool.ntp.org
    - 1.suse.pool.ntp.org
  password: rancher
  environment:
    http_proxy: http://myserver
    https_proxy: http://myserver
  labels:
    topology.kubernetes.io/zone: zone1
    foo: bar
    mylabel: myvalue
install:
  mode: create
  management_interface:
    interfaces:
    - name: ens5
      hwAddr: "B8:CA:3A:6A:64:7C"
    method: dhcp
  force_efi: true
  device: /dev/sda
  data_disk: /dev/sdb
  silent: true
  iso_url: http://myserver/test.iso
  poweroff: true
  no_format: true
  debug: true
  tty: ttyS0
  vip: 10.10.0.19
  vip_hw_addr: 52:54:00:ec:0e:0b
  vip_mode: dhcp
  force_mbr: false
  addons:
    harvester_vm_import_controller:
      enabled: false
      values_content: ""
    harvester_pcidevices_controller:
      enabled: false
      values_content: ""
    rancher_monitoring:
      enabled: true
      values_content: ""
    rancher_logging:
      enabled: false
      values_content: ""
    harvester_seeder:
      enabled: false
      values_content: ""
system_settings:
  auto-disk-provision-paths: ""
```

## Configuration Reference

Below is a reference of all configuration keys.

:::caution

**Security Risks**: The configuration file contains credentials which should be kept secret. Please do not make the configuration file publicly accessible.

:::

:::note

**Configuration Priority**: When you provide a remote Harvester Configuration file during the install of Harvester, the Harvester Configuration file will not overwrite the values for the inputs you had previously filled out and selected.  Priority is given to the values that you input during the guided install.
For instance, if you have in your Harvester Configuration file specified `os.hostname` and during install you fill in the field of `hostname` when prompted, the value that you filled in will take priority over your Harvester Configuration's `os.hostname`.

:::

### `scheme_version`

#### Definition

The version of scheme reserved for future configuration migration.

This configuration is mandatory for migrating the configuration to a new scheme version. It tells Harvester the previous version and the need to migrate.

:::note
This field didn't take any effect in the current Harvester version.
:::

:::caution
Make sure that your custom configuration always has the correct scheme version.
:::

### `server_url`

#### Definition

`server_url` is the URL of the Harvester cluster, which is used for the new `node` to join the cluster.

This configuration is mandatory when the installation is in `JOIN` mode. The default format of `server_url` is `https://cluster-VIP:443`.

:::note

To ensure a high availability (HA) Harvester cluster, please use either the Harvester cluster [VIP](#installvip) or a domain name in `server_url`.

:::

#### Example

```yaml
server_url: https://cluster-VIP:443
install:
  mode: join
```

### `token`

#### Definition

The cluster secret or node token. If the value matches the format of a node token it will
automatically be assumed to be a node token. Otherwise it is treated as a cluster secret.

In order for a new node to join the Harvester cluster, the token should match what the server has.

#### Example

```yaml
token: myclustersecret
```

Or a node token

```yaml
token: "K1074ec55daebdf54ef48294b0ddf0ce1c3cb64ee7e3d0b9ec79fbc7baf1f7ddac6::node:77689533d0140c7019416603a05275d4"
```

### `os.ssh_authorized_keys`

#### Definition

A list of SSH authorized keys that should be added to the default user, `rancher`. SSH keys can be obtained from GitHub user accounts by using the format
`github:${USERNAME}`. This is done by downloading the keys from `https://github.com/${USERNAME}.keys`.

#### Example

```yaml
os:
  ssh_authorized_keys:
    - "ssh-rsa AAAAB3NzaC1yc2EAAAADAQABAAABAQC2TBZGjE+J8ag11dzkFT58J3XPONrDVmalCNrKxsfADfyy0eqdZrG8hcAxAR/5zuj90Gin2uBR4Sw6Cn4VHsPZcFpXyQCjK1QDADj+WcuhpXOIOY3AB0LZBly9NI0ll+8lo3QtEaoyRLtrMBhQ6Mooy2M3MTG4JNwU9o3yInuqZWf9PvtW6KxMl+ygg1xZkljhemGZ9k0wSrjqif+8usNbzVlCOVQmZwZA+BZxbdcLNwkg7zWJSXzDIXyqM6iWPGXQDEbWLq3+HR1qKucTCSxjbqoe0FD5xcW7NHIME5XKX84yH92n6yn+rxSsyUfhJWYqJd+i0fKf5UbN6qLrtd/D"
    - "github:ibuildthecloud"
```

### `os.write_files`

A list of files to write to disk on boot. The `encoding` field specifies the content's encoding. Valid `encoding` values are:

- `""`: content data are written in plain text. In this case, the `encoding` field can be also omitted.
- `b64`, `base64`: content data are base64-encoded.
- `gz`, `gzip`: content data are gzip-compressed.
- `gz+base64`, `gzip+base64`, `gz+b64`, `gzip+b64`: content data are gzip-compressed first and then base64-encoded.

Example

```yaml
os:
  write_files:
  - encoding: b64
    content: CiMgVGhpcyBmaWxlIGNvbnRyb2xzIHRoZSBzdGF0ZSBvZiBTRUxpbnV4...
    owner: root:root
    path: /etc/connman/main.conf
    permissions: '0644'
  - content: |
      # My new /etc/sysconfig/samba file

      SMDBOPTIONS="-D"
    path: /etc/sysconfig/samba
  - content: !!binary |
      f0VMRgIBAQAAAAAAAAAAAAIAPgABAAAAwARAAAAAAABAAAAAAAAAAJAVAAAAAA
      AEAAHgAdAAYAAAAFAAAAQAAAAAAAAABAAEAAAAAAAEAAQAAAAAAAwAEAAAAAAA
      AAAAAAAAAwAAAAQAAAAAAgAAAAAAAAACQAAAAAAAAAJAAAAAAAAcAAAAAAAAAB
      ...
    path: /bin/arch
    permissions: '0555'
  - content: |
      15 * * * * root ship_logs
    path: /etc/crontab
```

### `os.persistent_state_paths`

#### Definition

The `os.persistent_state_paths` option allows you to configure custom paths where modifications made to files will persist across reboots. Any changes to files in these paths will not be lost after a reboot.

#### Example

Refer to the following example config for installing `rook-ceph` in Harvester:

```yaml
os:
  persistent_state_paths:
    - /var/lib/rook
    - /var/lib/ceph
  modules:
    - rbd
    - nbd
```

### `os.after_install_chroot_commands`

#### Definition

You can add additional software packages with `after_install_chroot_commands`. The `after-install-chroot` stage, provided by [elemental-toolkit](https://rancher.github.io/elemental-toolkit/docs/), allows you to execute commands not restricted by file system write issues, ensuring the persistence of user-defined commands even after a system reboot.

#### Example

Refer to the following example config for installing an RPM package in Harvester:

```yaml
os:
  after_install_chroot_commands:
    - rpm -ivh <the url of rpm package>
  
```

DNS resolution is unavailable in the `after-install-chroot stage`, and the `nameserver` might not be available. If you need to access a domain name to install a package using an URL, create a temporary `/etc/resolv.conf` file first. For example:

```yaml
os:
  after_install_chroot_commands:
    - "rm -f /etc/resolv.conf && echo 'nameserver 8.8.8.8' | sudo tee /etc/resolv.conf"
    - "mkdir /usr/local/bin"
    - "curl -fsSL -o get_helm.sh https://raw.githubusercontent.com/helm/helm/main/scripts/get-helm-3 && chmod 700 get_helm.sh && ./get_helm.sh"
    - "rm -f /etc/resolv.conf && ln -s /var/run/netconfig/resolv.conf /etc/resolv.conf"
```


:::note

Upgrading Harvester causes the changes to the OS in the `after-install-chroot` stage to be lost. You must also configure the `after-upgrade-chroot` to make your changes persistent across an upgrade. Refer to [Runtime persistent changes](https://rancher.github.io/elemental-toolkit/docs/customizing/runtime_persistent_changes/) before upgrading Harvester.

:::

### `os.hostname`

#### Definition

Set the system hostname. The installer will generate a random hostname if the user doesn't provide a value.

#### Example

```yaml
os:
  hostname: myhostname
```

### `os.modules`

#### Definition

A list of kernel modules to be loaded on start.

#### Example

```yaml
os:
  modules:
    - kvm
    - nvme
```

### `os.sysctls`

#### Definition

Kernel sysctl to set up on start. These are the typical configurations found in `/etc/sysctl.conf`.
Values must be specified as strings.

#### Example

```yaml
os:
  sysctls:
    kernel.printk: 4 4 1 7 # the YAML parser will read as a string
    kernel.kptr_restrict: "1" # force the YAML parser to read as a string
```

### `os.dns_nameservers`

#### Definition

**Fallback** DNS name servers to use if DNS is not configured by DHCP or in the OS.

#### Example

```yaml
os:
  dns_nameservers:
    - 8.8.8.8
    - 1.1.1.1
```

### `os.ntp_servers`

#### Definition

**Fallback** ntp servers to use if NTP is not configured elsewhere in the OS. Highly recommend to configure `os.ntp_servers` to avoid time synchronization issue between machines.

#### Example

```yaml
os:
  ntp_servers:
    - 0.suse.pool.ntp.org
    - 1.suse.pool.ntp.org
```

### `os.password`

#### Definition

The password for the default user, `rancher`. By default, there is no password for the `rancher` user.
If you set a password at runtime it will be reset on the next boot. The
value of the password can be clear text or an encrypted form. The easiest way to get this encrypted
form is to change your password on a Linux system and copy the value of the second field from
`/etc/shadow`. You can also encrypt a password using OpenSSL. For the encryption algorithms
supported by Harvester, please refer to the table below.

| Algorithm | Command | Support |
|:---:|:---:|:---:|
| SHA-512 | `openssl passwd -6` | Yes |
| SHA-256 | `openssl passwd -5` | Yes |
| MD5 | `openssl passwd -1` | Yes |
| MD5, Apache variant | `openssl passwd -apr1` | Yes |
| AIX-MD5 | `openssl passwd -aixmd5` | No |

#### Example

Encrypted:
```yaml
os:
  password: "$6$kZYUnRaTxNdg4W8H$WSEJydGWsNpaRbbbRdTDLJ2hDLbkizxSFGW2RtexlqG6njEATaGQG9ssztjaKDCsaNUPBZ1E1YdsvSLMAi/IO/"
```

Or clear text:

```yaml
os:
  password: supersecure
```

### `os.environment`

#### Definition

Environment variables to be set on K3s and other processes like the boot process.
Primary use of this field is to set the HTTP proxy.

#### Example

```yaml
os:
  environment:
    http_proxy: http://myserver
    https_proxy: http://myserver
```

:::note

This example sets the HTTP(S) proxy for **foundational OS components**.
To set up an HTTP(S) proxy for Harvester components such as fetching external images and backup to S3 services,
see [Settings/http-proxy](../advanced/settings.md#http-proxy).

:::

### `os.labels`

#### Definition

Labels to be added to this Node.

#### Example

```yaml
os:
  labels:
    topology.kubernetes.io/zone: zone1
    foo: bar
    mylabel: myvalue
```

### `install.mode`

#### Definition

Harvester installation mode:

- `create`: Creating a new Harvester installation.
- `join`: Join an existing Harvester installation. Need to specify `server_url`.

#### Example

```yaml
install:
  mode: create
```

### `install.role`

#### Definition

Role assigned to a node at the time of installation. When unspecified, Harvester assigns the `default` role.

- `default`: Allows a node to function as a management node or a worker node.
- `management`: Allows a node to be prioritized when Harvester promotes nodes to management nodes.
- `worker`: Restricts a node to being a worker node (never promoted to management node) in a specific cluster.
- `witness`: Restricts a node to being a witness node (only functions as an etcd node) in a specific cluster.

### `install.management_interface`

#### Definition

Configure network interfaces for the host machine. Valid configuration fields are:

- `method`: Method to assign an IP to this network. The following are supported:
    - `static`: Manually assign an IP and gateway.
    - `dhcp`: Request an IP from the DHCP server.
- `ip`: Static IP for this network. Required if `static` method is chosen.
- `subnet_mask`: Subnet mask for this network. Required if `static` method is chosen.
- `gateway`: Gateway for this network. Required if `static` method is chosen.
- `interfaces`: An array of interface names. If provided, the installer then combines these NICs into a single logical bonded interface.
    - `interfaces.name`: The name of the slave interface for the bonded network.
    - `interfaces.hwAddr`: The hardware MAC address of the interface.
- `bond_options`: Options for bonded interfaces. Refer to [here](https://www.kernel.org/doc/Documentation/networking/bonding.txt) for more info. If not provided, the following options would be used:
    - `mode: balance-tlb`
    - `miimon: 100`
- `mtu`: The MTU for the interface.
- `vlan_id`: The VLAN ID for the interface.

:::note

Harvester uses the [systemd net naming scheme](https://www.freedesktop.org/software/systemd/man/systemd.net-naming-scheme.html).
Please make sure the interface name is present on the target machine before installation.

:::

#### Example

```yaml
install:
  mode: create
  management_interface:
    interfaces:
    - name: ens5
      hwAddr: "B8:CA:3A:6A:64:7D"     # The hwAddr is optional
    method: dhcp
    bond_options:
      mode: balance-tlb
      miimon: 100
    mtu: 1492
    vlan_id: 101
```

### `install.force_efi`

Force EFI installation even when EFI is not detected. Default: `false`.

### `install.device`

The device to install the OS.

Prefer to use `/dev/disk/by-id/$id` or `/dev/disk/by-path/$path` to specify the storage device if your machine contains multiple physical volumes via pxe installation.

### `install.silent`

Reserved.

### `install.iso_url`

ISO to download and install from if booting from kernel/vmlinuz and not ISO.

### `install.poweroff`

Shutdown the machine after installation instead of rebooting

### `install.no_format`

Do not partition and format, assume layout exists already.

### `install.debug`

Run the installation with additional logging and debugging enabled for the installed system.

### `install.persistent_partition_size`

#### Definition

Configure the size of partition `COS_PERSISTENT` in `Gi` or `Mi`. This partition is used to store data like system packages and container images. The default and minimum value is `150Gi`.

#### Example

```yaml
install:
  persistent_partition_size: 150Gi
```

### `install.tty`

#### Definition

The tty device used for the console.

#### Example

```yaml
install:
  tty: ttyS0,115200n8
```

### `install.vip`
### `install.vip_mode`
### `install.vip_hw_addr`

#### Definition

- `install.vip`: The VIP of the Harvester management endpoint. After installation, users can access the Harvester GUI at the URL `https://<VIP>`.
- `install.vip_mode`
    - `dhcp`: Harvester will send DHCP requests to get the VIP. The `install.vip_hw_addr` field needs to be provided.
    - `static`: Harvester uses a static VIP.
- `install.vip_hw_addr`: The hardware address corresponding to the VIP. Users must configure their on-premise DHCP server to offer the configured VIP. The field is mandatory when `install.vip_mode` is `dhcp`.

See [Management Address](./management-address.md) for more information.

#### Example

Configure a static VIP.

```yaml
install:
  vip: 192.168.0.100
  vip_mode: static
```

Configure a DHCP VIP.

```yaml
install:
  vip: 10.10.0.19
  vip_mode: dhcp
  vip_hw_addr: 52:54:00:ec:0e:0b
```

### `install.force_mbr`

#### Definition

By default, Harvester uses GPT partitioning scheme on both UEFI and BIOS systems.
However, if you face compatibility issues, the MBR partitioning scheme can be forced on BIOS systems.

:::note

Harvester creates an additional partition for storing VM data if
[`install.data_disk`](#installdata_disk) is configured to use the same
storage device as the one set for [`install.device`](#installdevice).
When force using MBR, no additional partition will be created and VM data will be stored in a partition shared with the OS data.

:::

#### Example

```yaml
install:
  force_mbr: true
```

### `install.data_disk`

_Available as of v1.0.1_

#### Definition

Sets the default storage device to store the VM data.

Prefer to use `/dev/disk/by-id/$id` or `/dev/disk/by-path/$path` to specify the storage device if your machine contains multiple physical volumes via pxe installation.

Default: Same storage device as the one set for [`install.device`](#installdevice)

#### Example

```yaml
install:
  data_disk: /dev/sdb
```

### `install.addons`

_Available as of v1.2.0_

#### Definition

Sets the default enabled/disabled status of Harvester addons.

Default: The addons are disabled.

#### Example

```yaml
install:
  addons:
    rancher_monitoring:
      enabled: true
    rancher_logging:
      enabled: false
```

Harvester v1.2.0 ships with five addons:

- vm-import-controller (chartName: `harvester-vm-import-controller`)
- pcidevices-controller (chartName: `harvester-pcidevices-controller`)
- rancher-monitoring
- rancher-logging
- harvester-seeder (experimental)

### `install.harvester.storage_class.replica_count`

_Available as of v1.1.2_

#### Definition

Sets the replica count of Harvester's default storage class `harvester-longhorn`.

Default: 3

Supported values: 1, 2, 3. All other values are considered 3.

In edge scenarios where users may deploy single-node Harvester clusters, they can set this value to 1. In most scenarios, it is recommended to keep the default value 3 for storage high availability.

Please refer to [longhorn-replica-count](https://longhorn.io/docs/1.4.1/references/settings/#default-replica-count) for more details.

#### Example

```yaml
install:
  harvester:
    storage_class:
      replica_count: 1
```

### `install.harvester.longhorn.default_settings.guaranteedEngineManagerCPU`

_Available as of v1.2.0_

#### Definition

Sets the default percentage of the total allocatable CPU on each node will be reserved for each Longhorn engine manager Pod.

Default: 12

Supported values: 0-12. All other values are considered 12.

This integer value indicates what percentage of the total allocatable CPU on each node will be reserved for each engine manager Pod.

In edge scenarios where users may deploy single-node Harvester clusters, they can set this parameter to a value smaller than 12. In most scenarios, it is recommended to keep the default value for system high availability.

Before setting the value, please refer to [longhorn-guaranteed-engine-manager-cpu](https://longhorn.io/docs/1.4.1/references/settings/#guaranteed-engine-manager-cpu) for more details.

#### Example

```yaml
install:
  harvester:
    longhorn:
      default_settings:
        guaranteedEngineManagerCPU: 6
```

### `install.harvester.longhorn.default_settings.guaranteedReplicaManagerCPU`

_Available as of v1.2.0_

#### Definition

Sets the default percentage of the total allocatable CPU on each node will be reserved for each Longhorn replica manager Pod.

Default: 12

Supported values: 0-12. All other values are considered 12.

This integer value indicates what percentage of the total allocatable CPU on each node will be reserved for each replica manager Pod.

In edge scenarios where users may deploy single-node Harvester clusters, can set this parameter to a value smaller than 12. In most scenarios, it is recommended to keep the default value for system high availability.

Before setting the value, please refer to [longhorn-guaranteed-replica-manager-cpu](https://longhorn.io/docs/1.4.1/references/settings/#guaranteed-replica-manager-cpu) for more details.

#### Example

```yaml
install:
  harvester:
    longhorn:
      default_settings:
        guaranteedReplicaManagerCPU: 6
```

### `system_settings`

#### Definition

You can overwrite the default Harvester system settings by configuring `system_settings`.
See the [Settings](../advanced/settings.md) page for additional information and the list of all the options.

:::note

Overwriting system settings only works when Harvester is installed in "create" mode.
If you install Harvester in "join" mode, this setting is ignored.
Installing in "join" mode will adopt the system settings from the existing Harvester system.

:::

#### Example

The example below overwrites `containerd-registry`, `http-proxy` and `ui-source` settings. The values must be a `string`.

```yaml
system_settings:
  containerd-registry: '{"Mirrors": {"docker.io": {"Endpoints": ["https://myregistry.local:5000"]}}, "Configs": {"myregistry.local:5000": {"Auth": {"Username": "testuser", "Password": "testpassword"}, "TLS": {"InsecureSkipVerify": false}}}}'
  http-proxy: '{"httpProxy": "http://my.proxy", "httpsProxy": "https://my.proxy", "noProxy": "some.internal.svc"}'
  ui-source: auto
```
