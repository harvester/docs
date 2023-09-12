---
sidebar_position: 2
sidebar_label: StorageClass
title: "StorageClass"
---

StorageClass 允许管理员描述存储的**类**。不同的 Longhorn StorageClass 可能会映射到集群管理员配置的不同的副本策略、不同的节点调度策略或不同的磁盘调度策略。这个概念在其他存储系统中也称为 **profiles**。

:::note

如需其他存储的支持，请参阅[第三方存储支持](../advanced/csidriver.md)。

:::

## 创建 StorageClass
你可以从 **Advanced > StorageClasses** 页面创建一个或多个 StorageClass。

![](/img/v1.2/storageclass/create_storageclasses_entry.png)

:::note

创建 StorageClass 后，你将无法更改 `Description` 之外的任何内容。

:::

### 标题部分
1. **Name**：StorageClass 的名称
1. **Description**（可选）：StorageClass 的描述

![](/img/v1.2/storageclass/create_storageclasses_header_sections.png)

### 参数选项卡

#### 副本数量

在 Longhorn 中为每个卷创建的副本数。默认为 `3`。

![](/img/v1.2/storageclass/create_storageclasses_replicas.png)

#### 过时副本超时

副本状态变为 ERROR 之后，Longhorn 多久后会清除错误副本，单位是分钟。在 Harvester 中默认为 `30` 分钟。

![](/img/v1.2/storageclass/create_storageclasses_stale_timeout.png)

#### 节点选择器（可选）

在卷调度阶段选择要匹配的节点标签。你可以通过转到 **Host > Edit Config** 添加节点标签。

![](/img/v1.2/storageclass/create_storageclasses_node_selector.png)

#### 磁盘选择器（可选）

在卷调度阶段选择要匹配的磁盘标签。你可以通过转到 **Host > Edit Config** 添加磁盘标签。

![](/img/v1.2/storageclass/create_storageclasses_disk_selector.png)

#### 可迁移

是否支持[热迁移](../vm/live-migration.md)。默认为 `Yes`。

![](/img/v1.2/storageclass/create_storageclasses_migratable.png)

### 自定义选项卡

#### 回收策略

StorageClass 动态创建的卷将具有在类的 `reclaimPolicy` 字段中指定的回收策略。默认使用 `Delete` 模式。

1. `Delete`：删除卷声明时，同时删除卷和底层设备。
2. `Retain`：保留卷以进行手动清理。

![](/img/v1.2/storageclass/customize_tab_reclaim_policy.png)

#### 允许拓展卷

你可以将卷配置为可扩展。该功能默认为 `Enabled`，即允许用户通过编辑对应的 PVC 对象来调整卷的大小。

![](/img/v1.2/storageclass/customize_tab_allow_vol_expansion.png)

:::note

你只能使用卷扩展功能来对卷进行扩容，而不能进行缩容。

:::

#### 卷绑定模式

`volumeBindingMode` 字段控制何时应该进行卷绑定和动态配置。默认使用 `Immediate` 模式。

1. `Immediate`：创建 PersistentVolumeClaim 后绑定和配置一个持久卷。
2. `WaitForFirstConsumer`：创建使用 PersistentVolumeClaim 的 VM 后绑定和配置持久卷。

![](/img/v1.2/storageclass/customize_tab_vol_binding_mode.png)

## 附录 - 用例

### HDD 场景

引入 *StorageClass* 后，用户现在可以使用 **HDD** 进行分层或归档冷存储。

:::caution

不建议将 HDD 用于对磁盘性能要求高的 RKE2 集群或 VM。

:::

#### 推荐做法

首先，在 `Host` 页面添加你的 HDD，然后根据需要添加磁盘标签，例如 `HDD` 或 `ColdStorage`。有关如何添加其他磁盘和磁盘标签的更多信息，请参阅[多磁盘管理](../host/host.md#多磁盘管理)。

![](/img/v1.2/storageclass/add_hdd_on_host_page.png)

![](/img/v1.2/storageclass/add_tags.png)

然后，为 HDD 创建一个新的 `StorageClass`（使用上面的磁盘标签）。对于容量大但性能慢的硬盘，你可以减少副本数量来提高性能。

![](/img/v1.2/storageclass/create_hdd_storageclass.png)

你现在可以使用上面的 `StorageClass` 和 HDD 创建一个卷，用于冷存储或归档。

![](/img/v1.2/storageclass/create_volume_hdd.png)