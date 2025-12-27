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

### Replica Rebuilding for Detached Cloned Longhorn Volumes

When you clone a detached Longhorn volume in a multi-node cluster, Longhorn creates only *one replica* instead of the expected number (for example, three replicas in a three-node cluster). The displayed volume clone status is `copy-completed-awaiting-healthy` instead of `complete`.

Longhorn automatically rebuilds the remaining replicas after the cloned volume is attached to a virtual machine. However, you can start the replica rebuilding process immediately for the detached volume by performing either of the following actions:

- On the Longhorn UI, manually attach the volume and wait for the replica rebuilding process to be completed.

- Enable the Longhorn setting [`offline-replica-rebuilding`](https://longhorn.io/docs/1.10.1/advanced-resources/rebuilding/offline-replica-rebuilding/) to allow automatic rebuilding of replicas for detached volumes.

:::note

This behavior applies exclusively to detached volumes. Longhorn automatically performs replica rebuilding for volumes that are attached to a running virtual machine.

:::
