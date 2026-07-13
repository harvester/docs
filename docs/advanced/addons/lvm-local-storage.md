---
sidebar_position: 8
sidebar_label: Local Storage Support
title: "Local Storage Support (Experimental)"
---

<head>
  <link rel="canonical" href="https://docs.harvesterhci.io/v1.8/advanced/addons/lvm-local-storage"/>
</head>

:::note

**harvester-csi-driver-lvm** is an *experimental* add-on. It is not included in the Harvester ISO, but you can download it from the [experimental-addons repository](https://github.com/harvester/experimental-addons). For more information about experimental features, see [Feature Labels](../../getting-started/document-conventions.md#feature-labels).

:::

Harvester allows you to use local storage on the host to create persistent volumes for your workloads with better performance and latency. This functionality is made possible by LVM, which provides logical volume management facilities on Linux.

The **harvester-csi-driver-lvm** add-on is a CSI driver that supports local path provisioning through LVM.

## Installing and Enabling the Add-on

If you are using the Harvester kubeconfig file, you can install the add-on by performing the following steps:

1. Install the add-on by running the following command:

    ```
    # kubectl apply -f https://raw.githubusercontent.com/harvester/experimental-addons/main/harvester-csi-driver-lvm/harvester-csi-driver-lvm.yaml
    ```

1. On the Harvester UI, go to **Advanced** > **Add-ons**.

1. Select **harvester-csi-driver-lvm (Experimental)**, and then select **⋮** > **Enable**.

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

    - **Volume Group Type**: Select the type of local volume that matches your requirements. Harvester currently supports **striped** and **dm-thin**.

      ![](/img/v1.4/csi-driver-lvm/create-lvm-sc-04.png)

    - **Volume Group Type**: Select a type based on how the workload uses snapshots and how pool capacity is allocated. Harvester supports the following options:
    
        - **striped**: Best suited for workloads requiring direct, high-performance volume access distributed across the physical devices in the volume group. Each logical volume is fully allocated its requested capacity at provisioning time. Snapshots are created as independent logical volumes sized to match the source volume's maximum capacity. For example, a snapshot of a 100 GiB volume reserves an additional 100 GiB of volume group space upon creation, regardless of the actual quantity of data written to the source..

        - **dm-thin**: Best suited for virtual machine workloads that frequently use snapshots or clones, and for environments that require over-provisioned pool capacity. Thin-provisioned volumes consume physical space only as blocks are written. Snapshots leverage true copy-on-write functionality at the thin-pool chunk level. For example, a fresh snapshot of a 100 GiB volume consumes practically zero pool capacity at creation, only growing as modified blocks accumulate over time.

        :::tip

        Select **dm-thin** if you expect to create regular snapshots or scheduled backups. This option is generally optimal for standard virtual machine workloads because of its efficient space utilization.

        :::

        ![](/img/v1.4/csi-driver-lvm/create-lvm-sc-04.png)

1. On the **Storage** screen, verify that the StorageClass was created and the correct provisioner was set.

    ![](/img/v1.4/csi-driver-lvm/create-lvm-sc-05.png)

### Considerations: `striped` vs `dm-thin`

Both volume group types are fully supported. The choice depends on how the workload will use snapshots and how the pool capacity will be shared.

- **`striped`** is a good fit for workloads that mostly need direct volume performance across the physical devices in the volume group. Each logical volume gets its full requested capacity at provision time. Snapshots are provisioned as separate LVs sized to the origin's full capacity — a snapshot of a 100 GiB volume reserves an additional 100 GiB of volume group space at creation, regardless of how much data has actually been written to the origin.

- **`dm-thin`** is a good fit for virtual machine workloads that take snapshots or clones, and for environments that want to over-provision pool capacity. Thin volumes consume physical space only as blocks are written to them, and snapshots are true copy-on-write at the thin-pool chunk level — a fresh snapshot of a 100 GiB volume adds effectively zero pool capacity at creation and only grows as changed blocks accumulate.

If regular snapshots are expected, `dm-thin` is generally the right choice for VM workloads.

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

- **Chunk zeroing**: By default, the thin pool writes zeros to each newly allocated block chunk before exposing it to a write operation. On single-tenant clusters, you can disable chunk zeroing to significantly reduce write amplification during initial data allocations.

  ```
  sudo lvchange --zero n <vgName>/<vgName>-thinpool
  ```

  You can fully reverse the change by running the command with `--zero y`.

- **Pool metadata size**: When the thin pool is created, LVM automatically sizes its metadata logical volume. Consider extending this volume proactively if you expect the pool to store a large number of snapshots or thin volumes over time. Doing so prevents the pool from running out of space and becoming unresponsive later.

  ```
  sudo lvextend --poolmetadatasize +1G <vgName>/<vgName>-thinpool
  ```

### Choosing a Virtual Machine Disk Bus

When attaching an LVM CSI PersistentVolumeClaim to a VirtualMachine, `virtio-scsi` (`bus: scsi`) generally outperforms the default `virtio-blk` (`bus: virtio`) for sustained-write workloads on thin-provisioned pools, particularly on RAID-backed storage. `virtio-scsi` performs better because it supports multiple queues and uses a more efficient DISCARD path.

### Coexistence with Longhorn v2 Block-Mode Disks

If the same node hosts a Longhorn v2 disk in block mode, the underlying device is held exclusively by the SPDK instance manager. Adding that device to the LVM `global_filter` prevents LVM's device scan from attempting to open it. Example, in `/etc/lvm/lvmlocal.conf`:

```
devices {
    global_filter = [
      "r|/dev/loop.*|",
      "r|/dev/disk/by-path/.*longhorn.*|",
      "r|/dev/mapper/pvc-.*|",
      "r|/dev/disk/by-id/wwn-<lhv2-disk-wwn>|",
    ]
}
```

Because Harvester's operating system is immutable, you must persist this change through an `/oem/*.yaml` cloud-config file to ensure it survives system reboots and upgrades.For more information, see issue [#11098](https://github.com/harvester/harvester/issues/11098).