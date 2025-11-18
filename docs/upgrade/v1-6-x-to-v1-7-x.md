---
sidebar_position: 2
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

:::info important
If you are using DHCP to configure your host IP addresses, it's possible the IP addresses may change during upgrade, which will prevent the cluster from starting correctly. This requires manual intervention to remedy. For full details see [Host IP address may change during upgrade when using DHCP](#1-host-ip-address-may-change-during-upgrade-when-using-dhcp).

:::

### Update Harvester UI Extension on Rancher v2.13

You must use a compatible version (v1.7.x) of the Harvester UI Extension to import Harvester v1.7.x clusters on Rancher v2.13.

1. On the Rancher UI, go to **local > Apps > Repositories**.

1. Locate the repository named **harvester**, and then select **⋮ > Refresh**.

1. Go to the **Extensions** screen.

1. Locate the extension named **Harvester**, and then click **Update**.

1. Select a compatible version, and then click **Update**.

1. Allow some time for the extension to be updated, and then refresh the screen.

---

## Known Issues

### 1. Host IP address may change during upgrade when using DHCP

Harvester v1.7.x uses NetworkManager instead of Wicked as was used in earlier versions of Harvester. These two network stacks have different defaults for generating DHCP client IDs. This means that if you are using DHCP to configure your host IP addresses, after the operating system on each host is upgraded and the host rebooted, your DHCP server may return a different IP address for that host than it did before. If this happens, the host in question will be unable to join the cluster on startup because its IP address has changed.

This problem will not occur if your DHCP server is configured to allocate fixed IP addresses based on MAC address, as is done in [Harvester iPXE Examples](https://github.com/harvester/ipxe-examples). It will occur however if the DHCP server is allocating IP addresses based solely on DHCP client ID.

For single node Harvester deployments that have this issue, Harvester simply will not start after rebooting after the upgrade, because the IP address is changed. For multi node deployments you may find management nodes are stuck "Waiting Reboot". In both cases, to address this issue, perform the following steps _after_ each node is upgraded and its IP address has changed:

1. Log in to the affected node, either via `ssh` to its new IP address, or by using the console.
1. Check for lease XML file in the `/var/lib/wicked` directory. It should be named similar to `/var/lib/wicked/lease-mgmt-br-dhcp-ipv4.xml`. If you are using a VLAN, the file name will include the VLAN ID, for example `/var/lib/wicked/lease-mgmt-br.2017-dhcp-ipv4.xml`
1. View this file to find the DHCP client ID:
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
1. Edit the `/oem/91_networkmanager.yaml` file and add the DHCP client ID to the content of the appropriate NetworkManager connection profile inside that file. If you are not using a VLAN, use the `bridge-mgmt.nmconnection` section. If you are using a VLAN, use `vlan-mgmt.nmconnection`. In either case, add `dhcp-client-id=CLIENT_ID_FROM_WICKED_LEASE_FILE` below the `[ipv4]` line, for example:
   ```
   $ cat /oem/91_networkmanager.yaml
   name: Harvester Network Configuration
   stages:
       initramfs:
           - files:
               ...
               - path: /etc/NetworkManager/system-connections/bridge-mgmt.nmconnection
                 ...
                 content: |
                   ...
                   [ipv4]
                   dhcp-client-id=ff:00:dd:c7:05:00:01:00:01:30:ae:a0:d3:52:54:00:dd:c7:05
                method=auto
                   ...

   ```
1. Reboot the node. The DHCP server should now return the original IP address and the affected node should be able to join the cluster.
1. Repeat as necessary for each remaining node.

Related issues: [#9260](https://github.com/harvester/harvester/issues/9260) and [#3418](https://github.com/harvester/harvester/issues/3418)
