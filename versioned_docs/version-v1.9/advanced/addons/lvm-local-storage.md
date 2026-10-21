---
sidebar_position: 8
sidebar_label: Local Storage Support
title: "Local Storage Support"
---

<head>
  <link rel="canonical" href="https://docs.harvesterhci.io/v1.9/advanced/addons/lvm-local-storage"/>
</head>

:::note

The **harvester-csi-driver-lvm** add-on is generally available (GA) starting with Harvester v1.9.1. Releases before v1.9.1 are pre-GA. Volumes created by pre-GA versions of the driver are not backward compatible with the GA driver and are outside the GA support scope.

:::

Harvester allows you to use local storage on the host to create persistent volumes for your workloads with better performance and latency. This functionality is made possible by LVM, which provides logical volume management facilities on Linux.

The **harvester-csi-driver-lvm** add-on is a CSI driver that supports local path provisioning through LVM.

## Supported Configuration

The driver provisions node-local LVM volumes. The volumes and the workloads that use them must be on the same node.

- Use the `ReadWriteOnce` access mode. Multi-node `ReadWriteMany` (RWX) access is not supported. Pre-GA versions accepted RWX volumes, but those volumes did not provide true multi-node RWX semantics.
- Use the `dm-thin` volume type. This is the only volume type included in the GA support scope.
- Virtual machine live migration is not supported for VMs that use LVM volumes.

The `striped` volume type is deprecated and outside the GA support scope. Striped volumes do not provide the storage-efficient snapshot, clone, and restore behavior required by the supported CSI workflow. These operations require full data copies, which increase capacity and I/O requirements and can cause longer operations, retries, and timeouts.

## Upgrading from a Pre-GA Release

:::caution

Before upgrading the add-on to the GA version provided for Harvester v1.9.1 or later, delete every LVM volume created by a pre-GA driver version. Back up any data that you need to preserve before deleting the volumes.

:::

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

When the driver provisions the first `dm-thin` volume in a volume group, it automatically creates `<volume-group>-thinpool` if that thin pool does not exist. The driver uses the following policy:

- 90% of the currently free volume group extents for thin-pool data
- 512 KiB chunk size
- 16 GiB of active metadata
- An enabled LVM metadata repair spare of approximately the same size as the active metadata

Approximately 32 GiB of volume group capacity is reserved for the active metadata and its repair spare. The repair spare is not additional live metadata capacity. Ensure that the volume group has enough free capacity for the data, active metadata, and repair spare. Thin-pool creation fails if the volume group cannot satisfy these allocations.

The 16 GiB metadata allocation reduces the risk of metadata exhaustion but does not eliminate it. If `<volume-group>-thinpool` already exists, the driver uses it as-is and does not modify its geometry. Reusing an existing thin pool does not provide backward compatibility for volumes created by a pre-GA driver.

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

Use only the `dm-thin` volume type. The `striped` volume type is deprecated and is not supported for GA.

:::

1. On the Harvester UI, go to the **Storage** screen.

1. Create a new StorageClass and select **LVM** in the **Provisioner** list.

    ![](/img/v1.4/csi-driver-lvm/create-lvm-sc-01.png)

1. On the **Parameters** tab, configure the following settings:

    - **Node**: Select the target node for the intended workloads. 
  
      ![](/img/v1.4/csi-driver-lvm/create-lvm-sc-02.png)

    - **Volume Group Name**: Select the volume group that you created.

      ![](/img/v1.4/csi-driver-lvm/create-lvm-sc-03.png)

    - **Volume Group Type**: Select **dm-thin**.

    - **Volume Mode / Access Modes**: On the **CDI Settings** tab, verify that the volume mode is **Block** and the access mode is **ReadWriteOnce**. For more information, see [Containerized Data Importer (CDI) Settings](../storageclass.md#containerized-data-importer-cdi-settings).

1. Click **Save**.

1. On the **Storage** screen, verify that the StorageClass was created and the correct provisioner was set.

    ![](/img/v1.4/csi-driver-lvm/create-lvm-sc-05.png)

For more information, see [StorageClass](../storageclass.md).

## Creating a Volume with LVM

1. On the Harvester UI, go to the **Volumes** screen.

1. Create a new volume using the `dm-thin` LVM StorageClass that you created.

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

## Monitoring and Workload Planning

Monitor each thin pool on the node that hosts its volume group. The following command displays the data and metadata usage, read-only state, and health attributes:

```
sudo lvs -a <volume-group> \
  -o lv_name,lv_attr,data_percent,metadata_percent
```

Monitor `Data%` and `Meta%`, and take corrective action before either value reaches 100%. In `lv_attr`, the second character indicates whether a logical volume is writable (`w`) or read-only (`r`). For a thin pool, the ninth character can indicate a failed pool (`F`), exhausted data space (`D`), or read-only metadata (`M`).

Exhausting thin-pool data or metadata can stall or fail I/O and prevent volume or snapshot creation. These behaviors are inherent to Linux device-mapper thin provisioning. For more information, see [LVM thin provisioning](https://www.man7.org/linux/man-pages/man7/lvmthin.7.html).

Avoid overwhelming LVM storage with too many concurrent I/O-intensive workloads or volume lifecycle operations, such as provisioning, cloning, and snapshot creation or restoration. Resource contention can significantly increase operation time and may cause applications to time out, depending on their timeout behavior and expectations. The suitable workload concurrency depends on the storage hardware and workload characteristics. Validate the expected concurrency with representative workload testing.

## Supported LVM Volume Features

- Volume resizing
- Volume cloning
- Snapshot creation

:::note

Backup creation is currently not supported. This limitation will be addressed in a future release.

:::
