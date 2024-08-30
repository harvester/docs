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

## Create an Image Volume

### Header Section
1. Set the Volume `Name`.
1. (Optional) Provide a `Description` for the Volume.

### Basics Tab

1. Choose `VM Image` in `Source`.
1. Select an existing `Image`.
1. Configure the `Size` of the volume.

:::caution

When creating volumes from a VM image, ensure that the volume size is greater than or equal to the image size. The volume may become corrupted if the configured volume size is less than the size of the underlying image. This is particularly important for qcow2 images because the virtual size is typically greater than the physical size.

To determine the virtual size of a qcow2 image, you can run the command `qemu-img info YOUR_IMAGE_FILE.qcow2`.

:::

![create-image-volume](/img/v1.2/volume/create-image-volume.png)