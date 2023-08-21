---
sidebar_position: 3
sidebar_label: USB Installation
title: "USB Installation"
---

<head>
  <link rel="canonical" href="https://docs.harvesterhci.io/v1.1/install/usb-install"/>
</head>

## Create a bootable USB flash drive

There are a couple of ways to create a USB installation flash drive.

:::caution
No matter which tool you use, creating a bootable device erases your USB device data. Please back up all data on your USB device before making a bootable device.
:::

### Rufus

[Rufus](https://rufus.ie/) allows you to create an ISO image on your USB flash drive on a Windows computer.
1. Open Rufus and insert a clean USB stick into your computer.
2. Rufus automatically detects your USB. Select the USB Device you want to use from the **Device** drop-down menu.
3. For **Boot Selection**, choose **Select** and find the Harvester installation ISO image you want to burn onto the USB.

	![rufus.png](/img/v1.2/install/rufus.png)

	:::info

	If using older versions of Rufus, both `DD mode` and `ISO mode` works. `DD mode` works just like the `dd` command in Linux, and you can't browse partitions after you create a bootable device. `ISO mode` creates partitions on your device automatically and copies files to these partitions, and you can browse these partitions even after you create a bootable device.

	:::

### balenaEtcher

[balenaEtcher](https://www.balena.io/etcher/) supports writing an image to a USB flash drive on most Linux distros, macOS, and Windows. It has a GUI and is easy to use.

1. Select the Harvester installation ISO.
2. Select the target USB device to create a USB installation flash drive.

	![balena-etcher.png](/img/v1.2/install/balena-etcher.png)

### `dd` command

You can use the 'dd' command on Linux or other platforms with the `dd` command to create a USB installation flash drive. Ensure you choose the correct device; the following command erases data on the selected device.

```
# sudo dd if=<path_to_iso> of=<path_to_usb_device> bs=64k
```

## Known issues

### A `GRUB _` text is displayed, but nothing happens when booting from a USB installation flash drive

If you use the UEFI mode, try to boot from the UEFI boot partition on the USB device rather than the USB device itself. For example, select the `UEFI: USB disk 3.0 PMAP, Partition 1` to boot. The representation varies from system to system.

![](/img/v1.2/install/usb-install-select-correct-partition.jpg)

### Graphics issue

Firmwares of some graphic cards are not shipped in `v0.3.0`.

You can press `e` to edit the GRUB menu entry and append `nomodeset` to the boot parameters. Press `Ctrl + x` to boot.

![](/img/v1.2/install/usb-install-nomodeset.png)

### Harvester installer is not displayed

If a USB flash driver boots, but you can't see the harvester installer, try one of the following workarounds:

- Plug the USB flash drive into a USB 2.0 slot.
- For version `v0.3.0` or above, remove the `console=ttyS0` parameter when booting. Press `e` to edit the GRUB menu entry and remove the `console=ttyS0` parameter.
