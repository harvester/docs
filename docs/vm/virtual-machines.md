---
sidebar_position: 1
sidebar_label: Virtual Machines
title: "Virtual Machines"
keywords:
  - virtual machine
  - VM
  - guest operating system
  - guest OS
description: Information concerning virtual machines that run on top of the Harvester cluster
---

<head>
  <link rel="canonical" href="https://docs.harvesterhci.io/v1.4/vm/virtual-machines"/>
</head>

You can create [Linux VMs](../vm/create-vm.md) using one of the following methods: 

- Harvester UI: On the **Virtual Machines** screen, click **Create** and configure the settings on each tab. 
- Kubernetes API: Create a `VirtualMachine` object. 
- [Harvester Terraform Provider](../terraform/terraform-provider.md): Define a `harvester_virtualmachine` resource block. 

Creating [Windows VMs](../vm/create-windows-vm.md) on the Harvester UI involves slightly different steps. Harvester provides a VM template named `windows-iso-image-base-template` that adds a volume with the Virtio drivers for Windows, which streamlines the VM configuration process. If you require Virtio devices but choose to not use the template, you must add your own Virtio drivers for Windows to enable correct hardware detection. 

## Supported Guest Operating Systems

The following operating systems have been validated to run in Harvester virtual machines:

- openSUSE Leap 15.6
- SUSE Linux Enterprise Micro 6
- SUSE Linux Enterprise Server 15 SP6
- Red Hat Enterprise Linux 9.4
- Ubuntu 24.04
- Windows 11
- Windows Server 2022

:::note

The list includes only tested operating systems and is not intended to be exhaustive. Other x86 operating systems may also run in Harvester virtual machines. However, Harvester cannot be held responsible for any damage or loss of data that may occur through the use of untested operating systems.

The contents of this document may not reflect the most current situation and may change at any time without notice.

:::