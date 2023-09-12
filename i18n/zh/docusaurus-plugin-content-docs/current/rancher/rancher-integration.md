---
sidebar_position: 1
sidebar_label: Rancher 集成
title: "Rancher 集成"
keywords:
  - Harvester
  - harvester
  - Rancher
  - rancher
  - Rancher 集成
Description: Rancher 是一个开源的多集群管理平台。从 Rancher v2.6.1 开始，Harvester 默认集成 Rancher。
---

[Rancher](https://github.com/rancher/rancher) 是一个开源的多集群管理平台。从 Rancher v2.6.1 开始，Rancher 默认集成了 Harvester 集群导入以支持虚拟机与容器的统一管理。

用户可以使用 Rancher [Virtualization Management](virtualization-management.md) 功能导入和管理多个 Harvester 集群，并利用 Rancher 的[身份认证](https://ranchermanager.docs.rancher.com/v2.7/pages-for-subheaders/authentication-config)功能和 [RBAC 控制](https://ranchermanager.docs.rancher.com/v2.7/pages-for-subheaders/manage-role-based-access-control-rbac)来实现[多租户](virtualization-management.md#多租户)支持。

有关支持矩阵的全面概述，请参阅 [Harvester & Rancher 支持矩阵](https://www.suse.com/suse-harvester/support-matrix/all-supported-versions/)。

有关网络要求，请参阅[此文档](../install/requirements.md#网络要求)。

<div class="text-center">
<iframe width="950" height="475" src="https://www.youtube.com/embed/fyxDm3HVwWI" title="YouTube video player" allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture" allowfullscreen></iframe>
</div>

![virtualization-management](/img/v1.2/rancher/virtualization-management.png)

## 部署 Rancher Server

要将 Rancher 与 Harvester 一起使用，请在单独的服务器上安装 Rancher。如果想尝试集成功能，你可以在 Harvester 中创建虚拟机并按照 [Helm CLI 快速入门](https://ranchermanager.docs.rancher.com/v2.7/getting-started/quick-start-guides/deploy-rancher-manager/helm-cli)安装 Rancher Server 。

在生产环境中，你可以使用以下指南之一在你的提供商中部署和配置 Rancher 和 Kubernetes 集群。

- [AWS](https://ranchermanager.docs.rancher.com/v2.7/pages-for-subheaders/deploy-rancher-manager)（使用 Terraform）
- [AWS Marketplace](https://ranchermanager.docs.rancher.com/v2.7/getting-started/quick-start-guides/deploy-rancher-manager/aws-marketplace)（使用 Amazon EKS）
- [Azure](https://ranchermanager.docs.rancher.com/v2.7/getting-started/quick-start-guides/deploy-rancher-manager/azure)（使用 Terraform）
- [DigitalOcean](https://ranchermanager.docs.rancher.com/v2.7/getting-started/quick-start-guides/deploy-rancher-manager/digitalocean)（使用 Terraform）
- [GCP](https://ranchermanager.docs.rancher.com/v2.7/getting-started/quick-start-guides/deploy-rancher-manager/gcp)（使用 Terraform）
- [Hetzner Cloud](https://ranchermanager.docs.rancher.com/v2.7/getting-started/quick-start-guides/deploy-rancher-manager/hetzner-cloud)（使用 Terraform）
- [Vagrant](https://ranchermanager.docs.rancher.com/v2.7/getting-started/quick-start-guides/deploy-rancher-manager/vagrant)
- [Equinix Metal](https://ranchermanager.docs.rancher.com/v2.7/getting-started/quick-start-guides/deploy-rancher-manager/equinix-metal)
- [Outscale](https://ranchermanager.docs.rancher.com/v2.7/getting-started/quick-start-guides/deploy-rancher-manager/outscale-qs)（使用 Terraform）

如有需要，你可以查看以下指南以了解分步步骤。如果你需要在其他提供商中或本地运行 Rancher，或者只是想看看它的上手容易程度，请阅读以下指南：

- [手动安装](https://ranchermanager.docs.rancher.com/v2.7/getting-started/quick-start-guides/deploy-rancher-manager/helm-cli)

:::caution

**不要在生产环境中使用 Docker 来安装 Rancher**。否则，你的环境可能会损坏，而且集群可能无法恢复。在 Docker 中安装 Rancher 只适用于快速评估和测试场景。

:::

## 虚拟化管理

借助 Rancher 的虚拟化管理功能，你可以导入和管理你的 Harvester 集群。单击导入的集群后，你可以轻松访问和管理一系列 Harvester 集群资源，包括主机、虚拟机、镜像、卷等。
此外，虚拟化管理功能还利用了 Rancher 的现有功能，例如使用各种身份认证提供商进行身份认证以及支持多租户。

有关更多信息，请参阅[虚拟化管理](./virtualization-management.md)页面。

![import-cluster](/img/v1.2/rancher/import-harvester-cluster.png)

## 使用 Harvester 主机驱动创建 Kubernetes 集群

你可以使用 [Harvester 主机驱动](./node/node-driver.md)从 Rancher 启动 Kubernetes 集群。在 Rancher 中将 Kubernetes 部署到这些节点上时，你可以选择 Rancher Kubernetes Engine (RKE) 或 RKE2 发行版。

在主机驱动托管的节点池上安装 Kubernetes 的一个好处是，如果一个节点与集群断开连接，Rancher 可以自动创建另一个节点并将其加入集群，从而确保节点池的数量符合要求。

Rancher `v2.6.1`开始默认包含 Harvester 主机驱动。详情请参见 [node-driver](./node/node-driver.md) 页面。

![harvester-node-driver](/img/v1.2/rancher/harvester-node-driver.png)

## Harvester 裸机容器工作负载支持（实验性）

_从 Harvester v1.2.0 + Rancher v2.7.6 起可用_


从 Rancher v2.7.6 开始，Harvester 引入了一项新功能，你可以直接将容器工作负载部署到底层 Harvester 集群并进行管理。借助此功能，你可以无缝结合虚拟机的强大功能与容器化的灵活性，从而更通用、更高效地设置基础设施。

![harvester-container-dashboard](/img/v1.2/rancher/harvester-container-dashboard.png)

本指南将引导你启用和使用此实验性功能，并重点介绍其能力和最佳实践。

要启用此新功能开关，请按照下列步骤操作：

1. 单击汉堡菜单并选择 **Global Settings** 选项卡。
1. 单击 **Feature Flags** 并找到新功能开关 `harvester-baremetal-container-workload`。
1. 单击下拉菜单并选择 **Activate** 以启用此功能。
1. 如果功能状态变为 **Active**，则该功能已成功启用。

![harvester-baremetal-container-workload-feature](/img/v1.2/rancher/harvester-baremetal-container-workload-feature.png)

### 主要功能

**统一仪表板视图**：
启用该功能后，你可以浏览 Harvester 集群的仪表板视图，就像其他标准 Kubernetes 集群一样。统一且用户友好的界面简化了虚拟机和容器工作负载的管理和监控。

**部署自定义工作负载**：
你可以将自定义容器工作负载直接部署到裸机 Harvester 集群。虽然此功能是实验性的，但它为优化基础设施带来了更多可能性。我们建议将容器和虚拟机工作负载部署在不同的命名空间中，从而确保清晰度和分离性。

:::note

- Monitoring、Logging、Rancher、KubeVirt 和 Longhorn 等关键系统组件均由 Harvester 集群本身管理。你无法升级或修改这些组件。因此，请谨慎操作并避免更改这些关键系统组件。
- 请勿将任何工作负载部署到系统命名空间 `cattle-system`、`harvester-system` 或 `longhorn-system` 中。将工作负载保存在单独的命名空间中对于保持系统组件的清晰度和完整性至关重要。
- 为了获得最佳实践，我们建议在单独的命名空间中部署容器和虚拟机工作负载。

:::

:::note

启用此功能后，你的 Harvester 集群将不会出现在 Rancher UI 中的**持续交付**页面上。请检查 [issue #4482](https://github.com/harvester/harvester/issues/4482) 以获取进一步更新。

:::
