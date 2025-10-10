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

Harvester v1.7.x uses NetworkManager instead of wicked, which was used in earlier versions of Harvester. If you have made changes to Harvester's network configuration since it was first installed there are additional manual steps required to ensure a smooth upgrade. For details, see [Migration from wicked to NetworkManager](#migration-from-wicked-to-networkmanager)

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

Harvester v1.7.x uses NetworkManager instead of wicked, which was used in earlier versions of Harvester. There is no straightforward 1:1 mapping between the old `ifcfg` style configuration files and NetworkManager's connection profiles. This means that the existing network configuration cannot be automatically migrated in-place. Instead, during upgrade, new NetworkManager connection profiles will generated based on the configuration in `/oem/harvester.config`, i.e. the network configuration as specified when Harvester was originally installed.

If you started with Harvester v1.1 or newer, and have _not_ made any manual changes to network configuration since inital installation, no special action is required.

If you have made manual changes to network configuration after installation, for example adding bonding slaves to the management interface, or adjusing DNS servers, these changes will not be picked up automatically during upgrade. You will need to either:

1. Preferably, before upgrade, edit `/oem/harvester.config` on each node to specify the desired network configuration, or,
2. After upgrade, make the required changes to the generated NetworkManager connection profiles using the `nmcli` tool.

The important things to check in `/oem/harvester.config` before upgrade are `os.dns_nameservers` and `install.management_interface`. Pay particular attention to the latter if you started with Harvester v1.0, as the format of this file changed between Harvester v1.0 and v1.1. For a full reference, see [Harvester configuration](../install/harvester-configuration.md).

If a node gets stuck in "Waiting Reboot" state part way through upgrade, log in via the console and verify the network configuration with `nmcli`.  If necessary you can make manual changes to the configuration at this point, then reboot the node and the upgrade will continue.

If you run into trouble with manual configuration changes and wish to revert back to the automatically generated NetworkManager connection profiles, you can run the `harvester-installer generate-network-config` command. This will re-create the NetworkManager connection profiles in `/etc/NetworkManager/system-connections/` based on the configuration specified in `/oem/harvester.config`.

For further details see the [Migrate from Wicked to NetworkManager HEP](https://github.com/harvester/harvester/pull/9039).

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
