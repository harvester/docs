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

Harvester supports CPU and memory hotplug for virtual machines. This feature allows you to increase the CPU and memory resources of a running virtual machine without requiring a reboot.

## Create VM with CPU / Memory Hotplug

1. On VM creation page, click `Enable CPU and memory hotplug` checkbox.

1. Edit Maximum CPU and Memory values as needed. This is maximum number of CPU cores and memory that can be dynamically adjusted for the VM.

1. Complete the rest of the VM creation process as usual.

1. After the VM is created, you can dynamically add CPU cores and memory through `Edit CPU and Memory` button.

1. Change the CPU and Memory values as needed, and then click `Apply` to apply the changes.

1. The VM will be migrated to a new node with new CPU and Memory settings.

![Enable CPU and Memory Hotplug](/img/v1.6/cpu-memory-hotplug/enable-cpu-and-memory-hotplug.png)

![Edit CPU and Memory](/img/v1.6/cpu-memory-hotplug/edit-cpu-and-memory.png)

## `max-hotplug-ratio` settings

The `max-hotplug-ratio` setting is a global setting. The default value is `4`. It defines the default maximum CPU and memory. For example, if the `max-hotplug-ratio` is set to `4` and the VM CPU is `1` and memory is `2Gi`, the maximum CPU and memory that can be hotplugged are `4` and `8Gi`, respectively.

![Edit max-hotplug-ratio](/img/v1.6/cpu-memory-hotplug/edit-max-hotplug-ratio.png)
