---
sidebar_position: 5
sidebar_label: 卷快照
title: "卷快照"
keywords:
- 卷快照
- 卷快照
Description: 通过 Volume 页面获取卷快照。
---

## 创建卷快照

:::note

目前不支持定期快照，你可以通过 [harvester/harvester#572](https://github.com/harvester/harvester/issues/572) 跟踪该功能。

:::

创建卷后，你可以按照以下步骤创建卷快照：

1. 单击 `⋮` 按钮并选择 `Take Snapshot` 选项。

   ![create-volume-snapshot-1](/img/v1.2/volume/create-volume-snapshot-1.png)

1. 配置新镜像的 `Name`，然后单击 `Create`。

   ![create-volume-snapshot-2](/img/v1.2/volume/create-volume-snapshot-2.png)

## 使用卷快照来还原新卷

创建卷快照后，你可以按照以下步骤使用卷快照来还原新卷：

1. 转到 `Backup & Snapshot > Volume Snapshots` 页面，或每个 `Volumes` 详细信息页面中的 `Snapshots` 选项卡。

   ![restore-volume-snapshot-1](/img/v1.2/volume/restore-volume-snapshot-1.png)

1. 单击 `⋮` 按钮并选择 `Restore` 选项。

   ![restore-volume-snapshot-2](/img/v1.2/volume/restore-volume-snapshot-2.png)

1. 指定新卷的 `Name`。
   ![restore-volume-snapshot-3](/img/v1.2/volume/restore-volume-snapshot-3.png)

1. 如果源卷不是镜像卷，你也可以选择不同的 `StorageClass`。

   ![restore-volume-snapshot-4](/img/v1.2/volume/restore-volume-snapshot-4.png)

1. 单击 `Create`。
