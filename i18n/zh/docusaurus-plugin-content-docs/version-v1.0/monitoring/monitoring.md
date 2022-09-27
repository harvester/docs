---
sidebar_position: 1
sidebar_label: 监控
title: ""
---

# 监控

_从 v0.3.0 起可用_

## 仪表盘指标
Harvester 已使用 [Prometheus](https://prometheus.io/) 内置集成监控。监控会在 Harvester 安装期间自动启用。

在 Harvester 的 `Dashboard` 页面中，你可以分别查看集群指标以及最常用的 10 个虚拟机指标。
此外，你可以单击 [Grafana](http://grafana.com/) 仪表盘链接，从而在 Grafana UI 上查看更多仪表盘。

![](/img/v1.0/monitoring/monitoring-dashboard.png)

:::note

只有管​​理员用户才能查看集群仪表盘指标。

:::


## 虚拟机详细指标

你可以单击 `VM details page > VM Metrics` 来查看​​各个虚拟机的指标：

![](/img/v1.0/monitoring/vm-metrics.png)

:::note

当前 `Memory Usage` 的计算公式是 `(1 - free/total) x 100%`，而不是 `(used/total) x 100%`。

:::

例如，在 Linux 操作系统中，`free -h` 命令输出当前内存的统计信息：

```
$ free -h
                total        used        free      shared  buff/cache   available
Mem:          7.7Gi       166Mi       4.6Gi       1.0Mi       2.9Gi       7.2Gi
Swap:            0B          0B          0B
```

对应的 `Memory Usage` 为 `(1 - 4.6/7.7) x 100%`，即大致为 `40%`。


## 配置 Monitoring

_从 v1.0.1 起可用_

Monitoring 有几个可用于收集和聚合所有节点/Pod/VM 指标数据的组件。Monitoring 所需的资源取决于你的工作负载和硬件资源。Harvester 会根据一般用例设置默认值，你可以相应地更改它们。

目前，`Resources Settings` 可以配置以下组件：

- Prometheus
- Prometheus Node Exporter（_从 v1.0.2 开始可以从 UI 中进行配置_）

### 使用 WebUI

在 `Advanced Settings` 页面中，你可以查看和更改资源设置：

1. 导航到设置页面，找到 `harvester-monitoring`。
   ![](/img/v1.0/monitoring/monitoring-setting.png)

1. 点击 `Show harvester-monitoring` 以查看当前的值：

1. 单击 `⋮ > Edit Setting` 设置新值：
   ![](/img/v1.0/monitoring/monitoring-setting-edit-config.png)

1. 点击 `Save`，`Monitoring` 资源会在几秒后重启。请注意，重新启动可能需要一些时间来重新加载以前的数据。

**最常用的选项：内存设置**

- `Requested Memory` 是 `Monitoring` 资源所需的最小内存。建议设置为单个管理节点系统内存的 5% 到 10%。小于 500Mi 的值将被拒绝。

- `Memory Limit` 是可以分配给 `Monitoring` 资源的最大内存。对于单个管理节点，推荐设置为系统内存的 30% 左右。达到这个阈值时，`Monitoring` 会自动重启。

你可以根据可用的硬件资源和系统负载相应地更改以上设置。

:::note

如果你有多个不同硬件资源的管理节点，请根据较小的节点来设置 Prometheus 的值。

:::

:::caution

如果某个节点上部署了越来越多的虚拟机，`prometheus-node-exporter` Pod 可能会由于 OOM（内存不足）而被杀死。在这种情况下，你需要增加 `limits.memory` 的值。

:::

### 使用 CLI

你可以使用 CLI 命令 `$kubectl edit managedchart rancher-monitoring -n fleet-local` 来更新这些值。

对于 `>= v1.0.1` 的 Harvester 版本，相关路径和默认值为：

```yaml
# Prometheus configs
spec.values.prometheus.prometheusSpec.resources.limits.cpu: 1000m
spec.values.prometheus.prometheusSpec.resources.limits.memory: 2500Mi
spec.values.prometheus.prometheusSpec.resources.requests.cpu: 750m
spec.values.prometheus.prometheusSpec.resources.requests.memory: 1750Mi
---
# node exporter configs
spec.values.prometheus-node-exporter.resources.limits.cpu: 200m
spec.values.prometheus-node-exporter.resources.limits.memory: 180Mi
spec.values.prometheus-node-exporter.resources.requests.cpu: 100m
spec.values.prometheus-node-exporter.resources.requests.memory: 30Mi
```

对于 `<= v1.0.0` 的版本，`managedchart rancher-monitoring` 中没有指定相关路径和默认值，因此你需要相应添加它们。

## 故障排除

如需 Monitoring 的支持和故障排除，请参阅[故障排除页面](../troubleshooting/monitoring.md)。

