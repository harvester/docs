---
sidebar_position: 10
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
  <link rel="canonical" href="https://docs.harvesterhci.io/v1.4/vm/CPU-pinning"/>
</head>

_Available as of v1.4.0_

Harvester supports VM CPU pinning. To enable this feature, first enable the CPU Manager on the nodes, then enable CPU pinning while creating the VM.

## What is CPU Manager ?

[Kubernetes CPU Manager](https://kubernetes.io/docs/tasks/administer-cluster/cpu-management-policies/) improves CPU resource allocation in Kubernetes clusters, ensuring that workloads with strict performance needs receive stable and predictable CPU resources. This is especially important for high-performance or latency-sensitive applications.

Harvester uses the static CPU manager policy when enable CPU manager, this policy manages a shared pool of CPUs that initially contains all CPUs in the node where:
- Pods in the [Guaranteed QoS class](https://kubernetes.io/docs/concepts/workloads/pods/pod-qos/#guaranteed) that request whole CPU cores (e.g., CPU: "2") are assigned dedicated CPUs, and these CPUs are "pinned" to the pod. These dedicated CPUs are removed from the shared CPU pool.
- Other pods, like [Burstable](https://kubernetes.io/docs/concepts/workloads/pods/pod-qos/#burstable) or [BestEffort QoS](https://kubernetes.io/docs/concepts/workloads/pods/pod-qos/#besteffort) pods, share the remaining CPUs from the shared pool.

### How the Shared CPU Pool is Calculated ?

Harvester reserves CPU resources for system-level operations based on the [GKE formula](https://cloud.google.com/kubernetes-engine/docs/concepts/plan-node-sizes#cpu_reservations), with [System Reserved](https://kubernetes.io/docs/tasks/administer-cluster/reserve-compute-resources/#system-reserved) and [Kube Reserved](https://kubernetes.io/docs/tasks/administer-cluster/reserve-compute-resources/#kube-reserved) allocated in a 2:3 ratio.

For instance, on a node with 16 CPU cores, this translates to:
```
systemReserved: 408 millicores
kubeReserved: 612 millicores
```
This leaves ~15 cores (14980 millicores) available for workloads.

When a VM (pod) requests 4 CPUs with Guaranteed QoS, those 4 cores are dedicated to it. The remaining pods that are not in Guaranteed QoS class share the remaining CPU pool (~11 cores).

## How to Enable/Disable CPU Manager ?

Enabling the CPU Manager sets the CPU manager policy to static. Disabling the CPU Manager switchs the policy back to the none policy. This action must be performed individually on each node.

1. Navigate to the Hosts page.
2. Click the hamburger button.
3. Select either Enable CPU Manager or Disable CPU Manager.
4. Wait ~1 minute for the action to complete.

![enable-cpu-manager](/img/v1.4/cpu-pinning/enable-cpu-manager.png)
![disable-cpu-manager](/img/v1.4/cpu-pinning/disable-cpu-manager.png)

### Limitations

- Only one master node can enable or disable the CPU Manager at a time. Note that the witness node cannot perform these actions.
- You must wait for an operation (enable/disable) to finish before starting another on the same node.
- Any VMs with CPU pinning enabled must be stopped before disabling CPU Manager on that node.

## How to create a VM with CPU Pinning ?

1. Ensure at least one node enable CPU Manager.
2. Go to Virtual Machines page, click Create. 
3. Click Advanced Options.
![create-vm](/img/v1.4/cpu-pinning/create-vm.png)
4. Scroll down to the bottom, check the Enable CPU Pinning checkbox.
![vm-advanced-options](/img/v1.4/cpu-pinning/vm-advanced-options.png)

Enabling the checkbox adds `dedicatedCpuPlacement: true` to `.spec.template.spec.domain.cpu` in the virtual machine YAML. In Harvester, when we detect that `dedicatedCpuPlacement` is set to true in the virtual machine definition, we automatically set the CPU and memory resource requests equal to the limits to ensure it meets the criteria for Guaranteed QoS.

- To enable CPU pinning for an existing VM, restart the VM after enabling this option to apply the change.
- CPU and memory [Resource Overcommit](./resource-overcommit.md) does not apply to VMs with CPU pinning, as they use Guaranteed QoS, meaning their requests and limits are the same.

## VM Live Migration
The migration of a VM with CPU pinning is mentioned in [Live Migration](./live-migration.md). However, you must ensure that the target node has CPU manager enabled; otherwise, the migration will not succeed.

## Upgrade
During an upgrade, Harvester will drain all pods on the node and live migrate VMs to another node. If there are VMs with CPU pinning enabled, ensure that the other nodes have the CPU Manager enabled. Otherwise, the upgrade process may get stuck.
