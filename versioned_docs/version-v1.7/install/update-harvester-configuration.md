---
sidebar_position: 6
sidebar_label: Update Harvester Configuration
title: "Update Harvester Configuration After Installation"
keywords:
  - Harvester configuration
  - Configuration
description: How to update Harvester configuration after installation
---

<head>
  <link rel="canonical" href="https://docs.harvesterhci.io/v1.6/install/update-harvester-configuration"/>
</head>

Harvester's OS has an immutable design, which means most files in the OS revert to their pre-configured state after a reboot. The Harvester OS loads the pre-configured values of system components from configuration files during the boot time.

To update a configuration, you must first update the runtime value in the system and then update configuration files to ensure that changes persist between reboots.

However, starting with v1.7.0, network configuration changes made using the `nmcli` tool persist automatically because the `/etc/NetworkManager` directory is now included in the list of persistent paths.

:::note

If you upgrade from a version before `v1.1.2`, the `cloud-init` file in examples will be `/oem/99_custom.yaml`. Please substitute the value if needed.

:::

## Password of user `rancher`

### Runtime change

1. [Log in to a Harvester node](../troubleshooting/os.md#how-to-log-in-to-a-harvester-node) using the `rancher` user account.

1. Reset the password for the `rancher` user account by running the command `passwd`.

### Configuration persistence

1. Backup the elemental `cloud-init` file `/oem/90_custom.yaml` as follows:

    ```
    cp /oem/90_custom.yaml /oem/install/90_custom.yaml.$(date --iso-8601=minutes)
    ```

1. Edit `/oem/90_custom.yaml` and update the yaml path `stages.initramfs[0].users.rancher.passwd`.

    For information about specifying the `rancher` user account password in an encrypted form, see [`os.password`](./harvester-configuration.md#ospassword).

## NTP servers

We introduced a new mechanism for NTP configuration in Harvester v1.2.0.

For more information about NTP settings in Harvester v1.2.0 and later versions, see [NTP servers](../host/host.md#ntp-configuration).

## DNS servers

1. [Log in to a Harvester node](../troubleshooting/os.md#how-to-log-in-to-a-harvester-node) using the root account.
1. Check the management interface configuration, and then run either of the following commands:

    - Not configured to use a VLAN:
      
      ```
      nmcli con modify bridge-mgmt ipv4.dns 8.8.8.8,1.1.1.1 && nmcli device reapply mgmt-br
      ```

    - Configured to use a VLAN:

      You must replace `VLAN_ID` with the actual ID. To view a list of configured connections and devices, run the command `nmcli con`.

    ```
    nmcli con modify vlan-mgmt ipv4.dns 8.8.8.8,1.1.1.1 && nmcli device reapply mgmt-br.VLAN_ID
    ```

1. Verify that the file `/etc/resolv.conf` contains the correct DNS servers by running the `cat` command.


    ```
    cat /etc/resolv.conf
    ```

1. Restart the `rke2-coredns` deployment.

    ```
    kubectl rollout restart deployment/rke2-coredns-rke2-coredns -n kube-system
    ```

1. Verify that the `rke2-coredns` deployment was rolled out successfully.

    ```
    kubectl rollout status deployment/rke2-coredns-rke2-coredns -n kube-system
    ```

## Bonding slaves

You can update the slave interfaces of Harvester's management bonding interface `mgmt-bo`.

1. Log in to a Harvester node and become root. See [how to log into a Harvester node](../troubleshooting/os.md#how-to-log-in-to-a-harvester-node) for more details.
1. Identify the interface names with the following command:

    ```
    $ nmcli device
    DEVICE           TYPE      STATE                   CONNECTION
    mgmt-br          bridge    connected               bridge-mgmt
    ...
    mgmt-bo          bond      connected               bond-mgmt
    ens6             ethernet  connected               bond-slave-ens6
    ens7             ethernet  disconnected            --
    ...
    ```

1. Use the `nmcli` tool to create a connection for the interface and attach it to the management bond.

    Example:

    ```
    $ nmcli con add type bond-slave ifname ens7 master mgmt-bo
    Connection 'bond-slave-ens7' (5a379328-178a-4167-b065-b5426facd659) successfully added.

1. You should now be able to see the device is connected:

    ```
    $ nmcli device
    DEVICE           TYPE      STATE                   CONNECTION
    mgmt-br          bridge    connected               bridge-mgmt
    ...
    mgmt-bo          bond      connected               bond-mgmt
    ens6             ethernet  connected               bond-slave-ens6
    ens7             ethernet  connected               bond-slave-ens7
    ```
