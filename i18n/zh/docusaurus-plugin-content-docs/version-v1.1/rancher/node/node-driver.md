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

Harvester 主机驱动（Node Driver）用于在 Harvester 集群中配置虚拟机。在本节中，你将学习如何配置 Rancher 以使用 Harvester 主机驱动来启动和管理 Kubernetes 集群。

主机驱动的设计与 [Docker Machine Driver](https://docs.docker.com/machine/) 相同，它的项目仓库位于 [harvester/docker-machine-driver-harvester](https://github.com/harvester/docker-machine-driver-harvester)。

从 Rancher `2.6.3` 版本开始，你可以使用内置的 Harvester 主机驱动创建 RKE1/RKE2 Kubernetes 集群。
此外，Harvester 可以为这些 Kubernetes 集群提供内置的[负载均衡器](../cloud-provider.md)以及 Harvester 集群的[存储直通](../csi-driver.md)支持。

虽然你可以中[在 Harvester UI 中上传和查看 `.ISO` 镜像](../../upload-image.md#通过本地文件上传镜像)，但 Rancher UI 不支持此功能。有关更多信息，请参阅 [Rancher 文档](https://rancher.com/docs/rancher/v2.6/en/virtualization-admin/#harvester-node-driver)。

## Harvester 主机驱动

Rancher `2.6.3+` 默认启用 Harvester 主机驱动。你可以前往 `Cluster Management` > `Drivers` > `Node Drivers` 页面手动管理 Harvester 主机驱动。

启用 Harvester 主机驱动后，你可以在 Harvester 集群之上创建 Kubernetes 集群并从 Rancher 管理它们。

![rke1-cluster](/img/v1.1/rancher/rke1-node-driver.png)

### 支持矩阵
参见 [Rancher 下游集群支持矩阵](https://www.suse.com/suse-rancher/support-matrix/all-supported-versions/rancher-v2-6-9)。

## 已知问题

| 摘要 | 状态 | 更新时间 |
|-------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------|-----------|--------------|
| [由 Harvester CSI Driver 在主机 Harvester 集群中创建的卷将在编辑/删除 Guest 集群后被删除](https://github.com/harvester/harvester/issues/3272) | 已解决 | 2023-05-08 |

### 由 Harvester CSI Driver 在主机 Harvester 集群中创建的卷将在编辑/删除 Guest 集群后被删除
| 状态 | 更新时间 |
|-----------|--------------|
| 已解决 (Rancher >=v2.7.2) | 2023-05-08 |

**解决方法**：在 Rancher UI 中临时将 Harvester 主机驱动版本更改为 [v0.6.3](https://github.com/harvester/docker-machine-driver-harvester/releases/tag/v0.6.3)。
1. 转到 Rancher UI 并单击 `Cluster Management` > `Drivers` > `Node Drivers`。在 `Node Drivers` 列表中，找到 ` Harvester` 然后点击 `⋮` > `View in API`。
2. 点击 `Edit`。
3. 取消选中 `builtin` 复选框。
4. 将 `*url` 改为 `https://releases.rancher.com/harvester-node-driver/v0.6.3/docker-machine-driver-harvester-amd64.tar.gz`。
5. 将 `checksum` 改为 `159516f8f438e9b1726418ec8608625384aba1857bc89dff4a6ff16b31357c28`。
6. 单击 `Show Request` > `Send Request`。
7. 单击 `Reload`，直到 `status.appliedChecksum` 和 `status.appliedURL` 的值更改为我们设置的值。

:::caution

对主机驱动的更改无法保留。换言之，重启 Rancher 容器后更改将丢失。

:::

:::caution

要使用这个解决方法，请确保与网址的连接是稳定的。
如果你使用离线环境，请下载文件并将其托管在内网上。

:::

:::caution

从 v0.6.3 开始，Harvester 主机驱动已从后端删除了 `qemu-guest-agent` 自动注入。如果你使用的镜像不包含 `qemu-guest-agent` 包，你可以使用 `userdata` 配置来安装和启动 `qemu-guest-agent`。否则，集群将无法配置成功。
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

**解决方法**：针对此问题，Rancher v2.7.2 已使用固定主机驱动版本 v0.6.3。Rancher v2.7.2 UI 将执行 `qemu-guest-agent` 自动注入。

**受影响的版本**：
- Rancher: v2.6.x,v2.7.0,v2.7.1

## RKE1 Kubernetes 集群
了解[如何创建 RKE1 Kubernetes 集群](./rke1-cluster.md)。

## RKE2 Kubernetes 集群
了解[如何创建 RKE2 Kubernetes 集群](./rke2-cluster.md)。

## K3s Kubernetes 集群
了解[如何创建 K3s Kubernetes 集群](./k3s-cluster.md)。


## 拓扑分布约束

_从 v1.0.3 起可用_

在你的 Kubernetes 集群中，你可以使用[拓扑分布约束](https://kubernetes.io/docs/concepts/scheduling-eviction/topology-spread-constraints/)来控制工作负载如何在容错域（例如区域和可用区）之间分布在 Harvester 虚拟机中。这有助于实现集群资源的高可用性和提高资源利用率。

支持同步拓扑标签功能所需的最低 RKE2 版本如下：

| 支持的 RKE2 版本 |
| :--|
| \>=  v1.24.3+rke2r1 |
| \>=  v1.23.9+rke2r1 |
| \>=  v1.22.12+rke2r1 |

另外，通过 RKE/K3s `应用程序`安装的 Cloud Provider 版本必须 >= v0.1.4。

### 将拓扑标签同步到 Guest 集群节点

在集群安装期间，Harvester 主机驱动将自动将拓扑标签从 VM 节点同步到 Guest 集群节点。目前仅支持 `region` 和 `zone` 拓扑标签。

:::note

标签同步只会在节点初始化期间生效。为了避免节点偏移到其他区域或可用区，建议在集群预配时添加[节点亲和性规则](./rke2-cluster.md#添加节点亲和性)，以便虚拟机在重建后也可以调度到同一个地区。

:::

1. 通过 `Hosts > Edit Config > Labels` 在 Harvester 节点上配置拓扑标签。例如，添加拓扑标签：
   ```yaml
   topology.kubernetes.io/region: us-east-1
   topology.kubernetes.io/zone: us-east-1a
   ```
   ![](/img/v1.1/rancher/node-add-affinity-labels.png)

1. 使用 Harvester 主机驱动创建 Guest Kubernetes 集群，建议添加[节点亲和性规则](./rke2-cluster.md#添加节点亲和性)，从而避免在 VM 重建后节点偏移到其它地区。

1. 成功部署集群后，确认 Guest Kubernetes 节点标签已成功从 Harvester VM 节点同步。

1. 现在，你可以在你的 Guest Kubernetes 集群上部署工作负载，并能够使用[拓扑分布约束](https://kubernetes.io/docs/concepts/scheduling-eviction/topology-spread-constraints/)来管理它们。
