---
sidebar_position: 4
sidebar_label: Harvester Seeder
title: "Harvester Seeder"
---

<head>
  <link rel="canonical" href="https://docs.harvesterhci.io/v1.2/advanced/seeder"/>
</head>

The Harvester Seeder add-on allows you to perform out-of-band operations on Harvester hosts using the Intelligent Platform Management Interface (IPMI).

This add-on can also discover hardware and related events for hosts that support [Redfish](https://www.dmtf.org/standards/redfish)-based access, and then associate that hardware with the corresponding hosts.

## Prerequisites

Ensure that the following requirements are met before enabling the add-on.

- IPMI access is enabled on the hosts, and your user account has the necessary privileges for performing related operations.

    If you are using [ipmitool](https://github.com/ipmitool/ipmitool), you can run `ipmitool -I lanplus -H iloOriDracIPAddress -U admin -P admin sel list` to verify that both requirements are met.

- Redfish is enabled.

    You can run `curl -vk https://iloOriDracIPAddress/redfish/v1` to verify that Redfish is enabled.

- Ports 443 and 623 are reachable.

    Some IPMI implementations allow you to access devices using a web interface on port 443. However, IPMI devices are more commonly accessed using a command-line interface on UDP port 623 (IPMI over IP).

- Alerts are enabled on the hosts.

    Some hardware vendors may require that you enable alerts.

## Enable the Add-On and Configure Hosts

1. On the Harvester UI, go to **Advanced** > **Addons** screen.

1. Select **harvester-seeder**, and then select **⋮** > **Enable**.

    After a few seconds, the value of **State** changes to **DeploySuccessful**.

![](/img/v1.2/vm-import-controller/EnableAddon.png)

1. Go to the **Hosts** screen.

    You must edit the configuration of each host listed on this screen.

1. Select a host, and then select **⋮** > **Edit Config**.

![](/img/v1.2/seeder/EditConfig.png)

1. On the **Out-of-Band Access** tab, select **Enabled**, configure the settings, and then select **Save**.

    Harvester Seeder uses the information to connect to your IPMI interface.

![](/img/v1.2/seeder/OutOfBandAccess.png)

## Power-Related Operations

After configuring the out-of-band access settings, you can enable Maintenance Mode, which allows you to shut down or reboot the host as necessary.

![](/img/v1.2/seeder/ShutdownReboot.png)

If a node is shut down, you can also select **Power On** to power it on again:

![](/img/v1.2/seeder/PowerOn.png)

## Hardware Event Aggregation

If you've enabled **Event** in **Out-of-Band Access**, `seeder` will leverage `redfish` to query the underlying hardware for information about component failures and fan temperatures.

This information is associated with Harvester nodes and can be used as Kubernetes events.

![](/img/v1.2/seeder/HardwareEvents.png)


:::info

Sometimes, the `Out-Of-Band Access` section may be stuck with the message `Waiting for "inventories.metal.harvesterhci.io" to be ready`. In this case, you need to refresh the page. For more information, see [this issue](https://github.com/harvester/harvester/issues/4412).

:::