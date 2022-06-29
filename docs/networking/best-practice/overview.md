---
sidebar_position: 1
sidebar_label: Overview
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

# Overview

In a real production environment, we generally recommend that you have multiple NICs in your machine, one for node access and one for VM networking. If your machine has multiple NICs, please refer to [multiple NICs](multiple-nics-vlan-aware-switch.md) for best practices. Otherwise, please refer to [Single NIC](single-nic-vlan-aware-switch.md) best practice.

:::note

If you configure a `bond` interface with multiple NICs, please refer to the single NIC scenario, unless the Harvester node has multiple `bond` interfaces.

:::

## Best Practice

- [Multiple NICs with VLAN-aware switch](multiple-nics-vlan-aware-switch.md)
- [Multiple NICs with non VLAN-aware switch](multiple-nics-non-vlan-aware-switch.md)
- [Single NIC with VLAN-aware switch](single-nic-vlan-aware-switch.md)
- [Single NIC with non VLAN-aware switch](single-nic-non-vlan-aware-switch.md)
