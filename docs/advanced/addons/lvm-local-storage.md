---
sidebar_position: 8
sidebar_label: Local Storage Support
title: "Local Storage Support"
---

<head>
  <link rel="canonical" href="https://docs.harvesterhci.io/v1.9/advanced/addons/lvm-local-storage"/>
</head>

:::note

The **harvester-csi-driver-lvm** add-on is classified as *experimental* in Harvester v1.9.0 and reaches general availability (GA) in v1.9.1. It is not included in the Harvester ISO, but is available for download from the [experimental-addons repository](https://github.com/harvester/experimental-addons). For more information about feature maturity, see [Feature Labels](../../getting-started/document-conventions.md#feature-labels).

:::

Harvester allows you to use local storage on the host to create persistent volumes for your workloads with better performance and latency. This functionality is made possible by LVM, which provides logical volume management facilities on Linux.

The **harvester-csi-driver-lvm** add-on is a CSI driver that supports local path provisioning through LVM.

## Installing and Enabling the Add-on

If you are using the Harvester kubeconfig file, you can install the add-on by performing the following steps:

1. Install the add-on by running the following command:

    ```
    kubectl apply -f https://raw.githubusercontent.com/harvester/experimental-addons/v1.9/harvester-csi-driver-lvm/harvester-csi-driver-lvm.yaml
    ```

1. On the Harvester UI, go to **Advanced** > **Add-ons**.

1. Select **harvester-csi-driver-lvm**, and then select **⋮** > **Enable**.

## Creating a Volume Group for LVM

A volume group combines physical volumes to create a single storage structure that can be divided into logical volumes.

:::note

Harvester currently does not allow you to modify the volume group composition (add or remove disks) after you create a logical volume. This issue will be addressed in a future release.

:::

1. Verify that the **harvester-csi-driver-lvm** add-on is installed.

1. On the Harvester UI, go to the **Hosts** screen.

1. Select the target host, and then select **⋮** > **Edit Config**.

1. On the Storage tab, add disks for the volume group.

    ![](/img/v1.4/csi-driver-lvm/add-disk-to-vg-01.png)

    Configure the following settings for each selected disk:

    - **Provisioner**: Select **LVM**.

      ![](/img/v1.4/csi-driver-lvm/add-disk-to-vg-02.png)

    - **Volume Group**: Select an existing volume group or specify a name for a new volume group.

      ![](/img/v1.4/csi-driver-lvm/add-disk-to-vg-03.png)

    For more information about adding disks, see [Multi-Disk Management](../../host/#multi-disk-management).

1. Click **Save**.

1. On the host details screen, verify that the disks were added and the correct provisioner was set.

    ![](/img/v1.4/csi-driver-lvm/add-disk-to-vg-04.png)

## Creating a StorageClass for LVM

:::note

You can only use one type of local volume in each volume group. If necessary, create different volume groups for the volume types that you want to use.

:::

1. On the Harvester UI, go to the **Storage** screen.

1. Create a new StorageClass and select **LVM** in the **Provisioner** list.

    ![](/img/v1.4/csi-driver-lvm/create-lvm-sc-01.png)

1. On the **Parameters** tab, configure the following settings:

    - **Node**: Select the target node for the intended workloads. 
  
      ![](/img/v1.4/csi-driver-lvm/create-lvm-sc-02.png)

    - **Volume Group Name**: Select the volume group that you created.

      ![](/img/v1.4/csi-driver-lvm/create-lvm-sc-03.png)

    - **Volume Group Type**: Select a type based on how the workload uses snapshots and how pool capacity is allocated. Harvester supports the following options:

        - **dm-thin**: The supported volume type. Thin-provisioned volumes consume physical space only as blocks are written, and snapshots use true copy-on-write functionality at the thin-pool chunk level. For example, a fresh snapshot of a 100 GiB volume consumes practically zero pool capacity at creation, and grows only as modified blocks accumulate over time. Use this type for virtual machine workloads, for workloads that frequently create snapshots or clones, and for environments that require over-provisioned pool capacity.

        - **striped**: Deprecated. Each logical volume is fully allocated its requested capacity at provisioning time, distributed across the physical devices in the volume group. Snapshots are created as independent logical volumes sized to match the source volume's maximum capacity. For example, a snapshot of a 100 GiB volume reserves an additional 100 GiB of volume group space upon creation, regardless of the actual quantity of data written to the source. Restoring such a volume requires a full data copy.

        :::warning

        The **striped** volume type is deprecated and is outside the general availability (GA) support scope of the **harvester-csi-driver-lvm** add-on. Use **dm-thin** for all new configurations.

        Striped logical volumes do not provide the storage-efficient snapshot, clone, and restore behavior that the supported CSI workflow requires. Because restoring a striped volume copies the full capacity of the source, these operations carry additional capacity, I/O, and timeout costs that grow with volume size.

        Existing pre-GA striped volumes continue to function, but you cannot convert a striped volume to dm-thin in place. To migrate, create a volume group with the **dm-thin** volume group type (a volume group supports only one volume type), create a StorageClass and a volume that use that volume group, attach the new volume to the workload alongside the existing one, and copy the data at the guest or application level. Decommission the striped volume only after you verify the copy.

        For more information, see issue [#11334](https://github.com/harvester/harvester/issues/11334).

        :::

        ![](/img/v1.4/csi-driver-lvm/create-lvm-sc-04.png)

1. On the **Storage** screen, verify that the StorageClass was created and the correct provisioner was set.

    ![](/img/v1.4/csi-driver-lvm/create-lvm-sc-05.png)

For more information, see [StorageClass](../storageclass.md).

## Creating a Volume with LVM

1. On the Harvester UI, go to the **Volumes** screen.

1. Create a new volume using the LVM StorageClass that you created.

    ![](/img/v1.4/csi-driver-lvm/create-lvm-volume-01.png)

    :::note

    The status **Not Ready** is normal because Harvester creates the LVM volume only when the first workload is created.

    :::

1. On the **Virtual Machines** screen, select the target virtual machine, and then select **⋮** > **Add Volume**.

    :::note

    Because the LVM volume is a local volume, you must ensure that the target node of the LVM StorageClass is the node on which the virtual machine is scheduled.

    :::

1. Specify the volume that you want to attach.

    ![](/img/v1.4/csi-driver-lvm/attach-lvm-volume-01.png)

1. On the **Volumes** screen, verify that the state is **In-use**.

    ![](/img/v1.4/csi-driver-lvm/attach-lvm-volume-02.png)

You can also create a new virtual machine with the volume of the LVM StorageClass that you created. This virtual machine will be scheduled on the target node with local storage for the volume.

![](/img/v1.4/csi-driver-lvm/create-vm-with-lvm-volume-01.png)

![](/img/v1.4/csi-driver-lvm/create-vm-with-lvm-volume-02.png)

## Creating Snapshots for an LVM Volume

1. On the Harvester UI, go to the **Settings** screen.

1. In the **csi-driver-config** section, select **⋮** > **Edit Setting**.

    ![](/img/v1.4/csi-driver-lvm/update-csi-driver-config-01.png)

1. Add an entry with the following settings:

    - **Provisioner**: Select **lvm.driver.harvesterhci.io**.
    - **Volume Snapshot Class Name**: Select **lvm-snapshot**.

    ![](/img/v1.2/advanced/csi-driver-config-external.png)

1. On the **Virtual Machines** screen, select the target virtual machine, and then select **⋮** > **Take Virtual Machine Snapshot**.

    Example:

    ![](/img/v1.4/csi-driver-lvm/vm-take-snapshot-with-lvm-01.png)

1. On the **Virtual Machine Snapshots** screen, verify that snapshot is ready to use.

    ![](/img/v1.4/csi-driver-lvm/vm-take-snapshot-with-lvm-02.png)

## Supported LVM Volume Features

- Volume resizing
- Volume cloning
- Snapshot creation

:::note

Backup creation is currently not supported. This limitation will be addressed in a future release.

:::

## Additional Notes

### Tuning the `dm-thin` Pool

When the first PersistentVolumeClaim is created against a `dm-thin` StorageClass, the driver creates an LVM thin pool named `<vgName>-thinpool` using `-l 90%FREE` (allocating 90% of the volume group's remaining free space). Consider tuning the following settings based on your workload demands:

:::info

These settings belong to the thin pool, which is shared by every logical volume in the volume group. They are not properties of an individual StorageClass. The StorageClass that first triggers pool creation for a volume group determines the chunk size, metadata size, and zeroing behavior of the pool; the corresponding parameters on StorageClasses that are created later for the same volume group have no effect. Defining several StorageClasses with different values on one volume group therefore produces a configuration that does not match what is applied to the pool.

Issue [#11335](https://github.com/harvester/harvester/issues/11335) tracks a dedicated pool-level configuration and status resource.

:::

:::warning

Do not run LVM commands such as `lvchange`, `lvextend`, or `lvconvert` against a thin pool that the CSI driver manages while the pool is in use. Direct changes can conflict with attached volumes and with in-flight driver operations. Perform any manual procedure offline: detach all volumes in the pool and verify that no corresponding device-mapper devices exist on the node before you modify the pool.

:::

- **Chunk size**: The chunk size determines the smallest unit of physical space that a thin pool allocates in response to a write. Because a write to a previously unallocated region always provisions a full chunk, small random writes against a large chunk size cause severe write amplification (for example, a 4 KiB write against a 16 MiB chunk allocates 16 MiB of pool space).

  When you install the `harvester-csi-driver-lvm` add-on v0.4.0 or later, the default StorageClass uses `chunkSize: "1M"`. On the hardware RAID-backed volume groups typical of Harvester nodes, `1M` matches the full-stripe width of common layouts (for example, four data disks with a 256 KiB stripe size yield a 1 MiB stripe). This ensures each chunk allocation maps to whole stripes rather than partial ones. Additionally, a `1M` chunk size keeps thin-pool metadata bounded and comfortably supports pools up to 256 TB. For more information about chunk sizing, see the [Linux kernel dm-thin documentation](https://docs.kernel.org/admin-guide/device-mapper/thin-provisioning.html).

  :::warning

  Chunk size cannot be changed after the thin pool is created. The value must be chosen before the first PersistentVolumeClaim is created against the StorageClass. Reducing chunk size on an existing pool requires evacuating all volumes, destroying the pool, recreating it with the new chunk size, and restoring the volumes.

  :::

  Align the chunk size to your RAID full-stripe width: (number of data disks) × (RAID strip size). A chunk smaller than the full stripe (for example, a `512K` chunk on a 1 MiB stripe) forces every first-touch allocation into a partial-stripe **read-modify-write**. On parity RAID (5/6), partial-stripe writes also widen the write-hole window. This means that an unclean shutdown without a protected controller cache (BBU/FBWC) can leave a stripe with inconsistent parity. Choosing a chunk size equal to, or an exact multiple of, the full stripe avoids both issues. `1M` is the safe default because it aligns with the most common power-of-two RAID geometries.

  The pool uses the value of the `chunkSize` parameter that is set on the StorageClass which first provisions into the volume group. Common values include the following:

  | Value | Target Environment |
  | :--- | :--- |
  | `1M` (Default) | Standard hardware RAID (1 MiB full stripe); general-purpose virtual machine workloads |
  | `512K` / `128K` | RAID arrays with matching full stripe size; non-RAID/single-disk volume groups where stripe alignment does not apply and minimizing snapshot copy-on-write overhead is primary |
  | `2M` | Large-stripe RAID arrays (2 MiB full stripe) with high-throughput sequential-write workloads |

  Do not exceed 2M. Larger chunk sizes trigger disproportionate copy-on-write overhead for snapshots, as documented in the [Red Hat Gluster admin guide](https://docs.redhat.com/en/documentation/red_hat_gluster_storage/3.5/html/administration_guide/chap-configuring_red_hat_storage_for_enhancing_performance).

  In addition, avoid relying on LVM's built-in auto-selection. To keep metadata bounded, LVM determines the chunk size based on the total pool size. This results in 8 to 16 MiB chunks for multi-terabyte pools, which is appropriate for metadata sizing but can severely degrade random-write performance. Always set `chunkSize` explicitly on the StorageClass that first provisions into the volume group.

  Verify the effective chunk size of a live pool:

  ```
  sudo lvs -o vg_name,lv_name,chunk_size,zero <vgName>/<vgName>-thinpool
  sudo dmsetup table <vgName>-<vgName>--thinpool-tpool
  ```

- **Chunk zeroing**: By default, the thin pool writes zeros to each newly allocated block chunk before exposing it to a write operation. On single-tenant clusters, you can disable chunk zeroing to significantly reduce write amplification during initial data allocations. To do this, set `zeroBlocks: "false"` on the StorageClass before the pool is created.

- **Pool metadata size**: When the thin pool is created, the driver sizes its metadata logical volume based on the `poolMetadataSize` StorageClass parameter. The default size is `16G`, which supports pools up to 256 TB at the default 1 MiB chunk size. Larger chunk sizes require less metadata to address the same capacity, while smaller chunk sizes require more (`metadata_bytes ≈ (pool_size ÷ chunk_size) × 64`). Size the metadata volume for the capacity that the pool is expected to reach, because a pool that exhausts its metadata space becomes unresponsive and can only be corrected offline.

### Choosing a Virtual Machine Disk Bus

When you attach an LVM CSI PersistentVolumeClaim to a virtual machine, retain the default `virtio-blk` (`bus: virtio`) bus unless the workload requires a SCSI-specific capability. QEMU [recommends `virtio-blk` for performance-critical use cases](https://www.qemu.org/2021/01/19/virtio-blk-scsi-configuration/), and KubeVirt [supports multiple queues on `virtio-blk` and enables discard passthrough by default](https://kubevirt.io/user-guide/storage/disks_and_volumes/).

Select `virtio-scsi` (`bus: scsi`) when the workload depends on a feature that only the SCSI bus provides, such as SCSI persistent reservations (required by clustered guests, for example Windows Server Failover Clustering), SCSI passthrough, or the ability to attach more disks than the guest's `virtio-blk` device budget allows.

### Coexistence with Longhorn V2 Block-Mode Disks

If the same node hosts a Longhorn V2 disk in block mode, the underlying device is held exclusively by the SPDK Instance Manager. LVM commands issued against volume groups on that node can block indefinitely, which in turn causes LVM CSI provisioning and detach operations to stall.

No supported workaround is currently available. For more information and for the status of the fix, see issue [#11098](https://github.com/harvester/harvester/issues/11098).