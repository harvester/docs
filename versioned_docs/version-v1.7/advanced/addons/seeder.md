---
sidebar_position: 4
sidebar_label: Harvester Seeder
title: "Harvester Seeder (Experimental)"
keywords:
- add-on
- addon
- out-of-band
- harvester-seeder
- Seeder
Description: Perform out-of-band operations on Harvester hosts via IPMI and discover hardware events via Redfish
---

<head>
  <link rel="canonical" href="https://docs.harvesterhci.io/v1.6/advanced/addons/seeder"/>
</head>

:::note

**harvester-seeder** is an *experimental* add-on. For more information about experimental features, see [Feature Labels](../../getting-started/document-conventions.md#feature-labels).

:::

The **harvester-seeder** add-on allows you to perform out-of-band operations on Harvester hosts using the Intelligent Platform Management Interface (IPMI).

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

## Enabling the Add-On and Configuring Hosts

1. On the Harvester UI, go to **Advanced** > **Add-ons**.

1. Select **harvester-seeder**, and then select **⋮** > **Enable**.

    After a few seconds, the value of **State** changes to **DeploySuccessful**.

    ![](/img/v1.2/vm-import-controller/EnableAddon.png)

1. Go to the **Hosts** screen.

    You must edit the configuration of each host listed on this screen.

1. Select a host, and then select **⋮** > **Edit Config**.

    ![](/img/v1.2/seeder/EditConfig.png)

1. On the **Out-of-Band Access** tab, select **Enabled**, configure the settings, and then select **Save**.

    The add-on uses the information to connect to your IPMI interface.

    ![](/img/v1.2/seeder/OutOfBandAccess.png)

## Power-Related Operations

You can use the Harvester UI to shut down and reboot hosts once the Out-of-Band Access settings are configured. However, you must first enable [Maintenance Mode](../../host/host.md#node-maintenance), which automatically migrates all VMs to other nodes. **harvester-seeder** communicates with the hosts via IPMI when performing the selected operation.

![](/img/v1.2/seeder/ShutdownReboot.png)

You can also power on VMs while Maintenance Mode is enabled.

![](/img/v1.2/seeder/PowerOn.png)

## Hardware Event Aggregation

If you selected **Enabled** in the **Event** section of the **Out-of-Band Access** settings screen, **harvester-seeder** leverages Redfish to query the hardware for information about component failures and fan temperatures. The information is converted to Kubernetes events during hardware reconciliation and is subsequently handled by the Kubernetes garbage collection policy. Harvester stores these events for 1 hour by default.

![](/img/v1.2/seeder/HardwareEvents.png)

## Troubleshooting

The **Out-of-Band Access** settings screen may become unresponsive and display the message `Waiting for "inventories.metal.harvesterhci.io" to be ready`. You must refresh the page whenever this occurs. For more information, see [Issue #4412](https://github.com/harvester/harvester/issues/4412).

If you encounter persistent issues while using **harvester-seeder**, submit the following to SUSE Support:

- Support bundle
- Output of the command `kubectl get machine -n harvester-system -o yaml`
