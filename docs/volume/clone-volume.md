---
sidebar_position: 3
sidebar_label: Clone a Volume
title: "Clone a Volume"
keywords:
- Volume
description: Clone volume from the Volume page.
---

<head>
  <link rel="canonical" href="https://docs.harvesterhci.io/v1.6/volume/clone-volume"/>
</head>

## How to Clone a Volume

After creating a volume, you can clone the volume by following the steps below:

1. Click the `⋮` button and select the `Clone` option.

    ![clone-volume-1](/img/v1.2/volume/clone-volume-1.png)

1. Select `clone volume data`.
1. Configure the `Name` of the new volume and click `Create`.
1. (Optional) A cloned volume can be added to a VM using `Add Existing Volume`.

    ![clone-volume-2](/img/v1.2/volume/clone-volume-2.png)

### Replica Rebuilding for Cloned Detached Longhorn Volumes

When you clone a detached Longhorn volume in a multi-node cluster, the cloned volume initially has only **one replica** instead of the expected number of replicas (e.g., 3 replicas in a 3-node cluster). The volume clone status will show as `copy-completed-awaiting-healthy` rather than `complete`.

Longhorn will rebuild the remaining replicas automatically when the cloned volume is first attached to a VM. However, if you need to trigger the replica rebuilding immediately for a detached volume, you have two options:

### Option 1: Manually Attach the Volume

1. Navigate to the Longhorn UI
1. Find and attach the cloned volume
1. Wait for the Longhorn replica rebuild process to complete
1. The volume will now have the expected number of replicas (e.g., 3 replicas)
1. Detach the volume if needed

### Option 2: Enable Offline Replica Rebuilding

Enable the Longhorn setting `offline-replica-rebuilding` to allow Longhorn to automatically rebuild replicas for detached volumes. For more information, see the [Longhorn documentation on offline replica rebuilding](https://longhorn.io/docs/1.10.1/advanced-resources/rebuilding/offline-replica-rebuilding/).

:::note

This behavior applies to cloned volumes that are in a detached state. Volumes that are attached to a running VM will automatically rebuild replicas as expected.

:::
