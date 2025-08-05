---
sidebar_position: 2
sidebar_label: VM Network
title: "VM Network"
keywords:
- Harvester
- Network
---

<head>
  <link rel="canonical" href="https://docs.harvesterhci.io/v1.5/networking/harvester-network"/>
</head>

Harvester provides three types of networks for virtual machines (VMs), including:

- Management Network
- VLAN Network
- Untagged Network

The management network is usually used for VMs whose traffic only flows inside the cluster. If your VMs need to connect to the external network, use the VLAN network or untagged network.

_Available as of v1.0.1_

Harvester also introduced storage networking to separate the storage traffic from other cluster-wide workloads. Please refer to [the storage network document](../advanced/storagenetwork.md) for more details.


## Management Network
Harvester uses [Canal](https://projectcalico.docs.tigera.io/getting-started/kubernetes/flannel/flannel) as its default management network. It is a built-in network that can be used directly from the cluster.
By default, the management network IP of a VM can only be accessed within the cluster nodes, and the management network IP will change after the VM reboot. This is non-typical behaviour that needs to be taken note of since VM IPs are expected to remain unchanged after a reboot.

However, you can leverage the Kubernetes [service object](https://kubevirt.io/user-guide/virtual_machines/service_objects/) to create a stable IP for your VMs with the management network.

### How to use management network
Since the management network is built-in and doesn't require extra operations, you can add it directly when configuring the VM network.

![](/img/v1.2/networking/management-network.png)

:::info important

Network interfaces of VMs connected to the management network have an [MTU value of `1450`](https://docs.tigera.io/calico/latest/networking/configuring/mtu#determine-mtu-size). This is because a VXLAN overlay network typically has a slightly higher per-packet overhead.

![](/img/v1.3/networking/management-network-mtu.png)

If any of your workloads involve transmission of network traffic, you must specify the appropriate MTU value for the affected VM network interfaces and bridges.

:::

## VLAN Network

The [Harvester network-controller](https://github.com/harvester/harvester-network-controller) leverages the [multus](https://github.com/k8snetworkplumbingwg/multus-cni) and [bridge](https://www.cni.dev/plugins/current/main/bridge/) CNI plugins to implement its customized L2 bridge VLAN network. It helps to connect your VMs to the host network interface and can be accessed from internal and external networks using the physical switch.

### Create a VM Network

1. Go to **Networks** > **VM Networks**. 

1. Select **Create**. 

1. Configure the following settings: 

    - Namespace 
    - Name 
    - Description (optional) 

1. On the **Basics** tab, configure the following settings: 

    - Type: Select **L2VlanNetwork**.
    - Vlan ID 
    - Cluster Network 

    ![](/img/v1.2/networking/create-vlan-network.png)

  :::note

  Virtual machine networks inherit the MTU from the network configuration of the associated cluster network. This ensures that virtual machines benefit from the best possible hardware performance. You cannot set a different MTU for virtual machine networks.

  When you change the MTU on the physical NICs, the newly created virtual machine networks automatically inherit the new MTU. The existing virtual machine networks need to be updated manually. For more information, see [Change the MTU of a Network Configuration with an Attached Storage Network](./clusternetwork.md#change-the-mtu-of-a-network-configuration-with-an-attached-storage-network) and [Change the MTU of a Network Configuration with No Attached Storage Network](./clusternetwork.md#change-the-mtu-of-a-network-configuration-with-no-attached-storage-network).

  :::

1. On the Route tab, select an option and then specify the related IPv4 addresses.

    - Auto(DHCP): The Harvester network controller retrieves the CIDR and gateway addresses from the DHCP server. You can specify the DHCP server address. 

    ![](/img/v1.2/networking/create-network-auto.png)

    - Manual: Specify the CIDR and gateway addresses. 

    ![](/img/v1.2/networking/create-network-manual.png)

    :::info important
    Harvester uses the information to verify that all nodes can access the VM network you are creating. If that is the case, the *Network connectivity* column on the **VM Networks** screen indicates that the network is active. Otherwise, the screen indicates that an error has occurred.
    :::

### Create a VM with VLAN Network
You can now create a new VM using the VLAN network configured above:

- Click the **Create** button on the **Virtual Machines** page.
- Specify the required parameters and click the **Networks** tab.
- Either configure the default network to be a VLAN network or select an additional network to add.

## Untagged Network

As is known, the traffic under a VLAN network has a VLAN ID tag and we can use the VLAN network with `PVID` (default 1) to communicate with any normal untagged traffic. However, some network devices may not expect to receive an explicitly tagged VLAN ID that matches the native VLAN on the switch the uplink belongs to. That's the reason why we provide the untagged network.

### How to use untagged network
The usage of untagged network is similar to [the VLAN network](./harvester-network.md#how-to-use-vlan-network).

To create a new untagged network, go to the **Networks > VM Networks** page and click the **Create** button. You have to specify the name, select the type `Untagged Network` and choose the cluster network.

![](/img/v1.2/networking/create-untagged-network.png)

:::note

Starting from Harvester v1.1.2, Harvester supports updating and deleting VM networks. Make sure to stop all affected VMs before updating or deleting VM networks.

:::

##  Overlay Network

The [Harvester network-controller](https://github.com/harvester/harvester-network-controller) leverages the [kube-ovn] (https://github.com/kubeovn/kube-ovn) to create OVN-based Virtualized Network and provide a bridge for connection. It helps to connect your VMs to the virtualized network which supports the VPC (Virtual Private Cloud) and Subnet to provide SDN features like Multi-Tenancy, Micro-Segmentation, Isolation...etc. The overlay network can be attached to the Subnet created in Virtual Private Cloud so that VM can access the internal virtualized network and reach the external network. However, the VM can not be accessed by external network like VLAN and Untagged network due to the current limitation of the Virtual Private Cloud.


### How to use overlay network
To create a new overlay network, go to the **Networks > VM Networks** page and click the **Create** button. You have to specify the name, select the type `OverlayNetwork`. You don't need to specify the cluster network since the overlay network is only enabled on the default management network.

The overlay network will act as the `Provider` of the Subnet which is created in `Virtual Private Cloud`. Each Subnet must be mapped to exactly one Overlay Network, and vice versa (1:1 relationship). 

:::note
Current limitation in Harvester 1.6
• Overlay networks backed by Kube-OVN can only be created on the default cluster - management network.
• Creating an overlay network on any newly created ClusterNetwork is not supported in this release.
• VMs attached to a Kube-OVN overlay subnet must manually add the subnet’s gateway IP as their default route; the DHCP offer does not automatically install the route, so external access fails until the user fixes it inside the guest OS.
• Underlay networking is not yet implemented, so there is no way to map a subnet directly to a physical network. Consequently, external hosts cannot reach VMs that live on an overlay subnet.
• Any subnet created in a user-defined VPC has natOutgoing: false by default. The field must be manually set to true; otherwise, VMs on the subnet will not be able to reach the Internet even when the gateway is correctly configured.

Future roadmap
• Support for provisioning overlay networks on user-defined ClusterNetworks is targeted for a later release.
• DHCP default-route injection
• Underlay networking support
• Outbound-NAT default policy in user VPCs
:::

![](/img/kubeovn-harvester-topology.png)
