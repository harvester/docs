---
sidebar_position: 3
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