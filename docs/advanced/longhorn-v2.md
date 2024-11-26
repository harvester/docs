---
id: longhorn-v2
sidebar_position: 11
sidebar_label: Longhorn V2 Data Engine
title: "Longhorn V2 Data Engine"
Description: How to enable and use the Longhorn V2 Data Engine
---

<head>
  <link rel="canonical" href="https://docs.harvesterhci.io/v1.4/advanced/longhorn-v2"/>
</head>

The Longhorn V2 Data Engine harnesses the power of the Storage Performance Development Kit (SPDK) to significantly reduce I/O latency while boosting IOPS and throughput. The result is a high-performance storage solution that is capable of meeting diverse workload demands.

:::caution

The Longhorn V2 Data Engine is an **Experimental** feature in Harvester v1.4.0 and should not be utilized in a production environment.

:::

## Prerequisites

Every node with an active Longhorn V2 Data Engine requires the following dedicated resources:

- 1 CPU core for use by the Longhorn instance-manager pod
- 2 GiB RAM (allocated as 1024 × 2 GiB huge pages)
- At least one local NVMe disk for data storage

## Limitations

:::note

The Longhorn V2 Data Engine currently does not support the following operations:

- Backing image creation and usage
- Live migration
- Volume cloning
- Volume encryption
- Volume expansion

:::

- Within the Harvester context, volumes backed by the Longhorn V2 Data Engine must be added to virtual machines as extra disks. The boot disk of each virtual machine must still be added from an image that is backed by the Longhorn V1 Data Engine.

- Harvester is unable to live-migrate virtual machines with V2 volumes attached, which means those virtual machines will be shut down during Harvester cluster upgrades. Moreover, snapshots of V2 volumes cannot be created because snapshot and restoration functionality in Harvester relies on volume cloning.

- SSDs and other non-NVMe disks are managed using the SPDK AIO bdev driver, which does not support the unmap operation. If you are using non-NVMe disks, avoid trimming the filesystem because this results in I/O errors and paused virtual machines. For example, when creating an ext4 filesystem on a Linux virtual machine, use `mkfs.ext4 -E nodiscard /dev/vdb` (assuming `/dev/vdb` is your device path). On Windows virtual machines, you can disable trimming for NTFS by running the command `fsutil behavior set disabledeletenotify NTFS 1`.

## Using the Longhorn V2 Data Engine

The Longhorn V2 Data Engine is only available for newly created volumes. Existing volumes, virtual machine images and virtual machine root volumes will continue to use the V1 Data Engine.

1. On the Harvester UI, go to **Advanced** > **Settings**.

1. Set `longhorn-v2-data-engine-enabled` to `true`.

  Harvester automatically loads the kernel modules required by the Longhorn V2 Data Engine, and attempts to allocate 1024 × 2 MiB-sized huge pages (for example, 2 GiB of RAM) on all nodes. 

  Changing this setting automatically restarts RKE2 on all nodes but does not affect running virtual machine workloads.

  :::tip

  If you encounter error messages that include the phrase "not enough hugepages-2Mi capacity", allow some time for the error to be resolved. If the error persists, reboot the affected nodes.
  
  To disable the Longhorn V2 Data Engine on specific nodes (for example, nodes with less processing and memory resources), go to the **Hosts** screen and add the following label to the target nodes:

    - label: `node.longhorn.io/disable-v2-data-engine`
    - value: `true`

  :::

1. Go to the **Hosts** screen, and then add extra disks to each node as described in [Multi-disk Management](../host/host.md#multi-disk-management). 

  Set the `Provisioner` of each extra disk to `Longhorn V2 (CSI)`.

  :::info important

  Harvester sets the [Longhorn disk driver](https://longhorn.io/docs/1.7.2/v2-data-engine/features/node-disk-support/) to `auto` so that NVMe disks use the SPDK NVMe bdev driver, which provides the best performance and also supports advanced operations such as trim (also known as discard).
  
  SSDs and other non-NVMe disks are managed using the SPDK AIO bdev driver, which requires a disk size that is an *even multiple of 4096 bytes*. Non-NVMe disks that do not meet this size requirement cannot be added.  Additionally, the SPDK AIO bdev driver does not support the unmap operation. If you are using non-NVMe disks, avoid trimming the filesystem because this results in I/O errors and paused virtual machines.

  :::

1. Go to **Advanced** > **Storage Classes**, and then add a new StorageClass as described in [Creating a StorageClass](storageclass.md#creating-a-storageclass). 

  Set the `Provisioner` to `Longhorn V2 (CSI)`.

1. Use the new StorageClass when creating new volumes (either on the **Volumes** screen or during virtual machine creation).

  Volumes created using the new StorageClass are backed by the Longhorn V2 Data Engine.