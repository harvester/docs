---
sidebar_position: 2
keywords:
  - Harvester
  - harvester
  - Rancher
  - rancher
  - Install Harverster
  - Installing Harverster
  - Harverster Installation
  - PXE Boot Install
Description: Starting from version `0.2.0`, Harvester can be installed automatically. This document provides an example to do the automatic installation with PXE boot.
---

# PXE Boot Installation

Starting from version `0.2.0`, Harvester can be installed automatically. This document provides an example to do the automatic installation with PXE boot.

We recommend using [iPXE](https://ipxe.org/) to perform the network boot. It has more features than the traditional PXE Boot program and is likely available in modern NIC cards. If NIC cards don't come with iPXE firmware, iPXE firmware images can be loaded from the TFTP server first.

To see sample iPXE scripts, please visit [Harvester iPXE Examples](https://github.com/harvester/ipxe-examples).

## Prerequisite

!!! important
    Nodes need to have at least **8G** of RAM because the installer loads the full ISO file into tmpfs.

## Preparing HTTP Servers

An HTTP server is required to serve boot files.
Let's assume an NGINX HTTP server's IP is `10.100.0.10`, and it serves `/usr/share/nginx/html/` directory with the path `http://10.100.0.10/`.

## Preparing Boot Files

- Download the required files from [Harvester Releases Page](https://github.com/harvester/harvester/releases).
    - The ISO: `harvester-<version>-amd64.iso`
    - The kernel: `harvester-<version>-vmlinuz-amd64`
    - The initrd: `harvester-<version>-initrd-amd64`
    - The rootfs squashfs image: `harvester-<version>-rootfs-amd64.squashfs`

- Serve the files.

    Copy or move the downloaded files to an appropriate location so they can be downloaded via the HTTP server. e.g.,
  
    ```
    sudo mkdir -p /usr/share/nginx/html/harvester/
    sudo cp /path/to/harvester-<version>-amd64.iso /usr/share/nginx/html/harvester/
    sudo cp /path/to/harvester-<version>-vmlinuz-amd64 /usr/share/nginx/html/harvester/
    sudo cp /path/to/harvester-<version>-initrd-amd64 /usr/share/nginx/html/harvester/
    sudo cp /path/to/harvester-<version>-rootfs-amd64.squashfs /usr/share/nginx/html/harvester/
    ```

## Preparing iPXE boot scripts

When performing automatic installation, there are two modes:

- `CREATE`: we are installing a node to construct an initial Harvester cluster.
- `JOIN`: we are installing a node to join an existing Harvester cluster.


### CREATE mode

!!! warning
    **Security Risks**: The configuration file below contains credentials which should be kept secretly. Please do not make the configuration file publicly accessible at the moment.

Create a [Harvester configuration file](./harvester-configuration.md) `config-create.yaml` for `CREATE` mode. Modify the values as needed:

```YAML
# cat /usr/share/nginx/html/harvester/config-create.yaml
token: token
os:
  hostname: node1
  ssh_authorized_keys:
  - ssh-rsa AAAAB3NzaC1yc2EAAAADAQABAAABgQDbeUa9A7Kee+hcCleIXYxuaPksn2m4PZTd4T7wPcse8KbsQfttGRax6vxQXoPO6ehddqOb2nV7tkW2mEhR50OE7W7ngDHbzK2OneAyONYF44bmMsapNAGvnsBKe9rNrev1iVBwOjtmyVLhnLrJIX+2+3T3yauxdu+pmBsnD5OIKUrBrN1sdwW0rA2rHDiSnzXHNQM3m02aY6mlagdQ/Ovh96h05QFCHYxBc6oE/mIeFRaNifa4GU/oELn3a6HfbETeBQz+XOEN+IrLpnZO9riGyzsZroB/Y3Ju+cJxH06U0B7xwJCRmWZjuvfFQUP7RIJD1gRGZzmf3h8+F+oidkO2i5rbT57NaYSqkdVvR6RidVLWEzURZIGbtHjSPCi4kqD05ua8r/7CC0PvxQb1O5ILEdyJr2ZmzhF6VjjgmyrmSmt/yRq8MQtGQxyKXZhJqlPYho4d5SrHi5iGT2PvgDQaWch0I3ndEicaaPDZJHWBxVsCVAe44Wtj9g3LzXkyu3k= root@admin
  password: rancher
install:
  mode: create
  networks:
    harvester-mgmt:       # (Mandatory) The management bond name.
      interfaces:
      - name: ens5
      default_route: true
      method: dhcp
      bond_options:
        mode: balance-tlb
        miimon: 100
    harvester-vlan:       # (Optional) The VLAN network bond name. If VLAN NIC names vary from
      interfaces:         # host to host, consider creating a bonding device. Users can then select
      - name: ens6        # `harvester-vlan` as the VLAN network NIC in the Harvester GUI.
      method: none
      bond_options:
        mode: balance-tlb
        miimon: 100
  device: /dev/sda
  iso_url: http://10.100.0.10/harvester/harvester-<version>-amd64.iso
  vip: 10.100.0.100       # The VIP to access the Harvester GUI. Make sure the IP is free to use.
  vip_mode: static        # Or dhcp, check configuration file for more information.
```

For machines that needs to be installed as `CREATE` mode, the following is an iPXE script that boots the kernel with the above config:

```
#!ipxe
kernel harvester-<version>-vmlinuz ip=dhcp net.ifnames=1 rd.cos.disable console=tty1 root=live:http://10.100.0.10/harvester/rootfs.squashfs harvester.install.automatic=true harvester.install.config_url=http://10.100.0.10/harvester/config-create.yaml
initrd harvester-<version>-initrd
boot
```

Let's assume the iPXE script is stored in `/usr/share/nginx/html/harvester/ipxe-create`

!!! note
    If there are multiple network interfaces on the installing machine, the user can use `ip=<interface>:dhcp` to specify the booting interface (e.g., `ip=eth1:dhcp`).

### JOIN mode

!!! warning 
    **Security Risks**: The configuration file below contains credentials which should be kept secretly. Please do not make the configuration file publicly accessible at the moment.

Create a [Harvester configuration file](./harvester-configuration.md) `config-join.yaml` for `JOIN` mode. Modify the values as needed:

```YAML
# cat /usr/share/nginx/html/harvester/config-join.yaml
server_url: https://10.100.0.130:8443
token: token
os:
  hostname: node2
  ssh_authorized_keys:
  - ssh-rsa AAAAB3NzaC1yc2EAAAADAQABAAABgQDbeUa9A7Kee+hcCleIXYxuaPksn2m4PZTd4T7wPcse8KbsQfttGRax6vxQXoPO6ehddqOb2nV7tkW2mEhR50OE7W7ngDHbzK2OneAyONYF44bmMsapNAGvnsBKe9rNrev1iVBwOjtmyVLhnLrJIX+2+3T3yauxdu+pmBsnD5OIKUrBrN1sdwW0rA2rHDiSnzXHNQM3m02aY6mlagdQ/Ovh96h05QFCHYxBc6oE/mIeFRaNifa4GU/oELn3a6HfbETeBQz+XOEN+IrLpnZO9riGyzsZroB/Y3Ju+cJxH06U0B7xwJCRmWZjuvfFQUP7RIJD1gRGZzmf3h8+F+oidkO2i5rbT57NaYSqkdVvR6RidVLWEzURZIGbtHjSPCi4kqD05ua8r/7CC0PvxQb1O5ILEdyJr2ZmzhF6VjjgmyrmSmt/yRq8MQtGQxyKXZhJqlPYho4d5SrHi5iGT2PvgDQaWch0I3ndEicaaPDZJHWBxVsCVAe44Wtj9g3LzXkyu3k= root@admin
  dns_nameservers:
  - 1.1.1.1
  - 8.8.8.8
  password: rancher
install:
  mode: join
  networks:
    harvester-mgmt:       # (Mandatory) The management bond name.
      interfaces:
      - name: ens5
      default_route: true
      method: dhcp
      bond_options:
        mode: balance-tlb
        miimon: 10
    harvester-vlan:       # (Optional) The VLAN network bond name. If VLAN NIC names vary from
      interfaces:         # host to host, consider creating a bonding device. Users can then select
      - name: ens6        # `harvester-vlan` as the VLAN network NIC in the Harvester GUI.
      method: none
      bond_options:
        mode: balance-tlb
        miimon: 100
  device: /dev/sda
  iso_url: http://10.100.0.10/harvester/harvester-<version>-amd64.iso
```

Note that the `mode` is `join` and the `server_url` needs to be provided.

For machines that needs to be installed in `JOIN` mode, the following is an iPXE script that boots the kernel with the above config:

```
#!ipxe
kernel harvester-<version>-vmlinuz ip=dhcp net.ifnames=1 rd.cos.disable console=tty1 root=live:http://10.100.0.10/harvester/rootfs.squashfs harvester.install.automatic=true harvester.install.config_url=http://10.100.0.10/harvester/config-join.yaml
initrd harvester-<version>-initrd
boot
```

Let's assume the iPXE script is stored in `/usr/share/nginx/html/harvester/ipxe-join`.


## DHCP server configuration

Here is an example to configure the ISC DHCP server to offer iPXE scripts:

```sh
option architecture-type code 93 = unsigned integer 16;

subnet 10.100.0.0 netmask 255.255.255.0 {
	option routers 10.100.0.10;
        option domain-name-servers 192.168.2.1;
	range 10.100.0.100 10.100.0.253;
}

group {
  # create group
  if exists user-class and option user-class = "iPXE" {
    # iPXE Boot
    if option architecture-type = 00:07 {
      filename "http://10.100.0.10/harvester/ipxe-create-efi";
    } else {
      filename "http://10.100.0.10/harvester/ipxe-create";
    }
  } else {
    # PXE Boot
    if option architecture-type = 00:07 {
      # UEFI
      filename "ipxe.efi";
    } else {
      # Non-UEFI
      filename "undionly.kpxe";
    }
  }

  host node1 { hardware ethernet 52:54:00:6b:13:e2; }
}


group {
  # join group
  if exists user-class and option user-class = "iPXE" {
    # iPXE Boot
    if option architecture-type = 00:07 {
      filename "http://10.100.0.10/harvester/ipxe-join-efi";
    } else {
      filename "http://10.100.0.10/harvester/ipxe-join";
    }
  } else {
    # PXE Boot
    if option architecture-type = 00:07 {
      # UEFI
      filename "ipxe.efi";
    } else {
      # Non-UEFI
      filename "undionly.kpxe";
    }
  }

  host node2 { hardware ethernet 52:54:00:69:d5:92; }
}
```

The config file declares a subnet and two groups. The first group is for hosts to boot with `CREATE` mode and the other one is for `JOIN` mode. By default, the iPXE path is chosen, but if it sees a PXE client, it also offers the iPXE image according to client architecture. Please prepare those images and a tftp server first.

## Harvester configuration

For more information about Harvester configuration, please refer to the [Harvester configuration](./harvester-configuration.md).

Users can also provide configuration via kernel parameters. For example, to specify the `CREATE` install mode, the user can pass the `harvester.install.mode=create` kernel parameter when booting. Values passed through kernel parameters have higher priority than values specified in the config file.

## UEFI HTTP Boot support

UEFI firmware supports loading a boot image from HTTP server. This section demonstrates how to use UEFI HTTP boot to load the iPXE program and perform the automatic installation.

### Serve the iPXE program

Download the iPXE UEFI program from http://boot.ipxe.org/ipxe.efi and make `ipxe.efi` can be downloaded from the HTTP server. e.g.:

```bash
cd /usr/share/nginx/html/harvester/
wget http://boot.ipxe.org/ipxe.efi
```

The file now can be downloaded from http://10.100.0.10/harvester/ipxe.efi locally.

### DHCP server configuration

If the user plans to use the UEFI HTTP boot feature by getting a dynamic IP first, the DHCP server needs to provides the iPXE program URL when it sees such a request. Here is an updated ISC DHCP server group example:

```sh
group {
  # create group
  if exists user-class and option user-class = "iPXE" {
    # iPXE Boot
    if option architecture-type = 00:07 {
      filename "http://10.100.0.10/harvester/ipxe-create-efi";
    } else {
      filename "http://10.100.0.10/harvester/ipxe-create";
    }
  } elsif substring (option vendor-class-identifier, 0, 10) = "HTTPClient" {
    # UEFI HTTP Boot
    option vendor-class-identifier "HTTPClient";
    filename "http://10.100.0.10/harvester/ipxe.efi";
  } else {
    # PXE Boot
    if option architecture-type = 00:07 {
      # UEFI
      filename "ipxe.efi";
    } else {
      # Non-UEFI
      filename "undionly.kpxe";
    }
  }

  host node1 { hardware ethernet 52:54:00:6b:13:e2; }
}
```

The `elsif substring` statement is new, and it offers `http://10.100.0.10/harvester/ipxe.efi` when it sees a UEFI HTTP boot DHCP request. After the client fetches the iPXE program and runs it, the iPXE program will send a DHCP request again and load the iPXE script from URL `http://10.100.0.10/harvester/ipxe-create-efi`.

### The iPXE script for UEFI boot

It's mandatory to specify the initrd image for UEFI boot in the kernel parameters. Here is an updated version of iPXE script for `CREATE` mode.

```
#!ipxe
kernel harvester-<version>-vmlinuz initrd=harvester-<version>-initrd ip=dhcp net.ifnames=1 rd.cos.disable console=tty1 root=live:http://10.100.0.10/harvester/rootfs.squashfs harvester.install.automatic=true harvester.install.config_url=http://10.100.0.10/harvester/config-create.yaml
initrd harvester-<version>-initrd
boot
```

The parameter `initrd=harvester-<version>-initrd` is required.
