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

Guest memory admission is governed by the following formula (default ratio is 150%):

```text
Maximum Allocatable Guest Memory = Node Allocatable Memory x Memory Overcommit Ratio
```

Adjusting the overcommit ratio changes the threshold for virtual machine admission control. It does not alter physical node capacity or modify existing memory allocations.

Configuring more than approximately 1 TiB of guest memory requires setting `cpu.model: host-passthrough`. The default virtual CPU model uses a restricted physical address width. At large memory allocations, KubeVirt's memory-hotplug headroom can exceed this address width, preventing the virtual machine from starting. Setting `cpu.model: host-passthrough` exposes the host CPU's full physical address width to bypass this limitation.

The following limits were validated on Harvester v1.9 (KubeVirt v1.8.4):

| Resource | Architecture | Tested Limit |
| :--- | :--- | :--- |
| vCPU per VM (unpinned) | ARM64 (`virt` machine type) | 512 (hard ceiling) |
| vCPU per VM (unpinned) | x86_64 (`q35` machine type) | 1024+ confirmed (no ceiling observed) |
| vCPU per VM (`dedicatedCpuPlacement`) | ARM64 / x86_64 | Bounded by node's free allocatable CPU |
| Guest memory per VM (default CPU model) | x86_64 | ~900 GiB–1 TiB |
| Guest memory per VM (`host-passthrough`) | x86_64 | 8 TiB confirmed booting (16 TiB theoretical limit) |

:::note

The following are configuration considerations for ARM64 and large memory:

- **ARM64 CPU model**: `host-passthrough` is the only supported CPU model on ARM64. Admission rejects `host-model`.
- **UEFI requirement for large memory**: Allocating more than approximately 1 TiB of guest memory may require setting `firmware.bootloader.efi` explicitly. The default legacy BIOS firmware can hang indefinitely during boot at very large memory allocations. UEFI avoids this issue.

:::

Enabling `dedicatedCpuPlacement` (CPU pinning) does not allocate a fixed vCPU count. It draws from the node's remaining allocatable CPU after accounting for existing Guaranteed-QoS workloads (such as Longhorn Instance Manager). For example, on a node with 158 allocatable cores where 39 are already claimed, a single pinned virtual machine can request a maximum of 119 vCPUs.

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