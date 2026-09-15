---
id: upload-image
sidebar_position: 1
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

<head>
  <link rel="canonical" href="https://docs.harvesterhci.io/v1.8/image/upload-image"/>
</head>

Currently, there are three ways that are supported to create an image: uploading images via URL, uploading images via local files, and creating images via volumes.

### Upload Images via URL

<Tabs>
<TabItem value="ui" label="UI" default>

To import virtual machine images in the **Images** page, enter a URL that can be accessed from the cluster. Description and labels are optional.

:::note

- The image name will be auto-filled using the URL address's filename. You can customize the image name at any time.
- Avoid using a daily build URL (for example, the [Ubuntu Jammy daily build](https://cloud-images.ubuntu.com/jammy/current/jammy-server-cloudimg-amd64.img)). When all replicas of a Longhorn backing image are lost, Longhorn attempts to download the file again for self-healing purposes. Using a daily build URL is problematic because the URL itself changes, causing a checksum mismatch and a conflict that results in lost replicas.

:::

![](/img/v1.2/upload-image.png)

</TabItem>
<TabItem value="api" label="API">

To import a virtual machine image from a repository using the API, create a `VirtualMachineImage` object. You must specify a URL that can be accessed from the cluster.

By default, a `VirtualMachineImage` object uses the Longhorn backing image backend. To store images in third-party storage or Longhorn V2 Data Engine volumes, use the Containerized Data Importer (CDI) backend and specify the target StorageClass.

Example (Longhorn backing image backend):

```yaml
apiVersion: harvesterhci.io/v1beta1
kind: VirtualMachineImage
metadata:
  name: opensuse-leap
  namespace: default
spec:
  description: A human-readable description for the VM image
  displayName: openSUSE-Leap
  sourceType: download
  url: "https://download.opensuse.org/repositories/Cloud:/Images:/Leap_15.5/images/openSUSE-Leap-15.5.x86_64-NoCloud.qcow2"
  checksum: 80c27afb7cd791ac86ee1b0b0c572a242f6142579db5beac841e71151d370cd6
```

Example (CDI backend):

```yaml
apiVersion: harvesterhci.io/v1beta1
kind: VirtualMachineImage
metadata:
  name: opensuse-leap-nfs
  namespace: default
spec:
  backend: cdi
  description: A VM image stored in third-party storage
  displayName: openSUSE-Leap-NFS
  sourceType: download
  url: "https://download.opensuse.org/repositories/Cloud:/Images:/Leap_15.5/images/openSUSE-Leap-15.5.x86_64-NoCloud.qcow2"
  checksum: 80c27afb7cd791ac86ee1b0b0c572a242f6142579db5beac841e71151d370cd6
  targetStorageClassName: nfs-csi
```

Replace `nfs-csi` with the name of the StorageClass for your storage solution. The target StorageClass cannot be changed after the image is created.

For more information, see the [API reference](/v1.6/api/create-namespaced-virtual-machine-image).

</TabItem>
<TabItem value="terraform" label="Terraform">

```hcl
resource "harvester_image" "opensuse154" {
  name      = "opensuse154"
  namespace = "harvester-public"

  display_name = "openSUSE-Leap-15.4.x86_64-NoCloud.qcow2"
  source_type  = "download"
  url          = "https://downloadcontent-us1.opensuse.org/repositories/Cloud:/Images:/Leap_15.4/images/openSUSE-Leap-15.4.x86_64-NoCloud.qcow2"
}
```

</TabItem>
</Tabs>

### Upload Images via Local File

Currently, qcow2, raw, and ISO images are supported.

:::note

- Please do not refresh the page until the file upload is finished.

:::

![](/img/v1.2/upload-image-local.png)


#### HTTP 413 Error in Rancher Multi-Cluster Management

You can upload images from the [**Multi-Cluster Management**](../rancher/virtualization-management.md#importing-harvester-cluster) screen on the **Rancher UI**. When the status of an image is *Uploading* but the progress indicator displays *0%* for an extended period, check the HTTP response status code. *413* indicates that the size of the request body exceeds the limit.

![](/img/v1.3/img-413-code.png)

The maximum request body size should be specific to the cluster that is hosting Rancher (for example, RKE2 clusters have a default limit of 1 MB but no such limit exists in K3s clusters).

The current workaround is to upload images from the **Harvester UI**. If you choose to upload images from the Rancher UI, you may need to configure related settings on the ingress server (for example, [`proxy-body-size`](https://kubernetes.github.io/ingress-nginx/user-guide/nginx-configuration/annotations/#custom-max-body-size) in NGINX).

If Rancher is deployed on an RKE2 cluster, perform the following steps:

1. Edit the Rancher ingress.

    ```
    $ kubectl -n cattle-system edit ingress rancher
    ```

2. Specify a value for `nginx.ingress.kubernetes.io/proxy-body-size`.

  Example:
  ![](/img/v1.3/img-ingress-client-body.png)

3. Delete the stuck image, and then restart the upload process.

#### Prolonged Uploading of Large Images in Rancher Multi-Cluster Management

If you upload a very large image (over 10 GB) from the **Multi-Cluster Management** screen on the Rancher UI, the operation may take longer than usual and the image status (Uploading) may not change.

This behavior is related to *proxy-request-buffering* in the ingress configuration, which is also specific to the cluster that is hosting Rancher.

The current workaround is to upload images from the **Harvester UI**. If you choose to upload images from the Rancher UI, you may need to configure related settings on the ingress server (for example, [`proxy-request-buffering`](https://nginx.org/en/docs/http/ngx_http_proxy_module.html#proxy_request_buffering) in NGINX).

If Rancher is deployed on an RKE2 cluster, perform the following steps:

1. Edit the Rancher ingress.

    ```
    $ kubectl -n cattle-system edit ingress rancher
    ```

2. Turn off `nginx.ingress.kubernetes.io/proxy-request-buffering`.

  Example:
  ![](/img/img-ingress-request-proxy-buffering.png)

3. Delete the stuck image, and then restart the upload process.

#### Uploading Images Previously Downloaded from Harvester

Starting with **v1.5.5**, Longhorn [compresses backing images for downloading](https://github.com/longhorn/backing-image-manager/pull/153). If you attempt to upload a compressed backing image, Harvester rejects the attempt and displays the message **Upload failed: the uploaded file size xxxx should be a multiple of 512 bytes since Longhorn uses directIO by default** because the compressed data violates Longhorn's data alignment.

Before uploading, decompress backing images using the command `$ gzip -d <file name>`.

### Create Images via Volumes

On the **Volumes** page, click **Export Image**. Enter the image name and select a StorageClass to create an image.

![](/img/v1.2/volume/export-volume-to-image-1.png)

### Image StorageClass

When creating an image, select a [StorageClass](../advanced/storageclass.md) on the **Storage** tab. Harvester selects the image backend according to the type of storage.

| Image Backend | StorageClass | Image Storage |
| --- | --- | --- |
| Longhorn backing image | Longhorn V1 Data Engine | Harvester creates an image-specific StorageClass that inherits parameters such as the number of replicas, node selectors, and disk selectors from the selected StorageClass. The image does not use the selected StorageClass directly. |
| CDI | Longhorn V2 Data Engine, LVM, and third-party CSI storage | Harvester creates a golden image PVC directly in the selected StorageClass. |

To create an image in third-party storage:

1. [Install and configure the third-party CSI driver](../advanced/csidriver.md#install-the-csi-driver), and create a StorageClass for the storage solution.
1. Configure the StorageClass [CDI settings](../advanced/storageclass.md#containerized-data-importer-cdi-settings). This step is required when CDI cannot automatically determine the volume mode and access modes for the CSI provisioner.
1. On the **Images** page, select **Create Image**.
1. Select **URL** or **File**, and configure the image source.
1. On the **Storage** tab, select the StorageClass for the third-party storage solution.
1. Select **Create**, and wait for the image to become ready.

Harvester uses CDI to import the image into a golden image PVC in the selected StorageClass. Volumes created from the image use the clone strategy configured in the StorageClass CDI settings.

![](/img/v1.2/image-storageclass.png)

### Image Labels

You can add labels to the image, which will help identify the OS type more accurately. Also, you can add any custom labels for filtering if needed.

If your image name or URL contains any valid information, the UI will automatically recognize the OS type and image category for you. If not, you can also manually specify those corresponding labels on the UI.

![](/img/v1.2/image-labels.png)
