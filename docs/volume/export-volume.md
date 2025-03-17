---
sidebar_position: 4
sidebar_label: Export a Volume to Image
title: "Export a Volume to Image"
keywords:
- Volume
description: Export volume to image from the Volume page.
---

<head>
  <link rel="canonical" href="https://docs.harvesterhci.io/v1.4/volume/export-volume"/>
</head>

You can select and export an existing volume to an image by following the steps below:

:::note

Since the third-party storage is supported, there is the limitation of the export volume. You need to ensure the volume did not attach to any workload (VM/Pods) before exporting the volume to an image or you will see the image is stuck in the `Exporting` status.

:::

1. Click the `⋮` button and select the `Export Image` option.

    ![export-volume-to-image-1](/img/v1.2/volume/export-volume-to-image-1.png)

1. Select the `Namespace` of the new image.
1. Configure the `Name` of the new image.
1. Select an existing `StorageClass`.
1. (Optional) You can download the exported image from the `Images` page by clicking the `⋮` button and selecting the `Download` option.

    ![export-volume-to-image-2](/img/v1.2/volume/export-volume-to-image-2.png)
