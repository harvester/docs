---
id: index
sidebar_position: 1
sidebar_label: Installation
title: "Installation"
---

<head>
  <link rel="canonical" href="https://docs.harvesterhci.io/v1.1/troubleshooting/installation"/>
</head>

The following sections contain tips to troubleshoot or get assistance with failed installations.

## Logging into the Harvester Installer (a live OS)

Users can press the key combination `CTRL + ALT + F2` to switch to another TTY and log in with the following credentials:

- User: `rancher`
- Password: `rancher`

## Meeting hardware requirements

- Check that your hardware meets the [minimum requirements](../install/requirements.md#hardware-requirements) to complete installation.

## Receiving the message `"Loading images. This may take a few minutes..."`

- Because the system doesn't have a default route, your installer may become "stuck" in this state. You can check your route status by executing the following command:

```shell
$ ip route
default via 10.10.0.10 dev mgmt-br proto dhcp        <-- Does a default route exist?
10.10.0.0/24 dev mgmt-br proto kernel scope link src 10.10.0.15
```

- Check that your DHCP server offers a default route option. Attaching content from `/run/cos/target/rke2.log` is helpful too.

## Modifying cluster token on agent nodes

When an agent node fails to join the cluster, it can be related to the cluster token not being identical to the server node token.
In order to confirm the issue, connect to your agent node (i.e. with [SSH](./os.md#how-to-log-into-a-harvester-node) and check the `rancherd` service log with the following command:

```shell
$ sudo journalctl -b -u rancherd
```

If the cluster token setup in the agent node is not matching the server node token, you will find several entries of the following message:

```shell
msg="Bootstrapping Rancher (master-head/v1.21.5+rke2r1)"
msg="failed to bootstrap system, will retry: generating plan: insecure cacerts download from https://192.168.122.115:443/cacerts: Get \"https://192.168.122.115:443/cacerts\": EOF"
```

To fix the issue, you need to update the token value in the `rancherd` configuration file `/etc/rancher/rancherd/config.yaml`.

For example, if the cluster token setup in the server node is `ThisIsTheCorrectOne`, you will update the token value as follow:

```yaml
token: 'ThisIsTheCorrectOne'
```

To ensure the change is persistent across reboots, update the `token` value of the OS configuration file `/oem/99_custom.yaml`:

```yaml
name: Harvester Configuration
stages:
  ...
  initramfs:
  - commands:
    - rm -f /etc/sysconfig/network/ifroute-mgmt-br
    files:
    - path: /etc/rancher/rancherd/config.yaml
      permissions: 384
      owner: 0
      group: 0
      content: |
        role: cluster-init
        token: 'ThisIsTheCorrectOne' # <- Update this value
        kubernetesVersion: v1.21.5+rke2r1
        labels:
         - harvesterhci.io/managed=true
      encoding: ""
      ownerstring: ""
```

:::note

To see what is the current cluster token value, log in your server node (i.e. with SSH)
and look in the file `/etc/rancher/rancherd/config.yaml`. For example,
you can run the following command to only display the token's value:

```bash
$ sudo yq eval .token /etc/rancher/rancherd/config.yaml
```

:::

## Collecting troubleshooting information

Please include the following information in a bug report when reporting a failed installation:

- A failed installation screenshot.
- System information and logs.
    - Available as of v1.0.2

    Please follow the guide in [Logging into the Harvester Installer (a live OS)](#logging-into-the-harvester-installer-a-live-os) to log in. And run the command to generate a tarball that contains troubleshooting information:

    ```
    supportconfig -k -c
    ```
    
    The command output messages contain the generated tarball path. For example the path is `/var/loq/scc_aaa_220520_1021 804d65d-c9ba-4c54-b12d-859631f892c5.txz` in the following example:

    ![](/img/v1.2/troubleshooting/installation-support-config-example.png)

    :::note

    A failure PXE Boot installation automatically generates a tarball if the [`install.debug`](../install/harvester-configuration.md#installdebug) field is set to `true` in the Harvester configuration file.

    :::

    - Before v1.0.2

    Please help capture the content of these files:

    ```
    /var/log/console.log
    /run/cos/target/rke2.log
    /tmp/harvester.*
    /tmp/cos.*
    ```

    And output of these commands:

    ```
    blkid
    dmesg
    ```
