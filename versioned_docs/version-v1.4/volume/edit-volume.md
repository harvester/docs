---
sidebar_position: 2
sidebar_label: Edit a Volume
title: "Edit a Volume"
keywords:
- Volume
description: Edit volume from the Volume page.
---

<head>
  <link rel="canonical" href="https://docs.harvesterhci.io/v1.5/volume/edit-volume"/>
</head>

After creating a volume, you can edit your volume by clicking the `⋮` button and selecting the `Edit Config` option.

## Expand a Volume

You can expand a volume by increasing the value of the `Size` parameter directly.
To prevent the expansion from interference by unexpected data R/W, Harvester supports `offline` expansion only. You must shut down the VM or detach the volume first if it is attached to a VM, and the detached volume will automatically attach to a random node with [maintenance mode](https://longhorn.io/docs/1.3.2/concepts/#22-reverting-volumes-in-maintenance-mode) to expand automatically.

![expand-volume](/img/v1.2/volume/expand-volume.png)

## Cancel a Failed Volume Expansion

If you specify a size larger than Longhorn's capacity during the expansion, the status of the volume expansion will be stuck in `Resizing`. You can cancel the failed volume expansion by clicking the `⋮` button and selecting the `Cancel Expand` option.

![cancel-failed-volume-expansion](/img/v1.2/volume/cancel-failed-volume-expansion.png)

## Change the StorageClass of an Existing Volume

The StorageClass of an existing volume cannot be changed. However, you can change the StorageClass while restoring a new volume from the snapshot by following the steps below:

1. [Take a volume snapshot](./volume-snapshots.md#create-volume-snapshots).
2. Select StorageClass when [restoring the volume using snapshot](./volume-snapshots.md#restore-a-new-volume-from-a-volume-snapshot).