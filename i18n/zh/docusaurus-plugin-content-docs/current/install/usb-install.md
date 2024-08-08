---
sidebar_position: 3
sidebar_label: U 盘安装
title: "U 盘安装"
---

## 创建一个 USB 启动盘

你可以通过以下几种方式创建 USB 安装启动盘。

:::caution
**已知问题**：v1.2.0 ISO 镜像存在一个已知[问题](https://github.com/harvester/harvester/issues/4510)，即使用 USB 进行 ISO 安装时会遇到问题。

有关详细信息和解决方法，请参阅[使用 USB 安装时 Harvester 交互式 ISO 挂起](#使用-usb-安装时-harvester-交互式-iso-挂起)。

无论你使用哪种工具，创建启动设备都会擦除你的 USB 设备数据。在创建启动设备之前，请备份 USB 设备上的所有数据。
:::

### Rufus

[Rufus](https://rufus.ie/) 用于在 Windows 计算机上使用 USB 盘创建 ISO 镜像。
1. 打开 Rufus 并将一个干净的 USB 记忆棒插入你的计算机。
2. Rufus 会自动检测你的 USB。从 **Device** 下拉菜单中选择要使用的 USB 设备。
3. 在 **Boot Selection** 中，选择 **Select** 并找到要刻录到 USB 的 Harvester ISO 安装镜像。

   ![rufus.png](/img/v1.2/install/rufus.png)

   :::info

   如果使用旧版本的 Rufus，`DD 模式`和 `ISO 模式`都可以使用。`DD 模式`与 Linux 中的 `dd` 命令类似，你无法在创建启动设备后浏览分区。`ISO 模式`会自动在你的设备上创建分区并将文件复制到这些分区，创建启动设备后你依然可以浏览这些分区。

   :::

### balenaEtcher

[balenaEtcher](https://www.balena.io/etcher/) 支持在大多数 Linux 发行版、macOS 和 Windows 上将镜像写入 USB 盘。它提供一个易用的 UI 界面。

1. 选择 Harvester 安装 ISO 文件。
2. 选择目标 USB 设备，创建 USB 安装盘。

   ![balena-etcher.png](/img/v1.2/install/balena-etcher.png)

### `dd` 命令

你可以在 Linux 或其他平台上使用 `dd` 命令来创建 USB 安装盘。请确保你选择了正确的设备。以下命令将擦除所选设备上的数据。

```
# sudo dd if=<path_to_iso> of=<path_to_usb_device> bs=64k
```

## 已知问题

### 显示了 `GRUB _` 文本，但使用 USB 安装盘启动时没有任何反应

如果你使用的是 UEFI 模式，请尝试从 USB 设备的 UEFI 分区启动，而不是从 USB 设备本身启动。例如，选择 `UEFI: USB disk 3.0 PMAP, Partition 1` 来启动。不同的系统可能会显示不同的内容。

![](/img/v1.2/install/usb-install-select-correct-partition.jpg)

### 显示问题

某些显卡的固件在 `v0.3.0` 中没有携带。

你可以按下 `e` 来编辑 GRUB 菜单入口，并将 `nomodeset` 尾附到启动参数后，然后按下 `Ctrl + x` 来启动。

![](/img/v1.2/install/usb-install-nomodeset.png)

### Harvester 安装程序没有显示

如果 USB 启动盘启动了，但是你没有看到 Harvester 安装程序，尝试以下的几个解决方法：

- 将 U 盘插到 USB 2.0 插槽中。
- 对于 `v0.3.0` 或以上版本，在启动时移除 `console=ttyS0` 参数。按下 `e` 来编辑 GRUB 菜单入口，并移除 `console=ttyS0` 参数。

### 使用 USB 安装时 Harvester 交互式 ISO 挂起

使用带有 v1.2.0 ISO 镜像（由 `balenaEtcher`、`dd` 等工具创建）的 USB 盘安装期间，安装可能会卡在初始镜像加载步骤，这是因为启动分区上缺少所需的标签。因此，数据分区无法正确挂载，导致 `dracut` 中的一些检查被阻止。

如果遇到此问题，你将看到类似以下的输出，并且该进程将挂起至少 50 分钟（`dracut` 的默认超时值）。

![](/img/v1.2/install/usb-install-hang.png)

#### 解决方法

要解决这个问题，你可以手动修改根分区，如下所示：
```text
# Replace the `CDLABEL=COS_LIVE` with your USB data partition. Usually, your USB data partition is the first partition with the device name `sdx` that hangs on your screen.
# Original
$linux ($root)/boot/kernel cdroot root=live:CDLABEL=COS_LIVE rd.live.dir=/ rd.live.squashimg=rootfs.squashfs console=tty1 console=ttyS0 rd.cos.disable net.ifnames=1
# Modified
$linux ($root)/boot/kernel cdroot root=live:/dev/sda1 rd.live.dir=/ rd.live.squashimg=rootfs.squashfs console=tty1 console=ttyS0 rd.cos.disable net.ifnames=1
```

修改后的参数应如下所示：

![](/img/v1.2/install/grub-parameter-modified.png)

进行此调整后，按 `Ctrl + x` 启动引导。你现在应该能正常进入安装程序。

- 相关 issue：
   - [[BUG] v1.2.0 Interactive ISO Fails to Install On Some Bare-Metal Devices](https://github.com/harvester/harvester/issues/4510)