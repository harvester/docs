---
sidebar_position: 6
sidebar_label: 上传镜像
title: "上传镜像"
keywords:
  - Harvester
  - harvester
  - Rancher
  - rancher
  - 导入镜像
Description: 如果需要在 **Images** 页面导入虚拟机镜像，输入集群可以访问的 URL。镜像名称将使用 URL 地址的文件名自动填充。你可以随时在需要时对其进行自定义。
---

目前支持三种方式创建镜像：通过 URL 上传镜像、通过本地文件上传镜像、通过卷创建镜像。

### 通过 URL 上传镜像

如果需要在 **Images** 页面导入虚拟机镜像，输入集群可以访问的 URL。描述和标签是可选的。
:::note

镜像名称将使用 URL 地址的文件名自动填充。你可以随时自定义镜像的名称。


:::

![](/img/v1.2/upload-image.png)

### 通过本地文件上传镜像

目前支持 qcow2、raw 和 ISO 镜像。

:::note

- 在文件上传完成之前，请不要刷新页面，否则会中断退出。

:::

![](/img/v1.2/upload-image-local.png)


### 通过卷创建镜像

在 **Volumes** 页面中，点击 **Export Image**。输入镜像名称并选择一个 StorageClass 以创建镜像。

![](/img/v1.2/volume/export-volume-to-image-1.png)

### 镜像 StorageClass

创建镜像时，你可以选择 [StorageClass](./advanced/storageclass.md) 并使用其预定义的参数，例如副本、节点选择器和磁盘选择器。

:::note

镜像不会直接使用这里选择的 `StorageClass`。这只是一个 `StorageClass` 模板。

相反，它会在底层创建一个特殊的 StorageClass，其前缀名称为 `longhorn-`。这是由 Harvester 后端自动完成的，但它会继承你选择的 StorageClass 的参数。

:::

![](/img/v1.2/image-storageclass.png)

### 镜像标签

你可以为镜像添加标签，以便更准确地识别操作系统类型。此外，你还可以按照需求添加自定义标签进行过滤。

如果你的镜像名称或 URL 包含任何有效信息，UI 将自动为你识别操作系统类型和镜像类别。如果没有，你也可以在 UI 上手动指定对应的标签。

![](/img/v1.2/image-labels.png)