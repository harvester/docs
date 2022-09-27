---
sidebar_position: 4
sidebar_label: Single NIC with VLAN-aware Switch
title: ""
keywords:
  - Harvester
  - harvester
  - Rancher
  - rancher
  - Network
  - network
  - VLAN
  - vlan
Description: Harvester is built on top of Kubernetes, and uses the [CNI](https://github.com/containernetworking/cni) as the interface between network providers and Kubernetes pod networking. Naturally, we implement the Harvester network based on CNI. Moreover, the Harvester UI integrates the network configuration in order to provide a user-friendly way to configure networks for VMs.
---

# Single NIC with VLAN-aware Switch

In this best practice guide on how to configure "VLAN-aware", we will introduce Harvester VLAN network and external switch configuration for common scenario.

## Architecture

Hardware:

- Three Harvester servers with only one single port network card.
- One or more VLAN-aware switch(es). We will use "Cisco like" configuration as example.

Network Specification:

- Assume that the subnet of the Harvester hosts is in VLAN 100.
- Assume that the VMs are in the VLAN 101-200.

Cabling:

- The Harvester servers are connected to the switch in a port from `1` to `3`.

The following diagram illustrates the cabling used for this guide:

   ![vlan-aware-case.png](/img/v1.0/networking/best-practice/vlan-aware-case.png)

## External Switch Configuration

For the external switch configuration, we'll use a "Cisco like" configuration as example. You can apply the following configurations to your switch:

```
switch# config terminal
switch(config)# interface ethernet1/<Port Number>
switch(config-if)# switchport
switch(config-if)# switchport mode trunk
switch(config-if)# switchport trunk allowed vlan 100-200
switch(config-if)# switchport trunk native vlan 100
switch(config-if)# no shutdown
switch(config-if)# end
switch# copy running-config startup-config
```

## Create a VLAN Network in Harvester

You can create a new VLAN network in the **Advanced > Networks** page, and click the **Create** button.

Specify the name and VLAN ID that you want to create for the VLAN network <small>(You can specify the same VLAN ID in different namespaces if you have [Rancher multi-tenancy](../../rancher/virtualization-management.md#multi-tenancy) configured)</small>.

   ![create-vlan-network.png](/img/v1.0/networking/best-practice/create-network.png)

### Connect a VM to the subnet of the Harvester hosts

Once you finished the configuration in the previous section, the external switch will send out untagged network traffic to the subnet of the Harvester hosts. In Harvester, the untagged traffic is received in VLAN 1.

Therefore, if you need VMs to connect to the VLAN ID 100, you need to create a VLAN ID 1 Network in Harvester.

The external switch will remove the VLAN 100 tag from the packet for egress and `harvester-br0` will add the VLAN 1 tag to the packet and treat it as VLAN 1 as shown in the following diagram:

   ![vlan-aware-native-vlan.png](/img/v1.0/networking/best-practice/vlan-aware-native-vlan.png)

:::caution

Do not create a VLAN Network with VLAN 100 and associate any VM to it. The connectivity will not always be ensured and depends on the external switch behavior to add/remove VLAN tag from packets.

:::

### Connect a VM to specific VLAN network

You need to create a VLAN Network with specific VLAN ID and associate the VM to that VLAN network. 

Please refer to [this page](../harvester-network.md) for additional information on Harvester Networking.
