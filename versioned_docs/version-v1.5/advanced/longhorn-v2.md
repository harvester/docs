---
id: longhorn-v2
sidebar_position: 11
sidebar_label: Longhorn V2 Data Engine
title: "Longhorn V2 Data Engine"
Description: How to enable and use the Longhorn V2 Data Engine
---

<head>
  <link rel="canonical" href="https://docs.harvesterhci.io/v1.7/advanced/longhorn-v2"/>
</head>

The Longhorn V2 Data Engine harnesses the power of the Storage Performance Development Kit (SPDK) to significantly reduce I/O latency while boosting IOPS and throughput. The result is a high-performance storage solution that is capable of meeting diverse workload demands.

:::caution

The Longhorn V2 Data Engine is an **Experimental** feature and should not be utilized in a production environment.

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
- Storage network
- Volume cloning
- Volume encryption
- Volume expansion

:::

- Snapshots of V2 volumes cannot be created because snapshot and restoration functionality in Harvester relies on volume cloning.

- SSDs and other non-NVMe disks are managed using the SPDK AIO bdev driver, which does not support the unmap operation. If you are using non-NVMe disks, avoid trimming the filesystem because this results in I/O errors and paused virtual machines. For example, when creating an ext4 filesystem on a Linux virtual machine, use `mkfs.ext4 -E nodiscard /dev/vdb` (assuming `/dev/vdb` is your device path). On Windows virtual machines, you can disable trimming for NTFS by running the command `fsutil behavior set disabledeletenotify NTFS 1`.

## Using the Longhorn V2 Data Engine

The Longhorn V2 Data Engine is only available for newly created volumes and images. Existing volumes, virtual machine images and virtual machine root volumes will continue to use the V1 Data Engine.

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

1. Use the new StorageClass:
   - When creating new volumes (either on the **Volumes** screen or during virtual machine creation)
   - When creating images on the **Images** screen

  Volumes and images created using the new StorageClass are backed by the Longhorn V2 Data Engine.

## Upgrading from Harvester v1.4.x

In Harvester v1.4 (which uses Longhorn v1.7), V2 volumes did not support live migration, nor could the V2 data engine be used for virtual machine images, which meant VM boot volumes could not use the V2 Data Engine.

Starting with Harvester v1.5.0 and Longhorn v1.8.1, these limitations are removed, but only for volumes and images that are created _after_ the system is upgraded. Any V2 StorageClass created with Harvester v1.4.0 will have the migratable option set to "false", and like other StorageClass properties, this cannot be changed once set. Similarly, any existing V2 volumes will remain non-migratable after the upgrade.  If you have used the V2 data engine on Harvester v1.4, and later upgrade to Harvester v1.5, you will need to create a new V2 StorageClass, which will default to having migratable set to "true".  Volumes and images created using _this_ Storage Class _will_ be live-migratable.

:::info important

- If you are using the SPDK AIO bdev driver (i.e. if your disks were added using `/dev/sd*` device paths), _V2 volumes created before the upgrade will be unusable after upgrading, and cannot be recovered_.  For more details see https://github.com/longhorn/longhorn/issues/10461.

- If you are using the SPDK NVMe bdev driver (i.e. your disks were added using `/dev/nvme*` device paths), V2 volumes created before the upgrade will function after the upgrade, but will continue to use the Longhorn v1.7.x engine.  As mentioned above, these volumes will remain non-migratable, but it is possible to export the data and create new migratable volumes (see below for details).

- All virtual machines with V2 volumes attached need to be stopped before upgrading to Harvester v1.5.0.  If there are any V2 volumes active during the upgrade, the process will stall part way through "upgrading system services".  The logs of the `apply-manifests` pod will show repeated messages similar to the following:
  
  ```
  instance-manager (aio)(v2) (image=longhornio/longhorn-instance-manager:v1.8.1) state is not running on node harvester-node-0, will retry...
  ```
  
  Stopping all Virtual Machines that are using V2 volumes will allow the upgrade to proceed.


:::

If you have existing virtual machines with V2 non-migratable volumes attached, and you are using the SPDK NVMe bdev driver (i.e. your disks were added using `/dev/nvme*` device paths), it's possible to transition to live-migratable volumes as follows:

1. Stop the Virtual Machine
1. For each V2 volume attached to the Virtual Machine, use the Export Image option to export that volume to an image that uses your new V2 StorageClass (with migratable set to "true"). This may take a while, depending on how much data needs to be copied.
1. Once complete, edit the Virtual Machine and on the Volumes tab:
   - Remove the existing V2 volume(s).
   - Use the "Add VM Image" button to add the image(s) that were exported in the previous step.
1. Start the VM. Again, this may take a while depending on how much data needs to be copied.
1. Delete the original volume(s) and the exported image(s) as these should no longer be necessary to keep around.