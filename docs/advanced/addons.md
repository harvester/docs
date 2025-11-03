---
sidebar_position: 5
sidebar_label: Add-ons
title: "Add-ons"
---

<head>
  <link rel="canonical" href="https://docs.harvesterhci.io/v1.6/advanced/add-ons"/>
</head>

Harvester makes optional functionality available as add-ons.

One of the key reasons for the same is to ensure that Harvester installation footprint can be kept low while allowing users to enable/disable functionality based on their use case or requirements.

Some level of customization is allowed for each add-on, which depends on the underlying add-on.

Harvester provides the following add-ons:

* [harvester-csi-driver-lvm](./addons/lvm-local-storage.md) (Experimental)
* [harvester-seeder](./addons/seeder.md) (Experimental)
* [harvester-vm-dhcp-controller](./addons/managed-dhcp.md) (Experimental)
* [kubeovn-operator](./addons/kubeovn-operator.md)
* [nvidia-driver-toolkit](./addons/nvidiadrivertoolkit)
* [pcidevices-controller](./addons/pcidevices.md) 
* [rancher-logging](../logging/harvester-logging.md)
* [rancher-monitoring](../monitoring/harvester-monitoring.md)
* [rancher-vcluster](./addons/rancher-vcluster.md) (Experimental)
* [vm-import-controller](./addons/vmimport.md)

Select an add-on and then select **⋮** > **Enable** from the **Basic** tab.

![](/img/v1.2/addons/enable-rancher-logging-addon.png)

When the add-on is enabled successfully, the **State** will be **DeploySuccessful**.

![](/img/v1.2/addons/deploy-successful-addon.png)

You can disable an **Enabled** by choosing an add-on and selecting **⋮** > **Disable** or from the **Basic** tab.

![](/img/v1.2/addons/disable-rancher-monitoring-addon.png)

When the add-on is disabled successfully, the **State** will be **Disabled**.

:::note

When an add-on is disabled, the configuration data is stored to reuse when the add-on is enabled again.

:::