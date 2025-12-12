---
sidebar_position: 3
sidebar_label: Upgrade from v1.7.x to v1.7.y
title: "Upgrade from v1.7.x to v1.7.y"
---

<head>
  <link rel="canonical" href="https://docs.harvesterhci.io/v1.7/upgrade/v1-7-x-to-v1-7-y"/>
</head>

## General Information

An **Upgrade** button appears on the **Dashboard** screen whenever a new Harvester version that you can upgrade to becomes available. For more information, see [Start an upgrade](./automatic.md#start-an-upgrade).

For information about upgrading Harvester in air-gapped environments, see [Prepare an air-gapped upgrade](./automatic.md#prepare-an-air-gapped-upgrade).

---

## Known Issues

### 1. Upgrade Is Stuck in the "Post-draining" State

When draining a Harvester node, the upgrade-repo deployment may occasionally get stuck because its Longhorn volume remains in the attaching state. This causes the upgrade flow to stall in the Post-draining phase, since the post-drain jobs wait for the upgrade-repo deployment to become ready before proceeding.

As a workaround, you can delete the longhorn replica of the upgrade-repo volume on the drained node, which allows the volume to attach and the upgrade flow to continue.

Related issues: [#9597](https://github.com/harvester/harvester/issues/9597) and [longhorn#12226](https://github.com/longhorn/longhorn/issues/12226)
