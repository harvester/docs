---
sidebar_position: 5
sidebar_label: Harvester CSI Driver
title: "Harvester CSI Driver"
keywords:
  - Harvester
  - harvester
  - Rancher 集成
---

Harvester CSI Driver 提供了一个标准的 CSI 接口，供 Harvester 中所创建的 Kubernetes 集群使用。这个 CIS 接口连接到主机集群，并将主机卷热插拔到虚拟机来提供裸金属集群磁盘的存储性能。

## 部署

### 前提

- Kubernetes 集群是在 Harvester 虚拟机之上构建的。
- 作为 Kubernetes 节点运行的 Harvester 虚拟机位于相同的命名空间中。

:::note

目前，Harvester CSI Driver 仅支持单节点读写 (RWO) 卷。请留意 [issue #1992](https://github.com/harvester/harvester/issues/1992) 以获得后续多节点 `read-only` (ROX) 和 `read-write` (RWX) 的支持。

:::

### 使用 Harvester RKE1 主机驱动进行部署

- 选择 `Harvester(Out-of-tree)` 选项（可选，如不需要同时使用 Cloud Provider 功能可以选择 `None` 选项）。

   ![](/img/v1.2/rancher/rke-cloud-provider.png)

- 从 Rancher 应用市场安装 `Harvester CSI Driver`：

   ![](/img/v1.2/rancher/install-harvester-csi-driver.png)


### 使用 Harvester RKE2 主机驱动进行部署

当使用 Rancher RKE2 主机驱动启动 Kubernetes 集群时，Harvester CSI Driver 会在选中 Harvester 云提供商后被自动部署。

![select-harvester-cloud-provider](/img/v1.2/rancher/rke2-cloud-provider.png)

### 使用 Harvester K3s 主机驱动进行部署

- [生成 addon 配置](https://github.com/harvester/harvester-csi-driver/blob/master/deploy/generate_addon_csi.sh)并放入 K3s 虚拟机 `/etc/kubernetes/cloud-config`。

```
# 依赖 kubectl 来操作 Harvester 集群
./deploy/generate_addon.sh <serviceaccount name> <namespace>
```

- 从 Rancher 应用市场安装 `Harvester CSI Driver`：

   ![](/img/v1.2/rancher/install-harvester-csi-driver-in-k3s.png)
