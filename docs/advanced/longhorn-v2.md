---
id: longhorn-v2
sidebar_position: 11
sidebar_label: Longhorn V2 Data Engine
title: "Longhorn V2 Data Engine"
Description: How to enable and use the Longhorn V2 Data Engine
---

<head>
  <link rel="canonical" href="https://docs.harvesterhci.io/v1.8/advanced/longhorn-v2"/>
</head>

The Longhorn V2 Data Engine harnesses the power of the Storage Performance Development Kit (SPDK) to significantly reduce I/O latency while boosting IOPS and throughput. The result is a high-performance storage solution that is capable of meeting diverse workload demands.

:::caution

The Longhorn V2 Data Engine is a **Technical Preview** feature. Explore the feature extensively before using in production environments.

:::

## Prerequisites

Every node with an active Longhorn V2 Data Engine requires the following dedicated resources:

- 2 CPU cores for use by the Longhorn instance-manager pod
- 2 GiB RAM (allocated as 1024 × 2 MiB huge pages)
- At least one local NVMe disk for data storage

## Limitations

The Longhorn V2 Data Engine currently does not support the following operations:

- Backing image creation and usage
- Volume encryption
- Harvester does not automatically coordinate Longhorn V2 SPDK CPU assignment with VM CPU pinning. Configure Longhorn V2 SPDK CPU assignment before running CPU-pinned VMs on nodes where the Longhorn V2 Data Engine is enabled. For more information, see [CPU Core Configuration with CPU-Pinned VMs](#cpu-core-configuration-with-cpu-pinned-vms).

## Using the Longhorn V2 Data Engine

The Longhorn V2 Data Engine is only available for newly created volumes and images. Existing volumes, virtual machine images and virtual machine root volumes will continue to use the V1 Data Engine.

1. On the Harvester UI, go to **Advanced** > **Settings**.

1. Set `longhorn-v2-data-engine-enabled` to `true`.

  Harvester automatically loads the kernel modules required by the Longhorn V2 Data Engine, and attempts to allocate 1024 × 2 MiB-sized huge pages (for example, 2 GiB of RAM) on all nodes. 

  Changing this setting automatically restarts RKE2 on all nodes but does not affect running virtual machine workloads.

  :::tip

  If you encounter error messages that include the phrase "not enough hugepages-2Mi capacity", allow some time for the error to be resolved. If the error persists, reboot the affected nodes.
  
  If you do not plan to use hugepages or want to allocate a custom memory size, adjust the `longhorn-v2-data-engine-hugepage-enabled` and `longhorn-v2-data-engine-memory-size` settings, preferably before enabling the Longhorn V2 Data Engine. Disabling hugepages is currently supported only for Longhorn V2 disks that use the AIO bdev driver (the default in Harvester v1.9.0). Do not disable hugepages when using the NVMe or virtio bdev driver.

  To disable the Longhorn V2 Data Engine on specific nodes (for example, nodes with less processing and memory resources), go to the **Hosts** screen and add the following label to the target nodes:

    - label: `node.longhorn.io/disable-v2-data-engine`
    - value: `true`

  :::

1. Go to the **Hosts** screen, and then add extra disks to each node as described in [Multi-disk Management](../host/host.md#multi-disk-management). 

  Set the `Provisioner` of each extra disk to `Longhorn V2 (CSI)`.

  :::info important

  The default [Longhorn disk driver](https://longhorn.io/docs/1.7.2/v2-data-engine/features/node-disk-support/) for newly added Longhorn V2 disks in Harvester is `aio`. This driver uses a Linux block device path and avoids the SPDK NVMe VFIO path.

  :::

1. Go to **Advanced** > **Storage Classes**, and then add a new StorageClass as described in [Creating a StorageClass](storageclass.md#creating-a-storageclass). 

  Set the `Provisioner` to `Longhorn V2 (CSI)`.

1. Use the new StorageClass:
   - When creating new volumes (either on the **Volumes** screen or during virtual machine creation)
   - When creating images on the **Images** screen

  Volumes and images created using the new StorageClass are backed by the Longhorn V2 Data Engine.

## CPU Core Configuration with CPU-Pinned VMs

_Available as of v1.9.0_

Longhorn supports assigning SPDK CPU cores through Kubernetes CPU Manager. Harvester does not yet expose these Longhorn controls in the Harvester UI. Configure them directly in Longhorn when the same nodes run the Longhorn V2 Data Engine and CPU-pinned VMs.

By default, Longhorn V2 uses [`data-engine-cpu-mask`](https://longhorn.io/docs/1.12.1/references/settings/#data-engine-cpu-mask) (default: `{"v2":"0x3"}`, which maps to CPU IDs `0` and `1`), which binds `spdk_tgt` to fixed CPU IDs. When Harvester CPU Manager is enabled, CPU-pinned VM pods can receive exclusive CPUs from kubelet. If those exclusive CPUs overlap with the Longhorn V2 CPU mask and the V2 instance-manager pod starts with a cpuset that excludes one of the masked CPUs, `spdk_tgt` can fail to start with the following error:

```text
EAL: PANIC in rte_eal_init():
Cannot set affinity
```

To avoid fixed CPU ID conflicts, configure the Longhorn [`data-engine-number-of-cpu-cores`](https://longhorn.io/docs/1.12.1/references/settings/#data-engine-number-of-cpu-cores) setting before enabling Longhorn V2 on nodes that already run CPU-pinned VMs. This setting is global. When the value is greater than `0`, Longhorn validates that every node reports the `static` CPU Manager policy. Longhorn then ignores `data-engine-cpu-mask`, requests at least the configured number of full CPU cores for each V2 instance-manager pod, and uses Kubernetes CPU Manager to assign exclusive CPUs.

:::caution

Longhorn does not support mixed CPU Manager configurations for `data-engine-number-of-cpu-cores`. If CPU Manager is enabled only on some nodes, Longhorn rejects any V2 value greater than `0`. Enable CPU Manager on all nodes before configuring this setting.

:::

1. Enable [CPU Manager](../vm/cpu-pinning.md#enable-and-disable-cpu-manager) on all nodes in the cluster.

1. Select the CPU core count for the V2 instance-manager pod.

    Longhorn recommends at least `2` CPU cores for `data-engine-number-of-cpu-cores`. Make sure each node that can run Longhorn V2 has enough allocatable CPU for the selected count and for any CPU-pinned VMs.

    Harvester's [`instance-manager-resources`](settings.md#instance-manager-resources) setting is not required for CPU Manager-based SPDK CPU assignment. That setting controls Longhorn's CPU reservation for instance-manager pods. If Longhorn's CPU reservation for V2 instance-manager pods is higher than the configured SPDK CPU core count, Longhorn rounds the reservation up to full CPU cores, and the pod can receive more exclusive CPUs than the `data-engine-number-of-cpu-cores` value.

1. If Longhorn V2 volumes are already attached, schedule a maintenance window, stop all VMs that use those volumes, and detach the volumes.

    Longhorn automatically recreates idle V2 instance-manager pods to apply the new CPU settings.

1. Configure `data-engine-number-of-cpu-cores`.

    The following example allocates `2` CPU cores to the SPDK target daemon in each V2 instance-manager pod:

    ```shell
    kubectl -n longhorn-system patch settings.longhorn.io data-engine-number-of-cpu-cores --type=merge -p '{"value":"{\"v2\":\"2\"}"}'
    ```

1. Verify the effective CPU set after the V2 instance-manager pods are recreated.

    ```shell
    kubectl -n longhorn-system exec <v2-instance-manager-pod> -- awk '/^Cpus_allowed_list:/ {print $2}' /proc/self/status
    ```

    The allowed CPU list should contain at least the configured number of CPUs. If Longhorn's guaranteed instance-manager CPU reservation is higher, the list can contain more CPUs.

## Migrating Longhorn V2 Disks from NVMe to AIO

Before migrating a disk, verify that all affected volumes are healthy and that the remaining Longhorn V2 disks have sufficient free space to accommodate rebuilt replicas during disk removal.

:::note

In Harvester v1.9.0 and later, newly created Longhorn V2 disks use the `aio` disk driver by default. Existing Longhorn V2 disks retain their current driver configuration until you manually remove and add them again.

:::

To migrate a disk, perform the following steps:

1. [Remove the affected Longhorn V2 disk](../host/host.md#remove-disks).

2. [Add the Longhorn V2 disk again](../host/host.md#add-additional-disks).

3. Verify that the migrated disk uses `aio`.

    ```shell
    kubectl -n longhorn-system get blockdevices.harvesterhci.io BLOCKDEVICE_NAME -o yaml
    ```

    The matching `BlockDevice` custom resource should have the following values:

    ```yaml
    spec:
      provisioner:
        longhorn:
          diskDriver: aio
          engineVersion: LonghornV2
    status:
      provisionPhase: Provisioned
      state: Active
    ```

## Known Issues

### I/O Operations May Stall on ARM64 Platforms

On ARM64 platforms, Longhorn V2 disks using the SPDK NVMe bdev driver can experience stalled I/O operations under active workloads. For more information, see issue [#10710](https://github.com/harvester/harvester/issues/10710).

For information about the workaround, see [Migrating Longhorn V2 Disks from NVMe to AIO](#migrating-longhorn-v2-disks-from-nvme-to-aio).

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
