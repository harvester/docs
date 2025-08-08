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

##  Overlay Network [Experimental]

The [Harvester network-controller](https://github.com/harvester/harvester-network-controller) leverages [Kube-OVN] (https://github.com/kubeovn/kube-ovn) to create an OVN-based virtualized network that supports advanced SDN capabilities such as virtual private cloud (VPC) and subnets for virtual machine workloads.

An overlay network represents a virtual layer 2 switch that encapsulates and forwards traffic between virtual machines. This network can be linked to the subnet created in the VPC so that virtual machines can access the internal virtualized network and also reach the external network. However, the same virtual machines cannot be accessed by external networks such as VLANs and untagged networks because of current VPC limitations.

![](/img/kubeovn-harvester-topology.png)

### Create an Overlay Network
1. Go to **Networks > Virtual Machine Networks**, and then click **Create**.

2. On the **Virtual Machine Network:Create** screen, specify a name for the network.

3. On the **Basics** tab, select `OverlayNetwork` as the network type.

  Specifying a cluster network is not required because the overlay network is only enabled on `mgmt` (the built-in management network).

4. Click **Create**.


### How to use overlay network
To create a new overlay network, go to the **Networks > VM Networks** page and click the **Create** button. You have to specify the name, select the type `OverlayNetwork`. You don't need to specify the cluster network since the overlay network is only enabled on the default management network.

The overlay network functions as the provider of the subnet that is created in the virtual private cloud. Because of this, each subnet must be mapped to only one overlay network, and each overlay network can be used by only one subnet. This one-to-one relationship ensures that routing behavior is clear and predictable, subnets are isolated, and routing conflicts and traffic leakage are avoided.



![](/img/create_vm_networks.png)

![](/img/create_vpc.png)

![](/img/create_subnet.png)

### Limitations
The overlay network implementation in Harvester v1.6 has the following limitations:
- Overlay networks that are backed by Kube-OVN can only be created on `mgmt` (the built-in management network).
- If a virtual machine is attached to a Kube-OVN overlay subnet, you must manually add the subnet’s gateway IP as the virtual machine's default route. Attempts to access external destinations fail until you add the route from within the guest operating system.
- Underlay networking is still unavailable. Consequently, you cannot directly map a subnet to a physical network, and external hosts cannot reach virtual machines that live on an overlay subnet.
- The `natOutgoing` field is set to `false` by default in all subnets whether they are created in the default VPC or in a user-defined VPC. If you do not change the value to `true`, virtual machines on the subnet are unable to reach the internet even when the gateway is correctly configured.
- Static IP defined in cloud-init is ignored for Overlay NICs; the interface will always receive an auto-assigned address from the Subnet’s CIDR.
- When multiple NICs are attached and the Overlay NIC is not the primary interface, the user must manually bring it up inside the VM (ip link set up) and run DHCP (dhclient ) to obtain its IP.
- Peering does **not** work between a **default VPC** and a **custom VPC**. It only works between **custom VPCs**.

