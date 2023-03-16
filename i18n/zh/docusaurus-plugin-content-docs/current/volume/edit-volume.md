---
sidebar_position: 2
sidebar_label: 编辑卷
title: "编辑卷"
keywords:
- 卷
Description: 通过 Volume 页面编辑卷。
---

创建卷后，你可以通过单击 `⋮` 按钮并选择 `Edit Config` 选项来编辑卷。

## 扩容卷

你可以通过直接增加 `Size` 参数的值来扩容卷。
为了防止扩容受到意外数据 R/W 的干扰，Harvester 仅支持`离线`扩容。如果卷已连接到虚拟机，你必须先关闭虚拟机或分离卷，分离的卷将自动附加到具有[维护模式](https://longhorn.io/docs/1.3.2/concepts/#22-reverting-volumes-in-maintenance-mode)的随机节点以进行自动扩容。

![expand-volume](/img/v1.2/volume/expand-volume.png)

## 取消失败的卷扩容

如果你在扩容过程中指定的值大于 Longhorn 卷的大小，卷扩容会卡在 `Resizing` 状态。你可以通过单击 `⋮` 按钮并选择 `Cancel Expand` 选项来取消失败的卷扩容。

![cancel-failed-volume-expansion](/img/v1.2/volume/cancel-failed-volume-expansion.png)

## 更改现有卷的 StorageClass

现有卷的 StorageClass 无法更改。但是，你可以按照以下步骤在使用快照恢复新卷时更改 StorageClass：

1. [创建卷快照](./volume-snapshots.md#创建卷快照)。
2. [使用快照来恢复卷](./volume-snapshots.md#使用卷快照来还原新卷)时选择 StorageClass。