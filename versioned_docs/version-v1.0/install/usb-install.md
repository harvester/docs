---
sidebar_position: 3
sidebar_label: USB Installation
title: ""
---

# USB Installation

## Create a bootable USB flash drive

There are a couple of ways to create a USB installation flash drive.


### balenaEtcher

[balenaEtcher](https://www.balena.io/etcher/) supports writing images to USB flash drives. It has a GUI and is easy to use. Select the Harvester installation ISO and the target USB device to create a USB installation flash drive.


### `dd` command

On Linux or other platforms that have the `dd` command, users can use `dd` to create a USB installation flash drive.

:::caution

Make sure you choose the correct device. The process erases data on the selected device.

:::

```
# sudo dd if=<path_to_iso> of=<path_to_usb_device> bs=64k
```

## Common issues

### When booting from a USB installation flash drive, a `GRUB _` text is displayed, but nothing happens

If you are using the UEFI mode, try to boot from the UEFI boot partition on the USB device rather than the USB device itself. e.g.,

![](/img/v1.0/install/usb-install-select-correct-partition.jpg)

Select the `UEFI: USB disk 3.0 PMAP, Partition 1` to boot. Note the representation varies from system to system.


### Graphics issue

Firmwares of some graphic cards are not shipped in `v0.3.0`.
You can press `e` to edit the GRUB menu entry and append `nomodeset` to the boot parameters. Press `Ctrl + x` to boot.

![](/img/v1.0/install/usb-install-nomodeset.png)


### Other issues

- Harvester installer is not displayed

    If a USB flash driver boots, but you can't see the harvester installer. You may try out the following workarounds:
    
    - Plug the USB flash drive into a USB 2.0 slot.
    - For version `v0.3.0` or above, try to remove the `console=ttyS0` parameter when booting. You can press `e` to edit the GRUB menu entry and remove the `console=ttyS0` parameter.
