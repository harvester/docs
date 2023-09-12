---
sidebar_position: 1
sidebar_label: 创建卷
title: "创建卷"
keywords:
- 卷
Description: 通过 Volume 页面创建卷。
---

## 创建一个空卷

### 标题部分
1. 设置卷的 `Name`。
1. （可选）设置卷的 `Description`。

### 基本信息选项卡

1. 在 `Source` 中选择 `New`。
1. 选择现有的 `StorageClass`。
1. 配置卷的 `Size`。

![create-empty-volume](/img/v1.1/volume/create-empty-volume.png)

## 创建镜像卷

### 标题部分
1. 设置卷的 `Name`。
1. （可选）设置卷的 `Description`。

### 基本信息选项卡

1. 在 `Source` 中选择 `VM Image`。
1. 选择现有的 `Image`。
1. 配置卷的 `Size`。

![create-image-volume](/img/v1.1/volume/create-image-volume.png)

## 已知问题

### Volumes 页面不显示创建的卷

| 问题 | 受影响的版本 | 状态 | 更新时间 |
|-----------|-----------|-----------|--------------|
| [Volumes 页面不显示创建的卷](https://github.com/harvester/harvester/issues/3874) | Harvester v1.1.2 | 已解决（Harvester > v1.1.2） | 2023-07-28 |

#### 摘要

从 Rancher 中的 Harvester 创建卷后，项目角色为 **Project Member** 的用户无法在 **Volumes** 页面中找到新创建的卷。

#### 解决方法

你可以从 Harvester UI 中暂时将 Harvester 插件版本更改为 [v1.2.1-patch1](https://github.com/harvester/dashboard/releases/tag/v1.1.2-patch1)。

1. 进入 **Advanced** > **Settings** 页面。找到 **ui-plugin-index** 并选择 **⋮** > **Edit Setting**。
1. 将 **Value** 更改为 **https://releases.rancher.com/harvester-ui/plugin/harvester-release-harvester-v1.1.2-patch1/harvester-release-harvester-v1.1.2-patch1.umd.min.js**。
1. 在 **Settings** 页面上，找到 **ui-source** 并选择 **⋮** > **Edit Setting**。
1. 将 **Value** 更改为 **External** 以使用外部 UI 源。
1. 以 Rancher 中的 **Project Member** 用户身份再次登录，查看为 Harvester 集群新创建的卷。
