---
sidebar_position: 6
sidebar_label: Best Practices
title: "Harvester Network Best Practices"
keywords:
- Harvester
- Networking
---

<head>
  <link rel="canonical" href="https://docs.harvesterhci.io/v1.2/networking/best-pratice"/>
</head>

## Overview

This best practice guide introduces how to configure Harvester and the external network to achieve the following goals:
- Traffic isolation between the management plane and the data plane.
- General external switch and router configurations.
- Network access to VMs from different VLANs.
- Access Harvester load balancers from different VLANs.

We will use the following diagram to illustrate an example and the best practices.

![](/img/v1.2/networking/best-practice.png)

The diagram shows a Harvester cluster composed of two hosts. It contains:
- **Hardware**:
  - Two Harvester servers with dual-port network cards.
  - One non-VLAN-aware switch and one VLAN-aware switch. We will use the Cisco-like configuration as an example. 
  - One router. We will use the Cisco-like configuration as an example.

- **Cabling**:
  - The NIC eth0 of the node1 is connected to the port `ethernet1/1` of the switch1, while the NIC eth0 of the node2 is connected to the port `ethernet1/2` of the switch1.
  - The NIC eth1 of the node1 is connected to the port `ethernet1/1` of the switch2, while the NIC eth1 of the node2 is connected to the port `ethernet1/2` of the switch2.
  - The port `ethernet1/3` of the switch1 is connected to the port `ethernet0/1` of the router.
  - The port `ethernet1/3` of the switch2 is connected to the port `ethernet0/2` of the router.
  
- **Network specification**:
  - The subnet of the Harvester hosts is in the VLAN untagged network.
  - All hosts are in the IPv4 subnet `10.10.0.0/24`, and the gateway IP address is `10.10.0.254`.
  - The VM network allows VLAN 100-200.
  - The IPv4 subnets of the VM network are:
    - Untagged network: `192.168.0.0/24`, and the gateway IP address is `192.168.0.254`.
    - VLAN 100: `192.168.100.0/24`, and the gateway IP address is `192.168.100.254`.
    - VLAN 200: `192.168.200.0/24`, and the gateway IP address is `192.168.200.254`.

- **Harvester configuration**:
  - Two cluster networks: `mgmt` and `vm`.
  - Three VM networks under the cluster network `vm`: `vlan100`, `vlan200`, and `untagged`.
  - Six VMs, from `VM1` to `VM6`.
  - One guest cluster `demo` composed of `VM3` and `VM4`.
  - Two VM load balancers and one guest Kubernetes cluster load balancer.

## Multiple Cluster Networks for Traffic Isolation 

The two Harvester hosts have two NICs. Specifically, NIC `eth0` is used for the management network (mapped to the cluster network `mgmt`), while NIC `eth1` is used for the VM network (mapped to the cluster network `vm`). 

It's beneficial to use two cluster networks to achieve traffic isolation between the management plane and the data plane. If there is an issue with the VM network, you can still use the management network for emergency handling to ensure business continuity. Similarly, if there is a failure in the management network, VM traffic is not affected.

If your hardware has more NICs, we recommend using at least two NICs for one cluster network. For example, you can use NIC `eth0` and `eth1` for the management network and NIC `eth2` and `eth3` for the VM network.

## External Switch and Router Configuration

1. ** Switch1 configuration**:


Since the management network is under the untagged network, `switch1` can be a non-VLAN-aware switch. Typically, you can't configure a non-VLAN-aware switch.

2. ** Switch2 configuration**:

Set the ports `ethernet1/1`, `ethernet1/2`, and `ethernet1/3` as trunk ports, and allow VLAN 100-200. 

  ```
  switch2# config terminal
  switch2(config)# interface ethernet1/1
  switch2(config-if)# switchport
  switch2(config-if)# switchport mode trunk
  switch2(config-if)# switchport trunk allowed vlan 100-200
  switch2(config-if)# switchport trunk native vlan 1
  switch2(config-if)# no shutdown
  switch2(config)# interface ethernet1/2
  switch2(config-if)# switchport
  switch2(config-if)# switchport mode trunk
  switch2(config-if)# switchport trunk allowed vlan 100-200
  switch2(config-if)# switchport trunk native vlan 1
  switch2(config-if)# no shutdown
  switch2(config)# interface ethernet1/3
  switch2(config-if)# switchport
  switch2(config-if)# switchport mode trunk
  switch2(config-if)# switchport trunk allowed vlan 100-200
  switch2(config-if)# switchport trunk native vlan 1
  switch2(config-if)# no shutdown
  switch2(config-if)# end
  switch2# copy running-config startup-config
  ```

3. **Router configuration**:

- Configure a DHCP pool for the management network.

  ```
  router# config terminal
  router(config)# ip dhcp pool mgmt
  router(dhcp-config)# network 10.10.0.0 255.255.255.0
  router(dhcp-config)# default-router 10.10.0.254
  router(dhcp-config)# interface ethernet0/1
  router(config-if)# ip address 10.10.0.254 255.255.255.0 
  router(config-if)# no shutdown
  router(config)# exit
  router# copy running-config startup-config
  ```

