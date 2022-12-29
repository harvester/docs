---
sidebar_position: 5
sidebar_label: Volume Snapshots
title: "Volume Snapshots"
keywords:
- Volume Snapshot
- Volume Snapshots
Description: Take a snapshot for a volume from the Volume page.
---

## Create Volume Snapshots

:::note

A recurring snapshot is currently not supported and is tracked via [harvester/harvester#572](https://github.com/harvester/harvester/issues/572)

:::

After creating a volume, you can create volume snapshots by following the steps below:

1. Click the `⋮` button and select the `Take Snapshot` option.
1. Configure the `Name` of the new image and click `Create`.

![create-volume-snapshot-1](/img/v1.1/volume/create-volume-snapshot-1.png)
![create-volume-snapshot-2](/img/v1.1/volume/create-volume-snapshot-2.png)

## Restore a New Volume using Volume Snapshot

After creating a volume snapshot, you can restore a new volume using the volume snapshot by following the steps below:

1. Go to the `Backup & Snapshot > Volume Snapshots` page or the `Snapshots` tab in each `Volumes` Detail page.
1. Click the `⋮` button and select the `Restore` option.
1. Specify the `Name` of the new Volume.
1. If the source volume is not an image volume, you can also select a different `Storage Class`.
1. Click `Create`.

![restore-volume-snapshot-1](/img/v1.1/volume/restore-volume-snapshot-1.png)
![restore-volume-snapshot-2](/img/v1.1/volume/restore-volume-snapshot-2.png)
![restore-volume-snapshot-3](/img/v1.1/volume/restore-volume-snapshot-3.png)
![restore-volume-snapshot-4](/img/v1.1/volume/restore-volume-snapshot-4.png)
