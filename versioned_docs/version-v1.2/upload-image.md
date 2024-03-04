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
description: To import virtual machine images in the **Images** page, enter a URL that can be accessed from the cluster. The image name will be auto-filled using the URL address's filename. You can always customize it when required.
---

Currently, there are three ways that are supported to create an image: uploading images via URL, uploading images via local files, and creating images via volumes.

### Upload Images via URL

To import virtual machine images in the **Images** page, enter a URL that can be accessed from the cluster. Description and labels are optional.
:::note

The image name will be auto-filled using the URL address's filename. You can customize the image name at any time.

:::

![](/img/v1.2/upload-image.png)

### Upload Images via Local File

Currently, qcow2, raw, and ISO images are supported.

:::note

- Please do not refresh the page until the file upload is finished.

:::

![](/img/v1.2/upload-image-local.png)


### Create Images via Volumes

On the **Volumes** page, click **Export Image**. Enter the image name and select a StorageClass to create an image.

![](/img/v1.2/volume/export-volume-to-image-1.png)

### Image StorageClass

When creating an image, you can select a [StorageClass](./advanced/storageclass.md) and use its pre-defined parameters like replicas, node selectors and disk selectors .

:::note

The image will not use the `StorageClass` selected here directly. It's just a `StorageClass` template.

Instead, it will create a special StorageClass under the hood with a prefix name of `longhorn-`. This is automatically done by the Harvester backend, but it will inherit the parameters from the StorageClass you have selected.

:::

![](/img/v1.2/image-storageclass.png)

### Image Labels

You can add labels to the image, which will help identify the OS type more accurately. Also, you can add any custom labels for filtering if needed.

If your image name or URL contains any valid information, the UI will automatically recognize the OS type and image category for you. If not, you can also manually specify those corresponding labels on the UI.

![](/img/v1.2/image-labels.png)

### Known Issues

Attempts to download images while [storage network settings](./advanced/storagenetwork.md) are being configured will fail. Use the following workaround to download images without triggering an HTTP 502 error:

1. Obtain the name and namespace of the **image**.

    ```
    $ kubectl get virtualmachineimages.harvesterhci.io -A -o json | jq -r '.items[] | select(.spec.displayName == "<image name from Harvester GUI>") | .metadata.namespace + "/" + .metadata.name'
    ```

    Example:
    ```
    $ kubectl get virtualmachineimages.harvesterhci.io -A -o json | jq -r '.items[] | select(.spec.displayName == "jammy-server-cloudimg-amd64.img") | .metadata.namespace + "/" + .metadata.name'
    default/image-h6dwf
    ```

2. Obtain the name of the related **backing image**.

    ```
    $ kubectl get backingimage -A -o json | jq -r '.items[] | select(.metadata.annotations["harvesterhci.io/imageId"] == "<image namespace>/<image name>") | .metadata.name'
    ```

    Example:
    ```
    $ kubectl get backingimage -A -o json | jq -r '.items[] | select(.metadata.annotations["harvesterhci.io/imageId"] == "default/image-h6dwf") | .metadata.name'
    default-image-h6dwf
    ```

3. Obtain the image file path from the **backing image manager**.

    ```
    $ kubectl get backingimagemanagers.longhorn.io -A -o json | jq -r '.items[] | select(.spec.backingImages."<backing image name>" != null) | .spec'
    ```

    Example:
    ```
    $ kubectl get backingimagemanagers.longhorn.io -A -o json | jq -r '.items[] | select(.spec.backingImages."default-image-h6dwf" != null) | .spec'
    {
      "backingImages": {
        "default-image-dp85d": "df08a47d",
        "default-image-h6dwf": "dda82f44"
      },
      "diskPath": "/var/lib/harvester/defaultdisk",
      "diskUUID": "ac97e1b6-7a2e-4125-9589-2247ea8fa93f",
      "image": "longhornio/backing-image-manager:v1.6.0",
      "nodeID": "img-encrypter"
    }
    ```

4. Connect to the corresponding node and then check if the file path matches.
    ```
    $ ls <diskPath>/backing-images/<backing image name>-<backimg image UUID>
    ```

    Example:
    ```
    $ ls /var/lib/harvester/defaultdisk/backing-images/default-image-h6dwf-dda82f44
    backing  backing.cfg
    ```

5. Download the image.
    ```
    $ scp <diskPath>/backing-images/<backing image name>-<backimg image UUID>/backing <destination host>
    ```

    Example:
    ```
    $ scp /var/lib/harvester/defaultdisk/backing-images/default-image-h6dwf-dda82f44/backing rancher@host:~/iso
    ```


- Related issue:
  - [[BUG] Download backing image failed with HTTP 502 error if Storage Network configured](https://github.com/harvester/harvester/issues/4807)
