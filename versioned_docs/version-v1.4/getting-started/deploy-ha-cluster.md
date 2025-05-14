---
sidebar_position: 1
sidebar_label: Deploy a High-Availability Cluster
title: "Deploy a High-Availability Cluster"
keywords:
- deployment
- getting started
- Harvester
- Harvester cluster
- high availability
- virtual machine
---

<head>
  <link rel="canonical" href="https://docs.harvesterhci.io/v1.5/getting-started/deploy-ha-cluster"/>
</head>

A [Harvester cluster](../getting-started/glossary.md#harvester-cluster) with three or more nodes is required to fully realize multi-node features such as high availability. Certain versions of Harvester allow you to create clusters with two management nodes and one [witness node](../advanced/witness.md) (and optionally, one or more worker nodes). You can also create [single-node clusters](../advanced/singlenodeclusters.md) that support most Harvester features (excluding high availability, multi-replica support, and live migration). 

This guide walks you through the steps required to deploy a **high-availability cluster** and virtual machines (VMs) that can host [guest clusters](../getting-started/glossary.md#guest-cluster--guest-kubernetes-cluster) and run custom workloads. 

## 1. Verify that the minimum hardware and network requirements are met. 

Harvester is built for bare metal servers using enterprise-grade open-source software components. The installer automatically checks the hardware and displays warning messages if the minimum [requirements](../install/requirements.md) are not met. 

## 2. Prepare the installation files based on the installation method that you want to use. 

You can download the installation files from the [Harvester Releases](https://github.com/harvester/harvester/releases) page. The **Downloads** section of the release notes contains links to the ISO files and related artifacts. The following types of ISO files are available: 

- **Full ISO**: Contains the core operating system components and all required container images, which are preloaded during installation. You must use a full ISO when installing Harvester behind a firewall or proxy, and in environments without internet connectivity. 
- [**Net install ISO**](../install/net-install.md): Contains only the core operating system components. After installation is completed, the operating system pulls all required container images from the internet (mostly from Docker Hub). 


| Method | Required Installation Files | Other Requirements |
| --- | --- | --- |
| [ISO](../install/iso-install.md) | ISO | N/A |
| [USB](../install/usb-install.md) | ISO | USB flash drive; utility such as [balenaEtcher](https://etcher.balena.io/) or the Linux [dd command](https://man7.org/linux/man-pages/man1/dd.1.html) |
| [PXE](../install/pxe-boot-install.md) | ISO, Linux kernel image (vmlinuz), initrd, SquashFS image | Directory on the HTTP server (for serving boot files); iPXE boot scripts (for automatic installation); DHCP server configuration |

## 3. Prepare the cluster configuration requirements. 

- Cluster token: ASCII string that nodes use when joining the cluster 
- Fixed IP address for each node: May be assigned statically or using DHCP (host reservation) 
- Fixed virtual IP address (VIP) to be used as the cluster management address: VIP that nodes point to when joining the cluster and that you connect to when performing administration tasks after the cluster is deployed 
- Addresses of DNS servers, NTP servers, and the proxy server (if necessary) 

## 4. Deploy the first cluster node. 

Deployment involves installing the operating system and other components on the host, and then rebooting once installation is completed. Deploying the first node creates the cluster, and the first node is assigned the management node by default. 
    
During installation, you must configure node settings, define the cluster management address (VIP) and the cluster token, and specify other information. If necessary, you can configure more settings using a [Harvester configuration](../install/harvester-configuration.md) file. 

Once installation is completed, the node restarts and then the Harvester console appears. The console displays information about the cluster (management URL and status) and the node (hostname, IP address, and status). After the cluster is initialized and all services start running, the cluster status changes to **Ready**. 

## 5. Configure a strong password for the default `admin` user on the Harvester UI. 

Once the cluster status changes to **Ready**, you can access the [Harvester UI](../authentication.md) using the management URL displayed on the console. 

## 6. Deploy the other nodes and join them to the cluster. 

Deployment involves installing the operating system and other components on the host, and then rebooting once installation is completed. All other nodes join the cluster that was created when the first node was deployed. 

During installation, you must configure node settings, and specify the cluster management address (virtual IP) and the cluster token that you defined previously. If necessary, you can configure more settings using a [Harvester configuration](../install/harvester-configuration.md) file. 

When the cluster has three or more nodes, the two nodes added after the first node are automatically promoted to management nodes to form a high-availability (HA) cluster. 

## 7. Create a custom cluster network (optional) and a VM network (required).

Networking in Harvester involves three major concepts:

- [**Cluster network**](../networking/clusternetwork.md#cluster-network): Traffic-isolated forwarding path for transmission of network traffic in the Harvester cluster. 
    
    During deployment, a cluster network called [`mgmt`](../networking/clusternetwork.md#built-in-cluster-network) is created for intra-cluster communications. `mgmt` allows VMs to be accessed from the infrastructure network (external to the Harvester cluster) to which each Harvester node attaches with management NICs for cluster management purposes. Harvester also allows you to create [custom cluster networks](../networking/clusternetwork.md#custom-cluster-network) that can be dedicated to VM traffic. 

- [**Network configuration**](../networking/clusternetwork.md#network-configuration): Definition of how cluster nodes connect to a specific cluster network. 
    
    Each network configuration corresponds to a set of nodes with uniform network specifications. Only nodes that are covered by the network configuration can access the associated cluster network. This arrangement offers you flexibility when configuring a heterogeneous cluster, particularly when the network interface names are different for each node.

- [**VM network**](../networking/clusternetwork.md#vm-network): Virtual network that VMs use to communicate with other VMs and the external infrastructure network.
    
    Each VM network is linked to a specific cluster network, which is used for transmission of VM traffic. You can create either a [VLAN network](../networking/harvester-network.md#vlan-network) or an [untagged network](../networking/harvester-network.md#untagged-network) based on your requirements, such as traffic isolation, network segmentation, ease of management, or alignment with the external network environment. 

Before you create VMs, create the necessary networks. If more than one network interface is attached to each cluster node, consider [creating custom cluster networks](../networking/clusternetwork.md#how-to-create-a-new-cluster-network) and network configurations for better traffic isolation. Otherwise, you can only use the management network for transmission of VM traffic. Next, [create a VM network](../networking/harvester-network.md#create-a-vm-network) that is linked to either `mgmt` or any of the custom cluster networks that you created. 

## 8. Import VM images. 

On the Harvester UI, you can import ISO, qcow2, and raw [images](../image/upload-image.md) by uploading an image from the local file system, or by specifying the URL of an image that can be accessed from the cluster. 

## 9. Import SSH keys. (Recommended)

You can store SSH public keys in Harvester. When a VM is launched, a stored key can be [injected](../vm/access-to-the-vm.md#ssh-access) into the VM to allow secure access via SSH. Validated keys are displayed on the **SSH Keys** screen on the Harvester UI. 

## 10. Create VMs. 

You can create [Linux VMs](../vm/create-vm.md) using one of the following methods: 

- Harvester UI: On the **Virtual Machines** screen, click **Create** and configure the settings on each tab. 
- Kubernetes API: Create a `VirtualMachine` object. 
- [Harvester Terraform Provider](../terraform/terraform-provider.md): Define a `harvester_virtualmachine` resource block. 

Creating [Windows VMs](../vm/create-windows-vm.md) on the Harvester UI involves slightly different steps. Harvester provides a VM template named `windows-iso-image-base-template` that adds a volume with the Virtio drivers for Windows, which streamlines the VM configuration process. If you require Virtio devices but choose to not use the template, you must add your own Virtio drivers for Windows to enable correct hardware detection. 

## What's Next

The following sections provide guides that walk you through how to back up and restore VMs, manage hosts, and use Rancher with Harvester.

- [VM Backup, Snapshot & Restore](../vm/backup-restore.md) 
- [Host Management](../host/host.md) 
- [Rancher Integration](../rancher/rancher-integration.md) 
