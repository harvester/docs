---
sidebar_position: 1
sidebar_label: Harvester 主机驱动
title: "Harvester 主机驱动"
keywords:
  - Harvester
  - harvester
  - Rancher
  - rancher
  - Harvester 主机驱动
Description: Harvester 主机驱动（Node Driver）用于在 Harvester 集群中配置虚拟机。在本节中，你将学习如何配置 Rancher 以使用 Harvester 主机驱动来启动和管理 Kubernetes 集群。
---

[Harvester 主机驱动](https://github.com/harvester/docker-machine-driver-harvester)与 Docker Machine driver 类似，用于在 Harvester 集群中创建并配置虚拟机，而 Rancher 会使用主机驱动来启动和管理 Kubernetes 集群。

在主机驱动托管的节点池上安装 Kubernetes 的一个好处是，如果一个节点与集群断开连接，Rancher 可以自动创建另一个节点并将其加入集群，从而确保节点池的数量符合要求。
此外，Harvester 主机驱动默认与 Harvester Cloud Provider 集成，提供[内置负载均衡器](../cloud-provider.md#负载均衡器支持)以及从裸机集群到 Kubernetes 集群的[存储直通](../csi-driver.md)支持，从而获得原生存储性能。

在本节中，你将学习如何配置 Rancher 以使用 Harvester 主机驱动来启动和管理 Kubernetes 集群。

:::note

Harvester 主机驱动仅支持云服务镜像（Cloud Image）。这是因为 .ISO 镜像通常需要额外的设置，这会影响干净的部署（即无需用户干预），并且它们通常不用于云环境。

:::

## Harvester 主机驱动

从 Rancher `v2.6.3`开始，Harvester 主机驱动默认启用。你可以前往 **Cluster Management** > **Drivers** > **Node Drivers** 页面检查 Harvester 主机驱动的状态。

![edit-node-driver](/img/v1.2/rancher/edit-node-driver.png)

启用 Harvester 主机驱动后，你可以在 Harvester 集群之上创建 Kubernetes 集群并从 Rancher 管理它们。

![harvester-node-driver](/img/v1.2/rancher/harvester-node-driver.png)

:::note

- 请参阅 [Rancher 下游集群支持矩阵](https://www.suse.com/suse-rancher/support-matrix/all-supported-versions/rancher-v2-7-5)了解其支持的 RKE2 和 Guest 操作系统版本。
- 对主机驱动配置所做的更改不会保留。重启 Rancher 容器后，应用的任何修改都将被重置。
- Harvester 主机驱动 v0.6.3 开始已从后端删除 `qemu-guest-agent` 自动注入。如果你使用的镜像不包含 `qemu-guest-agent` 软件包，你仍然可以通过 `userdata` 配置安装进行安装。否则，集群将无法成功配置。

   ```yaml
   #cloud-config
   package_update: true
   packages:
   - qemu-guest-agent
   runcmd:
   - - systemctl
     - enable
     - '--now'
     - qemu-guest-agent.service
   ```

:::

## RKE1 Kubernetes 集群
了解[如何创建 RKE1 Kubernetes 集群](./rke1-cluster.md)。

## RKE2 Kubernetes 集群
了解[如何创建 RKE2 Kubernetes 集群](./rke2-cluster.md)。

## K3s Kubernetes 集群
了解[如何创建 K3s Kubernetes 集群](./k3s-cluster.md)。


## 拓扑分布约束

_从 v1.0.3 起可用_

在 Kubernetes 集群中，你可以使用[拓扑分布约束](https://kubernetes.io/docs/concepts/scheduling-eviction/topology-spread-constraints/)来管理如何在节点之间分发工作负载，并考虑地区和区域等容错域因素。这有助于实现 Harvester 集群资源的高可用性和提高资源利用率。

对于 `v1.25.x`之前的 RKE2 版本，支持拓扑标签同步功能所需的最低版本如下：

| 所需的最低 RKE2 版本 |
| :--|
| \>=  v1.24.3+rke2r1 |
| \>=  v1.23.9+rke2r1 |
| \>=  v1.22.12+rke2r1 |

此外，对于自定义安装，Harvester Cloud Provider 版本应为 `>= v0.1.4`。

### 将拓扑标签同步到 Guest 集群节点

在集群安装期间，Harvester 主机驱动将自动将拓扑标签从 VM 节点同步到 Guest 集群节点。目前仅支持 `region` 和 `zone` 拓扑标签。

1. 通过 **Hosts** > **Edit Config** > **Labels** 页面在 Harvester 节点上配置拓扑标签。例如，添加拓扑标签：
   ```yaml
   topology.kubernetes.io/region: us-east-1
   topology.kubernetes.io/zone: us-east-1a
   ```
   ![](/img/v1.2/rancher/node-add-affinity-labels.png)

1. 使用 Harvester 主机驱动创建下游 RKE2 集群并启用 Harvester Cloud Provider。我们建议添加[节点亲和性规则](./rke2-cluster.md#添加节点亲和性)，防止虚拟机重建后节点偏移到其他区域。

   ![](/img/v1.2/rancher/create-rke2-harvester-cluster-3.png)

1. 集群准备就绪后，确认这些拓扑标签已成功同步到 Guest Kubernetes 集群上的节点。

1. 现在，你可以在你的 Guest Kubernetes 集群上部署工作负载，并能够使用[拓扑分布约束](https://kubernetes.io/docs/concepts/scheduling-eviction/topology-spread-constraints/)来管理它们。

:::note

如果你的 Harvester Cloud Provider > = v0.2.0，迁移或更新 VM（对应于 Guest 节点）时，Harvester 节点上的拓扑标签将自动重新同步。

如果你的 Harvester Cloud Provider < v0.2.0，标签同步只会在 Guest 节点初始化期间进行。为防止节点偏移到其他区域或可用区，建议在集群预配时添加[节点亲和性规则](./rke2-cluster.md#添加节点亲和性)，以便虚拟机在重建后也可以调度到同一个地区。

:::

