---
sidebar_position: 40
keywords:
  - Harvester
  - harvester
  - Rancher
  - rancher
  - Harvester Upgrade
Description: Harvester is built on Kubernetes, which uses CNI as an interface between network providers and Kubernetes pod networking. Naturally, we implement the Harvester network based on CNI. Moreover, the Harvester UI integrates the Harvester network to provide a user-friendly way to configure networks for VMs.
---

# Harvester Network

## Summary
[Harvester](https://github.com/harvester/harvester) is built on Kubernetes, which uses [CNI](https://github.com/containernetworking/cni) as an interface between network providers and Kubernetes pod networking. Naturally, we implement the Harvester network based on CNI. Moreover, the [Harvester UI](https://github.com/harvester/harvester-ui) integrates the Harvester network to provide a user-friendly way to configure networks for VMs.

As of version 0.2.0, Harvester supports two kinds of networks: 

- management network
- [VLAN](https://en.wikipedia.org/wiki/Virtual_LAN)

## Implementation

### Management Network

Harvester adopts [flannel](https://github.com/flannel-io/flannel) as the default CNI to implement the management network. It's an internal network, which means the user can only access the VM's management network within its cluster nodes or pods.

### VLAN

[Harvester network-controller](https://github.com/harvester/harvester-network-controller) leverages the [multus](https://github.com/k8snetworkplumbingwg/multus-cni) and [bridge](https://www.cni.dev/plugins/current/main/bridge/) CNI plugins to implement the VLAN.  

Below is a use case of the VLAN in Harvester.

  ![](./assets/vlan-case.png)

- Harvester network-controller uses a bridge for a node and a pair of veth for a VM to implement the VLAN. The bridge acts as a switch to forward the network traffic from or to VMs and the veth pair is like the connected ports between VMs and switch.
- VMs within the same VLAN can communicate with each other, while the VMs within different VLANs can't.
- The external switch ports connected with the hosts or other devices(such as DHCP server) should be set as trunk or hybrid type and permit the specified VLANs.
- Users can use VLAN with `PVID` (default 1) to communicate with any normal untagged traffic.

## Enabling VLAN in the Harvester UI

Enable VLAN via going to **Setting > vlan** to enable VLAN and input a valid default physical NIC name for the VLAN. 

It is recommended to choose a separate NIC for the VLAN other than the one used for the management network (the one selected during the Harvester installation) for better network performance and isolation. 

!!! note
    Modifying the default VLAN network setting will not change the existing configured host networks.

  ![](./assets/enable-vlan.png)

- (optional) Users can customize each node's VLAN network configuration via going to the **HOST > Network** tab.

  ![](assets/node-network-configuration.png)
  
- A new VLAN network is created by going to the **Advanced > Networks** page and clicking the **Create** button.

  ![](./assets/create-network.png)

- The network is configured when the VM is created.

  - Only the first network interface card will be enabled by default. Users can either choose to use a management network or VLAN network. 
!!! note
    You will need to select the `Install guest agent` option in the `Advanced Options` tab to get the VLAN network IP address from the Harvester UI.

    ![](./assets/vm-network-configuration.png)

  - Users can choose to add one or multiple network interface cards. Additional network interface card configurations can be set via cloud-init network data, for example:

    ```YAML
    version: 1
    config:
      - type: physical
        name: enp1s0 # name is varies upon OS image
        subnets:
          - type: dhcp
      - type: physical
        name: enp2s0 
        subnets:
          - type: DHCP
    ```
