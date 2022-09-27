---
sidebar_position: 1
sidebar_label: Harvester 主机驱动
title: ""
keywords:
  - Harvester
  - harvester
  - Rancher
  - rancher
  - Harvester 主机驱动
Description: Harvester 主机驱动（Node Driver）用于在 Harvester 集群中配置虚拟机。在本节中，你将学习如何配置 Rancher 以使用 Harvester 主机驱动来启动和管理 Kubernetes 集群。
---

# Harvester 主机驱动

Harvester 主机驱动（Node Driver）用于在 Harvester 集群中配置虚拟机。在本节中，你将学习如何配置 Rancher 以使用 Harvester 主机驱动来启动和管理 Kubernetes 集群。

主机驱动的设计与 [Docker Machine Driver](https://docs.docker.com/machine/) 相同，它的项目仓库位于 [harvester/docker-machine-driver-harvester](https://github.com/harvester/docker-machine-driver-harvester)。

你可以使用内置的 Harvester 主机驱动在 Rancher `2.6.3` 中配置 RKE1/RKE2 Kubernetes 集群。
此外，Harvester 可以为 Kubernetes 集群提供内置的[负载均衡器](../cloud-provider.md)以及原始集群[持久存储](../csi-driver.md)支持。

虽然你可以中[在 Harvester UI 中上传和查看 `.ISO` 镜像](../../upload-image.md#通过本地文件上传镜像)，但 Rancher UI 不支持此功能。有关更多信息，请参阅 [Rancher 文档](https://rancher.com/docs/rancher/v2.6/en/virtualization-admin/#harvester-node-driver)。

:::note

Harvester 1.0.0 仅与 Rancher `2.6.3+` 或更高版本兼容。

:::

## Harvester 主机驱动

Rancher `2.6.3+` 默认启用 Harvester 主机驱动。你可以前往 `Cluster Management` > `Drivers` > `Node Drivers` 页面手动管理 Harvester 主机驱动。

启用 Harvester 主机驱动后，你可以在 Harvester 集群之上创建 Kubernetes 集群并从 Rancher 管理它们。

![rke1-cluster](/img/v1.0/rancher/rke1-node-driver.png)

## RKE1 Kubernetes 集群
了解[如何创建 RKE1 Kubernetes 集群](./rke1-cluster.md)。

## RKE2 Kubernetes 集群
了解[如何创建 RKE2 Kubernetes 集群](./rke2-cluster.md)。

## K3s Kubernetes 集群
点击了解[如何创建 K3s Kubernetes 集群](./k3s-cluster.md)。


## 拓扑分布约束

_从 v1.0.3 起可用_

在你的 Kubernetes 集群中，你可以使用[拓扑分布约束](https://kubernetes.io/docs/concepts/scheduling-eviction/topology-spread-constraints/)来控制工作负载如何在容错域（例如区域和可用区）之间分布在 Harvester 虚拟机中。这有助于实现集群资源的高可用性和提高资源利用率。


### 将拓扑标签同步到 Guest 集群节点

在集群安装期间，Harvester 主机驱动将自动将拓扑标签从 VM 节点同步到 Guest 集群节点。目前，仅支持 `region` 和 `zone` 拓扑标签。

:::note

标签同步只会在 Guest 节点初始化期间生效。为了避免节点偏移到其他区域或可用区，建议在集群预配时添加[节点亲和性规则](./rke2-cluster.md#添加节点亲和性)，以便虚拟机在重建后也可以调度到同一个地区。

:::

1. 通过 `Hosts > Edit Config > Labels` 在 Harvester 节点上配置拓扑标签。例如，添加拓扑标签：
   ```yaml
   topology.kubernetes.io/region: us-east-1
   topology.kubernetes.io/zone: us-east-1a
   ```
   ![](/img/v1.0/rancher/node-add-affinity-labels.png)

1. 使用 Harvester 主机驱动创建 Guest Kubernetes 集群，建议添加[节点亲和性规则](./rke2-cluster.md#添加节点亲和性)，从而避免在 VM 重建后节点偏移到其它地区。

1. 成功部署集群后，确认 Guest Kubernetes 节点标签已成功同步 Harvester VM 节点。

1. 现在，你可以在你的 Guest Kubernetes 集群上部署工作负载，并能够使用[拓扑分布约束](https://kubernetes.io/docs/concepts/scheduling-eviction/topology-spread-constraints/)来管理它们。