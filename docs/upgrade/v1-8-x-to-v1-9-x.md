---
sidebar_position: 2
sidebar_label: Upgrade from v1.8.x to v1.9.x
title: "Upgrade from v1.8.x to v1.9.x"
---

<head>
  <link rel="canonical" href="https://docs.harvesterhci.io/v1.8/upgrade/v1-8-x-to-v1-9-x"/>
</head>

## General Information

An **Upgrade** button appears on the **Dashboard** screen whenever a new Harvester version that you can upgrade to becomes available. For more information, see [Start an upgrade](./automatic.md#start-an-upgrade).

Clusters running v1.8.x can upgrade to v1.9.x directly because Harvester allows a maximum of one minor version upgrade for underlying components. For more information, see [Upgrade paths](./automatic.md#upgrade-paths).

For information about upgrading Harvester in air-gapped environments, see [Prepare an air-gapped upgrade](./automatic.md#prepare-an-air-gapped-upgrade).

### Update Harvester UI Extension on Rancher v2.15

You must use a compatible version (v1.9.x) of the Harvester UI Extension to import Harvester v1.9.x clusters on Rancher v2.15.

1. On the Rancher UI, go to **local > Apps > Repositories**.

1. Locate the repository named **harvester**, and then select **⋮ > Refresh**.

1. Go to the **Extensions** screen.

1. Locate the extension named **Harvester**, and then click **Update**.

1. Select a compatible version, and then click **Update**.

1. Allow some time for the extension to be updated and then refresh the screen.
---

## Known Issues

### 1. Upgrade Gets Stuck in a Crash Loop After the CDI Importer Pod Is OOM-Killed

During Phase 1 (Provision an Upgrade Repository Virtual Machine), the Containerized Data Importer (CDI) downloads the release ISO and converts it to a raw disk image using `qemu-img convert -t writeback`, which buffers converted data in memory. On slower destination storage, this buffer can grow until it exceeds the CDI importer pod's memory limit, causing the pod to be OOM-killed.

This issue stems from the CDI configuration already running on the **source** cluster, not the target release. Clusters still running v1.8.0 use the default importer pod memory limit of `600M`, which is prone to this failure. The limit was raised to `2G` starting in v1.8.1, but sufficiently slow storage or large images can still exceed even the higher limit.

After the importer pod is OOM-killed, its `/data` PVC (unlike the `/scratch` PVC) is not cleaned up automatically. A partially converted disk image remains, so the next retry miscalculates the available space and fails immediately, leaving the pod crash-looping indefinitely.

:::note

This issue mostly happens when upgrading from v1.8.0. v1.8.0 does not have the `2G` memory-limit fix yet. Clusters running v1.8.1 or later already have the fix, so they are less likely to hit this issue.

:::

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
