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

Additionally, [persistent names of certain Intel network interfaces may change](#3-persistent-names-of-certain-network-interfaces-may-change-during-upgrade) during upgrades. This breaks connectivity on the host and requires manual remediation steps.

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

:::note

Propagation of the DHCP client ID from wicked to NetworkManager occurs automatically when upgrading from v1.6.x to v1.7.1. This workaround is only required when upgrading to v1.7.0.

:::

Related issues: [#9260](https://github.com/harvester/harvester/issues/9260) and [#3418](https://github.com/harvester/harvester/issues/3418)

### 2. Upgrade Is Stuck in "Upgrading System Service"

The upgrade process may become stuck in the "Upgrading System Service" phase. This issue is likely related to the `apply-manifest` job and to two known issues related to the Fleet upgrade.

You may encounter log messages similar to the following:

```
...
Happy Containering!
Wait for Rancher dependencies helm releases...
wait helm release cattle-fleet-system fleet fleet-108.0.0+up0.14.0 0.14.0 deployed
wait helm release cattle-fleet-system fleet-crd fleet-crd-108.0.0+up0.14.0 0.14.0 deployed
```

Check the Helm history to determine the cause and related workaround.

- Scenario 1: The Fleet upgrade status is `pending-upgrade` even after the upgrade has been completed.

    ```
    $ helm history fleet -n cattle-fleet-system
    REVISION        UPDATED                         STATUS          CHART                   APP VERSION     DESCRIPTION
    6               Tue Nov  4 06:22:34 2025        superseded      fleet-105.0.2+up0.11.2  0.11.2          Upgrade complete
    7               Tue Nov  4 06:22:49 2025        superseded      fleet-105.0.2+up0.11.2  0.11.2          Upgrade complete
    8               Mon Dec  8 07:10:43 2025        superseded      fleet-106.1.1+up0.12.3  0.12.3          Upgrade complete
    9               Mon Dec  8 07:26:49 2025        deployed        fleet-106.1.1+up0.12.3  0.12.3          Upgrade complete
    10              Mon Dec  8 07:27:10 2025        pending-upgrade fleet-106.1.1+up0.12.3  0.12.3          Preparing upgrade
    ```

    To address the issue, perform the following workaround:

    1. Run the command `$ helm rollback fleet -n cattle-fleet-system`.

    1. Wait for the embedded Rancher to reconcile the `ClusterRepo` CRD and trigger the Helm chart upgrade. To accelerate the process, you can restart the embedded Rancher pods.

- Scenario 2: The upgrade is stuck on a release candidate (RC) version. 

    This should not occur unless you are upgrading from an RC version to a stable version, which is not supported. For assistance, create a [GitHub issue](https://github.com/harvester/harvester/issues).

    ```
    # helm history fleet -n cattle-fleet-system
    REVISION        UPDATED                         STATUS          CHART                           APP VERSION     DESCRIPTION
    2               Mon Dec  8 10:43:42 2025        superseded      fleet-108.0.0+up0.14.0-rc.1     0.14.0-rc.1     Upgrade complete
    3               Mon Dec  8 10:49:51 2025        superseded      fleet-108.0.0+up0.14.0-rc.1     0.14.0-rc.1     Upgrade complete
    4               Mon Dec  8 10:50:04 2025        superseded      fleet-108.0.0+up0.14.0-rc.1     0.14.0-rc.1     Upgrade complete
    5               Mon Dec  8 10:56:30 2025        superseded      fleet-108.0.0+up0.14.0-rc.1     0.14.0-rc.1     Upgrade complete
    6               Mon Dec  8 10:56:42 2025        deployed        fleet-108.0.0+up0.14.0-rc.1     0.14.0-rc.1     Upgrade complete
    ```

Related issues: [#9738](https://github.com/harvester/harvester/issues/9738) and [#9680](https://github.com/harvester/harvester/issues/9680)

### 3. Persistent names of certain network interfaces may change during upgrade

Harvester v1.7.x uses newer versions of the Linux kernel's `i40e` and `ice` network drivers, causing a port number to be added to the name of certain Intel network interfaces, such as the X710. For example, an interface named `enp6s0f0` on Harvester v1.6.x is renamed to `enp6s0f0np0` during the upgrade to Harvester v1.7.0. This breaks connectivity on the host because existing network configurations still reference the original name.

To resolve this issue, apply kernel arguments that restore the original names of the affected interfaces.

1. Retrieve the list of non-default kernel arguments (`third_party_kernel_args`) on the node.

   ```
   $ grub2-editenv /oem/grubenv list
   third_party_kernel_args=multipath=off
   ```

1. Add `ifname=nicName:macAddress` for each network interface on the node to restore the original names.

   Ensure that `third_party_kernel_args` is included when you add the `ifname=` arguments.

   Example:

   ```
   $ grub2-editenv /oem/grubenv set \
       third_party_kernel_args="multipath=off ifname=enp6s0f0:d4:c9:ef:ce:30:68 ifname=enp6s0f1:d4:c9:ef:ce:30:69"
   ```

3. Reboot the node.

:::note

This workaround is only necessary when upgrading to v1.7.0. In v1.7.1 and later versions, these `ifname=` arguments are automatically added to prevent network disruptions during driver updates.

:::

Related issues: [#9815](https://github.com/harvester/harvester/issues/9815) and [#9802](https://github.com/harvester/harvester/issues/9802)

### 4. After upgrade from to v1.7.x, Running VM show message "Restart action is required ..."

After upgrade, the Harvester UI might show message like `"Restart action is required ..."`, Kubevirt adds a field to the vm definition implicitly during the upgrade.

Check the yaml output of the related VM, it shows information like below.

  ```yaml
  metadata:
  ...
    managedFields:
    - apiVersion: kubevirt.io/v1
      fieldsType: FieldsV1
      fieldsV1:
        f:metadata:
          f:annotations:
            f:kubevirt.io/latest-observed-api-version: {}
            f:kubevirt.io/storage-observed-api-version: {}
          f:finalizers:
            v:"kubevirt.io/virtualMachineControllerFinalize"null: {}
        f:spec:
          f:template:
            f:spec:
              f:domain:
                f:firmware:
                  .: {}
                  f:uuid: {}
      manager: virt-controller
      operation: Update
      time: "2025-12-15T09:10:30Z"
  ...
  spec:
    template:
      spec:
        domain:
          firmware:
            uuid: d633a622-2335-5606-93ae-d432b7c7f2d2
  ...
  status:
    conditions:
    - lastProbeTime: "null"
      lastTransitionTime: "2025-12-15T09:10:30Z"
      message: a non-live-updatable field was changed in the template spec
      status: "True"
      type: RestartRequired
   ```

Restart the VM on a proper time to eliminate this warning message.

Related issues: [#9751](https://github.com/harvester/harvester/issues/9751)