- Configure three DHCP pools for the VM networks (untagged, vlan100, and vlan200).

  ```
  router# config terminal
  router(config)# ip dhcp pool vm-untagged
  router(dhcp-config)# network 192.168.0.0 255.255.255.0
  router(dhcp-config)# default-router 192.168.0.254
  router(dhcp-config)# ip dhcp pool vm-vlan100
  router(dhcp-config)# network 192.168.100.0 255.255.255.0
  router(dhcp-config)# default-router 192.168.100.254
  router(dhcp-config)# ip dhcp pool vm-vlan200
  router(dhcp-config)# network 192.168.200.0 255.255.255.0
  router(dhcp-config)# default-router 192.168.200.254
  router(config-if)# interface ethernet0/2
  router(config-if)# ip address 192.168.0.254 255.255.255.0
  router(config-if)# no shutdown
  router(config-subif)# interface ethernet0/2.100
  router(config-subif)# encapsulation dot1q 100
  router(config-subif)# ip address 192.168.100.254 255.255.255.0
  router(config-subif)# interface ethernet0/2.200
  router(config-subif)# encapsulation dot1q 200
  router(config-subif)# ip address 192.168.200.254 255.255.255.0
  router(config-subif)# end
  router# copy running-config startup-config
  ```

## Network Access to VMs from Different VLANs

1. **Network connection between VM networks**:

  The router configuration above uses the [`A router on a stick`](https://www.grandmetric.com/knowledge-base/design_and_configure/router-on-a-stick-approach-cisco-configuration/) technology to allow VMs among untagged network, `vlan100` and `vlan200`, to communicate with each other. Thus, adding more configurations to the router is not required.

1. **Network connection between VM networks and the management network**:

  A feasible method to ensure network connectivity between VM networks and the management network is manually adding static routes. The following commands add static routes on the router to allow VMs in the untagged network, `vlan100` and `vlan200`, to access the management network.

  ```
  router(config)# config terminal
  router(config)# ip route 10.10.0.0 255.255.255.0 ethernet0/1
  router(config)# ip route 192.168.0.0 255.255.255.0 ethernet0/2
  router(config)# ip route 192.168.100.0 255.255.255.0 ethernet0/2
  router(config)# ip route 192.168.200.0 255.255.255.0 ethernet0/2
  router(config)# end
  ```

  The route table would look like this:

  ```
  Router#show ip route
  Codes: C - connected, S - static, R - RIP, M - mobile, B - BGP
         D - EIGRP, EX - EIGRP external, O - OSPF, IA - OSPF inter area
         N1 - OSPF NSSA external type 1, N2 - OSPF NSSA external type 2
         E1 - OSPF external type 1, E2 - OSPF external type 2
         i - IS-IS, su - IS-IS summary, L1 - IS-IS level-1, L2 - IS-IS level-2
         ia - IS-IS inter area, * - candidate default, U - per-user static route
         o - ODR, P - periodic downloaded static route

  Gateway of last resort is not set

  C    192.168.200.0/24 is directly connected, Ethernet0/2.200
     10.0.0.0/24 is subnetted, 1 subnets
  C       10.10.0.0 is directly connected, Ethernet0/1
  C    192.168.0.0/24 is directly connected, Ethernet0/2
  C    192.168.100.0/24 is directly connected, Ethernet0/2.100
  ```

## Access Harvester Load Balancers from Different VLANs
The Harvester load balancer is divided into two types: VM load balancer and guest Kubernetes cluster load balancer. 

1. The load balancer IP of the VM load balancer is only exposed within the same network as the Harvester hosts, or in other words, the management network. To access the VM load balancer from outside the network, you have to guarantee routing for external clients to the management network. For example, if the VM load balancer `lb1` has obtained its load balancer IP via DHCP and you want to access it from the VM `VM5`, you can add the following static routes: 

  ```
  router(config)# ip route 10.10.0.0 255.255.255.0 ethernet0/1
  router(config)# ip route 192.168.0.0 255.255.255.0 ethernet0/2
  ```

1. The load balancer IP of the guest Kubernetes cluster load balancer is exposed within the VM network. In the diagram above, the guest cluster `demo` is within the VM network `vlan200` because the VMs consisting of the guest cluster are in the `vlan200`. Thus, the guest Kubernetes cluster load balancer `lb2` is exposed within the VM network `vlan200`. There are three scenarios to explain how to access `lb2` if it has obtained the load balancer IP via DHCP:
   - You can access it from the VM `VM3` and `VM4` directly because they are in the `vlan200`. 
   - You can also access it directly from the VMs in other VM networks because of the `A router on a stick` configuration.
   - You can access it from the Harvester hosts, or in other words, the management network, by adding the following static routes on the router.  

     ```
     router(config)# ip route 10.10.0.0 255.255.255.0 ethernet0/1
     router(config)# ip route 192.168.200.0 255.255.255.0 ethernet0/2
     ```


:::note

Except for the static routes above, you can use dynamic routing protocols such as RIP, BGP, OSPF, and ISIS according to your network planning and requirements.

:::
