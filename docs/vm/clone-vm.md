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

## EFI and vTPM Persistent State

Harvester supports cloning VMs that use persistent EFI or vTPM state. When you clone this type of VM, Harvester also copies the persistent state that the guest OS depends on. This allows the cloned VM to keep EFI NVRAM settings and vTPM data, such as a BitLocker recovery key stored in vTPM.

Before creating the cloned VM, you can choose whether to enable EFI, vTPM, or both. Harvester preserves only the persistent state required by the cloned VM.

- If both EFI and vTPM are enabled, Harvester preserves both persistent states.
- If only EFI or only vTPM is enabled, Harvester preserves only the selected persistent state.
- If neither EFI nor vTPM is enabled, Harvester does not process the persistent state storage.

The cloned VM may stay in the `Pending` state while Harvester copies and prepares the persistent state storage.

![efi-tpm-clone.png](/img/v1.9/vm/efi-tpm-clone.png)

:::note

EFI and vTPM persistent state is stored separately from the volumes listed in `vm.Spec.Template.Spec.Volumes`. Harvester creates this storage only after the source VM has been started at least once. If the source VM has never been started, cloning a VM with EFI or vTPM persistent state can fail because the required source storage does not exist.

:::

:::caution

Because the persistent state is copied from the source VM, guest-visible firmware identifiers such as the firmware UUID will be the same on the cloned VM. The cloned VM still has its own VM object identity in Harvester.

:::
