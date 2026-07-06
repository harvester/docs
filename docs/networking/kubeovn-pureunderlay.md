---
sidebar_position: 12
sidebar_label: Pure Underlay Networking
title: "Pure Underlay Networking"
keywords:
- Harvester
- networking
- Kube-OVN
- overlay VMs
- underlay networking
---

<head>
  <link rel="canonical" href="https://docs.harvesterhci.io/v1.9/networking/kubeovn-pureunderlay"/>
</head>

:::note

All features that use Kube-OVN are considered experimental. For more information about experimental features, see [Feature Labels](../getting-started/document-conventions.md#feature-labels).

:::

A pure underlay network allows virtual machines to connect directly to a physical Layer 2 network without overlay networking and the encapsulation overhead of technologies such as VXLAN or Geneve. Each virtual machine becomes a first-class member of the external network, communicating natively using standard Ethernet frames.

In Harvester, this direct connectivity is achieved by attaching virtual machines to a provider network, which maps a physical NIC or bonded interface on each host to the cluster. Traffic leaves the virtual machine through the host's physical interface and reaches the external network immediately, bypassing overlay tunnels completely.

## Kube-OVN Underlay Mode

While traditional VLAN networking already enables VMs to communicate directly with the physical network, Kube-OVN's Pure Underlay extends this capability by integrating native Layer 2 connectivity into the Kube-OVN networking model. This allows workloads to leverage existing underlay infrastructure while coexisting seamlessly with overlay networks in the same Kubernetes cluster.

Also by integrating underlay networking of Kube-OVN into SUSE Virtualization, VMs connected to the physical network can still benefit from Kube-OVN's micro-segmentation capabilities, including Subnet ACLs and Network Policies. This enables fine-grained traffic control between workloads.

### Underlay Installation

#### Create a Provider Network

1. Go to > **Underlay Networks**.

1. Select **Create**.

1. Configure the following settings:

    - Name
    - Description (optional)

1. On the **Interfaces** tab, configure the following settings:

    - Select **Default Interface**.
    - Select **Custom Interfaces**. (Optional)
      - Interface Name
      - Nodes
    - Select **Excluded Nodes**. (Optional)
      - Nodes

    ![](/img/pn.png)

Refer [Provider Network Configuration](https://kubeovn.github.io/docs/v1.16.x/en/start/underlay/#create-providernetwork)

#### Create a VLAN Network

1. Go to > **VLANs**.

1. Select **Create**.

1. Configure the following settings:

    - Name
    - Description (optional)

1. On the **Basics** tab, configure the following settings:

    - Select **VLAN ID**.
    - Select **Provider Network**.

    ![](/img/vlan2017.png)

Refer [VLAN Network Configuration](https://kubeovn.github.io/docs/v1.16.x/en/start/underlay/#create-vlan)

#### Create an Overlay Network

1. Go to **Networks** > **Overlay Networks**.

1. Select **Create**.

1. Configure the following settings:

    - Namespace (`kube-system`)
    - Name
    - Description (optional)

1. On the **Basics** tab, configure the following settings:

    - Select **OverlayNetwork**.
    - Select **Network Interface Card** (`The NIC selected here must match the interface provided in Provider Network`)

     ![](/img/vswitchexternal.png)

#### Create a Subnet in custom or default VPC

1. Go to **Overlay Networks** > **Virtual Private Cloud**.

1. Select **Create Subnet** under `ovn-cluster`

1. Configure the following settings:

    - Name
    - Description (optional)

1. On the **Basics** tab, configure the following settings:

    - **CIDR Block**.
    - **Provider Network**.
    - **Gateway IP**
    - **Protocol**
    - **VPC**
    - **VLAN**

     ![](/img/subnetexternal.png)


#### Create VMs attached to underlay network using `vswitchexternal`
Refer [Create a VM](https://docs.harvesterhci.io/v1.9/vm/index#how-to-create-a-vm)

### Underlay Networking Explained

![](/img/pureunderlay.png)


### Micro segmentation

Use [Network Isolation](https://docs.harvesterhci.io/v1.9/networking/kubeovn-vm-isolation) to achieve microsegmentation of VMs using underlay Network.
