---
sidebar_position: 3
sidebar_label: 第三方存储支持
title: "第三方存储支持"
---

_从 v1.2.0 起可用_

Harvester 现在支持在 Harvester 集群中安装[容器存储接口 (CSI)](https://kubernetes-csi.github.io/docs/introduction.html)。你可以将外部存储用于虚拟机的非系统数据磁盘，从而使用为特定需求（性能优化或无缝集成现有的内部存储解决方案等）定制的驱动程序。

:::note

Harvester 中的虚拟机 (VM) 镜像配置程序仍然依赖于 Longhorn。在 v1.2.0 版本之前，Harvester 只支持使用 Longhorn 来存储 VM 数据，不支持将外部存储作为 VM 数据的目标。

:::

## 前提

为了使 Harvester 功能正常工作，第三方 CSI Driver 需要具备以下功能：
- 支持扩展
- 支持快照
- 支持克隆
- 支持块设备
- 支持 Read-Write-Many (RWX)，用于 [实时迁移](../vm/live-migration.md)

## 创建 Harvester 集群

Harvester 的操作系统遵循不可变设计，换言之，大多数操作系统文件在重启后会还原到预先配置的状态。因此，要使用第三方 CSI Driver，你需要在安装 Harvester 集群之前执行其他配置。

某些 CSI Driver 需要主机上有额外的持久路径。你可以将这些路径添加到 [`os.persistent_state_paths`](../install/harvester-configuration.md#ospersistent_state_paths)。

某些 CSI Driver 需要主机上有额外的软件包。你可以使用 [`os.after_install_chroot_commands`](../install/harvester-configuration.md#osafter_install_chroot_commands) 安装这些软件包。

:::note

升级 Harvester 会导致 `after-install-chroot` 对操作系统所做的更改丢失。你还必须配置 `after-upgrade-chroot` 以使你的更改在升级过程中保留。升级 Harvester 之前，请参阅[运行时持久性更改](https://rancher.github.io/elemental-toolkit/docs/customizing/runtime_persistent_changes/)。

:::

## 安装 CSI Driver

Harvester 集群安装完成后，请参考[如何访问 Harvester 集群的 kubeconfig 文件](../faq.md#如何访问-harvester-集群的-kubeconfig-文件)获取集群的 kubeconfig。

通过 Harvester 集群的 kubeconfig，你可以按照每个 CSI Driver 的安装说明将第三方 CSI Driver 安装到集群中。你还必须参考 CSI Driver 文档在 Harvester 集群中创建 `StorageClass` 和 `VolumeSnapshotClass`。

## 配置 Harvester 集群

在使用 Harvester 的 **Backup & Snapshot** 功能之前，你需要通过 Harvester [csi-driver-config](../advanced/settings.md#csi-driver-config) 来进行一些基本配置。请按照以下步骤进行配置：

1. 登录 Harvester UI，然后导航至 **Advanced** > **Settings**。
1. 找到并选择 **csi-driver-config**，然后选择 **⋮** > **Edit Setting** 以访问配置选项。
1. 将 **Provisioner** 设置为第三方 CSI Driver。
1. 接下来，配置 **Volume Snapshot Class Name**。此设置指向用于创建卷快照或 VM 快照的 `VolumeSnapshotClass` 的名称。
1. 同样，配置 **Backup Volume Snapshot Class Name**。这对应于负责创建 VM 备份的 `VolumeSnapshotClass` 的名称。

![csi-driver-config-external](/img/v1.2/advanced/csi-driver-config-external.png)

## 使用 CSI Driver

成功配置后，你可以使用第三方 StorageClass。你可以在创建空卷或向虚拟机添加新块卷时应用第三方 StorageClass，从而增强 Harvester 集群的存储能力。

完成配置后，你的 Harvester 集群就可以充分利用第三方存储集成了。

![rook-ceph-volume-external](/img/v1.2/advanced/rook-ceph-volume-external.png)

![rook-ceph-vm-external](/img/v1.2/advanced/rook-ceph-vm-external.png)

## 参考

- [在 Harvester 中使用 Rook Ceph 存储](https://harvesterhci.io/kb/using_rook_ceph_storage)