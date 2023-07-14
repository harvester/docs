---
sidebar_position: 1
sidebar_label: Monitoring
title: "Monitoring"
---

<head>
  <link rel="canonical" href="https://docs.harvesterhci.io/v1.1/monitoring/monitoring"/>
</head>

_Available as of v0.3.0_

## Dashboard Metrics
Harvester `v0.3.0` has provided a built-in monitoring integration using [Prometheus](https://prometheus.io/). Monitoring is automatically installed during ISO installations.

From the `Dashboard` page, users can view the cluster metrics and top 10 most used VM metrics respectively.
Also, users can click the [Grafana](http://grafana.com/) dashboard link to view more dashboard on the Grafana UI.
![](./assets/monitoring-dashboard.png)

:::note

Only admin users are able to view the dashboard metrics.

:::


## VM Detail Metrics
For each VM, users can view the VM metrics by clicking the VM details page.
![](./assets/vm-metrics.png)
