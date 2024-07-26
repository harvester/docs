---
sidebar_position: 6
sidebar_label: Live Migration
title: "Live Migration"
keywords:
  - Harvester
  - harvester
  - Rancher
  - rancher
  - Live Migration
description: Live migration means moving a virtual machine to a different host without downtime.
---

<head>
  <link rel="canonical" href="https://docs.harvesterhci.io/v1.1/vm/live-migration"/>
</head>

Live migration means moving a virtual machine to a different host without downtime.

:::note

- Live migration is not allowed when the virtual machine is using a management network of bridge interface type.
- Live migration is not allowed when the virtual machine has any volume of the `CD-ROM` type. Such volumes should be ejected before live migration.
- Live migration is not allowed when the virtual machine has any volume of the `Container Disk` type. Such volumes should be removed before live migration.
- Live migration is not allowed when the virtual machine has any  `PCIDevice` passthrough enabled. Such devices need to be removed before live migration.

:::

## How Migration Works

Each node has multiple CPU models labeled with different keys:

- Primary CPU Model: `host-model-cpu.node.kubevirt.io/{cpu-model}`
- Supported CPU Models: `cpu-model.node.kubevirt.io/{cpu-model}`
- Supported Migration CPU Models: `cpu-model-migration.node.kubevirt.io/{cpu-model}`

When performing live migration, the process will check the value of `spec.domain.cpu.model` in VMI CR, which is derived from `spec.template.spec.domain.cpu.model` in VM CR. If this value is not set, it defaults to `host-model`.

- With `host-model`, the process will fetch the value of the primary CPU model and fill `spec.NodeSelectors` of the newly created POD with the label `cpu-model-migration.node.kubevirt.io/{cpu-model}`.
- With a custom CPU model like `XYZ`, the process will fill `spec.NodeSelectors` of the newly created POD with the label `cpu-model.node.kubevirt.io/XYZ`.

However, there is a limitation with `host-model`, please check [limitation section](#limitation) for more details.

## Starting a Migration

1. Go to the **Virtual Machines** page.
1. Find the virtual machine that you want to migrate and select **⋮ > Migrate**.
1. Choose the node to which you want to migrate the virtual machine. Click **Apply**.

![](/img/v1.2/vm/migrate-action.png)

When you have [node scheduling rules](./create-windows-vm.md#node-scheduling-tab) configured for a VM, you must ensure that the target nodes you are migrating to meet the VM's runtime requirements. The list of nodes you get to search and select from will be generated based on:
- VM scheduling rules.
- Possibly node rules from the network configuration.

![](/img/v1.2/vm/migrate.png)

## Aborting a Migration

1. Go to the **Virtual Machines** page.
1. Find the virtual machine in migrating status that you want to abort. Select **⋮ > Abort Migration**.

## Migration Timeouts

### Completion Timeout

The live migration process will copy virtual machine memory pages and disk blocks to the destination. In some cases, the virtual machine can write to different memory pages or disk blocks at a higher rate than these can be copied. As a result, the migration process is prevented from being completed in a reasonable amount of time. 

Live migration will be aborted if it exceeds the completion timeout of 800s per GiB of data. For example, a virtual machine with 8 GiB of memory will time out after 6400 seconds.

### Progress Timeout

Live migration will also be aborted when copying memory doesn't make any progress in 150s.

## Limitation

With `host-model`, it only allows the live migration process to migrate the VM to a node with same CPU model. For example, if the original CPU model is `XYZ`, it can migrate VM to another node with `XYZ` CPU model. However, sometimes VM does not require a specified CPU model. In such case, we need to shut down the VM, assign a CPU model supported by all nodes, and then restart the VM.

For example, consider two nodes:

- A node: `host-model-cpu.node.kubevirt.io/XYZ` `cpu-model-migration.node.kubevirt.io/XYZ` `cpu-model.node.kubevirt.io/123`
- B node: `host-model-cpu.node.kubevirt.io/ABC` `cpu-model-migration.node.kubevirt.io/ABC` `cpu-model.node.kubevirt.io/123`

It is not possible to migrate a VM with `host-model` in this case due to different `host-model-cpu.node.kubevirt.io` values. However, both nodes support the `123` CPU model. Thus, it is possible to migrate VM with `123` CPU model in two ways:
- Cluster Level: Run `kubectl edit kubevirts.kubevirt.io -n harvester-system` and add `spec.configuration.cpuModel: "123"`. This changes also affects the newly created VMs.
- Per VM Level: Edit the VM spec to include `spec.template.spec.domain.cpu.model: "123"`.

Both methods require the restarting the VMs. If you know all nodes in this cluster support a specified CPU model, you can define this at cluster level before creating any VMs. This way, you won't need to restart the VMs to assign the CPU model later while performing live migration.