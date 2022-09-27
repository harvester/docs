---
sidebar_position: 6
sidebar_label: 热迁移
title: ""
keywords:
  - Harvester
  - harvester
  - Rancher
  - rancher
  - 热迁移
Description: 热迁移（也称为实时迁移，动态迁移）指的是在不停机的情况下将虚拟机移动到不同的主机。
---

# 热迁移

热迁移（也称为实时迁移，动态迁移）指的是在不停机的情况下将虚拟机移动到不同的主机。

:::note

- 当虚拟机使用桥接口类型的管理网络时，不允许进行热迁移。
- 要使用热迁移，由于[已知问题](https://github.com/harvester/harvester/issues/798)，需要 Harvester 集群中的 3 台或以上的主机。

:::

## 开始迁移

1. 前往 **Virtual Machines** 页面。
1. 找到要迁移的虚拟机，然后选择 **⋮ > Migrate**。
1. 选择虚拟机迁移的目标节点。点击 **Apply**。

![](/img/v1.0/vm/migrate-action.png)

![](/img/v1.0/vm/migrate.png)

## 中止迁移

1. 前往 **Virtual Machines** 页面。
1. 找到要中止的处于迁移状态的虚拟机。选择 **⋮ > Abort Migration**。

## 迁移超时

### 完成超时

热迁移过程会将虚拟机内存页和磁盘块复制到目标。在某些情况下，虚拟机写入不同的内存页或磁盘块的速度，会高于复制的速度。这将导致迁移不能在合理的时间内完成。

如果超过完成超时的时间（每 GiB 数据 800 秒），热迁移将被中止。例如，一个拥有 8 GiB 内存的虚拟机将在 6400 秒后超时。

### 进程超时

当复制内存在 150 秒内没有任何进展时，热迁移也将中止。
