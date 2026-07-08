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

### Create a Provider Network

1. On the Harvester UI, go to **Underlay Networks > Provider Networks**.

1. Click **Create**.

    ![](/img/pn.png)

1. Specify a unique name for the network.

1. On the **Interfaces** tab, configure the following settings:

    - **Default Interface**: Select a physical or bonded interface that is present on every host in your cluster. This interface acts as the main uplink connecting all nodes to the provider network.

    - **Custom Interfaces**: (Optional) Configure a custom interface if your hosts do not have identical network interface names. You can manually map specific interface names to their corresponding nodes to ensure consistent network connectivity.

1. (Optional) On the **Excluded Nodes** tab, select nodes that should not participate in this provider network (for example, nodes that are isolated for dedicated tasks).

1. Click **Create**.

For more information, see [Create Provider Network](https://kubeovn.github.io/docs/v1.16.x/en/start/underlay/#create-providernetwork) in the Kube-OVN documentation.

### Create a VLAN Network

1. On the Harvester UI, go to **Underlay Networks > VLANs**.

    ![](/img/vlan2017.png)

1. Click **Create**.

1. Specify a unique name for the network.

1. On the **Basic** tab, configure the following settings:

    - **VLAN ID**: Specify the VLAN tag number for this network. Traffic passing through this network will automatically be tagged with this ID. If you do not want traffic to be tagged, set the value to `0`.

    - **Provider Network**: Select the underlying provider network. You can map multiple VLANs to the same provider network to segregate traffic over the same physical infrastructure.

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
