# Installation

The page contains tips to troubleshoot failed installations.

## How to login to the Harvester Installer (a live OS)

Users can press the key combination `CTRL + ALT + F2` to switch to another TTY and log in with the following credential:

- User: `rancher`
- Password: `rancher`

## Make sure hardware requirements are met

Please check your hardware meets the [requirements](../index.md#hardware-requirements).

## The installer is stuck on `"Loading images. This may take a few minutes..."`

Normally it's because the system doesn't have a default route. You can check it by:

```console
$ ip route
default via 10.10.0.10 dev harvester-mgmt proto dhcp        <-- Does a default route exist?
10.10.0.0/24 dev harvester-mgmt proto kernel scope link src 10.10.0.15
```

Please check your DHCP server offers a default route option.
Attaching content of `/run/cos/target/rke2.log` is helpful too.

## Collecting information

The following information helps troubleshooting a failed installation. Please include them in a bug report.

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
