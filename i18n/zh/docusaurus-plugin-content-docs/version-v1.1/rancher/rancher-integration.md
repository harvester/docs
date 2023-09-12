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

_从 v0.3.0 起可用_

[Rancher](https://github.com/rancher/rancher) 是一个开源的多集群管理平台。从 Rancher v2.6.1 开始，Rancher 默认集成了 Harvester 集群导入以支持虚拟机与容器的统一管理。


## Rancher 和 Harvester 支持矩阵

有关支持矩阵，请参阅 [Harvester & Rancher 支持矩阵](https://www.suse.com/suse-harvester/support-matrix/all-supported-versions/harvester-v1-1-1/#anchor-h4-item2)。

你现在可以使用 Rancher 的[虚拟化管理](virtualization-management.md)页面导入和管理多个 Harvester 集群，并利用 Rancher 的[认证](https://ranchermanager.docs.rancher.com/v2.6/pages-for-subheaders/authentication-config)功能和 RBAC 控制来实现[多租户](https://rancher.com/docs/rancher/v2.6/en/admin-settings/rbac/)支持。

<div class="text-center">
<iframe width="950" height="475" src="https://www.youtube.com/embed/fyxDm3HVwWI" title="YouTube video player" frameborder="0" allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture" allowfullscreen></iframe>
</div>

![virtualization-management](/img/v1.1/rancher/virtualization-management.png)

## 部署 Rancher Server

要想通过 Rancher 使用 Harvester，请将 Rancher 和 Harvester 安装在两个独立的服务器中。如果你想试用集成功能，你可以在 Harvester 中创建一个虚拟机，然后安装 Rancher v2.6.3 或以上版本（建议使用最新的稳定版本）。

你可使用以下指南之一，在你选择的提供商中部署和配置 Rancher 和 Kubernetes 集群。

- [AWS](https://rancher.com/docs/rancher/v2.6/en/quick-start-guide/deployment/amazon-aws-qs/)（使用 Terraform）
- [AWS Marketplace](https://rancher.com/docs/rancher/v2.6/en/quick-start-guide/deployment/amazon-aws-marketplace-qs/)（使用 Amazon EKS）
- [Azure](https://rancher.com/docs/rancher/v2.6/en/quick-start-guide/deployment/microsoft-azure-qs/)（使用 Terraform）
- [DigitalOcean](https://rancher.com/docs/rancher/v2.6/en/quick-start-guide/deployment/digital-ocean-qs/)（使用 Terraform）
- [GCP](https://rancher.com/docs/rancher/v2.6/en/quick-start-guide/deployment/google-gcp-qs/)（使用 Terraform）
- [Hetzner Cloud](https://rancher.com/docs/rancher/v2.6/en/quick-start-guide/deployment/hetzner-cloud-qs/)（使用 Terraform）
- [Vagrant](https://rancher.com/docs/rancher/v2.6/en/quick-start-guide/deployment/quickstart-vagrant/)
- [Equinix Metal](https://rancher.com/docs/rancher/v2.6/en/quick-start-guide/deployment/equinix-metal-qs/)

:::caution

**不要在生产环境中使用 Docker 来安装 Rancher**。否则，你的环境可能会损坏，而且集群可能无法恢复。在 Docker 中安装 Rancher 只适用于快速评估和测试场景。

要使用 Docker 安装 Rancher：

1. 配置 Linux 主机来创建自定义集群。你的主机可以是以下任何一种：
   - 云虚拟机
   - 本地虚拟机
   - 服务器
1. 使用你惯用的 shell（例如 PuTTy 或远程终端连接）登录你的 Linux 主机。
1. 在 shell 中，输入以下命令：

```shell
# 为了快速评估，你可以使用以下命令运行 Rancher Server
$ sudo docker run -d --restart=unless-stopped -v /opt/rancher:/var/lib/rancher -p 80:80 -p 443:443 --privileged rancher/rancher:v2.6.9
```

:::

## 虚拟化管理

借助 Rancher 的虚拟化管理功能，你可以导入和管理 Harvester 集群。
通过单击其中一个集群，你可以查看和管理导入的 Harvester 集群资源，例如主机、虚拟机、镜像、卷等。此外，`Virtualization Management` 利用了现有的 Rancher 功能，例如通过各种验证提供程序进行身份验证和多租户支持。

详情请查看[虚拟化管理](./virtualization-management.md)页面。

![import-cluster](/img/v1.1/rancher/import-harvester-cluster.png)

## 使用 Harvester 主机驱动创建 Kubernetes 集群

[Harvester 主机驱动](./node/node-driver.md)用于在 Harvester 集群中创建并配置虚拟机，而 Rancher 会使用这些虚拟机来启动和管理 Kubernetes 集群。

Rancher `v2.6.1` 开始已默认添加 Harvester 主机驱动。详情请参见 [node-driver](./node/node-driver.md) 页面。