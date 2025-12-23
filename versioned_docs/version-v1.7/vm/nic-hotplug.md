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

In addition, virtual machines created using the [Harvester Node Driver](../rancher/node/node-driver.md) and the [Harvester Terraform Provider](terraform/terraform-provider.md) _do not support_ NIC hotplugging and hotunplugging.

:::

## Hotplug NICs to a Running VM

1. On the Harvester UI, go to the **Virtual Machines** screen.

1. Locate the target virtual machine, and then select **⋮** > **Hotplug Network Interface**.

    ![Hotplug Network Interface](/img/v1.7/nic-hotplug/hotplug-network-interface.png)

1. Specify a name for the network interface and select a virtual machine network.

    You can select a [VLAN network](../networking/harvester-network.md#vlan-network), an [untagged network](../networking/harvester-network.md#untagged-network), or a [VLAN trunk network](../networking/harvester-network.md#vlan-trunk-network).

1. Click **Apply**.

Harvester [migrates the virtual machine](./live-migration.md#prerequisites) and the specified interface is connected through bridge binding.

For information about limitations to the number of hotplugged interfaces, see [Virtio Limitations](https://kubevirt.io/user-guide/network/hotplug_interfaces/#virtio-limitations) in the KubeVirt documentation.

## Hotunplug NICs from a Running VM

:::info important

You can perform this action only when the following conditions are met:

- The virtual machine has at least two network interfaces. You cannot hotunplug the single remaining interface.
- The target interface is connected through bridge binding.

:::

1. On the Harvester UI, go to the **Virtual Machines** screen.

1. Click the name of the target virtual machine, and then go to the **Networks** tab.

    ![Hotunplug Network Interface](/img/v1.7/nic-hotplug/hotunplug-network-interface.png)

1. Locate the target interface, and then click **Detach Network Interface**.

Harvester [migrates the virtual machine](./live-migration.md#prerequisites) and detaches the interface.
