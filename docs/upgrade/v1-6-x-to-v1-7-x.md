---
sidebar_position: 3
sidebar_label: Upgrade from v1.6.x to v1.7.x
title: "Upgrade from v1.6.x to v1.7.x"
---

<head>
  <link rel="canonical" href="https://docs.harvesterhci.io/v1.7/upgrade/v1-6-x-to-v1-7-x"/>
</head>

## General Information

An **Upgrade** button appears on the **Dashboard** screen whenever a new Harvester version that you can upgrade to becomes available. For more information, see [Start an upgrade](./automatic.md#start-an-upgrade).

Clusters running v1.6.x can upgrade to v1.7.x directly because Harvester allows a maximum of one minor version upgrade for underlying components. Harvester v1.6.0 and v1.6.1 use the same minor version of RKE2 (v1.33), while Harvester v1.7.0 and v1.7.1 use the next minor version (v1.34). For more information, see [Upgrade paths](./automatic.md#upgrade-paths).

For information about upgrading Harvester in air-gapped environments, see [Prepare an air-gapped upgrade](./automatic.md#prepare-an-air-gapped-upgrade).

:::caution

v1.7.x uses NetworkManager instead of wicked, which was used in earlier versions of Harvester. If you modified the management interface configuration after the initial installation, you must perform additional manual steps to avoid issues during the upgrade. For more information, see [Migration from wicked to NetworkManager](#migration-from-wicked-to-networkmanager).

:::

:::info important

Host IP addresses configured via DHCP may change during upgrades. This prevents the cluster from starting correctly and requires manual recovery steps. For details, see [Host IP address may change during upgrade when using DHCP](#1-host-ip-address-may-change-during-upgrade-when-using-dhcp).

:::

### Update Harvester UI Extension on Rancher v2.13

You must use a compatible version (v1.7.x) of the Harvester UI Extension to import Harvester v1.7.x clusters on Rancher v2.13.

1. On the Rancher UI, go to **local > Apps > Repositories**.

1. Locate the repository named **harvester**, and then select **⋮ > Refresh**.

1. Go to the **Extensions** screen.

1. Locate the extension named **Harvester**, and then click **Update**.

1. Select a compatible version, and then click **Update**.

1. Allow some time for the extension to be updated and then refresh the screen.

### Migration from wicked to NetworkManager

Harvester v1.7.x transitions from wicked to NetworkManager for network management. Because there is no direct 1:1 mapping between the legacy `ifcfg` files and NetworkManager's connection profiles, an in-place migration of the existing network configuration is not possible.

During upgrades, Harvester generates new NetworkManager connection profiles using the original installation settings stored in `/oem/harvester.config`. The legacy `ifcfg` files in `/oem/90_custom.yaml` remain on the system, but NetworkManager ignores these files and instead stores its configuration under `/etc/NetworkManager`.

| Scenario | Action Required |
| --- | --- |
| You installed v1.1 or later, and never manually modified the management interface or DNS configuration. | None |
| You manually modified the management interface configuration by editing the `/oem/90_custom.yaml` file or by adding CloudInit resources to the `ifcfg` files. | **Required** (Custom configuration will be ignored after the upgrade to v1.7.0.) |

If action is required, choose one of the following methods:

- Pre-upgrade (Recommended): Edit the `/oem/harvester.config` file on each node. Configure the relevant network settings, particularly `os.dns_nameservers` and `install.management_interface`. For more information, see [Harvester Configuration](../install/harvester-configuration.md).

  :::note

  If you initially installed v1.0, ensure that `install.management_interface` follows the updated schema required by later Harvester versions.

  :::

- Post-upgrade: Use the `nmcli` tool to manually re-apply your custom configuration to the new NetworkManager connection profiles.

If you encounter any issues during the upgrade, you can perform the following workarounds:

| Scenario | Workaround | Result |
| --- | --- | --- |
| A node becomes stuck in "Waiting Reboot" state. | Log in via the console and verify the network configuration using the `nmcli` tool. If necessary, manually correct the configuration, then reboot the node. | The upgrade automatically resumes. |
| Errors occur when you manually change the configuration. | If you want to revert to the automatically generated NetworkManager connection profiles, run the command `harvester-installer generate-network-config`. | The NetworkManager connection profiles in `/etc/NetworkManager/system-connections/` are recreated based on the configuration specified in `/oem/harvester.config`. |

---

## Known Issues

### 1. Host IP address may change during upgrade when using DHCP

Harvester v1.7.x uses NetworkManager instead of wicked, which was used in earlier versions of Harvester. These two network stacks have different defaults for generating DHCP client IDs. 

If the host IP addresses are configured using DHCP, a Harvester upgrade and subsequent reboot may cause the DHCP server to assign IP addresses that are different from what hosts previously used. Consequently, the affected hosts are unable to join the cluster on startup because of the IP address change.

This issue typically occurs when the DHCP server allocates IP addresses based solely on the DHCP client ID. You are unlikely to encounter this issue when the DHCP server is configured to allocate fixed IP addresses based on the MAC address (as demonstrated in the [Harvester iPXE Examples](https://github.com/harvester/ipxe-examples)).

The impact of this issue varies by cluster size:

- Single-node clusters: Harvester fails to start after rebooting because the IP address has changed.
- Multi-node clusters: Management nodes become stuck in the "Waiting Reboot" state.

To address the issue, perform the following steps:

:::info important

You must perform the steps for each affected node _after_ the upgrade is completed and the IP address has changed.

:::

1. Log in to the affected node. You can either access the node via SSH at its new IP address or use the console.

1. In the `/var/lib/wicked` directory, check for the lease XML file (named similar to `/var/lib/wicked/lease-mgmt-br-dhcp-ipv4.xml`).

    If you are using a VLAN, the file name includes the VLAN ID (for example, `/var/lib/wicked/lease-mgmt-br.2017-dhcp-ipv4.xml`).
    
1. View the file and identify the DHCP client ID.

    ```
    $ cat /var/lib/wicked/lease-mgmt-br-dhcp-ipv4.xml
    <lease>
      ...
      <ipv4:dhcp>
        <client-id>ff:00:dd:c7:05:00:01:00:01:30:ae:a0:d3:52:54:00:dd:c7:05</client-id>
        ...
      </ipv4:dhcp>
    </lease>
    ```

1. Use the `nmcli` command to set the DHCP client ID for the appropriate NetworkManager connection profile.
    
    The connection profile you need to modify depends on whether your node uses a VLAN.

    - No VLAN: Add the DHCP client ID to the `bridge-mgmt` connection profile.
    - VLAN used: Add the DHCP client ID to the `vlan-mgmt` connection profile.

    For example, in the no VLAN case:

    ```
    $ nmcli con modify bridge-mgmt \
            ipv4.dhcp-client-id \
            ff:00:dd:c7:05:00:01:00:01:30:ae:a0:d3:52:54:00:dd:c7:05
    ```

    Be sure to replace the client ID in the example with the actual client ID from your wicked lease file.

1. Reboot the node.

The DHCP server should return the original IP address and the affected node should be able to join the cluster.

Related issues: [#9260](https://github.com/harvester/harvester/issues/9260) and [#3418](https://github.com/harvester/harvester/issues/3418)

### 2. Upgrade Is Stuck in the "Upgradeing System Service" Stage.

During the upgrade process, it might be stuck in the `Upgradeing System Service` stage. It might be related to the stuck with `apply-manifest` job. We encounter two known issue realted the fleet upgrade.
You can find the similar logs as below:

```
...
Happy Containering!
Wait for Rancher dependencies helm releases...
wait helm release cattle-fleet-system fleet fleet-108.0.0+up0.14.0 0.14.0 deployed
wait helm release cattle-fleet-system fleet-crd fleet-crd-108.0.0+up0.14.0 0.14.0 deployed
```

Then, you need to check the helm history to identify which case you are facing:

1. The `pending-upgrade` status:
```
$ helm history fleet -n cattle-fleet-system
REVISION        UPDATED                         STATUS          CHART                   APP VERSION     DESCRIPTION
6               Tue Nov  4 06:22:34 2025        superseded      fleet-105.0.2+up0.11.2  0.11.2          Upgrade complete
7               Tue Nov  4 06:22:49 2025        superseded      fleet-105.0.2+up0.11.2  0.11.2          Upgrade complete
8               Mon Dec  8 07:10:43 2025        superseded      fleet-106.1.1+up0.12.3  0.12.3          Upgrade complete
9               Mon Dec  8 07:26:49 2025        deployed        fleet-106.1.1+up0.12.3  0.12.3          Upgrade complete
10              Mon Dec  8 07:27:10 2025        pending-upgrade fleet-106.1.1+up0.12.3  0.12.3          Preparing upgrade
```

If you saw the `pending-upgrade` status, it means the fleet upgrade is waiting for the upgrade even though the fleet has been already upgraded. You can try the following workaround:

```
$ helm rollback fleet -n cattle-fleet-system
```

After that, wait for the embedded Rancher reconciling the ClusterRepo again to trigger the chart upgrade. To accelerate the process, you may restart the embedded Rancher pods.

Related issue: [#9738](https://github.com/harvester/harvester/issues/9738)

2. Stuck in rc version:

```
# helm history fleet -n cattle-fleet-system
REVISION        UPDATED                         STATUS          CHART                           APP VERSION     DESCRIPTION
2               Mon Dec  8 10:43:42 2025        superseded      fleet-108.0.0+up0.14.0-rc.1     0.14.0-rc.1     Upgrade complete
3               Mon Dec  8 10:49:51 2025        superseded      fleet-108.0.0+up0.14.0-rc.1     0.14.0-rc.1     Upgrade complete
4               Mon Dec  8 10:50:04 2025        superseded      fleet-108.0.0+up0.14.0-rc.1     0.14.0-rc.1     Upgrade complete
5               Mon Dec  8 10:56:30 2025        superseded      fleet-108.0.0+up0.14.0-rc.1     0.14.0-rc.1     Upgrade complete
6               Mon Dec  8 10:56:42 2025        deployed        fleet-108.0.0+up0.14.0-rc.1     0.14.0-rc.1     Upgrade complete
```

This should not happened unless you are upgradeing from the rc version. And we did not support the upgrade from rc version to the stable version. If you are in this case, please report an issue on the Github repo for further assistance.

Related issue: [#9680](https://github.com/harvester/harvester/issues/9680)