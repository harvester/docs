---
sidebar_position: 5
sidebar_label: 故障排除
title: ""
---

# 故障排除

## 概述

以下是解决升级失败的一些提示：

- 查看[版本的升级说明](./automatic.md#升级支持矩阵)。你可以单击支持矩阵表中的版本查看是否存在已知问题。
- 深入了解升级[设计方案](https://github.com/harvester/harvester/blob/master/enhancements/20220413-zero-downtime-upgrade.md)。以下简要介绍了升级的各个阶段以及可能的解决方法。

## 升级流程

Harvester 升级包含了几个阶段：
![](/img/v1.0/upgrade/ts_upgrade_phases.png)

### 阶段 1：预配升级仓库 VM。

Harvester controller 下载 Harvester 版本 ISO 文件并使用它来配置 VM。在此阶段，你可以看到升级状态窗口显示：

![](/img/v1.0/upgrade/ts_status_phase1.png)

完成的时间取决于用户的网络速度和集群资源利用率。由于网络速度，我们看到此阶段出现了故障。如果发生这种情况，用户可以再次[重新开始升级](#重新开始升级)。

我们还可以检查仓库 VM（以 `upgrade-repo-hvst-xxxx` 格式命名）状态及其对应的 Pod：

```
$ kubectl get vm -n harvester-system
NAME                              AGE    STATUS     READY
upgrade-repo-hvst-upgrade-9gmg2   101s   Starting   False

$ kubectl get pods -n harvester-system | grep upgrade-repo-hvst
virt-launcher-upgrade-repo-hvst-upgrade-9gmg2-4mnmq     1/1     Running     0          4m44s
```

### 阶段 2：预加载容器镜像

Harvester controller 在每个 Harvester 节点上创建 Job，以便从仓库 VM 下载镜像并进行预加载。这些是下一个版本所需的容器镜像。

在此阶段，你可以看到升级状态窗口显示：

![](/img/v1.0/upgrade/ts_status_phase2.png)

所有节点都需要一些时间来预加载镜像。如果升级在此阶段失败，用户可以查看 `cattle-system` 命名空间中的 Job 日志：

```
$ kubectl get jobs -n cattle-system | grep prepare
apply-hvst-upgrade-9gmg2-prepare-on-node1-with-2bbea1599a-f0e86   0/1           47s        47s
apply-hvst-upgrade-9gmg2-prepare-on-node4-with-2bbea1599a-041e4   1/1           2m3s       2m50s

$ kubectl logs jobs/apply-hvst-upgrade-9gmg2-prepare-on-node1-with-2bbea1599a-f0e86 -n cattle-system
...
```

如果升级在此阶段失败，[重新开始升级](#重新开始升级)也是安全的。

### 阶段 3：升级系统服务

![](/img/v1.0/upgrade/ts_status_phase3.png)

在此阶段，Harvester controller 使用 Job 来升级组件 Helm Chart。用户可以使用以下命令检查 `apply-manifest` Job：

```
$ kubectl get jobs -n harvester-system -l harvesterhci.io/upgradeComponent=manifest
NAME                                 COMPLETIONS   DURATION   AGE
hvst-upgrade-9gmg2-apply-manifests   0/1           46s        46s

$ kubectl logs jobs/hvst-upgrade-9gmg2-apply-manifests -n harvester-system
...
```

### 阶段 4：升级节点

![](/img/v1.0/upgrade/ts_status_phase4.png)

Harvester controller 在每个节点上（一个接一个）创建 Job 以升级节点的操作系统和 RKE2 运行时。对于多节点集群，更新节点的 Job 有两种：

- **pre-drain** Job：热迁移或关闭节点上的虚拟机。Job 完成后，嵌入式 Rancher 服务会升级节点上的 RKE2 运行时。
- **post-drain** Job：升级操作系统并重新启动。

对于单节点集群，每个节点只有一个 `single-node-upgrade` 类型的 Job（命名格式为 `hvst-upgrade-xxx-single-node-upgrade-<hostname> `）。

用户可以通过以下方式检查节点 Job：

```
$ kubectl get jobs -n harvester-system -l harvesterhci.io/upgradeComponent=node
NAME                                  COMPLETIONS   DURATION   AGE
hvst-upgrade-9gmg2-post-drain-node1   1/1           118s       6m34s
hvst-upgrade-9gmg2-post-drain-node2   0/1           9s         9s
hvst-upgrade-9gmg2-pre-drain-node1    1/1           3s         8m14s
hvst-upgrade-9gmg2-pre-drain-node2    1/1           7s         85s

$ kubectl logs -n harvester-system jobs/hvst-upgrade-9gmg2-post-drain-node2
...
```

:::caution

如果升级在此阶段失败，请不要重新开始升级。

:::

### 阶段 5：清理

Harvester controller 会删除升级仓库 VM 和不再需要的文件。


## 常用操作

### 重新开始升级

1. 登录到 controlplane 节点。
2. 列出集群中的 `Upgrade` CR：

   ```
   # 使用 root
   $ sudo -i

   # 列出进行中的升级
   $ kubectl get upgrade.harvesterhci.io -n harvester-system -l harvesterhci.io/latestUpgrade=true
   NAME                 AGE
   hvst-upgrade-9gmg2   10m
   ```

3. 删除 Upgrade CR

   ```
   $ kubectl delete upgrade.harvesterhci.io/hvst-upgrade-9gmg2 -n harvester-system
   ```

4. 单击 Harvester 仪表板中的升级按钮，重新开始升级。
