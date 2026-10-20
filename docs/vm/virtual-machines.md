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
  <link rel="canonical" href="https://docs.harvesterhci.io/v1.9/vm/virtual-machines"/>
</head>

You can create [Linux VMs](../vm/create-vm.md) using one of the following methods: 

- Harvester UI: On the **Virtual Machines** screen, click **Create** and configure the settings on each tab. 
- Kubernetes API: Create a `VirtualMachine` object. 
- [Harvester Terraform Provider](../terraform/terraform-provider.md): Define a `harvester_virtualmachine` resource block. 

Creating [Windows VMs](../vm/create-windows-vm.md) on the Harvester UI involves slightly different steps. Harvester provides a VM template named `windows-iso-image-base-template` that adds a volume with the Virtio drivers for Windows, which streamlines the VM configuration process. If you require Virtio devices but choose to not use the template, you must add your own Virtio drivers for Windows to enable correct hardware detection.

:::note

Before creating virtual machines, review [Resource Overcommit](../vm/resource-overcommit.md) and verify that the cluster's default CPU, memory, and storage allocation ratios match your workload requirements. The default values suit dense, general-purpose workloads but may be too aggressive for latency-sensitive or CPU-bound guests.

:::

## Tested Resource Limits

Guest memory admission is governed by `node allocatable memory x memory overcommit ratio` (default 150%). Modifying the overcommit ratio only allows further provisioning.

Guest memory above roughly 1 TiB requires `cpu.model: host-passthrough`. The default CPU model has a limited physical address width that KubeVirt's memory-hotplug headroom can exceed at larger sizes, which stops the VM from starting. `host-passthrough` exposes the real CPU's full address width and clears this.

Tested on Harvester v1.9 (KubeVirt 1.8.4):

| Resource | Architecture | Tested limit |
|---|---|---|
| vCPU per VM (unpinned) | ARM64 (`virt` machine type) | 512 -- hard ceiling |
| vCPU per VM (unpinned) | x86_64 (`q35` machine type) | 1024+ confirmed, no ceiling found |
| vCPU per VM (`dedicatedCpuPlacement`) | Both | Bounded by the node's free allocatable CPU, not a fixed number |
| Guest memory per VM, default CPU model | x86_64 | ~900 GiB-1 TiB region |
| Guest memory per VM, `host-passthrough` | x86_64 | 8 TiB confirmed booting, 16 TiB theoretical |

:::note

On ARM64, `host-passthrough` is the only supported CPU model; `host-model` is rejected at admission.

:::

:::note

Guest memory above roughly 1 TiB may also require `firmware.bootloader.efi` set explicitly. The default (legacy BIOS) firmware can hang indefinitely during boot at very large memory sizes; UEFI does not have this problem.

:::

Enabling `dedicatedCpuPlacement` (aka CPU Pinning) does not reserve a fixed vCPU count; it draws from the node's remaining allocatable CPU after existing Guaranteed-QoS workloads (for example, Longhorn instance-managers). On a node with 158 allocatable cores and 39 already claimed, 119 was the maximum a single pinned VM could request.

## Validated Guest Operating Systems

The following operating systems have been validated to run in Harvester virtual machines:

- SUSE Linux Enterprise Server 15 SP7 and 16
- SUSE Linux Micro 6.1 and 6.2
- Red Hat Enterprise Linux 9 and 10
- Ubuntu 22.04 and 24.04
- Windows	11
- Windows Server 2025

:::note

The list includes only tested operating systems and is not intended to be exhaustive. Other operating systems may also run in Harvester virtual machines. However, guest operating systems must match the architecture of the Harvester cluster's hosts. x86 virtual machines can run only on x86 clusters, and ARM virtual machines can run only on ARM clusters.

You are responsible for obtaining, activating, and managing licenses for any commercial software that you decide to use. Harvester cannot be held responsible for damage or loss of data that may occur through the use of untested, unpatched, and outdated operating systems.

The contents of this document may not reflect the most current situation and may change at any time without notice.

:::