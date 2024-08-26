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

<Tabs>
<TabItem value="ui" label="UI" default>

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

</TabItem>
<TabItem value="api" label="API">

```yaml
apiVersion: v1
kind: PersistentVolumeClaim
metadata:
  annotations:
    volume.beta.kubernetes.io/storage-provisioner: driver.longhorn.io
    volume.kubernetes.io/storage-provisioner: driver.longhorn.io
  name: my-vol
  namespace: default
spec:
  accessModes:
    - ReadWriteMany
  resources:
    requests:
      storage: 10Gi
  volumeMode: Block
  volumeName: pvc-my-vol
```

</TabItem>
<TabItem value="terraform" label="Terraform">

To create an empty volume on Harvester with Terraform using the [Harvester Terraform Provider](https://registry.terraform.io/providers/harvester/harvester/latest), define a `harvester_volume` resource block:

```hcl
resource "harvester_volume" "empty-volume" {
  name      = "empty-volume"
  namespace = "default"

  size = "10Gi"
}
```

</TabItem>
</Tabs>

## Create an Image Volume

<Tabs>
<TabItem value="ui" label="UI">

### Header Section
1. Set the Volume `Name`.
1. (Optional) Provide a `Description` for the Volume.

### Basics Tab

1. Choose `VM Image` in `Source`.
1. Select an existing `Image`.
1. Configure the `Size` of the volume.

![create-image-volume](/img/v1.2/volume/create-image-volume.png)

</TabItem>
<TabItem value="api" label="API">

Create a volume, initialized with the contents of the image `image-8rb2z` from the namespace `default`:

```yaml
apiVersion: v1
kind: PersistentVolumeClaim
metadata:
  annotations:
    harvesterhci.io/imageId: default/image-8rb2z
    volume.beta.kubernetes.io/storage-provisioner: driver.longhorn.io
    volume.kubernetes.io/storage-provisioner: driver.longhorn.io
  name: foobar
  namespace: default
spec:
  accessModes:
    - ReadWriteMany
  resources:
    requests:
      storage: 5Gi
  storageClassName: longhorn-image-8rb2z
  volumeMode: Block
  volumeName: pvc-foobar
```

</TabItem>
<TabItem value="terraform" label="Terraform">

To create a volume on Harvester using Terraform and initialize it with the contents of an
image, define a `harvester_volume` resource block and set the `image` property:

```hcl
resource "harvester_volume" "opensuse154-image-disk" {
  name      = "opensuse154-image-disk"
  namespace = "default"

  size  = "10Gi"
  image = harvester_image.opensuse154.id
}
```

</TabItem>
</Tabs>
