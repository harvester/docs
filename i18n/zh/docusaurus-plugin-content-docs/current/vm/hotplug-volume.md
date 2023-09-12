---
sidebar_position: 7
sidebar_label: 热插拔卷
title: "热插拔卷"
keywords:
  - Harvester
  - 热插拔
  - 卷
Description: 向运行中的虚拟机添加热插拔卷
---

Harvester 支持向运行中的虚拟机添加热插拔卷。

:::info

目前，KubeVirt 对热插拔卷仅支持磁盘总线 `scsi`。有关详细信息，请参阅此 [issue](https://github.com/kubevirt/kubevirt/issues/5080#issuecomment-785183128)。

:::

## 向运行中的虚拟机添加热插拔卷

以下步骤假设你有一个正在运行的虚拟机和一个就绪卷：

1. 前往 **Virtual Machines** 页面。
1. 找到需要添加卷的虚拟机，然后点击 **⋮ > Add Volume**。

   ![Add Volume Button](/img/v1.2/vm/add-volume-button.png)

1. 输入 **Name**，然后选择 **Volume**。
1. 点击 **Apply**。

   ![Add Volume Panel](/img/v1.2/vm/add-volume-panel.png)
