---
sidebar_position: 6
sidebar_label: Upload Images
title: ""
keywords:
  - Harvester
  - harvester
  - Rancher
  - rancher
  - Import Images
Description: To import virtual machine images in the **Images** page, enter a URL that can be accessed from the cluster. The image name will be auto-filled using the URL address's filename. You can always customize it when required.
---

# Upload Images

Currently, there are three ways that are supported to create an image: uploading images via URL, uploading images via local files, and creating images via volumes.

### Upload Images via URL

To import virtual machine images in the **Images** page, enter a URL that can be accessed from the cluster. Description and labels are optional.
:::note

The image name will be auto-filled using the URL address's filename. You can customize the image name at any time.

:::

![](/img/v1.0/upload-image.png)

### Upload Images via Local File

Currently, qcow2, raw, and ISO images are supported.

:::note

- Please do not refresh the page until the file upload is finished.

:::

![](/img/v1.0/upload-image-local.png)


### Create Images via Volumes

On the **Volumes** page, click **Export Image**. Enter image name to create image.

![](/img/v1.0/export-image.png)

### Image labels


You can add labels to the image, which will help identify the OS type more accurately. Additionally, you can also add any custom labels when needed.

If you create an image from a URL, the UI will automatically recognize the OS type and image category based on the image name. However, if you created the image by uploading a local file, you will need to manually select the corresponding labels.

![](/img/v1.0/image-labels.png)