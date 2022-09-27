---
sidebar_position: 1
sidebar_label: Monitoring
title: ""
---

# Monitoring

_Available as of v0.3.0_

## Dashboard Metrics
Harvester has provided a built-in monitoring integration using [Prometheus](https://prometheus.io/). Monitoring is automatically enabled during the Harvester installations.

From the `Dashboard` page, users can view the cluster metrics and top 10 most used VM metrics respectively.
Also, users can click the [Grafana](http://grafana.com/) dashboard link to view more dashboards on the Grafana UI.

![](/img/v1.0/monitoring/monitoring-dashboard.png)

:::note

Only admin users are able to view the cluster dashboard metrics.

:::


## VM Detail Metrics

For VMs, you can view VM metrics by clicking on the `VM details page > VM Metrics`.

![](/img/v1.0/monitoring/vm-metrics.png)

:::note

The current `Memory Usage` is calculated based on `(1 - free/total) * 100%`, not `(used/total) * 100%`.

:::

For example, in a Linux OS, the `free -h` command outputs the current memory statistics as follows

```
$ free -h
                total        used        free      shared  buff/cache   available
Mem:          7.7Gi       166Mi       4.6Gi       1.0Mi       2.9Gi       7.2Gi
Swap:            0B          0B          0B
```

The corresponding `Memory Usage` is `(1 - 4.6/7.7) * 100%`, roughly `40%`.


## How to Configure Monitoring Settings

_Available as of v1.0.1_

Monitoring has several components that help to collect and aggregate metric data from all Nodes/Pods/VMs. The resources required for monitoring depend on your workloads and hardware resources. Harvester sets defaults based on general use cases, and you can change them accordingly.

Currently, `Resources Settings` can be configured for the following components:

- Prometheus
- Prometheus Node Exporter(_UI configurable as of v1.0.2_)

### From WebUI

In the `Advanced Settings` page, you can view and change the resources settings as follows:

1. Navigate to settings page, find `harvester-monitoring`.
![](/img/v1.0/monitoring/monitoring-setting.png)

1. Click `Show harvester-monitoring` to view the current values.

1. Click `⋮ > Edit Setting` to set a new value.
![](/img/v1.0/monitoring/monitoring-setting-edit-config.png)

1. Click `Save` and the `Monitoring` resource will be restarted within a few seconds. Please be aware that the reboot can take some time to reload previous data.

**The most frequently used option is the memory setting:**

- The `Requested Memory` is the minimum memory required by the `Monitoring` resource. The recommended value is about 5% to 10% of the system memory of one single management node. A value less than 500Mi will be denied.

- The `Memory Limit` is the maximum memory that can be allocated to a `Monitoring` resource. The recommended value is about 30% of the system's memory for one single management node. When the `Monitoring` reaches this threshold, it will automatically restart.

Depending on the available hardware resources and system loads, you may change the above settings accordingly.

:::note

If you have multiple management nodes with different hardware resources, please set the value of Prometheus based on the smaller one.

:::

:::caution

When an increasing number of VMs get deployed on one node, the `prometheus-node-exporter` pod might get killed due to OOM(out of memory). In that case, you should increase the value of `limits.memory`.

:::

### From CLI

To update those values, you can also use the CLI command with: `$kubectl edit managedchart rancher-monitoring -n fleet-local`.

For Harvester version `>= v1.0.1`, the related path and default value are:

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

For versions `<= v1.0.0`, the related path and default value are not specified in the `managedchart rancher-monitoring`, you need to add them accordingly.

## Troubleshooting

For Monitoring support and troubleshooting, please refer to the [troubleshooting page](../troubleshooting/monitoring.md) .

