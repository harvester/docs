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

### 1. Upgrade Stuck in Crash Loop After CDI Importer Pod Is OOM-Killed

During Phase 1 (Provision an Upgrade Repository Virtual Machine), the Containerized Data Importer (CDI) downloads the target ISO file and converts it to a raw disk image using `qemu-img convert -t writeback`, which buffers converted data in memory. On slow destination storage, this buffer can grow until it exceeds the CDI importer pod's memory limit, causing the pod to be OOM-killed.

This issue stems from the CDI configuration running on the **source** cluster rather than the target release. Clusters running v1.8.0 use the default importer pod memory limit of `600M`, which is prone to this failure. The limit was raised to `2G` in v1.8.1, but slow destination storage and large ISO images can still drive memory consumption past this threshold.

After the importer pod is OOM-killed, its `/data` PVC is not cleaned up automatically (unlike the `/scratch` PVC). The partially converted disk image remains on the volume, causing subsequent retries to miscalculate available storage space and fail immediately, leaving the pod crash-looping indefinitely.

:::note

This issue mostly happens when upgrading from v1.8.0. v1.8.0 does not have the `2G` memory-limit fix yet. Clusters running v1.8.1 or later already have the fix, so they are less likely to hit this issue.

:::

#### Symptoms

- The `importer-prime-*` pod in the `harvester-system` namespace is in a `CrashLoopBackOff` state.

- Node kernel logs indicate an `oom-kill` event for the `virt-cdi-import` and `qemu-img` processes, typically occurring during the initial crash:
  ```
  Memory cgroup out of memory: Killed process ... (virt-cdi-import) ...
  Memory cgroup out of memory: Killed process ... (qemu-img) ...
  ```
- Subsequent restarts do not trigger an OOM-kill. Instead, the pod fails with an error message similar to the following:
  ```
  Unable to convert source data to target format: virtual image size <X> is larger than the reported available storage <Y>. A larger PVC is required
  ```

#### Workaround

1. [Stop the ongoing upgrade](./troubleshooting.md#stop-the-ongoing-upgrade).

   This action deletes the `Upgrade` CR along with its associated DataVolume and PVCs, clearing the stale `/data` content.

1. Edit the `harvester` ManagedChart resource.

   ```bash
   kubectl edit managedchart.management.cattle.io harvester -n fleet-local
   ```

1. Increase the CDI importer pod's memory limit beyond the default value.

   Under `spec.values`, configure a higher value for the `cdi.spec.config.podResourceRequirements.limits.memory` field based on available node memory. Slow storage backends and large images may require a higher allocation.

   If the `cdi` key (or any part of its nested path) does not exist under `spec.values`, add the missing structure.

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


1. Verify that the CDI CR reflects the change:

   ```bash
   kubectl get cdi cdi -o jsonpath='{.spec.config.podResourceRequirements.limits.memory}{"\n"}'
   ```

1. Restart the upgrade.

1. After the upgrade completes successfully, remove the `podResourceRequirements` override you added to the `harvester` ManagedChart resource in step 3.

    The version you upgraded to already includes the memory-limit fix, so the override is no longer needed.

Related issues: [#11143](https://github.com/harvester/harvester/issues/11143) and [#10056](https://github.com/harvester/harvester/issues/10056)

### 2. Upgrade Is Stuck in "Images preloaded"

In rare cases, an upgrade from v1.8.x to v1.9.0 may remain in the **Images preloaded** state after a node reboots into the new operating system. This occurs when the upgrade controller changes the node's upgrade state to `Succeeded` before removing the `harvesterhci.io/pendingOSImage` annotation.

#### Identifying the Issue

1. Check the latest `Upgrade` CR:

  ```bash
  kubectl -n harvester-system get upgrades.harvesterhci.io \
    -l harvesterhci.io/latestUpgrade=true \
    -o yaml
  ```

  When the upgrade stops progressing, check if the output shows an upgraded node with `state: Succeeded` while the remaining nodes are stuck in the `Images preloaded` state.

1. Check the upgraded node's current and pending operating system images:

  ```bash
  kubectl get node <node-name> \
    -o custom-columns='NAME:.metadata.name,CURRENT-OS-IMAGE:.status.nodeInfo.osImage,PENDING-OS-IMAGE:.metadata.annotations.harvesterhci\.io/pendingOSImage'
  ```

  Check if the value of `PENDING-OS-IMAGE` matches `CURRENT-OS-IMAGE`.

#### Workaround

Apply this workaround only if all conditions described in the previous section are met.

1. Change the affected node's state in the Upgrade CR back to `Waiting Reboot`:

  Replace `<upgrade-name>` with the name of the `Upgrade` CR, and `<node-name>` with the name of the affected node.

  ```bash
  kubectl -n harvester-system patch upgrades.harvesterhci.io <upgrade-name> \
    --type=json \
    -p '[{"op":"replace","path":"/status/nodeStatuses/<node-name>/state","value":"Waiting Reboot"}]'
  ```

1. Verify that the upgrade resumes once the upgrade controller reconciles the node state.

Related issue: [#11543](https://github.com/harvester/harvester/issues/11543)
