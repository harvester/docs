---
sidebar_position: 50
keywords:
  - Harvester
  - harvester
  - Rancher
  - rancher
Description: Harvester is built on Kubernetes, which uses CNI as an interface between network providers and Kubernetes pod networking. Naturally, we implement the Harvester network based on CNI. Moreover, the Harvester UI integrates the Harvester network to provide a user-friendly way to configure networks for VMs.
---

# Best Practice for VLAN-aware Switch

In this best practice guide for VLAN-aware switch, we will introduce Harvester VLAN network and external VLAN-aware switch configuration for common scenario.

## Architecture

Hardware:
- 3 Harvester servers with only single port network card
- VLAN-aware switch (taking Cisco-like configuration as example)

Network Specification:
- Management Network to control Harvester servers in VLAN 100
- VM Network in VLAN 101-200

Cabling:
- Harvester servers connect to switch port from port 1 to 3

The below diagram illustrates cabling in this guide.

   ![vlan-aware-case.png](assets/vlan-aware-case.png)

## External Switch Configuration

In external switch, we takes Cisco-like configuration as example. Users should apply the following configurations to their switch.

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

A new VLAN network can be created via the **Advanced > Networks** page and clicking the **Create** button.

Specify the name and VLAN ID that you want to create for the VLAN network <small>(You can specify the same vlan ID on different namespaces of [Rancher multi-tenancy](/rancher/virtualization-management/#multi-tenancy) support)</small>.
   ![create-vlan-network.png](assets/create-network.png)

### Connect VM to the same network of Harvester management network

Once users finished the configuration in the previous section, external switch will send out untagged network traffic for manangement. Inside Harvester, the default VLAN tag to receive untagged taffic is VLAN 1.

If users need VM connects to VLAN 100, management network, users can create a VLAN Network in Harvester with VLAN ID 1 configuration instead of VLAN ID 100.

External switch will remove VLAN 100 from the packet for egress and `harvester-br0` will add VLAN 1 to the packet and treat it as VLAN 1. Shown as the below diagram.

   ![vlan-aware-native-vlan.png](assets/vlan-aware-native-vlan.png)

!!! note
    Do not create VLAN Network with VLAN 100 and associate any VM to it. Connectivity will not always be ensured and depend on external switch behavior to add/remove VLAN tag from packets.

### Connect VM to Specific VLAN network

Users need to create VLAN Network with specific VLAN ID in need and asscicate VM to that VLAN network. Refer to [Harvester Network](/networking/harvester-network/)
