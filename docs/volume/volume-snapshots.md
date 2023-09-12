---
sidebar_position: 5
sidebar_label: Volume Snapshots
title: "Volume Snapshots"
keywords:
- Volume Snapshot
- Volume Snapshots
Description: Take a snapshot for a volume from the Volume page.
---
<head>
  <link rel="canonical" href="https://docs.harvesterhci.io/v1.1/volume/volume-snapshots"/>
</head>

A volume snapshot represents a snapshot of a volume on a storage system. After creating a volume, you can create a volume snapshot and restore a volume to the snapshot's state. With volume snapshots, you can easily copy or restore a volume's configuration.

## Create Volume Snapshots

You can create a volume snapshot from an existing volume by following these steps:

1. Go to the **Volumes** page.

1. Choose the volume that you want to take a snapshot of and select **⋮ > Take Snapshot**.

    ![create-volume-snapshot-1](/img/v1.2/volume/create-volume-snapshot-1.png)

1. Enter a **Name** for the snapshot.

    ![create-volume-snapshot-2](/img/v1.2/volume/create-volume-snapshot-2.png)

1. Select  **Create** to finish creating a new volume snapshot.

1. Check the status of this operation and view all volume snapshots by going to the **Volumes** page and selecting the **Snapshots** tab. When the **Ready To Use** becomes **√**, the volume snapshot is ready to use.

:::note

A recurring snapshot is currently not supported and is tracked via [harvester/harvester#572](https://github.com/harvester/harvester/issues/572).

:::

## Restore a new volume from a volume snapshot

You can restore a new volume from an existing volume snapshot by following these steps:

1. Go to the **Backup & Snapshot > Volume Snapshots** page or select a **Volume** from the **Volumes** page and go to the **Snapshots** tab.

1. Select **⋮ > Restore**.

    ![restore-volume-snapshot-1](/img/v1.2/volume/restore-volume-snapshot-1.png)
  
    ![restore-volume-snapshot-2](/img/v1.2/volume/restore-volume-snapshot-2.png)

1. Specify the **Name** of the new volume.

    ![restore-volume-snapshot-3](/img/v1.2/volume/restore-volume-snapshot-3.png)

1. If the source volume is not an image volume, you can select a different **StorageClass**. You can not change the **StorageClass** if the source volume is an image volume.

    ![restore-volume-snapshot-4](/img/v1.2/volume/restore-volume-snapshot-4.png)

1. Select **Create** to finish restoring a new volume.
