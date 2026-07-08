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

![](/img/pureunderlay.png)

## Kube-OVN Underlay Mode

While traditional VLAN networking already enables virtual machines to communicate directly with the physical infrastructure, Kube-OVN's _Underlay_ mode extends this capability by embedding native Layer 2 connectivity directly into the OVN networking control plane. This deep integration allows workloads to leverage your existing physical underlay infrastructure while coexisting seamlessly with standard overlay networks inside the same Kubernetes cluster.

Furthermore, integrating Kube-OVN’s underlay capabilities into Harvester ensures that virtual machines connected to the physical network do not lose their cloud-native security features. Workloads can still benefit from advanced micro-segmentation capabilities, including subnet ACLs and granular network policies, allowing you to maintain strict traffic control across both virtual and physical network boundaries.Use [Network Isolation](https://docs.harvesterhci.io/v1.9/networking/kubeovn-vm-isolation) to achieve microsegmentation of VMs using underlay Network.

## Underlay Installation

#### Create a Provider Network

1. Go to > **Underlay Networks**.

1. Select **Create**.

1. Configure the following settings:

    - Name
    - Description (optional)

1. On the **Interfaces** tab, configure the following settings:

    - Select **Default Interface**. This is any physical or bond interface available on all the Harvester host.The provider network using this spans all nodes in the cluster.
    - Select **Custom Interfaces**. (Optional). If the interface names are not same on all the nodes in the cluster, user provides specific interface name to nodename mapping.
      - Interface Name
      - Nodes
    - Select **Excluded Nodes**. (Optional). These nodes are excluded from provider network configuration.
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

    - Select **VLAN ID**.VLAN ID/Tag, Kube-OVN will add this Vlan tag to traffic, if set 0, no tag is added. the vlan tag applies to a localnet port.
    - Select **Provider Network**. The name of ProviderNetwork. Multiple VLAN can use a same ProviderNetwork.

    ![](/img/vlan2017.png)

Refer [VLAN Network Configuration](https://kubeovn.github.io/docs/v1.16.x/en/start/underlay/#create-vlan)

#### Create an Overlay Network

Follow [Create an Overlay Network](https://docs.harvesterhci.io/v1.9/networking/harvester-network#create-an-overlay-network) to create an Overlay Network.

1. Select `kube-system` namespace

1. On the **Basics** tab, configure the following additional settings:

    - Select **OverlayNetwork**.
    - Select **Network Interface Card** (`The NIC selected here must match the interface provided in Provider Network`)

     ![](/img/vswitchexternal.png)

#### Create a Subnet in custom or default VPC

Follow [Create a Subnet](https://docs.harvesterhci.io/v1.8/networking/kubeovn-vpc/#subnet-settings)

1. On the **Basics** tab, configure the following additional settings:

    - **VLAN**. Name of the vlan resource configured for the Provider Network.

     ![](/img/subnetexternal.png)


#### Create VMs attached to underlay network using `vswitchexternal`
Refer [Create a VM](https://docs.harvesterhci.io/v1.9/vm/index#how-to-create-a-vm)
