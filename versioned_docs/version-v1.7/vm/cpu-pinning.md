---
sidebar_position: 11
sidebar_label: CPU Pinning
title: "CPU Pinning"
keywords:
  - Harvester
  - harvester
  - Virtual Machine
  - virtual machine
  - CPU
  - cpu
  - CPU Pinning
  - CPU pinning
  - cpu pinning
  - CPU manager
  - cpu manager
  - static policy
description: Create VM with CPU pinning
---

<head>
  <link rel="canonical" href="https://docs.harvesterhci.io/v1.6/vm/cpu-pinning"/>
</head>

_Available as of v1.4.0_

Harvester supports VM CPU pinning. To use this feature, you must first enable the CPU Manager on the nodes, and then enable CPU pinning when you create the VM.

## Kubernetes CPU Manager

The [CPU Manager](https://kubernetes.io/docs/tasks/administer-cluster/cpu-management-policies/) feature improves CPU resource allocation in Kubernetes clusters, ensuring that workloads with strict performance needs receive stable and predictable CPU resources. This is especially important for high-performance and latency-sensitive applications.

Harvester uses the `static` CPU Manager policy when the CPU Manager is enabled. This policy manages a shared pool of CPUs that initially includes all CPUs on nodes with the following configuration:

- Pods in the [`Guaranteed`](https://kubernetes.io/docs/concepts/workloads/pods/pod-qos/#guaranteed) quality of service (QoS) class that request whole CPU cores (for example, CPU: "2") are assigned dedicated CPUs. These CPUs are "pinned" to the pod and are removed from the shared CPU pool.
- Pods in the [`Burstable`](https://kubernetes.io/docs/concepts/workloads/pods/pod-qos/#burstable) and [`BestEffort`](https://kubernetes.io/docs/concepts/workloads/pods/pod-qos/#besteffort) QoS classes share the remaining CPUs in the shared pool.

### Calculation of Shared CPU Pool

Harvester reserves CPU resources for system-level operations based on the [GKE formula](https://cloud.google.com/kubernetes-engine/docs/concepts/plan-node-sizes#cpu_reservations), with the [`systemReserved`](https://kubernetes.io/docs/tasks/administer-cluster/reserve-compute-resources/#system-reserved) and [`kubeReserved`](https://kubernetes.io/docs/tasks/administer-cluster/reserve-compute-resources/#kube-reserved) values allocated in a 2:3 ratio.

Example (node with 16 CPU cores):
```
systemReserved: 408 millicores
kubeReserved: 612 millicores
```
In this example, approximately 15 cores (14980 millicores) are available for workloads.

When a VM (pod) in the Guaranteed QoS class requests 4 CPUs, 4 cores are dedicated to that VM. Pods in the other QoS classes share the remaining 11 cores in the shared pool.

## Enable and Disable CPU Manager

When you enable the CPU Manager, Harvester sets the CPU Manager policy to `static`. When you disable the feature, Harvester switches the CPU Manager policy back to `none`. 

You must enable or disable the CPU Manager on each node separately.

1. On the Harvester UI, go to **Hosts**.

1. Locate the node in the list, and then select **⋮** > **Enable CPU Manager** or **Disable CPU Manager**.

Allow some time for Harvester to apply the corresponding CPU Manager policy.

![enable-cpu-manager](/img/v1.4/cpu-pinning/enable-cpu-manager.png)
![disable-cpu-manager](/img/v1.4/cpu-pinning/disable-cpu-manager.png)

### Limitations

- The CPU Manager cannot be enabled on the witness node.

- The CPU Manager must be enabled or disabled on each management node separately. You must wait for the operation to be completed before starting another.

- VMs with CPU pinning enabled must be stopped before CPU Manager is disabled on the corresponding node.

## Enable CPU Pinning on a New VM

1. Verify that CPU Manager is enabled on one or more nodes.

  :::note important

  Ensure that at least one node has CPU Manager enabled. Otherwise, the VM will be stuck in the `unschedulable` state after startup. For more information, see [Node Affinity Rules](./create-vm.md#related-cpu-pinning-concepts).

  :::

1. Go to **Virtual Machines**.

1. Click **Create**.

  ![create-vm](/img/v1.4/cpu-pinning/create-vm.png)

1. On the **Advanced Options** tab, select **Enable CPU Pinning**.

  ![vm-advanced-options](/img/v1.4/cpu-pinning/vm-advanced-options.png)

1. Click **Save**.

Enabling CPU pinning adds `dedicatedCpuPlacement: true` to `.spec.template.spec.domain.cpu` in the virtual machine configuration (YAML). When `dedicatedCpuPlacement` is set to `true`, the CPU and memory resource requests are automatically set to match the limits to ensure that the criteria for Guaranteed QoS are met.

Because the requests and limits are identical, CPU and memory [Resource Overcommit](./resource-overcommit.md) settings do not apply to VMs with CPU pinning enabled.

:::note

To use CPU pinning on an existing VM, you must restart the VM after enabling the feature and saving the change.

:::

## VM Live Migration

VMs with CPU pinning enabled can be migrated only if the CPU Manager is enabled on the target node.

## Upgrades

When upgrading a node, Harvester drains all pods and live migrates VMs to another node. To avoid interruptions to the upgrade process, ensure that the CPU Manager is enabled on other nodes and sufficient resources are available whenever you use VMs with CPU pinning enabled.
