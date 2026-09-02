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

---

## Known Issues

### 1. Upgrade Is Stuck in "Images preloaded"

In rare cases, an upgrade from v1.8.x to v1.9.0 may remain in the **Images preloaded** state after the operating system is upgraded on a node. The upgrade controller marks the node `Succeeded` before removing the `harvesterhci.io/pendingOSImage` annotation.

#### Identifying the Issue

Check the latest Upgrade CR:

```bash
kubectl -n harvester-system get upgrades.harvesterhci.io \
  -l harvesterhci.io/latestUpgrade=true \
  -o yaml
```

When the upgrade has stopped progressing, this issue is present if the output shows an upgraded node with `state: Succeeded` while the remaining nodes are still in the `Images preloaded` state.

Check the upgraded node's current and pending operating system images:

```bash
kubectl get node <node-name> \
  -o custom-columns='NAME:.metadata.name,CURRENT-OS-IMAGE:.status.nodeInfo.osImage,PENDING-OS-IMAGE:.metadata.annotations.harvesterhci\.io/pendingOSImage'
```

Use the workaround only when the status pattern described above is present, `PENDING-OS-IMAGE` is not empty, and it matches `CURRENT-OS-IMAGE`.

#### Workaround

Change the affected node's state in the Upgrade CR back to `Waiting Reboot`:

```bash
kubectl -n harvester-system patch upgrades.harvesterhci.io <upgrade-name> \
  --type=json \
  -p '[{"op":"replace","path":"/status/nodeStatuses/<node-name>/state","value":"Waiting Reboot"}]'
```

Replace `<upgrade-name>` and `<node-name>` with the names of the Upgrade CR and affected node. The upgrade resumes after the upgrade controller reconciles the node.

Related issue: [#11543](https://github.com/harvester/harvester/issues/11543)
