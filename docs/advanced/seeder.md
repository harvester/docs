---
sidebar_position: 7
sidebar_label: Seeder
title: "Seeder"
---

<head>
  <link rel="canonical" href="https://docs.harvesterhci.io/v1.1/advanced/seeder"/>
</head>

_Available as of v1.2.0_

The `harvester-seeder` addon, allows users to perform out-of-band operations on underlying nodes. 

Baremetal nodes that support redfish based access, the addon can also perform hardware discover, hardware events and correlate these with corresponding harvester nodes.

To get start the user needs to enable `harvester-seeder` addon from the Addons page

![](/img/v1.2/vm-import-controller/EnableAddon.png)

Once he addon is enabled, users can `Edit Config` for a specific host, to access `Out-Of-Band` definition page

![](/img/v1.2/seeder/EditConfig.png)

![](/img/v1.2/seeder/OutOfBandAccess.png)

`seeder` leverages `ipmi` for performing management operations on the underlying node hardware.

`redfish` support is needed for optional hardware discovery and event detection capability.

## Performing power operations

Once an out-of-band config is defined for a node. Placing the node successfully into `Maintenance Mode`, allows users to Shutdown or Reboot the node.

![](/img/v1.2/seeder/ShutdownReboot.png)

A node once Shutdown, allows users to subsequently power it on.

![](/img/v1.2/seeder/PowerOn.png)


## Hardware event aggregation

If `Event` collection is enabled in `Out-of-Band Access`, then `seeder` leverages `redfish` to query the underlying hardware for information about component failures and fan temperatures.

This information is correlated with Harvester nodes, and made available as kubernetes events

![](/img/v1.2/seeder/HardwareEvents.png)