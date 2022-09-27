---
sidebar_position: 6
sidebar_label: 上传镜像
title: ""
keywords:
  - Harvester
  - harvester
  - Rancher
  - rancher
  - 导入镜像
Description: 如果需要在 **Images** 页面导入虚拟机镜像，输入集群可以访问的 URL。镜像名称将使用 URL 地址的文件名自动填充。你可以随时在需要时对其进行自定义。
---

# 上传镜像

目前支持三种方式创建镜像：通过 URL 上传镜像、通过本地文件上传镜像、通过卷创建镜像。

### 通过 URL 上传镜像

如果需要在 **Images** 页面导入虚拟机镜像，输入集群可以访问的 URL。描述和标签是可选的。
:::note

镜像名称将使用 URL 地址的文件名自动填充。你可以随时自定义镜像的名称。


:::

![](/img/v1.0/upload-image.png)

### 通过本地文件上传镜像

目前支持 qcow2、raw 和 ISO 镜像。

:::note

- 在文件上传完成之前，请不要刷新页面，否则会中断退出。

:::

![](/img/v1.0/upload-image-local.png)


### 通过卷创建镜像

在 **Volumes** 页面中，点击 **Export Image**。然后，输入镜像名称来创建镜像。

![](/img/v1.0/export-image.png)

### 镜像标签


你可以为镜像添加标签，以便更准确地识别操作系统类型。此外，你还可以按照需求添加自定义标签。

如果你使用 URL 创建镜像，UI 将根据镜像名称自动识别操作系统类型和镜像类别。但是，如果你通过上传本地文件创建镜像，则需要手动选择对应的标签。

![](/img/v1.0/image-labels.png)