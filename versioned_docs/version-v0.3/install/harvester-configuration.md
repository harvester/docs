---
sidebar_position: 4
sidebar_label: Harvester Configuration
title: ""
keywords:
  - Harvester
  - harvester
  - Rancher
  - rancher
  - Harvester Configuration
Description: Harvester configuration file can be provided during manual or automatic installation to configure various settings.
---

# Harvester Configuration

## Configuration Example

Harvester configuration file can be provided during manual or automatic installation to configure various settings. The following is a configuration example:

```yaml
server_url: https://someserver:8443
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
    - 0.us.pool.ntp.org
    - 1.us.pool.ntp.org
  password: rancher
  environment:
    http_proxy: http://myserver
    https_proxy: http://myserver
install:
  mode: create
  networks:
    harvester-mgmt:
      interfaces:
      - name: ens5
      default_route: true
      method: dhcp
  force_efi: true
  device: /dev/vda
  silent: true
  iso_url: http://myserver/test.iso
  poweroff: true
  no_format: true
  debug: true
  tty: ttyS0
  vip: 10.10.0.19
  vip_hw_addr: 52:54:00:ec:0e:0b
  vip_mode: dhcp
```

## Configuration Reference

Below is a reference of all configuration keys.

:::caution

**Security Risks**: The configuration file contains credentials which should be kept secret. Please do not make the configuration file publicly accessible.

:::

### `server_url`

#### Definition

The URL of the Harvester server to join as an agent.

This configuration is mandatory when the installation is in `JOIN` mode. It tells the Harvester installer where the main server is.

#### Example

```yaml
server_url: https://someserver:8443
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

### `os.hostname`

#### Definition

Set the system hostname. If the system hostname is supplied via DHCP, then that value will be used here. If this value is not set and one is not supplied via DHCP, then a random hostname will be generated.

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

**Fallback** ntp servers to use if NTP is not configured elsewhere in the OS.

#### Example

```yaml
os:
  ntp_servers:
    - 0.us.pool.ntp.org
    - 1.us.pool.ntp.org
```

### `os.password`

#### Definition

The password for the default user, `rancher`. By default, there is no password for the `rancher` user.
If you set a password at runtime it will be reset on the next boot. The
value of the password can be clear text or an encrypted form. The easiest way to get this encrypted
form is to change your password on a Linux system and copy the value of the second field from
`/etc/shadow`. You can also encrypt a password using `openssl passwd -1`.

#### Example

Encrypted:
```yaml
os:
  password: "$1$tYtghCfK$QHa51MS6MVAcfUKuOzNKt0"
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

### `install.networks`

#### Definition

Configure network interfaces for the host machine. Each key-value pair
represents a network interface. The key name becomes the network name, and
the values are configurations for each network. Valid configuration fields are:

- `method`: Method to assign an IP to this network. The following are supported:
    - `static`: Manually assign an IP and gateway.
    - `dhcp`: Request an IP from the DHCP server.
    - `none`: Do nothing. Useful when the interface does not need an IP, such as when creating [VLAN network](../networking/harvester-network.md#vlan) NIC in Harvester.
- `ip`: Static IP for this network. Required if `static` method is chosen.
- `subnet_mask`: Subnet mask for this network. Required if `static` method is chosen.
- `gateway`: Gateway for this network. Required if `static` method is chosen.
- `interfaces`: An array of interface names. If provided, the installer then combines these NICs into a single logical bonded interface.
    - `interfaces.name`: The name of the slave interface for the bonded network.
- `default_route`: Set the network as the default route or not.
- `bond_options`: Options for bonded interfaces. Refer to [here](https://www.kernel.org/doc/Documentation/networking/bonding.txt) for more info. If not provided, the following options would be used:
    - `mode: balance-tlb`
    - `miimon: 100`

:::note

A network called `harvester-mgmt` is mandatory to establish a valid [management network](../networking/harvester-network.md#management-network).

:::

:::note

Harvester uses the [systemd net naming scheme](https://www.freedesktop.org/software/systemd/man/systemd.net-naming-scheme.html).
Please make sure the interface name is present on the target machine before installation.

:::

#### Example

```yaml
install:
  mode: create
  networks:
    harvester-mgmt:       # The management bond name. This is mandatory.
      interfaces:
      - name: ens5
      default_route: true
      method: dhcp
      bond_options:
        mode: balance-tlb
        miimon: 100
    harvester-vlan:       # The VLAN network bond name. User can then input `harvester-vlan` in the VLAN NIC setting in the GUI.
      interfaces:
      - name: ens6
      method: none
      bond_options:
        mode: balance-tlb
        miimon: 100
    bond0:
      interfaces:
      - name: ens8
      method: static
      ip: 10.10.18.2
      subnet_mask: 255.255.255.0
      gateway: 192.168.11.1
```

### `install.force_efi`

Force EFI installation even when EFI is not detected. Default: `false`.

### `install.device`

The device to install the OS.

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
