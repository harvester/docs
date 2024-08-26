---
id: index
sidebar_position: 1
sidebar_label: Create a Volume
title: "Create a Volume"
keywords:
- Volume
description: Create a volume from the Volume page.
---

<head>
  <link rel="canonical" href="https://docs.harvesterhci.io/v1.1/volume/create-volume"/>
</head>

## Create an Empty Volume

### Header Section
1. Set the Volume `Name`.
1. (Optional) Provide a `Description` for the Volume.

### Basics Tab

1. Choose `New` in `Source`.
1. Select an existing `StorageClass`.
1. Configure the `Size` of the volume.

![create-empty-volume](/img/v1.2/volume/create-empty-volume.png)

:::info important

Harvester automatically attaches and detaches volumes during operations such as VM creation and migration.

Manually attaching a volume to the node is not recommended because it may prevent you from enabling [Maintenance Mode](../host/host.md#node-maintenance). For troubleshooting information, see [Manually Attached Volumes](../troubleshooting/host.md#manually-attached-volumes).

:::

## Create an Image Volume

### Header Section
1. Set the Volume `Name`.
1. (Optional) Provide a `Description` for the Volume.

### Basics Tab

1. Choose `VM Image` in `Source`.
1. Select an existing `Image`.
1. Configure the `Size` of the volume.

![create-image-volume](/img/v1.2/volume/create-image-volume.png)
