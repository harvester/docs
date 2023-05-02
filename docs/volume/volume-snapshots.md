---
sidebar_position: 5
sidebar_label: Volume Snapshots
title: "Volume Snapshots"
keywords:
- Volume Snapshot
- Volume Snapshots
Description: Take a snapshot for a volume from the Volume page.
---

After creating a volume, you can create a volume snapshot and use a volume snapshot to restore a new volume. Volume snapshots allow you to copy or restore a volume's configuraiton without creating a completely new volume.

## Create volume snapshots

You can create a volume snapshot from an existing volume by following these steps:

1. Go to the **Volumes** page.
1. Choose the volume that you want to take a snapshot of and select **⋮ > Take Snapshot**.

 ![create-volume-snapshot-1](/img/v1.2/volume/create-volume-snapshot-1.png)
1. Enter a **Name** for the snapshot.

 ![create-volume-snapshot-2](/img/v1.2/volume/create-volume-snapshot-2.png)
1. Select  **Create** to finish creating a new volume snapshot.

1. You can view all VM snapshots and check the status of this operation from the **Backup & Snapshot > VM Snapshots** page. When the **ReadyToUse** status is set to **true**, the snapshot is complete.

:::note

A recurring snapshot is currently not supported and is tracked via [harvester/harvester#572](https://github.com/harvester/harvester/issues/572)

:::

## Restore a new volume from a volume snapshot

You can restore a new volume from an existing volume snapshot by following these steps:

1. Go to the **Backup & Snapshot > Volume Snapshots** page or go to the **Volumes** page and select the **Snapshots** tab.
1. Select **⋮ > Restore**.
![restore-volume-snapshot-1](/img/v1.2/volume/restore-volume-snapshot-1.png)
![restore-volume-snapshot-2](/img/v1.2/volume/restore-volume-snapshot-2.png)
1. Specify the **Name** of the new volume.
![restore-volume-snapshot-3](/img/v1.2/volume/restore-volume-snapshot-3.png)
1. If the source volume is not an image volume, you can select a different **StorageClass**. You can not change the **StorageClass** if the source volume is an image volume.
![restore-volume-snapshot-4](/img/v1.2/volume/restore-volume-snapshot-4.png)
1. Select **Create** to finish restoring a new volume.

### View the replication and health status in Longhorn

1. You can view the replication and health status for the new volume from Longhorn dashboard. The Longhorn dashboard is available directly in the Harvester dashboard, but you must first enable developer tools & features. Go to the **Preference** page.
![restore-volume-snapshot-5](/img/v1.2/volume/restore-volume-snapshot-5.png)
1. Select the **Enable Developer Tools & Features**.
![restore-volume-snapshot-6](/img/v1.2/volume/restore-volume-snapshot-6.png)
1. Go to the **Support** page to access the embedded Longhorn UI.
![restore-volume-snapshot-6](/img/v1.2/volume/restore-volume-snapshot-7.png)