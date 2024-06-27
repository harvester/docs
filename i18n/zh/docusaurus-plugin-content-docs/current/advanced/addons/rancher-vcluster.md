---
sidebar_position: 5
sidebar_label: Rancher Manager
title: "Rancher Manager（实验性）"
---

_从 v1.2.0 起可用_

`rancher-vcluster` 插件用于将 Rancher Manager 作为底层 Harvester 集群上的工作负载运行，该功能是使用 [vcluster](https://www.vcluster.com/) 实现的。

![](/img/v1.2/vm-import-controller/EnableAddon.png)

该插件在 `rancher-vcluster` 命名空间中运行嵌套的 K3s 集群，并将 Rancher 部署到该集群。

在安装过程中，Rancher 的 ingress 会同步到 Harvester 集群，从而允许最终用户访问 Rancher。

## 安装 rancher-vcluster

Harvester 没有附带 `rancher-vcluster` 插件，但你可以在 [expreimental-addon 仓库](https://github.com/harvester/experimental-addons)中找到该插件。

假设你使用 Harvester kubeconfig，你可以运行以下命令来安装插件：

```
kubectl apply -f https://raw.githubusercontent.com/harvester/experimental-addons/main/rancher-vcluster/rancher-vcluster.yaml
```

## 配置 rancher-vcluster

安装插件后，你需要从 Harvester UI 进行配置，如下所示：

1. 选择 **Advanced** > **Addons**。
1. 找到 `rancher-vcluster` 插件并选择 **⋮** > **Edit Config**。

   ![](/img/v1.2/rancher-vcluster/VclusterConfig.png)

1. 在 **Hostname** 字段中，输入指向 Harvester VIP 的有效 DNS 记录。该步骤非常重要，因为 vcluster ingress 会同步到父 Harvester 集群。有效的主机名用于过滤 vcluster 工作负载的 ingress 流量。
1. 在 **Bootstrap Password** 字段中，输入部署在 vcluster 上的 Rancher 的引导新密码。

部署插件后，Rancher 可能需要几分钟时间才能使用。

然后，你可以通过你提供的主机名 DNS 记录访问 Rancher。

有关更多信息，请参阅 [Rancher 集成](../../rancher/virtualization-management.md)。

:::note 禁用 rancher-vcluster

`rancher-vcluster` 插件部署在使用 Longhorn PVC 的 `vcluster` Statefulset 上。

禁用 `rancher-vcluster` 时，PVC `data-rancher-vcluster-0` 将保留在 `rancher-vcluster` 命名空间中。

如果你再次启用该插件，PVC 将被重新使用，Rancher 将再次恢复先前状态。

如果要擦除数据，请确保 PVC 已被删除。

:::