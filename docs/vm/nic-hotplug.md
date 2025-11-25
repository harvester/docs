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

Harvester supports hotplugging and hotunplugging of network interface controllers (NICs) for [live-migratable](./live-migration.md#live-migratable-virtual-machines) virtual machines. This feature allows you to add and remove network interfaces from a running virtual machine without requiring a reboot.

:::note

You cannot perform NIC hotplugging on virtual machines created in clusters running Harvester versions earlier than v1.7.0 _if the network interface's MAC address was not explicitly configured_. To enable this feature, you must restart those virtual machines. Restarting allows the system to automatically save the observed MAC addresses to the virtual machine's configuration.

In addition, virtual machines created by the [Harvester Node Driver](../rancher/node/node-driver.md) do not support NIC hotplugging and hotunplugging.

:::

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
