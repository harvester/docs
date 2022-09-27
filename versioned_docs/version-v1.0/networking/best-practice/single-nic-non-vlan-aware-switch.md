---
sidebar_position: 5
sidebar_label: Single NIC with Non VLAN-aware Switch
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

# Single NIC with Non VLAN-aware Switch

In this best practice guide for "non VLAN-aware" switch, also known as "dummy" switch, we will introduce Harvester VLAN network and external switch configuration for common scenario.

## Architecture

Hardware:

- Three Harvester servers with only one single port network card.
- One or more "non VLAN-aware" switch(es).

Network Specification:

- The host and the VM networks are in the same subnet.

Cabling:

- The Harvester servers are connected to the switch in a port from `1` to `3`.

The following diagram illustrates the cabling used for this guide:

   ![non-vlan-aware-case.png](/img/v1.0/networking/best-practice/non-vlan-aware-case.png)

## External Switch Configuration

Typically, a "non VLAN-aware" switch cannot be configured.

## Create a VLAN Network in Harvester

You can create a new VLAN network in the **Advanced > Networks** page, and click the **Create** button.

Specify the name and VLAN ID that you want to create for the VLAN network <small>(You can specify the same VLAN ID in different namespaces if you have [Rancher multi-tenancy](../../rancher/virtualization-management.md#multi-tenancy) configured)</small>.

   ![create-vlan-network.png](/img/v1.0/networking/best-practice/create-network.png)

### Connect a VM to the subnet of the Harvester hosts

The "non VLAN-aware" switch will only send out untagged network traffic to the subnet of the Harvester hosts. In Harvester, the untagged traffic is received in VLAN 1.

If you need a VM to connect to the subnet of the Harvester hosts, you have to create a VLAN Network in Harvester with VLAN ID 1.

   ![non-vlan-aware-vlan1.png](/img/v1.0/networking/best-practice/non-vlan-aware-vlan1.png)

Please refer to [this page](../harvester-network.md) for additional information on Harvester Networking.

:::note

If you create a VLAN Network different from `1`, the connection between VMs in different nodes will fail.

:::
