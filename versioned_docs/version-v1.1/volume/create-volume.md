---
id: index
sidebar_position: 1
sidebar_label: Create a Volume
title: "Create a Volume"
keywords:
- Volume
Description: Create a volume from the Volume page.
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

![create-empty-volume](/img/v1.1/volume/create-empty-volume.png)

## Create an Image Volume

### Header Section
1. Set the Volume `Name`.
1. (Optional) Provide a `Description` for the Volume.

### Basics Tab

1. Choose `VM Image` in `Source`.
1. Select an existing `Image`.
1. Configure the `Size` of the volume.

![create-image-volume](/img/v1.1/volume/create-image-volume.png)

## Known Issues

### The Volumes page does not show the created volume

| Issue | Affected versions | Status | Last updated |
|-----------|-----------|-----------|--------------|
|[The Volumes page does not show the created volume](https://github.com/harvester/harvester/issues/3874)|Harvester v1.1.2| Resolved (Harvester > v1.1.2)  | 2023-07-28 |

#### Summary

After creating a volume when using Harvester from Rancher, users with the project role **Project Member** cannot find the newly created volume on the **Volumes** page.

#### Workaround

You can temporarily change the Harvester plugin version to [v1.2.1-patch1](https://github.com/harvester/dashboard/releases/tag/v1.1.2-patch1) from the Harvester UI.

1. Go to the **Advanced** > **Settings** page. Find  the **ui-plugin-index** and select **⋮**  > **Edit Setting**.
1. Change the **Value** to **https://releases.rancher.com/harvester-ui/plugin/harvester-release-harvester-v1.1.2-patch1/harvester-release-harvester-v1.1.2-patch1.umd.min.js**.
1. On the **Settings** page, find **ui-source** and select **⋮**  > **Edit Setting**.
1. Change the **Value** to **External** to use an external UI source.
1. Log in again as a **Project Member** user in Rancher to view the newly created volume for your Harvester cluster.
