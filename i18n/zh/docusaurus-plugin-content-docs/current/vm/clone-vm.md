---
sidebar_position: 9
sidebar_label: 克隆虚拟机
title: "克隆虚拟机"
keywords:
  - Harvester
  - harvester
  - Rancher
  - rancher
  - 克隆虚拟机
Description: 在克隆 VM 时，你可以选择是否同时克隆 VM 数据。此功能不需要你先获取 VM 快照或设置备份目标。
---

_从 v1.1.0 起可用_

在克隆 VM 时，你可以选择是否同时克隆 VM 数据。此功能不需要你先获取 VM 快照或设置备份目标。

## 同时克隆 VM 卷数据

1. 在 `Virtual Machines` 页面上，单击 VM 操作的 `Clone`。
1. 设置新的 VM 名称，然后单击 `Create` 以创建新的 VM。
   ![clone-vm-with-data.png](/img/v1.2/vm/clone-vm-with-data.png)

## 不克隆 VM 卷数据

克隆不带卷数据的 VM 会创建一个与源 VM 具有相同配置的新 VM。

1. 在 `Virtual Machines` 页面上，单击 VM 操作的 `Clone`。
1. 取消选中 `clone volume data` 复选框。
1. 设置新的 VM 名称，然后单击 `Create` 以创建新的 VM。
   ![clone-vm-without-data.png](/img/v1.2/vm/clone-vm-without-data.png)
