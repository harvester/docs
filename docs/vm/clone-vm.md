---
sidebar_position: 9
sidebar_label: Clone VM 
title: "Clone VM"
keywords:
  - Harvester
  - harvester
  - Rancher
  - rancher
  - Clone VM
Description: VM can be cloned with/without data. This function doesn't need to take a VM snapshot or set up a backup target first.
---

_Available as of v1.1.0_

VM can be cloned with/without data. This function doesn't need to take a VM snapshot or set up a backup target first.

## Clone VM with volume data

1. On the `Virtual Machines` page, click `Clone` of the VM actions.
1. Set a new VM name and click `Create` to create a new VM.
![clone-vm-with-data.png](/img/v1.2/vm/clone-vm-with-data.png)

## Clone VM without volume data

1. On the `Virtual Machines` page, click `Clone` of the VM actions.
1. Unclick the `clone volume data` checkbox.
1. Set a new VM name and click `Create` to create a new VM.
![clone-vm-without-data.png](/img/v1.2/vm/clone-vm-without-data.png)
