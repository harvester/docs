---
sidebar_position: 60
keywords:
  - Harvester
  - harvester
  - Rancher
  - rancher
  - Import Images
Description: To import virtual machine images in the **Images** page, enter a URL that can be accessed from the cluster. The image name will be auto-filled using the URL address's filename. You can always customize it when required.
---

# Import Images

To import virtual machine images in the **Images** page, enter a URL that can be accessed from the cluster. Description and labels are optional.
!!!note
    The image name will be auto-filled using the URL address's filename. You can always customize it when required.
![](./assets/upload-image.png)

Currently, we support qcow2, raw, and ISO images.

!!!note
    Uploading images from UI to the Harvester cluster is not supported yet. The feature request is being tracked on [#570](https://github.com/harvester/harvester/issues/570).
