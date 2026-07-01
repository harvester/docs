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

The cloned virtual machine inherits the source's basic configuration. You can choose whether to include the source's volume data, as well as customize the clone's name and [run strategy](./create-vm.md#run-strategy).

## Clone a Virtual Machine with Volume Data

1. On the **Virtual Machines** screen, locate the target virtual machine and select **⋮ > Clone**.
    ![clone-vm-with-data.png](/img/v1.8/vm/clone-vm-with-data.png)

2. Specify a unique name for the cloned virtual machine.

3. Select a [run strategy](./create-vm.md#run-strategy).
    The cloned virtual machine uses the source's run strategy by default.

4. Click **Create**.

## Clone a Virtual Machine Without Volume Data

Cloning a virtual machine without volume data creates a new virtual machine with the same configuration as the source virtual machine.

1. On the **Virtual Machines** screen, locate the target virtual machine and select **⋮ > Clone**.
    ![clone-vm-without-data.png](/img/v1.8/vm/clone-vm-without-data.png)
2. Clear **Clone volume data**.

3. Specify a unique name for the cloned virtual machine.

4. Select a [run strategy](./create-vm.md#run-strategy).
    The cloned virtual machine uses the source's run strategy by default.

5. Click **Create**.
![clone-vm-without-data-config.png](/img/v1.8/vm/clone-vm-without-data-config.png)
