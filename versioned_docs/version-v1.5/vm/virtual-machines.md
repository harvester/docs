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
  <link rel="canonical" href="https://docs.harvesterhci.io/v1.7/vm/virtual-machines"/>
</head>

You can create [Linux VMs](../vm/create-vm.md) using one of the following methods: 

- Harvester UI: On the **Virtual Machines** screen, click **Create** and configure the settings on each tab. 
- Kubernetes API: Create a `VirtualMachine` object. 
- [Harvester Terraform Provider](../terraform/terraform-provider.md): Define a `harvester_virtualmachine` resource block. 

Creating [Windows VMs](../vm/create-windows-vm.md) on the Harvester UI involves slightly different steps. Harvester provides a VM template named `windows-iso-image-base-template` that adds a volume with the Virtio drivers for Windows, which streamlines the VM configuration process. If you require Virtio devices but choose to not use the template, you must add your own Virtio drivers for Windows to enable correct hardware detection. 

## Validated Guest Operating Systems

The following operating systems have been validated to run in Harvester virtual machines:

- SUSE Linux Enterprise Micro 6
- SUSE Linux Enterprise Server 15 SP6
- Red Hat Enterprise Linux 9.5
- Ubuntu 24.04
- Windows 11
- Windows Server 2025

:::note

The list includes only tested operating systems and is not intended to be exhaustive. Other operating systems may also run in Harvester virtual machines. However, guest operating systems must match the architecture of the Harvester cluster's hosts. x86 virtual machines can run only on x86 clusters, and ARM virtual machines can run only on ARM clusters.

You are responsible for obtaining, activating, and managing licenses for any commercial software that you decide to use. Harvester cannot be held responsible for damage or loss of data that may occur through the use of untested, unpatched, and outdated operating systems.

The contents of this document may not reflect the most current situation and may change at any time without notice.

:::