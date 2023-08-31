---
id: index
sidebar_position: 1
sidebar_label: 集群网络
title: "集群网络"
keywords:
- Harvester
- 网络
- ClusterNetwork
- NetworkConfig
- 网络
---

## 概念

### 集群网络
_从 v1.1.0 起可用_

在 Harvester v1.1.0 中，我们引入了一个称为集群网络的新概念，用于流量隔离。

下图描述了分离数据中心 (DC) 流量与带外 (OOB) 流量的典型网络架构：

![](/img/v1.2/networking/traffic-isolation.png)

我们将 Harvester 上流量隔离转发路径上的设备、链路和配置的总和抽象为集群网络。

在上述案例中，将有两个集群网络对应两个流量隔离的转发路径。

### 网络配置

Harvester 主机（包括网络设备）的规格可能会有所不同。为了兼容这样的异构集群，我们设计了网络配置。

网络配置仅在特定集群网络下有效。每个网络配置均对应一组具有统一网络规格的主机。因此，非统一主机上的集群网络需要多个网络配置。

### 虚拟机网络

虚拟机网络是虚拟机中连接到主机网络的接口。与网络配置一样，除了内置的[管理网络](./harvester-network.md#管理网络)之外，每个网络都必须在某个集群网络下。

Harvester 支持在一个 VM 下添加多个网络。如果某个网络的集群网络未在主机上启用，则该网络所在的 VM 将不会被调度到这些主机。

有关网络的详细信息，请参阅[网络](./harvester-network.md)。

### 集群网络、网络配置、虚拟机网络之间的关系
下图显示了集群网络、网络配置和 VM 网络之间的关系。

![](/img/v1.2/networking/relation.png)

所有`网络配置`和`虚拟机网络`都分组在一个集群网络下。

- 你可以为每个主机分配一个标签，从而根据主机的网络规范对主机进行分类。
- 你可以使用节点选择器（node selector）为每组主机添加网络配置（network-config）。

例如，在上图中，`ClusterNetwork-A` 中的主机分为以下三组：
- 第一组包括 host0，对应 `network-config-A`。
- 第二组包括 host1 和 host2，对应 `network-config-B`。
- 第三组包括剩余的主机（host3、host4 和 host5），它们没有对应的网络配置（network-config），因此不属于 `ClusterNetwork-A`。

集群网络只对网络配置覆盖的主机有效。在特定集群网络下使用 `VM 网络`的 VM 只能调度到集群网络处于活动状态的主机上。

在上图中，我们可以看到：
- `ClusterNetwork-A` 在 host0、host1 和 host2 上处于活动状态。`VM0` 使用 `VM-network-A`，所以可以调度到这些主机中的任意一个。
- `VM1` 同时使用了 `VM-network-B` 和 `VM-network-C`，所以只能被调度到 `ClusterNetwork-A` 和 `ClusterNetwork-B` 都处于活动状态的 host2 上。
- `VM0`、`VM1` 和 `VM2` 无法在两个集群网络都处于非活动状态的 host3 上运行。

总体而言，此图清楚地显示了集群网络、网络配置和 VM 网络之间的关系，以及它们是如何影响主机上的 VM 调度的。

## 集群网络详细信息

### 内置集群网络

Harvester 提供了一个名为 `mgmt` 的内置集群网络。它不同于自定义集群网络。mgmt 集群网络：

- 无法被删除。
- 不需要任何网络配置。
- 在所有主机上启用且无法禁用。
- 与管理网络共享相同的流量出口。

如果不需要分离流量，你可以把所有的网络都放在 mgmt 集群网络下。

### 自定义集群网络

你可以添加自定义集群网络，在主机上通过添加网络配置启用后，自定义集群网络才可以使用。

#### 如何创建新的集群网络

1. 要创建集群网络，请转到 **Networks > ClusterNetworks/Configs** 页面并单击 **Create** 按钮。你只需要指定名称即可。

   ![](/img/v1.2/networking/create-clusternetwork.png)

2. 点击集群网络右侧的 **Create Network Config** 按钮，创建新的网络配置。

   ![](/img/v1.2/networking/create-network-config-button.png)

3. 在 **Node Selector** 选项卡中，指定名称并选择三种方法之一来选择要应用网络配置的节点。如果要覆盖未选中的节点，你可以创建另一个网络配置。

   ![](/img/v1.2/networking/select-nodes.png)

4. 单击 **Uplink** 选项卡来添加 NIC，并配置绑定选项和链接属性。绑定模式默认为 `active-backup`。

   ![](/img/v1.2/networking/config-uplink.png)

:::note

- NICs 下拉列表显示了所有选定节点上的共有 NIC。当你选择不同的节点时，下拉列表将发生变化。
- NICs 下拉列表中的文本 `enp7s3 (1/3 Down)` 表示 enp7s3 NIC 在其中一个选定节点中状态为 Down。在这种情况下，你需要找到 NIC，将其状态设置为 Up，然后刷新此页面，它将变成可选。

:::

:::note

从 Harvester v1.1.2 开始，Harvester 支持更新网络配置。在更新网络配置之前，请停止所有受影响的虚拟机。

:::
