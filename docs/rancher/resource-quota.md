---
sidebar_position: 6
sidebar_label: Resource Quotas
title: "Resource Quotas"
keywords:
  - Harvester
  - harvester
  - Rancher
  - rancher
  - Resource Quota
description: ResourceQuota allows administrators to set resource limits per namespace, preventing excessive resource usage and ensuring the smooth operation of other namespaces when the quota is reached.
---

<head>
  <link rel="canonical" href="https://docs.harvesterhci.io/v1.8/rancher/resource-quota"/>
</head>

[ResourceQuota](https://kubernetes.io/docs/concepts/policy/resource-quotas/) is used to limit the usage of resources within a namespace. It helps administrators control and restrict the allocation of cluster resources to ensure fairness and controlled resource distribution among namespaces.

In Harvester, ResourceQuota can define usage limits for the following resources:
- **CPU:** Limits compute resource usage, including CPU cores and CPU time.
- **Memory:** Limits the usage of memory resources in bytes or other recognizable memory units.
- **Storage:** Limits the usage of storage resources.

## Set ResourceQuota via Rancher

In the Rancher UI, administrators can configure resource quotas for namespaces through the following steps:

1. Click the hamburger menu and choose the **Virtualization Management** tab.
1. Choose one of the clusters and go to **Projects/Namespaces** > **Create Project**.
1. Specify the desired project **Name**. Next, go to the **Resource Quotas** tab and select the **Add Resource** option. Within the **Resource Type** field, select either **CPU Limit** or **Memory Limit** and define the **Project Limit** and **Namespace Default Limit** values.
  ![](/img/v1.4/rancher/create-project.png)

:::note
The `VM Default Resource Limit` is used to set default request/limit on compute resources for pods running within the namespace, using the Kubernetes [`LimitRange` API](https://kubernetes.io/docs/concepts/policy/limit-range/). The resource `reservation` and `limit` values correspond to the `defaultRequest` and `default` limits of the namespace's `LimitRange` configuration. These settings are applied to pod workloads only.

These configurations will be removed in the future. See issue https://github.com/harvester/harvester/issues/5652.
:::

You can configure the **Namespace** limits as follows: 

1. Find the newly created project, and select **Create Namespace**.
1. Specify the desired namespace **Name**, and adjust the limits.
1. Complete the process by selecting **Create**.
  ![](/img/v1.4/rancher/create-namespace.png)
   
:::note
Attempts to provision VMs for guest clusters are blocked when the resource quotas are reached. Rancher responds by creating a new VM in a loop, in which each failed attempt to create a VM is immediately followed by another creation attempt. This results in a transient error state in the cluster that is not recorded as the VM is recreated.
:::

:::important

- Due to the [Overhead Memory of Virtual Machine](#overhead-memory-of-virtual-machine), each VM needs some additional memory to work. When setting **Memory Limit**, this should be taken into account. For example, when the project **Memory Limit** is `24 Gi`, it is not possible to run 3 VMs each has `8 Gi` memory. The [link](../advanced/settings.md#additional-guest-memory-overhead-ratio) includes a table to show how the final memory of a VM is calculated.

- When you plan to change the Harvester setting [additional-guest-memory-overhead-ratio](../advanced/settings.md#additional-guest-memory-overhead-ratio) to a bigger value, remember to review the `ResourceQuota` values and update them accordingly. You need to tune these two parameters to ensure the `ResourceQuota` can accommodate the original number of VMs which will have the new amount of overhead memory.

:::

## Overhead Memory of Virtual Machine

Upon creating a virtual machine (VM), the VM controller seamlessly incorporates overhead resources into the VM's configuration. These additional resources intend to guarantee the consistent and uninterrupted functioning of the VM. It's important to note that configuring memory limits requires a higher memory reservation due to the inclusion of these overhead resources.

For example, consider the creation of a new VM with the following configuration:
- CPU: 8 cores
- Memory: 16Gi

:::note
The operating system, either Linux or Windows, does not affect overhead calculations.
:::

Memory Overhead is calculated in the following sections:
- **Memory PageTables Overhead:** This accounts for one bit for every 512b RAM size. For instance, a memory of 16Gi requires an overhead of 32Mi.
- **VM Fixed Overhead:** This consists of several components:
    - `VirtLauncherMonitorOverhead`: 25Mi  (the `ps` RSS for virt-launcher-monitor)
    - `VirtLauncherOverhead`: 100Mi  (the `ps` RSS for the virt-launcher process)
    - `VirtlogdOverhead`: 20Mi  (the `ps` RSS for virtlogd)
    - `VirtqemudOverhead`: 35Mi (the `ps` RSS for virtqemud)
    - `QemuOverhead` : 30Mi (the `ps` RSS for qemu, minus the RAM of its (stressed) guest, minus the virtual page table)
- **8Mi per CPU (vCPU) Overhead:** Additionally, 8Mi of overhead per vCPU is added, along with a fixed 8Mi overhead for IOThread.
- **Extra Added Overhead:** This encompasses various factors like video RAM overhead and architecture overhead. Refer to [Additional Overhead](https://github.com/kubevirt/kubevirt/blob/2bb88c3d35d33177ea16c0f1e9fffdef1fd350c6/pkg/virt-controller/services/template.go#L1853-L1890) for further details.
- **additional-guest-memory-overhead-ratio** User can further tune the `Memory Overhead` by the Harvester setting [additional-guest-memory-overhead-ratio](../advanced/settings.md#additional-guest-memory-overhead-ratio), which defaults to `"1.5"`. This setting is important for VM to eliminate the chance to hit OOM(Out of Memory).

This calculation demonstrates that the VM instance necessitates an additional memory overhead of approximately 380Mi.

For more information, see [Memory Overhead](https://kubevirt.io/user-guide/virtual_machines/virtual_hardware/#memory-overhead).

For more information on how the memory overhead is calculated in Kubevirt, refer to the source code [GetMemoryOverhead](https://github.com/kubevirt/kubevirt/blob/1466b658f78b9b8bb9517ffb6dafd4b777f33fe6/pkg/virt-controller/services/renderresources.go#L307).

:::note

The `Overhead Memory` varies between different Harvester releases (with different Kubevirt releases) because all those backing components are keeping adding new features and fixing bugs, they need more memory.

:::

## Automatic adjustment of ResourceQuota during migration

When the allocated resource quota controlled by the `ResourceQuota` object reaches its limit, migrating a VM becomes unfeasible. The migration process automatically creates a new pod mirroring the resource requirements of the source VM. If these pod creation prerequisites surpass the defined quota, the migration operation cannot proceed.

_Available as of v1.2.0_

In Harvester, the `ResourceQuota` values will dynamically expand ahead of migration to accommodate the resource needs of the target virtual machine. After migration, the ResourceQuotas will be reinstated to their prior configurations.

Please be aware of the following constrains of the automatic resizing of `ResourceQuota`:
- `ResourceQuota` cannot be changed during VM migration.
- When raising the `ResourceQuota` value, if you create, start, or restore other VMs, Harvester will verify if the resources are sufficient based on the original `ResourceQuota`. If the conditions are not met, the system will alert that the migration process is not feasible.
- After expanding `ResourceQuota`, potential resource contention may occur between non-VM pods and VM pods, leading to migration failures. Therefore, deploying custom container workloads and VMs to the same namespace is not recommended.
- Due to the concurrent limitation of the webhook validator, the VM controller will execute a secondary validation to confirm resource sufficiency. If the resource is insufficient, it will auto config the VM's `RunStrategy` to `Halted`, and a new annotation `harvesterhci.io/insufficient-resource-quota` will be added to the VM object, informing you that the VM was shut down due to insufficient resources.
  ![](/img/v1.2/rancher/vm-annotation-insufficient-resource-quota.png)

### Disable automatic adjustment of ResourceQuota during migration

_Available as of v1.4.2_

When a `ResourceQuota` object has the annotation `harvesterhci.io/skipResourceQuotaAutoScaling: "true"`, Harvester does not automatically adjust the values of that object. This feature is useful for debugging, troubleshooting and other tasks.

:::info important

You must set the annotation before the migration starts. If the annotation is set while the values are already being adjusted, Harvester is unable to automatically restore the previous configuration.

:::

### Automatic adjustment of ResourceQuota during migration when `additional-guest-memory-overhead-ratio` changes

_Available as of v1.9.0_

When the system setting [additional-guest-memory-overhead-ratio](../advanced/settings.md#additional-guest-memory-overhead-ratio) is increased, it affects all subsequent VM cold starts and live migrations. For a running VM, subsequent migrations will consume more memory. This creates a cumulative challenge: after multiple live migrations, the actual memory usage of all VMs within a namespace can exceed its configured `ResourceQuota` limit, placing the namespace in an **over-provisioned** state.

It is important to understand the fundamental Kubernetes mechanism regarding `ResourceQuota`: while scaling a quota down can result in current usage exceeding the new limit, Kubernetes does not terminate running instances; it allows them to continue as-is while blocking the creation of any *new* instances. Consequently, when a new migration is triggered in an already **over-provisioned** environment, the system may block the operation because the total namespace quota is insufficient to accommodate both the existing source VM and the new target VM instance, even when the quota is automatically scaled for the new instance's specific requirements.

Harvester automatically manages this bottleneck through the following workflow:

- **Detection:** Harvester identifies when a live migration is specifically blocked by `ResourceQuota` limitations, even after the quota has already been scaled up for that specific VM.

- **Delta Adjustment:** The system calculates a temporary "quota delta"—the additional capacity required to accommodate the cumulative memory footprint—and applies it to allow the migration to proceed.

- **Cleanup:** Once the migration concludes, Harvester removes the temporary adjustment, reverting the `ResourceQuota` to its configured state.

:::info

To minimize reliance on automatic adjustments, manually update `ResourceQuota` settings whenever overhead configurations are changed. Ultimately, the VM's final memory footprint must always comply with defined namespace limits, regardless of whether it is migrated or cold-rebooted.

:::

## Monitoring ResourceQuota Usage and Alerts

Monitoring resource usage is critical to cluster stability, as high `ResourceQuota` consumption can cause VM startup failures or prevent successful VM migrations. Real-time visibility and proactive notifications ensure you can address capacity constraints before they impact your workloads.

When the [rancher-monitoring](../advanced/addons.md) addon is enabled, it creates the `PrometheusRule` resource `rancher-monitoring-kubernetes-resources` in `cattle-monitoring-system`. This includes the following pre-configured ResourceQuota alert rules.

### Alert Rule Definitions

| Alert Name | Condition | Duration |
| :--- | :--- | :--- |
| **KubeCPUQuotaOvercommit** | CPU usage > 150% | 5 minutes |
| **KubeMemoryQuotaOvercommit** | Memory usage > 150% | 5 minutes |
| **KubeQuotaAlmostFull** | CPU/Memory usage between 90% and 100% | 15 minutes |
| **KubeQuotaFullyUsed** | CPU/Memory usage = 100% | 15 minutes |
| **KubeQuotaExceeded** | CPU/Memory usage > 100% | 15 minutes |

### Verifying ResourceQuota Status

To inspect your current resource usage, use the `kubectl get resourcequota -A` command. This helps correlate your manual observations with the alert triggers.

**Example Output:**

For a `ResourceQuota` named `default-kflsw` in the `quota-test` namespace:

```sh
NAMESPACE    NAME            REQUEST   LIMIT
quota-test   default-kflsw             limits.cpu: 2015m/3, limits.memory: 4797464313/5000Mi
...
```

In this instance, the memory usage 4797464313(4575Mi) is approximately 91.5% of the 5000Mi limit, which triggers the **KubeQuotaAlmostFull** alert once the 15-minute duration threshold is surpassed.

### Observing Alerts in Harvester

Once threshold conditions are met and the duration has elapsed, alerts transition to the "Firing" state. Use the following steps to navigate to your monitoring dashboard:

1.  **Access Addons:** Go to the **Advanced** section of the Harvester dashboard and select **Addons**.
2.  **Open Monitoring:** Click on the **rancher-monitoring** addon.
3.  **Launch Prometheus:** Switch to the **Prometheus** tab and click the **Prometheus Graph** link.
4.  **Filter Alerts:** Within the Prometheus interface, click the **Alerts** tab.
5.  **Locate Rules:** Search for `kubernetes-resources` to view the status of your ResourceQuota alerts.

*Figure: Alert status for the `ResourceQuota` `default-kflsw`.*

![](/img/v1.9/rancher/resourcequota-alerts.png)

To integrate external notifications, refer to [Configure AlertmanagerConfig](../monitoring/harvester-monitoring.md#configure-alertmanagerconfig-from-webui) to forward alerts to a central monitoring or notification server.

For more information on managing alerts, see [View and Manage Alerts](../monitoring/harvester-monitoring.md#view-and-manage-alerts).

For troubleshooting guidance, refer to the [Prometheus Operator Runbooks](https://runbooks.prometheus-operator.dev/runbooks/kubernetes/kubequotaalmostfull/).
