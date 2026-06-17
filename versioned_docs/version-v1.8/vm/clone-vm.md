---
sidebar_position: 10
sidebar_label: Clone VM 
title: "Clone VM"
keywords:
  - Harvester
  - harvester
  - Rancher
  - rancher
  - Clone VM
description: VM can be cloned with/without data. This function doesn't need to take a VM snapshot or set up a backup target first.
---

<head>
  <link rel="canonical" href="https://docs.harvesterhci.io/v1.8/vm/clone-vm"/>
</head>

_Available as of v1.1.0_

VM can be cloned with/without data. This function doesn't need to take a VM snapshot or set up a backup target first.

The cloned VM inherits the source VM's basic configuration. Before cloning, you can update settings such as the VM name, volume data cloning, and [run strategy](./create-vm.md#run-strategy).

## Clone VM with volume data

1. On the `Virtual Machines` page, click `Clone` of the VM actions.
2. Select a [run strategy](./create-vm.md#run-strategy). The cloned VM uses the source VM's run strategy by default.
3. Set a new VM name and click `Create` to create a new VM.
![clone-vm-with-data.png](/img/v1.8/vm/clone-vm-with-data.png)

## Clone VM without volume data

Cloning a VM without volume data creates a new VM with the same configuration as the source VM.

1. On the `Virtual Machines` page, click `Clone` of the VM actions.
2. Clear the `clone volume data` checkbox.
3. Select a [run strategy](./create-vm.md#run-strategy). The cloned VM uses the source VM's run strategy by default.
4. Set a new VM name and click `Create` to create a new VM.
![clone-vm-without-data.png](/img/v1.8/vm/clone-vm-without-data.png)
![clone-vm-without-data-config.png](/img/v1.8/vm/clone-vm-without-data-config.png)
