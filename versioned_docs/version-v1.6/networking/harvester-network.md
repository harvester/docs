---
sidebar_position: 2
sidebar_label: VM Network
title: "VM Network"
keywords:
- Harvester
- Network
---

<head>
  <link rel="canonical" href="https://docs.harvesterhci.io/v1.6/networking/harvester-network"/>
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

`mgmt` uses the default MTU value `1500` if you do not specify a value other than `0` or `1500` in the [`install.management_interface`](../install/harvester-configuration.md#installmanagement_interface) setting during installation. However, the network interfaces of virtual machines connected to `mgmt` have an MTU value of [`1450`](https://docs.tigera.io/calico/latest/networking/configuring/mtu#determine-mtu-size). This is because Harvester uses the **Calico and Flannel CNI**, which has an overhead of 50 bytes per packet, to carry the in-cluster overlay network.

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

  When you change the MTU on the physical NICs of cluster network uplink, the newly created virtual machine networks automatically inherit the new MTU. The existing virtual machine networks are also updated automatically. For more information, see [Change the MTU of a Network Configuration with an Attached Storage Network](./clusternetwork.md#change-the-mtu-of-a-network-configuration-with-an-attached-storage-network) and [Change the MTU of a Network Configuration with No Attached Storage Network](./clusternetwork.md#change-the-mtu-of-a-network-configuration-with-no-attached-storage-network).

  The Harvester webhook does not allow you to directly change the MTU on VM networks.

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
The usage of untagged network is similar to [the VLAN network](#vlan-network).

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

    ![](/img/create_vm_networks.png)

2. On the **Virtual Machine Network:Create** screen, specify a name for the network.

3. On the **Basics** tab, select `OverlayNetwork` as the network type.

  Specifying a cluster network is not required because the overlay network is only enabled on `mgmt` (the built-in management network).

4. Click **Create**.

### Limitations
The overlay network implementation in Harvester v1.6 has the following limitations:
- Overlay networks that are backed by Kube-OVN can only be created on `mgmt` (the built-in management network).
- By default, the `enableDHCP` and `dhcpV4Options` settings are not configured, so no default route exists on virtual machines that are attached to a Kube-OVN overlay subnet. Attempts to access external destinations fail until the default route is correctly configured on the guest operating system. You can perform either of the following workarounds:

    - Manually add the subnet’s gateway IP as the virtual machine's default route.
    - Use the `managedTap` binding: Edit the YAML configuration of the attached subnet, and verify that the field `.spec.enableDHCP` is set to `true`. Next, edit the YAML configuration of the virtual machine, and modify the interface definition to use binding.
      ```
            interfaces:
            - binding:
                name: managedtap
              model: virtio
              name: default
      ```

- Kube-OVN "native" load balancers are not integrated yet because this requires fundamental changes to the upstream codebase. Kube-OVN currently functions as the primary CNI plug-in for each cluster.
- Underlay networking is still unavailable. Consequently, you cannot directly map a subnet to a physical network, and external hosts cannot reach virtual machines that live on an overlay subnet.
- The `natOutgoing` field is set to `false` by default in all subnets (in both default and custom VPCs). Only subnets that belong to the default VPC can reach the internet after you change the value to `true` and configure the default route. Subnets created in custom VPCs are unable to access the internet without `VpcNatGateway` support.
- The static IP in cloud-init appears to be ignored for overlay NICs. In practice, the static IP works *only if it matches the exact address Kube-OVN has reserved* for the virtual machine. Any other. value breaks connectivity.
- When multiple NICs are attached and the overlay NIC is not the primary interface, you must manually initialize the overlay NIC within the guest operating system (IP link setup) and run the DHCP client (dhclient) command to obtain the NIC's IP address.
- Peering only works between custom VPCs. Attempts to establish a peering connection between the default VPC and a custom VPC will fail.
- Kube-OVN native LBs are not integrated yet because Kube-OVN is designed and implemented as the primary CNI plug-in for a cluster. This requires fundamental changes to the upstream codebase.
- Virtual machine load balancers, which are provided by the Harvester Load Balancer, are not compatible with Kube-OVN overlay networks. You can only use these load balancers with VLAN networks.
- Cluster load balancers, which are provided by the Harvester Cloud Provider and the Harvester Load Balancer, do not function properly with guest clusters on Kube-OVN overlay networks. The compatibility issues are caused by the following:

    - `Pool` IPAM: Kube-OVN is unaware that the load balancer's front-end IP addresses are allocated from pools managed by the Harvester Load Balancer. This can lead to IP address conflicts.

    - `DHCP` IPAM: Dynamic IP address allocation does not work even when the DHCP service is enabled for the Kube-OVN subnet. The lease record is managed on the control plane by Kube-OVN. Integration enhancements are required to allow the affected components to function properly together.

- Rancher integration (specifically, downstream cluster creation using the Harvester Node Driver) only works on Kube-OVN overlay networks within the default VPC. To ensure successful cluster creation, you must perform the following actions:

    - Enable the DHCP service for the overlay network. You must set a valid default gateway.
    - Manually update the underlying virtual machine spec to adapt the `managedTap` binding interface for the downstream cluster during the cluster provision period.
