---
id: upload-image
sidebar_position: 6
sidebar_label: Upload Images
title: "Upload Images"
keywords:
  - Harvester
  - harvester
  - Rancher
  - rancher
  - Import Images
Description: To import virtual machine images in the **Images** page, enter a URL that can be accessed from the cluster. The image name will be auto-filled using the URL address's filename. You can always customize it when required.
---

Currently, there are three ways that are supported to create an image: uploading images via URL, uploading images via local files, and creating images via volumes.

### Upload Images via URL

To import virtual machine images in the **Images** page, enter a URL that can be accessed from the cluster. Description and labels are optional.
:::note

The image name will be auto-filled using the URL address's filename. You can customize the image name at any time.

:::

![](/img/v1.1/upload-image.png)

### Upload Images via Local File

Currently, qcow2, raw, and ISO images are supported.

:::note

- Please do not refresh the page until the file upload is finished.

:::

![](/img/v1.1/upload-image-local.png)


### Create Images via Volumes

On the **Volumes** page, click **Export Image**. Enter the image name and select a StorageClass to create an image.

![](/img/v1.1/volume/export-volume-to-image-1.png)

### Image StorageClass

When creating an image, you can select a [StorageClass](./advanced/storageclass.md) and use its pre-defined parameters like replicas, node selectors and disk selectors .

:::note

The image will not use the `StorageClass` selected here directly. It's just a `StorageClass` template.

Instead, it will create a special StorageClass under the hood with a prefix name of `longhorn-`. This is automatically done by the Harvester backend, but it will inherit the parameters from the StorageClass you have selected.

:::

![](/img/v1.1/image-storageclass.png)

### Image Labels

You can add labels to the image, which will help identify the OS type more accurately. Also, you can add any custom labels for filtering if needed.

If your image name or URL contains any valid information, the UI will automatically recognize the OS type and image category for you. If not, you can also manually specify those corresponding labels on the UI.

![](/img/v1.1/image-labels.png)