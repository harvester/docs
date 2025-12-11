---
sidebar_position: 5
sidebar_label: Add-ons
title: "Add-ons"
---

<head>
  <link rel="canonical" href="https://docs.harvesterhci.io/v1.6/advanced/addons"/>
</head>

Harvester provides optional features as add-ons to maintain a minimal installation footprint. This design allows you to easily enable or disable functionality based strictly on your use case and requirements. You can customize the settings of each add-on, though the level of customization depends on the underlying software.

The following add-ons are available in this version:

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
* [virtual-machine-auto-balance](./addons/virtual-machine-auto-balance.md) (Experimental)

You can enable and disable add-ons on the **Add-ons** screen of the Harvester UI.

| Operation | Action | New State |
| --- | --- | --- |
| Enabling an add-on | Select the add-on, and then select **⋮** > **Enable**. | **DeploySuccessful** |
| Disabling an add-on | Select the add-on, and then select **⋮** > **Disable**. | **Disabled** |

:::note

Harvester stores the configuration data of disabled add-ons, allowing for immediate reuse upon re-enabling.

:::
