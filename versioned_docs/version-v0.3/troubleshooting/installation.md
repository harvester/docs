---
sidebar_position: 1
sidebar_label: Installation
title: ""
---

# Installation

The following sections contain tips to troubleshoot or get assistance with failed installations.

## Logging into the Harvester Installer (a live OS)

Users can press the key combination `CTRL + ALT + F2` to switch to another TTY and log in with the following credentials:

- User: `rancher`
- Password: `rancher`

## Meeting hardware requirements

- Check that your hardware meets the [minimum requirements](../index.md#hardware-requirements) to complete installation.

## Receiving the message `"Loading images. This may take a few minutes..."`

- Because the system doesn't have a default route, your installer may become "stuck" in this state. You can check your route status by executing the following command:

```console
$ ip route
default via 10.10.0.10 dev harvester-mgmt proto dhcp        <-- Does a default route exist?
10.10.0.0/24 dev harvester-mgmt proto kernel scope link src 10.10.0.15
```

- Check that your DHCP server offers a default route option. Attaching content from `/run/cos/target/rke2.log` is helpful too.

## Collecting Information

Please include the following information in a bug report when reporting a failed installation:

- A failed installation screenshot.
- Content of these files:
  
    ```
    /var/log/console.log
    /run/cos/target/rke2.log
    /tmp/harvester.*
    /tmp/cos.*
    ```

- Output of these commands:

    ```
    blkid
    dmesg
    ```
