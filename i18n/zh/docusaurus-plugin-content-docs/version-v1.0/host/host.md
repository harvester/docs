---
sidebar_position: 1
sidebar_label: 主机管理
title: ""
---

# 主机管理

用户可以从主机页面查看和管理 Harvester 节点。第一个节点默认为集群的管理节点。当节点数量大于等于三个时，先加入的另外两个节点会自动升级为管理节点，从而形成一个高可用 (HA) 集群。

:::note

由于 Harvester 建立在 Kubernetes 之上并使用 etcd 作为数据库，因此当管理节点的数量是 3 时，最大节点容错为 1。

:::

![host.png](/img/v1.0/host/host.png)

## 节点维护

Admin 用户可以点击 **Enable Maintenance Mode** 来自动驱逐节点中所有的虚拟机。这将使用`虚拟机热迁移`功能，来将所有虚拟机自动迁移到其他节点。要使用这个功能，至少需要有两个 `active` 的节点。

![node-maintenance.png](/img/v1.0/host/node-maintenance.png)

## 封锁节点 (Cordon)

封锁节点会将节点标记为不可调度。此功能适用于在短期维护（如重启，升级或停用）时在节点上执行短期任务。完成后，重新打开电源并通过取消封锁使节点再次可调度。

![cordon-node.png](/img/v1.0/host/cordon-nodes.png)

## 删除节点

删除节点有两个步骤：

1. 从 Harvester 删除节点
   - 前往 **Hosts** 页面
   - 找到需要修改的节点，点击 **⋮ > Delete**。

2. 在节点中卸载 RKE2
   - 作为 `root` 用户登录到节点。
   - 运行 `rke2-uninstall.sh` 删除整个 RKE2 服务。

:::caution

删除 RKE2 服务后，你将丢失 control plane 节点的所有数据。

:::

:::note

节点硬删除存在一个[已知问题](https://github.com/harvester/harvester/issues/1497)。
该问题解决后，可以跳过 RKE2 节点卸载的步骤。

:::

![delete.png](/img/v1.0/host/delete.png)

## 多磁盘管理 - `预览版本`

用户可以从主机详情页面查看和添加多个磁盘作为附加数据卷。

1. 前往 **Hosts** 页面。
2. 找到需要修改的节点，点击 **⋮ > Edit Config**。
2. 选择 **Disks** 选项卡并点击 **Add Disks**。
3. 选择额外的原始块设备，将其添加为额外的数据卷。
   - 如果块设备从未被强制格式化，则需要 `Force Formatted` 选项。

:::note

要让 Harvester 识别磁盘，每个磁盘都需要有一个唯一的 [WWN](https://en.wikipedia.org/wiki/World_Wide_Name)。否则，Harvester 将拒绝添加磁盘。
如果你的磁盘没有 WWN，你可以使用 `EXT4` 文件系统对其进行格式化，以帮助 Harvester 识别磁盘。

:::

:::note

如果你在 QEMU 环境中测试 Harvester，你需要使用 QEMU v6.0 或更高版本。以前版本的 QEMU 将始终为 NVMe 磁盘模拟生成相同的 WWN，这将导致 Harvester 不添加其他磁盘。

:::

![Edit Config](/img/v1.0/host/edit-config.png)
![Add Disks](/img/v1.0/host/add-disks.png)
