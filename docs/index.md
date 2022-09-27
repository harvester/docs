---
sidebar_position: 1
sidebar_label: Harvester Overview
slug: /
title: ""
keywords:
  - Harvester
  - harvester
  - Rancher
  - rancher
  - Harvester Intro
Description: Harvester is an open source hyper-converged infrastructure (HCI) software built on Kubernetes. It is an open source alternative to vSphere and Nutanix.
---

# Harvester Overview

Harvester is an open-source [hyper-converged infrastructure](https://en.wikipedia.org/wiki/Hyper-converged_infrastructure) (HCI) software built on Kubernetes. It is an open alternative to using a proprietary HCI stack that incorporates the design and ethos of [Cloud Native Computing](https://en.wikipedia.org/wiki/Cloud_native_computing).

![harvester-ui](/img/v1.1/dashboard.png)

## Harvester Features

Harvester implements HCI on bare metal servers. Harvester is designed to use local, direct attached storage instead of complex external SANs. It ships as an integrated bootable appliance image that can be deployed directly to servers through an ISO or PXE boot artifact.

Some notable features of Harvester include the following:

1. VM lifecycle management including SSH-Key injection, cloud-init, and graphic and serial port console
1. VM live migration support
1. Supported VM backup and restore
1. Distributed block storage
1. Multiple network interface controllers (NICs) in the VM connecting to the management network or VLANs
1. Virtual Machine and cloud-init templates
1. [Rancher](https://github.com/rancher/rancher) integration with multi-cluster management and the Harvester node driver
1. [PXE/iPXE boot support](https://docs.harvesterhci.io/latest/install/pxe-boot-install)
1. Virtual IP and bond NIC support
1. Monitoring integration

## Harvester Architecture
The following diagram outlines a high-level architecture of Harvester:

![](/img/v1.1/architecture.svg)

- [Longhorn](https://longhorn.io/) is a lightweight, reliable and easy-to-use distributed block storage system for Kubernetes.
- [KubeVirt](https://kubevirt.io/) is a virtual machine management add-on for Kubernetes.
- [Elemental for SLE-Micro 5.2](https://github.com/rancher-sandbox/cOS-toolkit) (based on openSUSE Leap 15.3 before v1.0.3) is an immutable Linux distribution designed to remove as much OS maintenance as possible in a Kubernetes cluster.

## Hardware Requirements

To get the Harvester server up and running, the following minimum hardware is required:

| Type | Requirements                                                                                                                                                                                               |
|:---|:-----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------|
| CPU | x86_64 only. Hardware-assisted virtualization is required. 8-core processor minimum; 16-core or above preferred                                                                                            |
| Memory | 32 GB minimum; 64 GB or above preferred                                                                                                                                                                    |
| Disk Capacity | 140 GB minimum for testing; 500 GB or above preferred for production                                                                                                                                       |
| Disk Performance | 5,000+ random IOPS per disk (SSD/NVMe). Management nodes (first three nodes) must be [fast enough for etcd](https://www.ibm.com/cloud/blog/using-fio-to-tell-whether-your-storage-is-fast-enough-for-etcd) |
| Network Card | 1 Gbps Ethernet minimum for testing; 10Gbps Ethernet recommended for production                                                                                                                            |
| Network Switch | Trunking of ports required for VLAN support                                                                                                                                                                |

## Quick Start

You can install Harvester via the [ISO](./install/iso-install.md) installation or the [PXE](./install/pxe-boot-install.md) boot installation. Instructions are provided in the sections below.

### ISO Installation

You can use the ISO to install Harvester directly on the bare metal server to form a Harvester cluster. Users can add one or many compute nodes to join the existing cluster.

To get the Harvester ISO, download it from the [Github releases](https://github.com/harvester/harvester/releases).

During the installation, you can either choose to form a new cluster or join the node to an existing cluster.

1. Mount the Harvester ISO disk and boot the server by selecting the `Harvester Installer`.
   ![iso-install.png](/img/v1.1/install/iso-install.png)
2. Choose the installation mode by either creating a new Harvester cluster or by joining an existing one.
3. Choose the installation device on which the Harvester cluster will be installed
    - Note: By default, Harvester uses [GPT](https://en.wikipedia.org/wiki/GUID_Partition_Table) partitioning schema for both UEFI and BIOS. If you use the BIOS boot, then you will have the option to select [MBR](https://en.wikipedia.org/wiki/Master_boot_record).
   ![iso-install-disk.png](/img/v1.1/install/iso-install-disk.png)
4. Configure the hostname and select the network interface for the management network. By default, Harvester will create a bonded NIC named `harvester-mgmt`, and the IP address can be configured via DHCP or a statically assigned one <small>(Note: The Node IP can not change at the lifecycle of a Harvester cluster, in case the DHCP is used, the user must make sure the DHCP server always offers the same IP for the same Node. Due to a changed Node IP the related Node can not join the cluster, or even break the cluster)</small>.

   ![iso-installed.png](/img/v1.1/install/iso-nic-config.gif)
5. Optional: Configure the DNS servers; use commas as delimiters.
6. Configure the `Virtual IP` which you can use to access the cluster or join other nodes to the cluster <small>(Note: If your IP address is configured via DHCP, you will need to configure static MAC-to-IP address mapping on your DHCP server in order to have a persistent Virtual IP, VIP must be different than any Node IP)</small>.
7. Configure the `cluster token`. This token will be used for adding other nodes to the cluster.
8. Configure the login password of the host. The default SSH user is `rancher`.
9. Recommended configuring the NTP server to make sure all nodes' times are synchronized. This defaults to `0.suse.pool.ntp.org`.
10. (Optional) If you need to use an HTTP proxy to access the outside world, enter the proxy URL address here. Otherwise, leave this blank.
11. (Optional) You can choose to import SSH keys from a remote server URL. Your GitHub public keys can be used with `https://github.com/<username>.keys`.
12. (Optional) If you need to customize the host with a [Harvester configuration](./install/harvester-configuration.md) file, enter the HTTP URL here.
13. Confirm the installation options and Harvester will be installed to your host. The installation may take a few minutes to complete.
14. Once the installation is complete, the host will restart, and a console UI with management URL and status will be displayed. <small>(You can Use F12 to switch between the Harvester console and the Shell).</small>
15. The default URL of the web interface is `https://your-virtual-ip`.
    ![iso-installed.png](/img/v1.1/install/iso-installed.png)
16. Users will be prompted to set the password for the default `admin` user at first login.
    ![first-login.png](/img/v1.1/install/first-time-login.png)

<div class="text-center">
<iframe width="950" height="475" src="https://www.youtube.com/embed/Ngsk7m6NYf4" title="YouTube video player" frameborder="0" allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture" allowfullscreen></iframe>
</div>

### PXE/iPXE Installation

Harvester can also be installed automatically. Please refer to [PXE Boot Install](./install/pxe-boot-install.md) for detailed instructions and additional guidance.

:::note

More iPXE usage examples are available at [harvester/ipxe-examples](https://github.com/harvester/ipxe-examples).

:::
