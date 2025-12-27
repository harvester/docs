---
sidebar_position: 2
sidebar_label: Edit a Volume
title: "Edit a Volume"
keywords:
- Volume
description: Edit volume from the Volume page.
---

<head>
  <link rel="canonical" href="https://docs.harvesterhci.io/v1.6/volume/edit-volume"/>
</head>

After creating a volume, you can edit your volume by clicking the `⋮` button and selecting the `Edit Config` option.

## Expand a Volume

Harvester supports offline volume expansion, provided that the underlying storage provider supports volume resizing. You can increase the size of a volume when the associated virtual machine is powered off or when the volume is detached from the virtual machine.

![expand-volume](/img/v1.2/volume/expand-volume.png)

### Online Volume Expansion

_Available as of v1.6.0_

To minimize downtime, Harvester allows you to expand volumes that are attached to a running virtual machine or have a PVC that is attached to a running pod in the guest cluster. Depending on the underlying storage provider, you may need to take extra steps to use this feature.

- **Longhorn**: Harvester considers Longhorn to have support for online volume expansion, even if differences exist between versions of the Longhorn Data Engine. Currently, the V1 Data Engine fully supports online volume expansion, while the V2 Data Engine does not support volume expansion at all (regardless of the volume's attachment state).

- **Third-party storage**: Harvester rejects online volume expansion requests for third-party storage by default. If you have confirmed that your storage provider supports online volume expansion, you can use the [`csi-online-expand-validation`](../advanced/settings.md#csi-online-expand-validation) setting to mark that storage provider as validated.

![](/img/csi-online-expand-validation.png)

:::info important

Online resizing of hotplugged filesystem volumes is not supported. When a filesystem volume is bind-mounted in the `virt-launcher` pod, hotplugging a new filesystem volume triggers `NodeUnPublish` and `NodeUnstage` operations on the previous volume, which prevents further resizing.

Additionally, you cannot use the [Edit Config](../vm/edit-vm.md) feature on the Harvester UI **Virtual Machines** screen to resize a volume while the virtual machine is running. Certain limitations prevent the current UI from accurately displaying the results of volume expansion operations. For more information, see [issue #8669](https://github.com/harvester/harvester/issues/8669).

:::


## Cancel a Failed Volume Expansion

If you specify a size larger than Longhorn's capacity during the expansion, the status of the volume expansion will be stuck in `Resizing`. You can cancel the failed volume expansion by clicking the `⋮` button and selecting the `Cancel Expand` option.

![cancel-failed-volume-expansion](/img/v1.2/volume/cancel-failed-volume-expansion.png)

## Change the StorageClass of an Existing Volume

The StorageClass of an existing volume cannot be changed. However, you can change the StorageClass while restoring a new volume from the snapshot by following the steps below:

1. [Take a volume snapshot](./volume-snapshots.md#create-volume-snapshots).
2. Select StorageClass when [restoring the volume using snapshot](./volume-snapshots.md#restore-a-new-volume-from-a-volume-snapshot).