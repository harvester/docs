---
sidebar_position: 2
sidebar_label: Upgrade from v1.7.x to v1.7.y
title: "Upgrade from v1.7.x to v1.7.y"
---

<head>
  <link rel="canonical" href="https://docs.harvesterhci.io/v1.8/upgrade/v1-7-x-to-v1-7-y"/>
</head>

## General Information

An **Upgrade** button appears on the **Dashboard** screen whenever a new Harvester version that you can upgrade to becomes available. For more information, see [Start an upgrade](./automatic.md#start-an-upgrade).

For information about upgrading Harvester in air-gapped environments, see [Prepare an air-gapped upgrade](./automatic.md#prepare-an-air-gapped-upgrade).

---

## Known Issues

### 1. Upgrade Is Stuck in the "Post-draining" State

During the node draining process, the `upgrade-repo` deployment may get stuck when its Longhorn volume remains in the "Attaching" state. This causes the upgrade flow to stall in the "Post-draining" phase, since the post-drain jobs wait for the `upgrade-repo` deployment to become ready before proceeding.

The workaround is to delete the Longhorn replica of the `upgrade-repo` volume on the drained node. This allows the volume to attach and the upgrade flow to continue. Note that any node being drained during the upgrade may encounter this issue, so this workaround may need to be applied whenever it occurs.

Related issues: [#9597](https://github.com/harvester/harvester/issues/9597) and [#12226](https://github.com/longhorn/longhorn/issues/12226)


### 2. Unnecessary live-migrations during the upgrade

Harvester v1.6.x enables [CPU and memory hot-plugging](../vm/cpu-memory-hotplug/) for virtual machines through KubeVirt's `LiveMigrate` workload update strategy. However, when the KubeVirt operator is upgraded, this feature triggers simultaneous live-migration of all running VMs to update their virt-launcher pods immediately. This mass migration can overwhelm cluster resources and cause performance degradation.

To prevent this issue, you can temporarily disable the `LiveMigrate` workload update method before the upgrade and re-enable it after the upgrade completes. VMs will migrate naturally during node upgrades, allowing the virt-launcher image to be updated gradually.

:::note

Starting from v1.8.0, this process is handled automatically. The workaround described below is only necessary when upgrading to a version before v1.8.0.

:::

Please see the instruction on this [page](./v1-5-x-to-v1-6-x.md#10-unnecessary-live-migrations-during-the-upgrade).

### 3. Upgrade Stalls During Image Preloading Due to System-Upgrade-Controller Failing to Retry a Plan

During Phase 2 (Preload Container Images) of the upgrade, Harvester creates a system-upgrade-controller (SUC) plan for each node to preload the container images required for the new release. If SUC fails to reschedule a plan job after a transient failure, the affected node's plan remains stuck in the `applying` state, stalling the upgrade indefinitely.

This is an intermittent issue: once a plan job fails and is deleted (by the default job TTL of 900 seconds), SUC may stop rescheduling it for the affected node.

:::note

Although the prepare stage is the most common upgrade stage where this issue manifests, the same SUC behavior can also affect other stages that rely on SUC plans.

:::

#### Symptoms

- The upgrade has shown no progress for an extended period (typically more than 30 minutes) while in the image preloading phase.
- No job has been created for the affected node's prepare plan in the `cattle-system` namespace:

  ```bash
  kubectl get jobs -n cattle-system | grep prepare
  ```

- One or more SUC prepare plans are stuck in the `applying` state:

  ```bash
  kubectl get plans.upgrade.cattle.io -n cattle-system | grep prepare
  ```

  Check the status of the stuck plan (replace `<plan-name>` with the actual plan name from the previous command):

  ```bash
  kubectl get plans.upgrade.cattle.io <plan-name> -n cattle-system -o yaml | yq .status
  ```

  If the issue is present, the affected node appears under `applying`, and the `Complete` condition is `False`:

  ```yaml
  applying:
  - <node-name>
  conditions:
  - lastUpdateTime: "..."
    reason: SyncJob
    status: "False"
    type: Complete
  ```

#### Workaround

Restart the `system-upgrade-controller` deployment to force SUC to reconcile all plans and reschedule any stuck jobs:

```bash
kubectl rollout restart deployment/system-upgrade-controller -n cattle-system
```

After the restart, SUC reschedules the plan job for the affected node. The upgrade should resume automatically within a few minutes.

Related issue: [#9880](https://github.com/harvester/harvester/issues/9880)

### 4. Upgrade Gets Stuck in a Crash Loop After the CDI Importer Pod Is OOM-Killed

During Phase 1 (Provision an Upgrade Repository Virtual Machine), the Containerized Data Importer (CDI) downloads the release ISO and converts it to a raw disk image using `qemu-img convert -t writeback`, which buffers converted data in memory. On slower destination storage, this buffer can grow until it exceeds the CDI importer pod's memory limit, causing the pod to be OOM-killed.

This issue stems from the CDI configuration already running on the **source** cluster, not the target release. Clusters still running v1.7.0 or v1.7.1 use the default importer pod memory limit of `600M`, which is prone to this failure. The limit was raised to `2G` starting in v1.7.2, but sufficiently slow storage or large images can still exceed even the higher limit.

After the importer pod is OOM-killed, its `/data` PVC (unlike the `/scratch` PVC) is not cleaned up automatically. A partially converted disk image remains, so the next retry miscalculates the available space and fails immediately, leaving the pod crash-looping indefinitely.

#### Symptoms

- The `importer-prime-*` pod in the `harvester-system` namespace is in `CrashLoopBackOff`.
- Node kernel logs show an `oom-kill` event for the `virt-cdi-import` and `qemu-img` processes, typically only on the first crash:
  ```
  Memory cgroup out of memory: Killed process ... (virt-cdi-import) ...
  Memory cgroup out of memory: Killed process ... (qemu-img) ...
  ```
- On subsequent restarts, the pod no longer gets OOM-killed. Instead, the importer logs show an error similar to:
  ```
  Unable to convert source data to target format: virtual image size <X> is larger than the reported available storage <Y>. A larger PVC is required
  ```

#### Workaround

1. If the upgrade is already stuck in this crash loop, [stop the ongoing upgrade](./troubleshooting.md#stop-the-ongoing-upgrade) first. This deletes the `Upgrade` CR along with its associated DataVolume and PVCs, clearing the stale `/data` content.

1. Edit the `harvester` ManagedChart resource to raise the CDI importer pod's memory limit beyond the default:

   ```bash
   kubectl edit managedchart.management.cattle.io harvester -n fleet-local
   ```

   Under `spec.values`, add or update the `cdi.spec.config.podResourceRequirements.limits.memory` field to a higher value. The `cdi` key (or parts of its nested path) may not already exist under `spec.values`; if so, add the missing nested structure as shown below:

   ```yaml
   spec:
     values:
       cdi:
         spec:
           config:
             podResourceRequirements:
               limits:
                 memory: 4G
   ```

   :::caution

   Only modify the `cdi.spec.config.podResourceRequirements.limits.memory` field. Do not modify or delete any other existing fields in the `harvester` ManagedChart resource.

   The YAML snippet is an excerpt, not a full resource manifest.

   :::

   Adjust the value based on available node memory. Larger upgrade images or slower storage backends may require an even higher limit.

1. Verify that the CDI CR reflects the change:

   ```bash
   kubectl get cdi cdi -o jsonpath='{.spec.config.podResourceRequirements.limits.memory}{"\n"}'
   ```

1. Restart the upgrade.

1. After the upgrade completes successfully, remove the `podResourceRequirements` override you added to the `harvester` ManagedChart resource in step 2. The version you upgraded to already includes the memory-limit fix, so the override is no longer needed.

Related issues: [#11143](https://github.com/harvester/harvester/issues/11143) and [#10056](https://github.com/harvester/harvester/issues/10056)
