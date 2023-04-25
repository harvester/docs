---
id: host-management
sidebar_position: 1
sidebar_label: 主机管理
title: "主机管理"
---

用户可以从主机页面查看和管理 Harvester 节点。第一个节点默认为集群的管理节点。当节点数量大于等于三个时，先加入的另外两个节点会自动升级为管理节点，从而形成一个高可用 (HA) 集群。

:::note

由于 Harvester 建立在 Kubernetes 之上并使用 etcd 作为数据库，因此当管理节点的数量是 3 时，最大节点容错为 1。

:::

![host.png](/img/v1.2/host/host.png)

## 节点维护

Admin 用户可以点击 **Enable Maintenance Mode** 来自动驱逐节点中所有的虚拟机。这将使用`虚拟机热迁移`功能，来将所有虚拟机自动迁移到其他节点。要使用这个功能，至少需要有两个 `active` 的节点。

![node-maintenance.png](/img/v1.2/host/node-maintenance.png)

## 封锁节点 (Cordon)

封锁节点会将节点标记为不可调度。此功能适用于在短期维护（如重启，升级或停用）时在节点上执行短期任务。完成后，重新打开电源并通过取消封锁使节点再次可调度。

![cordon-node.png](/img/v1.2/host/cordon-nodes.png)

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

![delete.png](/img/v1.2/host/delete-node.png)

## 多磁盘管理

### 添加其他磁盘

用户可以从主机编辑页面查看和添加多个磁盘作为附加数据卷。

1. 前往 **Hosts** 页面。
2. 找到需要修改的节点，点击 **⋮ > Edit Config**。

![Edit Config](/img/v1.2/host/edit-config.png)

3. 选择 **Storage** 选项卡并单击 **Add Disk**。

![Add Disks](/img/v1.2/host/add-disks.png)

:::caution

从 Harvester v1.0.2 开始，我们不再支持将分区添加为附加磁盘。如果你想将其添加为附加磁盘，请先删除所有分区（例如，使用 `fdisk`）。

:::

4. 选择额外的原始块设备，将其添加为额外的数据卷。
   - 如果块设备从未被强制格式化，则需要 `Force Formatted` 选项。

![Force Format](/img/v1.2/host/force-format-disks.png)

