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
**Known Issue:** For the v1.2.0 ISO image, there is a known [issue](https://github.com/harvester/harvester/issues/4510) where the interactive ISO installation will get stuck using the USB method.

To resolve this, you can use the patched [ISO](https://releases.rancher.com/harvester/v1.2.0/harvester-v1.2.0-patch1-amd64.iso). This patched version only corrects the partition label, and there are no other changes. You can also use the related sha512 [file](https://releases.rancher.com/harvester/v1.2.0/harvester-v1.2.0-patch1-amd64.iso.sha512sum) to verify the ISO.

Refer to the [Harvester interactive ISO hangs with the USB installation method](#harvester-interactive-iso-hangs-with-the-usb-installation-method) for details and a workaround.

No matter which tool you use, creating a bootable device erases your USB device data. Please back up all data on your USB device before making a bootable device.
:::

### Rufus

[Rufus](https://rufus.ie/) allows you to create an ISO image on your USB flash drive on a Windows computer.
1. Open Rufus and insert a clean USB stick into your computer.
2. Rufus automatically detects your USB. Select the USB device you want to use from the **Device** drop-down menu.
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

You can use the 'dd' command on Linux or other platforms to create a USB installation flash drive. Ensure you choose the correct device; the following command erases data on the selected device.

```
# sudo dd if=<path_to_iso> of=<path_to_usb_device> bs=64k
```

## Known issues

###

Sometimes using a USB to mount the Harvester ISO disk directs you to Grub2. In this case, it helps to know how to set the root partition and where to locate `grub.cfg`.

You can see the current root partition in the `grub.cfg`, once you've set the root to be within where the ISO lives on the USB. To view the `grub.cfg` from the ISO, run the command `cat /boot/grub2/grub.cfg`.

To set a new root partition, run the command `set root=(hdN,msdos1)`, where N denotes N numbers of possible drives. N should be the drive your USB is mounted to.

To launch into the GNU GRUB2 Boot Menu from the ISO, once the root has been set to where the ISO is located at the partition of `msdos1` - you can run `chainloader /boot/grub2/x86_64-efi/grub.efi` to get loaded into the GRUB2 Boot Menu for the Harvester Installer.
### When booting from a USB installation flash drive, a `GRUB _` text is displayed, but nothing happens

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

### Harvester interactive ISO hangs with the USB installation method

During installation from a USB flash drive with v1.2.0 ISO image (created by tools like `balenaEtcher`, `dd`, etc.), the installation process may get stuck on the initial image loading process because a required label is missing on the boot partition. Therefore, the installation cannot mount the data partition correctly, causing some checks in `dracut` to be blocked.

If you encounter this issue, you'll observe the following similar output, and the process will hang for at least 50 minutes (the default timeout value from `dracut`).

![](/img/v1.2/install/usb-install-hang.png)

#### Workaround

To address this problem, you can manually modify the root partition as follows:
```text
# Replace the `CDLABEL=COS_LIVE` with your USB data partition. Usually, your USB data partition is the first partition with the device name `sdx` that hangs on your screen.
# Original
$linux ($root)/boot/kernel cdroot root=live:CDLABEL=COS_LIVE rd.live.dir=/ rd.live.squashimg=rootfs.squashfs console=tty1 console=ttyS0 rd.cos.disable net.ifnames=1
# Modified 
$linux ($root)/boot/kernel cdroot root=live:/dev/sda1 rd.live.dir=/ rd.live.squashimg=rootfs.squashfs console=tty1 console=ttyS0 rd.cos.disable net.ifnames=1
``` 

The modified parameter should look like the following:

![](/img/v1.2/install/grub-parameter-modified.png)

After making this adjustment, press `Ctrl + x` to initiate booting. You should now enter the installer as usual.

- Related issue:
  - [[BUG] v1.2.0 Interactive ISO Fails to Install On Some Bare-Metal Devices](https://github.com/harvester/harvester/issues/4510) 