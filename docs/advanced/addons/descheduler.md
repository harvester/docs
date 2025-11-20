---
sidebar_position: 10
sidebar_label: Descheduler
title: "Descheduler"
---

_Available as of v1.7.0_

[`descheduler`](https://github.com/kubernetes-sigs/descheduler) is used to improve the scheduling of workloads by evicting pods that are not optimally placed according to defined policies. This helps to enhance resource utilization, balance workloads across nodes, and improve overall cluster performance.

## Enabling `descheduler` Add-on

Enable `descheduler` add-on to deploy the Descheduler to a Harvester cluster for improved workload scheduling and resource utilization.

1. On the Harvester UI, go to **Advanced** > **Add-ons**.

1. Select **descheduler (Experimental)**, and then select **⋮** > **Enable**.

  ![](/img/v1.7/descheduler/descheduler-enable.png)

The add-on can only be enabled when there is more than one node in the cluster. It will deploy the `kube-system/descheduler` deployment and a related configuration in the `kube-system/descheduler` ConfigMap.

## Customizing Descheduler Policies

Click the **Edit YAML** button to customize the descheduler policies according to your requirements. The configuration is defined in YAML format.

  ![](/img/v1.7/descheduler/descheduler-edit-yaml.png)

  ![](/img/v1.7/descheduler/descheduler-policy.png)

* `deschedulingInterval`: Specifies how often the descheduler runs. The default is set to 5 minutes.
* `maxNoOfPodsToEvictPerNode`: Limits the number of pods that can be evicted during a single descheduling cycle. The default is set to 5.
* `evictableNamespaces.exclude`: Namespaces that should be excluded from eviction. By default, the system namespaces are excluded to protect critical system components.
* `thresholds` and `targetThresholds`: Define resource usage thresholds to determine when pods should be evicted to balance resource utilization across nodes. The default values only contain CPU and memory. You can add additional resources as needed. It evicts pods from overutilized nodes (those with usage above `targetThresholds`) to underutilized nodes (those with usage below `thresholds`).

## Disabling `descheduler` Add-on

1. On the Harvester UI, go to **Advanced** > **Add-ons**.

1. Select **descheduler (Experimental)**, and then select **⋮** > **Disable**.
