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
