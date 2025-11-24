---
sidebar_position: 10
sidebar_label: Descheduler
title: "Descheduler (Experimental)"
---

_Available as of v1.7.0_

The [Kubernetes Descheduler](https://github.com/kubernetes-sigs/descheduler) optimizes workload scheduling by evicting pods that are not optimally placed according to administrator-defined policies. This crucial function enhances resource utilization, balances workloads across nodes, and improves overall cluster performance.

## Enabling the Add-on

When enabled, the add-on deploys the Descheduler in the `kube-system` namespace and a related configuration in the `kube-system/descheduler` ConfigMap. You can enable the add-on only when the cluster has more than one node.

1. On the Harvester UI, go to **Advanced** > **Add-ons**.

1. Select **descheduler (Experimental)**, and then select **⋮** > **Enable**.

  ![](/img/v1.7/descheduler/descheduler-enable.png)

The add-on can only be enabled when there is more than one node in the cluster. It will deploy the `kube-system/descheduler` deployment and a related configuration in the `kube-system/descheduler` ConfigMap.

## Customizing Descheduler Policies

Select **⋮** > **Edit YAML** to customize the Descheduler policies according to your requirements. The configuration is defined in YAML format.

  ![](/img/v1.7/descheduler/descheduler-edit-yaml.png)

  ![](/img/v1.7/descheduler/descheduler-policy.png)

- `deschedulingInterval`: How often the Descheduler runs. The default value is `5m` (5 minutes).
- `maxNoOfPodsToEvictPerNode`: Maximum number of pods that can be evicted during a single descheduling cycle. The default is value is `5`.
- `evictableNamespaces.exclude`: Namespaces to be excluded from eviction. By default, the system namespaces are excluded to protect critical system components.
- `targetThresholds`: Upper utilization limit for monitored resources. Nodes whose usage exceeds this threshold are marked as overutilized, triggering pod eviction to reduce their load. Default values are automatically applied for CPU (`50`) and memory (`50`), but you can define values for other monitored resources.
- `thresholds`: Lower utilization limit for monitored resources. Pods evicted from overutilized nodes are rescheduled only to nodes whose usage is currently below this threshold. Default values are automatically applied for CPU (`30`) and memory (`30`), but you can define values for other monitored resources.

## Disabling the Add-on

1. On the Harvester UI, go to **Advanced** > **Add-ons**.

1. Select **descheduler (Experimental)**, and then select **⋮** > **Disable**.
