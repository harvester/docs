---
sidebar_position: 8
sidebar_label: Local Storage Support
title: "Local Storage Support"
---

<head>
  <link rel="canonical" href="https://docs.harvesterhci.io/v1.4/advanced/addons/lvm-local-storage"/>
</head>

_Available as of v1.4.0_

Harvester allows you to use local storage on the host to create persistent volumes for your workloads with better performance and latency. This functionality is made possible by LVM, which provides logical volume management facilities on Linux.

## Installing and Enabling harvester-csi-driver-lvm

The `harvester-csi-driver-lvm` add-on is a CSI driver that supports local path provisioning through LVM. It is not packaged into the Harvester ISO, but is available in the [experimental-addons](https://github.com/harvester/experimental-addons) repository.

If you are using the Harvester kubeconfig file, you can perform the following steps:

1. Install the add-on by running the following command:

```
# kubectl apply -f https://raw.githubusercontent.com/harvester/experimental-addons/main/harvester-csi-driver-lvm/harvester-csi-driver-lvm.yaml
```

1. On the Harvester UI, go to **Advanced** > **Add-ons**.

1. Select **harvester-csi-driver-lvm (Experimental)**, and then select **⋮** > **Enable**.

  ![](/img/v1.4/csi-driver-lvm/enable-lvm-addon.png)

## Creating a Volume Group for LVM

A volume group combines physical volumes to create a single storage structure that can be divided into logical volumes.

:::note

Harvester currently does not allow you to modify the volume group composition (add or remove disks) after you create a logical volume. This issue will be addressed in a future release.

:::

1. Verify that the `harvester-csi-driver-lvm` add-on is installed.

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

1. Click **Save**.

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