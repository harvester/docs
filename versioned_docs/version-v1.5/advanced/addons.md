---
sidebar_position: 5
sidebar_label: Addons
title: "Addons"
---

<head>
  <link rel="canonical" href="https://docs.harvesterhci.io/v1.5/advanced/addons"/>
</head>

Harvester makes optional functionality available as Addons.

One of the key reasons for the same is to ensure that Harvester installation footprint can be kept low while allowing users to enable/disable functionality based on their use case or requirements.

Some level of customization is allowed for each addon, which depends on the underlying addon.

_Available as of v1.1.0_

Harvester v1.3.0 ships with six Addons:
* [pcidevices-controller](./addons/pcidevices.md)
* [vm-import-controller](./addons/vmimport.md)
* [rancher-monitoring](../monitoring/harvester-monitoring.md)
* [rancher-logging](../logging/harvester-logging.md)
* [harvester-seeder](./addons/seeder.md)
* [nvidia-driver-toolkit](./addons/nvidiadrivertoolkit)

![](/img/v1.2/addons/AddonsV120.png)

:::note

**harvester-seeder** is released as an experimental feature in Harvester v1.2.0 and has an **Experimental** label added to the **Name**.

:::

You can enable a **Disabled** by choosing an addon and selecting **⋮** > **Enable** from the **Basic** tab.

![](/img/v1.2/addons/enable-rancher-logging-addon.png)

When the addon is enabled successfully, the **State** will be **DeploySuccessful**.

![](/img/v1.2/addons/deploy-successful-addon.png)

You can disable an **Enabled** by choosing an addon and selecting **⋮** > **Disable** or from the **Basic** tab.

![](/img/v1.2/addons/disable-rancher-monitoring-addon.png)

When the addon is disabled successfully, the **State** will be **Disabled**.

:::note

When an addon is disabled, the configuration data is stored to reuse when the addon is enabled again.

:::