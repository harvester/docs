---
sidebar_position: 5
sidebar_label: 卷快照
title: "卷快照"
keywords:
- 卷快照
- 卷快照
Description: 通过 Volume 页面获取卷快照。
---

卷快照指的是存储系统上卷的快照。创建卷后，你可以创建卷快照并将卷还原到快照状态。有了卷快照，你可以轻松复制或还原卷的配置。

## 创建卷快照

你可以按照以下步骤为现有卷创建卷快照：

1. 转到 **Volumes** 页面。

1. 选择要为其创建快照的卷，然后选择 **⋮ > Take Snapshot**。

   ![create-volume-snapshot-1](/img/v1.1/volume/create-volume-snapshot-1.png)

1. 输入快照的 **Name**。

   ![create-volume-snapshot-2](/img/v1.1/volume/create-volume-snapshot-2.png)

1. 选择 **Create** 以完成卷快照的创建。

1. 转至 **Volumes** 页面并选择 **Snapshots** 选项卡，从而检查此操作的状态并查看所有卷快照。**Ready To Use** 变为 **√** 时，卷快照即可使用。

:::note

目前不支持定期快照，你可以通过 [harvester/harvester#572](https://github.com/harvester/harvester/issues/572) 跟踪该功能。

:::

## 使用卷快照来还原新卷

你可以按照以下步骤使用现有卷快照来还原新卷：

1. 进入 **Backup & Snapshot > Volume Snapshots** 页面或从 **Volumes** 页面选择**卷**并进入 **Snapshots** 选项卡。

1. 选择 **⋮ > Restore**。

   ![restore-volume-snapshot-1](/img/v1.1/volume/restore-volume-snapshot-1.png)

   ![restore-volume-snapshot-2](/img/v1.1/volume/restore-volume-snapshot-2.png)

1. 指定新卷的 **Name**。

   ![restore-volume-snapshot-3](/img/v1.1/volume/restore-volume-snapshot-3.png)

1. 如果源卷不是镜像卷，你可以选择不同的 **StorageClass**。如果源卷是镜像卷，则无法更改 **StorageClass**。

   ![restore-volume-snapshot-4](/img/v1.1/volume/restore-volume-snapshot-4.png)

1. 选择 **Create** 以完成新卷的还原。
