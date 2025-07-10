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
  <link rel="canonical" href="https://docs.harvesterhci.io/v1.1/install/update-harvester-configuration"/>
</head>

Harvester's OS has an immutable design, which means most files in the  OS revert to their pre-configured state after a reboot. The Harvester OS loads the pre-configured values of system components from configuration files during the boot time. 

This page describes how to edit some of the most-requested Harvester configurations. To update a configuration, you must first update the runtime value in the system and then update configuration files to make the changes persistent between reboots. 

:::note

If you upgrade from a version before `v1.1.2`, the `cloud-init` file in examples will be `/oem/99_custom.yaml`. Please substitute the value if needed.

:::

## DNS servers

### Runtime change

1. Log in to a Harvester node and become root. See [how to log into a Harvester node](../troubleshooting/os.md#how-to-log-into-a-harvester-node) for more details.
1. Edit `/etc/sysconfig/network/config` and update the following line. Use a space to separate DNS server addresses if there are multiple servers.

    ```
    NETCONFIG_DNS_STATIC_SERVERS="8.8.8.8 1.1.1.1"
    ```

1. Update and reload the configuration with the following command:

    ```
    netconfig update
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

### Configuration persistence

1. Backup the elemental `cloud-init` file `/oem/90_custom.yaml` as follows:

    ```
    cp /oem/90_custom.yaml /oem/install/90_custom.yaml.$(date --iso-8601=minutes)
    ```

1. Edit `/oem/90_custom.yaml` and update the value under the yaml path `stages.initramfs[0].commands`. The `commands` array must contain a line to manipulate the `NETCONFIG_DNS_STATIC_SERVERS` config. Add the line if the line doesn't exist. 

    The following example adds a line to change the `NETCONFIG_DNS_STATIC_SERVERS` config:

    ```
    stages:
      initramfs:
        - commands:
            - sed -i 's/^NETCONFIG_DNS_STATIC_SERVERS.*/NETCONFIG_DNS_STATIC_SERVERS="8.8.8.8 1.1.1.1"/' /etc/sysconfig/network/config
    ```

    Replace the DNS server addresses and save the file. Harvester sets up new servers after rebooting.


## NTP servers

### Runtime change

1. Log in to a Harvester node and become root. See [how to log into a Harvester node](../troubleshooting/os.md#how-to-log-into-a-harvester-node) for more details.
1. Edit `/etc/systemd/timesyncd.conf` and specify NTP servers in the `NTP=` setting:

    ```
    [Time]
    NTP = 0.suse.pool.ntp.org 1.suse.pool.ntp.org
    ```

1. Restart the `systemd-timesyncd.service` service:

    ```
    systemctl restart systemd-timesyncd.service
    ```

1. Display the timesync status:

    ```
    timedatectl timesync-status
    ```

### Configuration persistence

1. Backup the elemental `cloud-init` file `/oem/90_custom.yaml` as follows:

    ```
    cp /oem/90_custom.yaml /oem/install/90_custom.yaml.$(date --iso-8601=minutes)
    ```

1. Edit `/oem/90_custom.yaml` and update the yaml path `stages.initramfs[0].timesyncd`. The `timesyncd` map must be in the following format:

    ```
    stages:
      initramfs:
      - ...
        timesyncd:
        NTP: 0.suse.pool.ntp.org 1.suse.pool.ntp.org
    ```

1. Edit `/oem/90_custom.yaml` and update the yaml path `stages.initramfs[0].systemctl.enable`. The array must have the two services (`systemd-timesyncd` and `systemd-time-wait-sync`) enabled:

    ```
    stages:
      initramfs:
      - ...
        systemctl:
        enable:
            systemd-timesyncd
            systemd-time-wait-sync
        disable: []
        start: []
        mask: []
    ```

## SSH keys of user `rancher`

### Runtime change

1. Log in to a Harvester node as user `rancher`. See [how to log into a Harvester node](../troubleshooting/os.md#how-to-log-into-a-harvester-node) for more details.
1. Edit `/home/rancher/.ssh/authorized_keys` to add or remove keys.

### Configuration persistence

1. Backup the elemental `cloud-init` file `/oem/90_custom.yaml` as follows:

    ```
    cp /oem/90_custom.yaml /oem/install/90_custom.yaml.$(date --iso-8601=minutes)
    ```

1. Edit `/oem/90_custom.yaml` and update the yaml path `stages.network[0].authorized_keys.rancher`. Add or remove keys in the `rancher` array:

    ```
    stages:
      network:
      - ...
        authorized_keys:
          rancher:
          - key1
          - key2
    ```


## Password of user `rancher`

### Runtime change

1. Log in to a Harvester node as user `rancher`. See [how to log into a Harvester node](../troubleshooting/os.md#how-to-log-into-a-harvester-node) for more details.
1. To reset the password for the user `rancher`, run the command `passwd`. 

### Configuration persistence

1. Backup the elemental `cloud-init` file `/oem/90_custom.yaml` as follows:

    ```
    cp /oem/90_custom.yaml /oem/install/90_custom.yaml.$(date --iso-8601=minutes)
    ```

1. Edit `/oem/90_custom.yaml` and update the yaml path `stages.initramfs[0].users.rancher.passwd`. Refer to the configuration [`os.password`](./harvester-configuration.md#ospassword) for details on how to specify the password in an encrypted form.


## Bonding slaves

You can update the slave interfaces of Harvester's management bonding interface `mgmt-bo`.

### Runtime change

1. Log in to a Harvester node and become root. See [how to log into a Harvester node](../troubleshooting/os.md#how-to-log-into-a-harvester-node) for more details.
1. Identify the interface names with the following command:

    ```
    ip a
    ```

1. Edit `/etc/sysconfig/network/ifcfg-mgmt-bo` and update the lines associated with bonding slaves and bonding mode:

    ```
    BONDING_SLAVE_0='ens5'
    BONDING_SLAVE_1='ens6'
    BONDING_MODULE_OPTS='miimon=100 mode=balance-tlb '
    ```

1. Restart the network with the `wicked ifreload` command:

    ```
    wicked ifreload mgmt-bo
    ```

    :::caution

    A mistake in the configuration may disrupt the SSH session.

    :::

### Configuration persistence

Beginning with v1.1.2, the persistent name of the cloud-init file is `/oem/90_custom.yaml`. Harvester now uses a newer version of Elemental, which creates the file during installation.

When upgrading from an earlier version to `v1.1.2` or later, Harvester retains the old file name (`/oem/99_custom.yaml`) to avoid confusion. You can manually rename the file to `/oem/90_custom.yaml` if necessary.

1. Backup the elemental cloud-init file `/oem/90_custom.yaml` as follows:

    ```
    cp /oem/90_custom.yaml /oem/install/90_custom.yaml.$(date --iso-8601=minutes)
    ```

1. Edit `/oem/90_custom.yaml` and update the yaml path `stages.initramfs[0].files`. More specifically, update the content of the `/etc/sysconfig/network/ifcfg-mgmt-bo` file and edit the `BONDING_SLAVE_X` and `BONDING_MODULE_OPTS` entries accordingly:

    ```
    stages:
      initramfs:
      - ...
        files:
        - path: /etc/sysconfig/network/ifcfg-mgmt-bo
          permissions: 384
          owner: 0
          group: 0
          content: |+
              STARTMODE='onboot'
              BONDING_MASTER='yes'
              BOOTPROTO='none'
              POST_UP_SCRIPT="wicked:setup_bond.sh"
    
    
              BONDING_SLAVE_0='ens5'
              BONDING_SLAVE_1='ens6'
    
              BONDING_MODULE_OPTS='miimon=100 mode=balance-tlb '
    
              DHCLIENT_SET_DEFAULT_ROUTE='no'
    
          encoding: ""
          ownerstring: ""
        - path: /etc/sysconfig/network/ifcfg-ens6
          permissions: 384
          owner: 0
          group: 0
          content: |
            STARTMODE='hotplug'
            BOOTPROTO='none'
          encoding: ""
          ownerstring: ""
    ```

    :::note

    If you didn't select an interface during installation, you must add an entry to initialize the interface. Please check the `/etc/sysconfig/network/ifcfg-ens6` file creation in the above example. The file name should be `/etc/sysconfig/network/ifcfg-<interface-name>`.

    :::