5. 最后，你可以再次点击 **⋮ > Edit Config** 查看新添加的磁盘。同时，你还可以添加 “Host/Disk” 标签（详见[下一节](#存储标签)）。

![Check Result](/img/v1.2/host/check-added-disks.png)

:::note

要让 Harvester 识别磁盘，每个磁盘都需要有一个唯一的 [WWN](https://en.wikipedia.org/wiki/World_Wide_Name)。否则，Harvester 将拒绝添加磁盘。
如果你的磁盘没有 WWN，你可以使用 `EXT4` 文件系统对其进行格式化，以帮助 Harvester 识别磁盘。

:::

:::note

如果你在 QEMU 环境中测试 Harvester，你需要使用 QEMU v6.0 或更高版本。以前版本的 QEMU 将始终为 NVMe 磁盘模拟生成相同的 WWN，这将导致 Harvester 不添加其他磁盘。

:::

### 存储标签

存储标签功能用于仅允许使用某些节点或磁盘来存储 Longhorn 卷数据。例如，对性能有要求的数据只能使用标记为 `fast`、`ssd` 或 `nvme` 的高性能磁盘，或者只使用标记为 `baremetal` 的高性能节点。

此功能同时支持磁盘和节点。

#### 设置

你可以通过 Harvester UI 上的主机页面设置标签：

1. 点击 `Hosts` > `Edit Config` > `Storage`。
1. 单击 `Add Host/Disk Tags` 开始输入标签，然后按回车键来添加新标签。
1. 点击 `Save` 来更新标签。
1. 在 [StorageClasses](../advanced/storageclass.md) 页面上，创建一个新的存储类并在 `Node Selector` 和 `Disk Selector` 字段中选择已定义的标签。

节点或磁盘上的所有现有调度卷都不会受到新标签的影响。

:::note

为同一个卷指定多个标签时，磁盘和节点（磁盘所在的节点）必须具有所有指定的标签才能使用。

:::

### 移除磁盘

移除磁盘前必须先清除磁盘上的 Longhorn 副本。

:::note

副本数据会自动重建到另一个磁盘来保持高可用性。

:::

#### 确定要移除的磁盘（Harvester 仪表板）
1. 前往 **Hosts** 页面。
2. 在包含磁盘的节点上，选择节点名称并转到 **Storage** 选项卡。
3. 找到要移除的磁盘。假设要移除的是 `/dev/sdb`，磁盘的挂载点是 `/var/lib/harvester/extra-disks/1b805b97eb5aa724e6be30cbdb373d04`。

![Find disk to remove](/img/v1.2/host/remove-disks-harvester-find-disk.png)

#### 驱逐副本（Longhorn 仪表板）
1. 按照[此文档](../troubleshooting/harvester.md#访问嵌入式-rancher-和-longhorn-仪表板)启用嵌入式 Longhorn 仪表板。
2. 访问 Longhorn 仪表板并转到 **Node** 页面。
3. 展开包含磁盘的节点。确认挂载点 `/var/lib/harvester/extra-disks/1b805b97eb5aa724e6be30cbdb373d04` 在磁盘列表中。

![Check the removing disk](/img/v1.2/host/remove-disks-longhorn-nodes.png)

4. 选择 **Edit node and disks**。

![Edit node and disks](/img/v1.2/host/remove-disks-longhorn-nodes-edit.png)

5. 滚动到要移除的磁盘。
- 将 `Scheduling` 设置为 `Disable`。
- 将 `Eviction Requested` 设置为 `True`。
- 选择 **Save**。不要选择删除图标。

![Evict disk](/img/v1.2/host/remove-disks-longhorn-nodes-evict-disk.png)

6. 磁盘将被禁用。等待磁盘副本数变为 `0` 后再继续移除磁盘。

![Wait replicas](/img/v1.2/host/remove-disks-longhorn-wait-replicas.png)

#### 移除磁盘（Harvester 仪表板）
1. 前往 **Hosts** 页面。
2. 在包含磁盘的节点上，选择 **⋮ > Edit Config**。
3. 转到 **Storage** 选项卡并选择 **x** 来移除磁盘。

![Remove disk](/img/v1.2/host/remove-disks-harvester-remove.png)

4. 选择 **Save** 以移除磁盘。


## Ksmtuned 模式

_从 v1.1.0 起可用_

Ksmtuned 是一个部署为 DaemonSet 的 KSM 自动化工具，用于在每个节点上运行 Ksmtuned。它将通过观察可用内存百分比（**即 Threshold Coefficient，阈值系数**）来启动或停止 KSM。默认情况下，你需要在每个节点 UI 上手动启用 Ksmtuned。1-2 分钟后，你将能够从节点 UI 中看到 KSM 统计信息。有关更多信息，请参阅 [KSM](https://www.kernel.org/doc/html/latest/admin-guide/mm/ksm.html#ksm-daemon-sysfs-interface)。

### 快速运行

1. 前往 **Hosts** 页面。
2. 找到需要修改的节点，点击 **⋮ > Edit Config**。
3. 选择 **Ksmtuned** 选项卡，并在 **Run Strategy** 中选择 **Run**。
4. （可选）你可以根据需要修改**阈值系数**。

![编辑 Ksmtuned](/img/v1.2/host/edit-ksmtuned.png)

5. 点击 **Save** 进行更新。
6. 等待大约 1-2 分钟，然后你可以单击**你的节点 > Ksmtuned** 选项卡来检查**统计数据**。

![查看 Ksmtuned 统计数据](/img/v1.2/host/view-ksmtuned-statistics.png)

### 参数

**运行策略**：

- **Stop**：停止 Ksmtuned 和 KSM。VM 仍然可以使用共享内存页面。
- **Run**：运行 Ksmtuned。
- **Prune**：停止 Ksmtuned 并修剪 KSM 内存页面。

**Threshold Coefficient**：配置可用内存百分比。如果可用内存小于阈值，则启动 KSM；否则，将停止 KSM。

**Merge Across Nodes**：是否可以合并来自不同 NUMA 节点的页面。

**模式**：

- **Standard**：默认模式。控制节点 ksmd 大约使用单个 CPU 的 20%。使用的参数如下：

```yaml
Boost: 0
Decay: 0
Maximum Pages: 100
Minimum Pages: 100
Sleep Time: 20
```

- **High-performance**：节点 ksmd 使用单个 CPU 的 20% 到 100%，具有更高的扫描和合并效率。使用的参数如下：

```yaml
Boost: 200
Decay: 50
Maximum Pages: 10000
Minimum Pages: 100
Sleep Time: 20
```

- **Customized**：你可以自定义配置以达到你想要的性能。

Ksmtuned 使用以下参数来控制 KSM 效率：


| 参数 | 描述 |
|:----------------|:------------------------------------------------------------------------------------------------------------------------------------------|
| Boost | 如果可用内存小于**阈值系数**，则每次扫描的页数都会增加。 |
| Decay | 如果可用内存大于**阈值系数**，则每次扫描的页数都会减少。 |
| Maximum Pages | 每次扫描的最大页数。 |
| Minimum Pages | 每次扫描的最小页数，也是第一次运行的配置。 |
| Sleep Time (ms) | 两次扫描之间的间隔，通过公式（**Sleep Time** \* 16 \* 1024\* 1024 / Total Memory）计算得出。最小值：10 毫秒。 |

**例如，假设你有一个使用以下参数的 512GiB 内存节点**：

```yaml
Boost: 300
Decay: 100
Maximum Pages: 5000
Minimum Pages: 1000
Sleep Time: 50
```

Ksmtuned 启动时，将 KSM 中的 `pages_to_scan` 初始化为 1000（**Minimum Pages**）并将 `sleep_millisecs` 设置为 10 (50 \* 16 \* 1024 \* 1024 / 536870912 KiB < 10)。

可用内存低于**阈值系数**时，KSM 将启动。如果检测到它正在运行，`pages_to_scan` 每分钟增加 300（**Boost**）直到达到 5000（**Maximum Pages**）。

可用内存高于**阈值系数**时，KSM 将停止。如果检测到它已停止，`pages_to_scan` 每分钟递减 100（**Decay**）直到达到 1000（**Minimum Pages**）。
