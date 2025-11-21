---
sidebar_position: 13
sidebar_label: NIC Hotplug
title: "NIC Hotplug"
keywords:
  - Harvester
  - harvester
  - Virtual Machine
  - virtual machine
  - Hotplug
  - NIC
description: Hotplug and hotunplug network interfaces to a running VM.
---

<head>
  <link rel="canonical" href="https://docs.harvesterhci.io/v1.6/vm/nic-hotplug"/>
</head>

_Available as of v1.7.0_

:::note

The virtual machine must be [live-migratable](./live-migration.md#live-migratable-virtual-machines).

For virtual machine created prior to v1.7.0, they are not allowed to perform NIC hotplug or hotunplug if there is a network interface configured without settings MAC address explicitly. Restart is required for them to enable NIC hotplug since the observed MAC addresses would be backfilled to the virtual machine configuration during the corresponding reconciliation steps.

Besides, virtual machines created by [Harvester node driver](../rancher/node/node-driver.md) are not allowed for hotplugging and hotunplugging.

:::

Harvester supports hotplugging and hotunplugging NICs to a live-migratable virtual machine. This feature allows you to add and remove NICs to a running virtual machine without requiring a reboot.

## Hotplug NICs to a Running VM

:::note

Only [VLAN network](../../networking/harvester-network.md#vlan-network), [untagged network](../../networking/harvester-network.md#untagged-network), [VLAN trunk network](../../networking/harvester-network.md#vlan-trunk-network) are supported for hotplugging.

:::

You can hotplug an interface to a network using the **Hotplug Network Interface** button.

![Hotplug Network Interface](/img/v1.7/nic-hotplug/hotplug-network-interface.png)


Once you click **Apply**, Harvester [migrates the virtual machine](./live-migration.md#prerequisites) and the new `virtio` model interface would be connected through bridge binding.


:::note

Be aware that there are limitations to the number of hotplugged interfaces. Please refer to [this KubeVirt documentation](https://kubevirt.io/user-guide/network/hotplug_interfaces/#virtio-limitations).

:::

## Hotunplug NICs from a Running VM

:::note

Hot-unplug is only supported for interfaces connected through bridge binding.
If there is only single network interface left, it's not allowed to be hotunplugged.

:::

Navigate to the **Networks** tab of the detail page of a virtual machine. **Detach Network Interface** button can be used to hotunplug the interface.


![Hotunplug Network Interface](/img/v1.7/nic-hotplug/hotunplug-network-interface.png)

Once you click it, Harvester [migrates the virtual machine](./live-migration.md#prerequisites) and the interface would be detached.
