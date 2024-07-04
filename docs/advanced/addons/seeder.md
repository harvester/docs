---
sidebar_position: 4
sidebar_label: Seeder
title: "Seeder"
---

<head>
  <link rel="canonical" href="https://docs.harvesterhci.io/v1.2/advanced/seeder"/>
</head>

_Available as of v1.2.0_

_Unavailable on ARM64 architecture_

The `harvester-seeder` addon lets you perform out-of-band operations on underlying nodes. 

This addon can also discover hardware and hardware events for bare-metal nodes that support redfish-based access and then associate the hardware with the corresponding Harvester nodes.

You must enable the `harvester-seeder` addon from the **Addons** page to get started.

![](/img/v1.2/vm-import-controller/EnableAddon.png)

Once the addon is enabled, find the desired host and select **Edit Config** and go to the **Out-Of-Band Access** tab.

![](/img/v1.2/seeder/EditConfig.png)

![](/img/v1.2/seeder/OutOfBandAccess.png)

`seeder` leverages `ipmi` to manage the underlying node hardware.

Hardware discovery and event detection require `redfish` support.

## Power operations

Once you've defined the out-of-band config for a node, you can put the node into `Maintenance` mode, which allows you to shut down or reboot the node as needed.

![](/img/v1.2/seeder/ShutdownReboot.png)

If a node is shut down, you can also select **Power On** to power it on again:

![](/img/v1.2/seeder/PowerOn.png)


## Hardware event aggregation

If you've enabled **Event** in **Out-of-Band Access**, `seeder` will leverage `redfish` to query the underlying hardware for information about component failures and fan temperatures.

This information is associated with Harvester nodes and can be used as Kubernetes events.

![](/img/v1.2/seeder/HardwareEvents.png)


:::info

Sometimes, the `Out-Of-Band Access` section may be stuck with the message `Waiting for "inventories.metal.harvesterhci.io" to be ready`. In this case, you need to refresh the page. For more information, see [this issue](https://github.com/harvester/harvester/issues/4412).

:::
