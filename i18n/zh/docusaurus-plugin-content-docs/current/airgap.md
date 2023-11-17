---
id: airgap
sidebar_position: 3
sidebar_label: 离线环境
title: "离线环境"
keywords:
- Harvester
- 离线
- 离线
- HTTP 代理
---

本节介绍如何在离线环境中使用 Harvester。在某些用例中，Harvester 会在离线环境，或在防火墙/代理后安装。

Harvester ISO 镜像包括实现在离线环境中运行的所有包。

## 在 HTTP 代理后运行

在某些环境中，从服务器或虚拟机连接到外部服务需要 HTTP(S) 代理。

### 在安装期间配置 HTTP 代理

你可以在 [ISO 安装](./install/iso-install.md)期间配置 HTTP(S) 代理，如下图所示：

![iso-proxy](/img/v1.2/iso-proxy.png)

### 在 Harvester 设置中配置 HTTP 代理

你可以在 Harvester 仪表盘的设置页面中配置 HTTP(S) 代理：

1. 转到 Harvester UI 的设置页面。
1. 找到 `http-proxy` 设置，点击**⋮ > Edit setting**。
1. 输入 `http-proxy`，`https-proxy` 和 `no-proxy` 的值。

![proxy-setting](/img/v1.2/proxy-setting.png)

:::note

Harvester 在用户配置的 `no-proxy` 后附加必要的地址，来确保内部流量能正常工作。
例如：`localhost,127.0.0.1,0.0.0.0,10.0.0.0/8,longhorn-system,cattle-system,cattle-system.svc,harvester-system,.svc,.cluster.local`。v1.1.2 开始将 `harvester-system` 添加到列表。

如果集群中的节点之间不使用代理进行通信，你需要在第一个节点安装成功后将 CIDR 添加到 `http-proxy.noProxy`。请参阅[部署多节点集群失败](./troubleshooting/harvester.md#http-proxy-设置错误导致多节点集群部署失败)。

:::

## Guest 集群镜像

安装和运行 Harvester 所需的所有镜像都打包在 ISO 中，因此你无需在裸机节点上预加载镜像。Harvester 集群在后台独立且高效地管理它们。

但是，由 [Harvester 主机驱动](./rancher/node/node-driver.md)创建的 Guest K8s 集群（例如 RKE2 集群）是与 Harvester 集群不同的实体。Guest 集群在虚拟机内运行，需要从互联网或[私有镜像仓库](https://ranchermanager.docs.rancher.com/how-to-guides/new-user-guides/authentication-permissions-and-global-configuration/global-default-private-registry#configure-a-private-registry-with-credentials-when-creating-a-cluster)拉取镜像。

如果在 Guest K8s 集群中将 **Cloud Provider** 选项配置为 **Harvester**，则会部署 Harvester Cloud Provider 和 Container Storage Interface (CSI) 驱动程序。

![cluster-registry](/img/v1.2/cluster-registry.png)

因此，我们建议在离线环境中监控每个 [RKE2 版本](https://github.com/rancher/rke2/releases)，并将所需的镜像拉入你的私有镜像仓库。请参阅 [Harvester 支持矩阵页面](https://www.suse.com/suse-harvester/support-matrix/all-supported-versions/harvester-v1-1-2/)上的 **Harvester CCM & CSI Driver with RKE2 Releases** 部分，了解 Harvester Cloud Provider 和 CSI Driver 的最佳功能支持。