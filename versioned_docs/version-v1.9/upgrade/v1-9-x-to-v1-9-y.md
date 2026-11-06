---
sidebar_position: 2
sidebar_label: Upgrade from v1.9.x to v1.9.y
title: "Upgrade from v1.9.x to v1.9.y"
---

<head>
  <link rel="canonical" href="https://docs.harvesterhci.io/v1.9/upgrade/v1-9-x-to-v1-9-y"/>
</head>

## General Information

An **Upgrade** button appears on the **Dashboard** screen whenever a new Harvester version that you can upgrade to becomes available. For more information, see [Start an upgrade](./automatic.md#start-an-upgrade).

For information about upgrading Harvester in air-gapped environments, see [Prepare an air-gapped upgrade](./automatic.md#prepare-an-air-gapped-upgrade).

### Failed Live Migrations Block Upgrades by Default

When you upgrade to v1.9.1 or later, Harvester does not shut down a virtual machine if its live migration fails during the pre-drain phase of a node upgrade. The virtual machine keeps running, and the upgrade waits while the migration is retried.

:::caution

The upgrade remains blocked until the live migration succeeds or the virtual machine is stopped. No timeout applies. For more information, see [Unblocking a Waiting Upgrade](./automatic.md#unblocking-a-waiting-upgrade).

:::

To have Harvester shut down these virtual machines instead, set the `shutdownVMOnMigrationFailure` field of the [`upgrade-config`](../advanced/settings.md#upgrade-config) setting to `true` before starting the upgrade. The virtual machines remain stopped after the upgrade, and you must start them manually. For more information, see [Keeping the Automatic Shutdown Behavior](./automatic.md#keeping-the-automatic-shutdown-behavior).
