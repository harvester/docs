---
sidebar_position: 3
sidebar_label: U 盘安装
title: "U 盘安装"
---

## 创建一个 USB 启动盘

你可以通过以下几种方式创建 USB 安装启动盘。
:::caution

在创建可引导设备后，你的 USB 设备上的所有数据将会被清除，无论你使用什么工具。请保证在创建可引导设备前备份了你的USB设备上所有的数据。

:::

### rufus

[rufus](https://rufus.ie/)支持在 Windows 系统下使用可引导镜像来创建可引导设备。
![rufus.png](/img/v1.2/install/rufus.png)
   - 注意： `DD mode` 模式和 `ISO mode` 模式均可使用。 `DD mode` 模式的行为类似于 Linux 系统下的 `dd` 命令，并且在可引导设备制作完成后无法直接访问和浏览分区。 `ISO mode` 模式将自动创建分区并且将镜像中的文件复制到各个对应的分区下，这样在可引导设备制作完成后可以访问和浏览分区。

### balenaEtcher

通过 [balenaEtcher](https://www.balena.io/etcher/) 把镜像写入到 U 盘中。它提供一个易用的 UI 界面。选择某个版本的 Harvester ISO 镜像以及要写入的 USB 设备，然后它将自动帮你创建一个 USB 安装启动盘。
![balena-etcher.png](/img/v1.2/install/balena-etcher.png)


### `dd` 命令

在有 `dd` 命令的 Linux 或其他平台上，用户可以运行 `dd` 来创建一个 USB 安装启动盘：

:::caution

请确保你选择了正确的写入设备，因为所选设备上的数据会被清除。

:::

```
# sudo dd if=<path_to_iso> of=<path_to_usb_device> bs=64k
```

## 常见问题

### 使用 U 盘启动时，只显示 `GRUB _` 文本，但没有事情发生

如果你使用的是 UEFI 模式，请尝试从 USB 设备的 UEFI 分区启动，而不是从 USB 设备本身启动。例如：

![](/img/v1.2/install/usb-install-select-correct-partition.jpg)

选择 `UEFI: USB disk 3.0 PMAP, Partition 1` 来启动。请知悉不同的系统可能会显示不同的内容。


### 显示问题

某些显卡的固件在 `v0.3.0` 中没有携带。
你可以按下 `e` 来编辑 GRUB 菜单入口，并将 `nomodeset` 尾附到启动参数后。然后按下 `Ctrl + x` 来启动。

![](/img/v1.2/install/usb-install-nomodeset.png)


### 其他问题

- Harvester 安装程序没有显示

   如果 USB 启动盘启动了，但是你没有看到 Harvester 安装程序，你可以进行以下操作：

   - 将 U 盘插到 USB 2.0 插槽中。
   - 对于 `v0.3.0` 或以上版本，在启动时尝试移除 `console=ttyS0` 参数。按下 `e` 来编辑 GRUB 菜单入口，并移除 `console=ttyS0` 参数。
