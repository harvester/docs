---
sidebar_position: 12
sidebar_label: CPU and Memory Hotplug
title: "CPU and Memory Hotplug"
keywords:
  - Harvester
  - harvester
  - Virtual Machine
  - virtual machine
  - CPU
  - cpu
  - Memory
  - memory
  - CPU Hotplug
  - cpu hotplug
  - Memory Hotplug
  - memory hotplug
description: Create VM with CPU / Memory Hotplug
---

<head>
  <link rel="canonical" href="https://docs.harvesterhci.io/v1.6/vm/cpu-memory-hotplug"/>
</head>

_Available as of v1.6.0_

:::note

ARM64 architecture only supports memory hotplug. CPU hotplug operations require you to restart the virtual machine.

:::

Harvester supports CPU and memory hotplug for virtual machines. This feature allows you to increase the CPU and memory resources of a running virtual machine without requiring a reboot.

## Enable CPU and Memory Hotplug During Virtual Machine Creation

1. On the **Virtual Machine:Create** screen, specify the number of CPU cores and memory to be allocated.

  ![Enable CPU and Memory Hotplug](/img/v1.6/cpu-memory-hotplug/enable-cpu-and-memory-hotplug.png)

1. Select **Enable CPU and memory hotplug**.

  Harvester automatically populates the **Maximum CPU** and **Maximum Memory** fields based on the `max-hotplug-ratio` setting. These values represent the maximum amount of CPU and memory resources that are available to the virtual machine during runtime. You can change these values, if necessary.

1. Complete the rest of the virtual machine creation steps.

## Trigger CPU and Memory Hotplug Action

After the virtual machine is created, you can dynamically add CPU and memory resources using the **Edit CPU and Memory** button.

![Edit CPU and Memory](/img/v1.6/cpu-memory-hotplug/edit-cpu-and-memory.png)

Once you click **Apply**, Harvester [migrates the virtual machine](./live-migration.md#prerequisites) to a node with the configured CPU and memory amounts.

:::note

The virtual machine must be [live-migratable](./live-migration.md#live-migratable-virtual-machines).

:::

## `max-hotplug-ratio` setting

`max-hotplug-ratio` is a global setting that determines the default maximum amount of CPU and memory resources that are available to a running virtual machine. This ratio is multiplied by the amount of CPU and memory resources that you allocated when you created the virtual machine.

> Maximum available resource at runtime = Resource allocated during virtual machine creation x `max-hotplug-ratio` value

You can specify a value from `1` to `20`. The default value is `4`.

Example:

The `max-hotplug-ratio` is set to `4`.

| Resource | Allocated Amount | Maximum Available Amount |
| --- | --- | --- |
| CPU cores | `1` | `4` |
| Memory (Gi) | `2` | `8` |

![Edit max-hotplug-ratio](/img/v1.6/cpu-memory-hotplug/edit-max-hotplug-ratio.png)
