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

This page describes how to edit some of the most-requested Harvester configurations. To update a configuration, you must first update the runtime value in the system and then update configuration files to make the changes persistent between reboots.

One notable exception to this starting in Harvester v1.7.0 is network configuration, as the `/etc/NetworkManager` directory was added to the list of persistent paths. This means that changes to network configuration made using the `nmcli` tool will persist immediately.

:::note

If you upgrade from a version before `v1.1.2`, the `cloud-init` file in examples will be `/oem/99_custom.yaml`. Please substitute the value if needed.

:::

## Password of user `rancher`

### Runtime change

1. Log in to a Harvester node as user `rancher`. See [how to log into a Harvester node](../troubleshooting/os.md#how-to-log-in-to-a-harvester-node) for more details.
1. To reset the password for the user `rancher`, run the command `passwd`.

### Configuration persistence

1. Backup the elemental `cloud-init` file `/oem/90_custom.yaml` as follows:

    ```
    cp /oem/90_custom.yaml /oem/install/90_custom.yaml.$(date --iso-8601=minutes)
    ```

1. Edit `/oem/90_custom.yaml` and update the yaml path `stages.initramfs[0].users.rancher.passwd`. Refer to the configuration [`os.password`](./harvester-configuration.md#ospassword) for details on how to specify the password in an encrypted form.

## NTP servers

We introduced a new mechanism for NTP configuration in Harvester v1.2.0.

For more information about NTP settings in Harvester v1.2.0 and later versions, see [NTP servers](../host/host.md#ntp-configuration).

## DNS servers

1. Log in to a Harvester node and become root. See [how to log into a Harvester node](../troubleshooting/os.md#how-to-log-in-to-a-harvester-node) for more details.
1. If the management interface _is not_ configured to use a VLAN, run the following command:

    ```
    nmcli con modify bridge-mgmt ipv4.dns 8.8.8.8,1.1.1.1 && nmcli device reapply mgmt-br
    ```

1. If the management interface _is_ configured to use a VLAN, run the following commands. Replace `VLAN_ID` with the actal ID of the VLAN. If in doubt, run `nmcli con` to see the configured connections and devices.

    ```
    nmcli con modify vlan-mgmt ipv4.dns 8.8.8.8,1.1.1.1 && nmcli device reapply mgmt-br.VLAN_ID
    ```

1. Confirm the file `/etc/resolv.conf` contains the correct DNS servers with the `cat` command:

    ```
    cat /etc/resolv.conf
    ```
1. Restart rke2-coredns:
    ```
    kubectl rollout restart deployment/rke2-coredns-rke2-coredns -n kube-system
    ```
1. Confirm rke2-coredns was rolled out successfully:
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

1. Use `nmcli` to create a connection for the interface and attach it to the management bond, for example:

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
