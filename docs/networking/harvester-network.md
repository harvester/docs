---
sidebar_position: 2
sidebar_label: VM Network
title: "VM Network"
keywords:
- Harvester
- Network
---

<head>
  <link rel="canonical" href="https://docs.harvesterhci.io/v1.1/networking/harvester-network"/>
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

1. On the Route tab, select an option and then specify the related IPv4 addresses.

    - Auto(DHCP): The Harvester network controller retrieves the CIDR and gateway addresses from the DHCP server. You can specify the DHCP server address. 

    ![](/img/v1.2/networking/create-network-auto.png)

    - Manual: Specify the CIDR and gateway addresses. 

    ![](/img/v1.2/networking/create-network-manual.png)

    :::info important
    Harvester uses the information to verify that all nodes can access the VM network you are creating. If that is the case, the *Network connectivity* column on the **VM Networks** screen indicates that the network is active. Otherwise, the screen indicates that an error has occurred. Please check [the Route Connectivity section](#about-route-connectivity) for more details.
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

## About Route Connectivity

![](/img/v1.3/networking/route-connectivity.png)

There are four possible cases for the **Route Connectivity** for each VM Network:

- `Active`, meaning the connectivity between the VM Network and Harvester hosts via the configured gateway is confirmed.
- `Dhcp failed`, meaning Harvester cannot get the route information via DHCP, therefore it cannot confirm the connectivity between the VM Network and Harvester hosts. Please ensure the DHCP server is configured appropriately and is L2-reachable (or routable if a DHCP relay server is provided in the target network). Otherwise, please provide the gateway IP address directly during the VM Network creation.
- `Ping failed`, meaning Harvester is unable to send ICMP Echo Request packets. This rarely happens.
- `Inactive`, meaning such a VM Network is not reachable (or reachable but packet loss is greater than 20%) from Harvester hosts. Please ensure the gateway is configured appropriately and is reachable via the management network where the Harvester nodes live.

:::info important

For the [VM load balancer feature](./loadbalancer#vm-load-balancer) to work, the VM network must be `Active` in terms of route connectivity.

:::

Behind the scenes, the Harvester network controller checks the connectivity of each VM Network. Connectivity means whether the target VM Network is reachable (via router(s) if necessary) from the Harvester node. The check is essential because it indicates that such a VM Network is suitable for running workloads that require connections to the Harvester node, especially the control plane. For instance, the Harvester cloud provider that is running in the guest cluster needs to access the underlying Harvester/Kubernetes APIs to be able to calculate the node topology and provide the load balancer feature.

To check the connectivity, the gateway IP address is of interest to the Harvester network controller. Such information could be absent during  VM Network creation. However, it's still possible to get it if a DHCP server is running on the target VM Network and configured with the gateway information. If the user actively provides the gateway information during network creation, the network controller happily accepts it. Otherwise, the network controller will create a helper job on the target network that acts as a DHCP client to get the gateway information. With the gateway IP address in mind, the network controller then sends ICMP Echo Request packets from the management network to the gateway and waits for responses.

To wrap up, the **Route Connectivity** for VM Networks is an important indicator representing the connectivity between the VM Network and the management network where the Harvester nodes live.

:::note

If a VM Network's route connectivity is `Dhcp failed`, `Ping failed`, or `Inactive`, it doesn't mean the network is entirely unusable. It depends on what you're going to do with the network. Suppose you only want to run some workloads that should be completely isolated from any other network, including the management network where the Harvester nodes live. In that case, the VM Network is suitable for the job. Whether or not the VM Network has Internet connectivity is not the concern of the Harvester network controller.

:::
