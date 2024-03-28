---
sidebar_position: 1
sidebar_label: 监控
title: "监控"
---

_从 v0.3.0 起可用_

## 仪表盘指标
Harvester 已使用 [Prometheus](https://prometheus.io/) 内置集成监控。监控会在 Harvester 安装期间自动启用。

在 Harvester 的 `Dashboard` 页面中，你可以分别查看集群指标以及最常用的 10 个虚拟机指标。
此外，你可以单击 [Grafana](http://grafana.com/) 仪表盘链接，从而在 Grafana UI 上查看更多仪表盘。

![](/img/v1.1/monitoring/monitoring-dashboard.png)

:::note

只有管​​理员用户才能查看集群仪表盘指标。

另外，Grafana 是由 `rancher-monitoring` 提供的，因此默认的管理员密码是 prom-operator。

参考：[values.yaml](https://github.com/rancher/charts/tree/dev-v2.7/charts/rancher-project-monitoring)
:::


## 虚拟机详细指标

你可以单击 `VM details page > VM Metrics` 来查看​​各个虚拟机的指标：

![](/img/v1.1/monitoring/vm-metrics.png)

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

在 `Monitoring & Logging` 页面上，你可以查看和更改资源设置：

1. 导航到 `Monitoring > Configuration` 页面。
   ![](/img/v1.1/monitoring/monitoring-config.png)

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

## Alertmanager

_从 v1.1.0 起可用_

`Harvester` 使用 `Alertmanager` 来收集和管理集群中发生/正在发生的所有告警。

### Alertmanager 配置

#### 启用/禁用 Alertmanager

`Alertmanager` 默认启用。你可以通过以下配置路径来禁用它。

![](/img/v1.1/monitoring/alertmanager-config-enable-and-resource.png)

#### 更改资源设置

你还可以更改 `Alertmanager` 的资源设置，如上图所示。

#### 从 WebUI 配置 AlertmanagerConfig

要将告警发送到第三方服务器，你需要配置 `AlertmanagerConfig`。

在 WebUI 上，导航到 `Monitoring & Logging` > `Monitoring` > `Alertmanager Configs` 页面。

在 `Alertmanager Config: Create` 页面中，点击 `Namespace`，从下拉列表中选择目标命名空间并设置 `Name`。然后，点击右下角的 `Create`。

![](/img/v1.1/monitoring/alertmanager-config-create-1.png)

单击刚刚创建的 `Alertmanager Configs` 继续进行配置。

![](/img/v1.1/monitoring/view-alertmanager-config.png)

单击 `Add Receiver`。

![](/img/v1.1/monitoring/prepare-to-add-receiver.png)

为接收器设置 `Name`。然后，选择接收器类型，例如 `Webhook`，然后单击 `Add Webhook`。

![](/img/v1.1/monitoring/webhook-receiver-1.png)

填写所需参数，然后单击 `Create`。

![](/img/v1.1/monitoring/webhook-receiver-2.png)

#### 从 CLI 配置 AlertmanagerConfig

你还可以从 CLI 添加 `AlertmanagerConfig`。

示例：`default` 命名空间中的 Webhook 接收器：

```
cat << EOF > a-single-receiver.yaml
apiVersion: monitoring.coreos.com/v1alpha1
kind: AlertmanagerConfig
metadata:
  name: amc-example
  # namespace: your value
  labels:
    alertmanagerConfig: example
spec:
  route:
    continue: true
    groupBy:
    - cluster
    - alertname
    receiver: "amc-webhook-receiver"
  receivers:
  - name: "amc-webhook-receiver"
    webhookConfigs:
    - sendResolved: true
      url: "http://192.168.122.159:8090/"
EOF

# kubectl apply -f a-single-receiver.yaml
alertmanagerconfig.monitoring.coreos.com/amc-example created

# kubectl get alertmanagerconfig -A
NAMESPACE   NAME          AGE
default     amc-example   27s

```

#### Webhook 收到的告警示例

发送到 Webhook 服务器的告警格式如下：

```
{
'receiver': 'longhorn-system-amc-example-amc-webhook-receiver',
'status': 'firing',
'alerts': [],
'groupLabels': {},
'commonLabels': {'alertname': 'LonghornVolumeStatusWarning', 'container': 'longhorn-manager', 'endpoint': 'manager', 'instance': '10.52.0.83:9500', 'issue': 'Longhorn volume is Degraded.',
'job': 'longhorn-backend', 'namespace': 'longhorn-system', 'node': 'harv2', 'pod': 'longhorn-manager-r5bgm', 'prometheus': 'cattle-monitoring-system/rancher-monitoring-prometheus',
'service': 'longhorn-backend', 'severity': 'warning'},
'commonAnnotations': {'description': 'Longhorn volume is Degraded for more than 5 minutes.', 'runbook_url': 'https://longhorn.io/docs/1.3.0/monitoring/metrics/',
'summary': 'Longhorn volume is Degraded'},
'externalURL': 'https://192.168.122.200/api/v1/namespaces/cattle-monitoring-system/services/http:rancher-monitoring-alertmanager:9093/proxy',
'version': '4',
'groupKey': '{}/{namespace="longhorn-system"}:{}',
'truncatedAlerts': 0
}
```

:::note

不同的接收器可以以不同的格式呈现告警。详情请参阅相关文件。

:::

#### 已知限制

`AlertmanagerConfig` 由`命名空间`强制执行。不支持没有命名空间的全局级别 `AlertmanagerConfig`。

我们已经创建了一个 [GithHb issue](https://github.com/harvester/harvester/issues/2760) 来跟踪上游更改。一旦该功能可用，`Harvester` 将采用它。

### 查看和管理告警

#### 使用 Alertmanager 仪表板

你可以从下面的链接访问 `Alertmanager` 的原始仪表板。请注意，你需要将 `the-cluster-vip` 替换为实际的 cluster-vip：

> https://the-cluster-vip/api/v1/namespaces/cattle-monitoring-system/services/http:rancher-monitoring-alertmanager:9093/proxy/#/alerts

`Alertmanager` 仪表板的整体视图如下。

![](/img/v1.1/monitoring/alertmanager-dashboard.png)

你可以查看告警的详细信息：

![](/img/v1.1/monitoring/alert-view-detail.png)

#### 使用 Prometheus 仪表板

你可以从下面的链接访问 `Prometheus` 的原始仪表板。请注意，你需要将 `the-cluster-vip` 替换为实际的 cluster-vip：

> https://the-cluster-vip/api/v1/namespaces/cattle-monitoring-system/services/http:rancher-monitoring-prometheus:9090/proxy/

顶部导航栏中的 `Alerts` 菜单显示了 Prometheus 中定义的所有规则。你可以使用过滤器 `Inactive`、`Pending` 和 `Firing` 快速找到你需要的信息。

![](/img/v1.1/monitoring/prometheus-original-alerts.png)


## 故障排除

如需 Monitoring 的支持和故障排除，请参阅[故障排除页面](../troubleshooting/monitoring.md)。

