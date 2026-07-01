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

## EFI and vTPM Persistent State

Harvester supports cloning virtual machines that use persistent EFI or vTPM states. During cloning, Harvester copies the underlying persistent data that the guest operating system depends on. This ensures the cloned virtual machine retains vital configuration details, such as EFI NVRAM settings and vTPM-stored data (including BitLocker recovery keys).

You can enable EFI and/or vTPM independently before cloning. Harvester preserves only the persistent state required by the cloned virtual machine.

| EFI Status | vTPM Status | Harvester Behavior |
| --- | --- | --- |
| Enabled | Enabled | Preserves both persistent states |
| Enabled | Disabled | Preserves only the EFI state |
| Disabled | Enabled | Preserves only the vTPM state |
| Disabled | Disabled | Skips processing of persistent state storage |

The cloned virtual machine may remain in the `Pending` state while Harvester prepares the persistent state storage.

![efi-tpm-clone.png](/img/v1.9/vm/efi-tpm-clone.png)

:::caution

EFI and vTPM persistent state is stored separately from the volumes listed in `spec.template.spec.volumes`. Harvester creates this storage only after the source virtual machine has been started at least once. If the source virtual machine has never been started, cloning a virtual machine with EFI or vTPM persistent state can fail because the required source storage does not exist.

Because the persistent state is copied from the source virtual machine, guest-visible firmware identifiers such as the firmware UUID will be the same on the cloned virtual machine. The cloned virtual machine still has its own object identity in Harvester.

:::
