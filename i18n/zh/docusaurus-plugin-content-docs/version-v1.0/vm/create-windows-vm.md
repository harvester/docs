---
sidebar_position: 2
sidebar_label: 创建 Windows 虚拟机
title: ""
keywords:
  - Harvester
  - harvester
  - Rancher
  - rancher
  - Windows
  - windows
  - 虚拟机
  - VM
  - 创建 Windows 虚拟机
Description: 从"虚拟机"页面创建一个或多个 Windows 虚拟机。
---

# 创建 Windows 虚拟机

你可以从 **Virtual Machines** 页面创建一个或多个虚拟机。

:::note

如果需要创建 Linux 虚拟机，请参见[本页面](./create-vm.md)。

:::

## 如何创建 Windows 虚拟机

### Header Section

1. 选择创建单个实例或多个实例。
1. 设置虚拟机名称。
1. （可选）输入虚拟机的描述。
1. （可选）选择`使用虚拟机模板`并选择 `windows-iso-image-base-template`。此模板将为 Windows 添加带有 `virtio` 驱动的卷。

### 基本信息选项卡

1. 配置要分配给虚拟机的 `CPU` 核数。
1. 配置要分配给虚拟机的 `Memory`。
1. （可选）选择现有的 `SSH keys` 或上传新的密钥​​。

![create-windows-vm](/img/v1.0/vm/create-windows-vm.png)

:::note

如上所述，建议你使用 Windows 虚拟机模板。`Volumes` 部分将描述 Windows 虚拟机模板自动创建的选项。

:::

:::caution

`bootOrder` 值需要先使用安装镜像进行设置。如果你修改这些值，你的虚拟机可能无法启动到安装磁盘。

:::

### 卷选项卡

1. **第一个卷**是一个`镜像卷`，具有以下值：
   1. `Name`：默认设置为 `cdrom-disk`。你也可以修改它。
   2. `Image`：选择要安装的 Windows 镜像。有关如何创建新镜像的完整说明，请参见[上传镜像](../upload-image.md)。
   3. `Type`：选择 `cd-rom`。
   4. `Size`：默认值是 `20`。如果你的镜像较大，你可以更改该值。
   5. `Bus`：默认值是 `SATA`。建议你不要修改该值。
2. **第二个卷**是具有以下值的`卷`：
   1. `Name`：默认设置为 `rootdisk`。你也可以修改它。
   2. `Size`：默认值是 `32`。在更改此值之前，请参见 [Windows Server](https://docs.microsoft.com/en-us/windows-server/get-started/hardware-requirements#storage-controller-and-disk-space-requirements) 和 [Windows 11](https://docs.microsoft.com/en-us/windows/whats-new/windows-11-requirements#hardware-requirements) 的磁盘空间要求。
   3. `Bus`：默认值是 `VirtIO`。你也可以将它修改为其他可用的选项，例如 `SATA` 或 `SCSI`。
3. **第三个卷**是具有以下值的`容器` ：
   1. `Name`：默认设置为 `virtio-container-disk`。你也可以修改它。
   2. `Docker Image`：默认设置为 `registry.suse.com/suse/vmdp/vmdp:2.5.3`。建议你不要修改该值。
   3. `Bus`：默认值是 `SATA`。建议你不要修改该值。
4. 你可以使用 `Add Volume`、`Add Existing Volume`、`Add VM Image` 或 `Add Container` 按钮来添加其他磁盘：

![create-windows-vm-volumes](/img/v1.0/vm/create-windows-vm-volumes.png)

### 网络选项卡

1. **Management Network** 默认添加，并带有以下值：
   1. `Name`：默认设置为 `default`。你也可以修改它。
   2. `Network`：默认值是 `management Network`。如果尚未创建其他网络，则无法更改此选项。有关如何创建新网络的完整说明，请参见 [Harvester 网络](../networking/harvester-network)。
   3. `Model`：默认设置为 `e1000`。你也可以将其设为下拉菜单中的其他可用选项。
   4. `Type`：默认值是 `masquerade`。你也可以将其设置为 `bridge`。
2. 你可以点击 `Add Network` 来添加其他网络：

![create-windows-vm-networks](/img/v1.0/vm/create-windows-vm-networks.png)

:::caution

更改`节点调度`设置可能会影响 Harvester 功能，例如禁用`热迁移`。

:::

### 节点调度选项卡

1. `Node Scheduling` 默认设置为 `Run VM on any available node`（在任何可用节点上运行虚拟机）。你也可以将其设为下拉菜单中的其他可用选项。

![create-windows-vm-scheduling](/img/v1.0/vm/create-windows-vm-scheduling.png)

### 高级选项选项卡

1. `OS Type`：默认设置为`Windows`。建议你不要修改该值。
2. `Machine Type`：默认设置为 `None`。建议你不要修改该值。在更改此值之前，请参见 [KubeVirt 机器类型](https://kubevirt.io/user-guide/virtual_machines/virtual_hardware/#machine-type)文档。
3. （可选）`Hostname`：设置虚拟机的主机名。
4. （可选）`Cloud Config`：`User Data` 和 `Network Data` 均使用为默认值。目前，这些配置不适用于基于 Windows 的虚拟机。

![create-windows-vm-advanced](/img/v1.0/vm/create-windows-vm-advanced.png)

### 页脚部分

1. `Start virtual machine on creation`：此选项默认勾选。如果你不希望虚拟机在创建后启动，你可以取消勾选它。

完成所有设置后，单击 `Create` 来创建虚拟机。

:::note

如果你需要添加高级设置，你可以点击 `Edit as YAML` 来直接修改虚拟机配置。
如果你需要取消所有更改，点击 `Cancel`。

:::

## 安装 Windows

1. 选择你刚才创建的虚拟机，然后单击 `Start` 来启动虚拟机（如果你选择了 `Start virtual machine on creation`，虚拟机将在创建后自动启动）。

2. 引导安装程序，然后按照安装说明进行操作。

3. （可选）如果你使用的是基于 `virtio` 的卷，你需要加载特定的驱动程序来检测卷。如果你使用了虚拟机模板 `windows-iso-image-base-template`，则相关的说明如下：
   1. 点击 `Load driver`，在对话框中点击 `Browse`，然后找到带有 `VMDP-WIN` 前缀的光驱。然后，根据你的 Windows 版本找到驱动目录（例如，如果是 Windows Server 2012r2，则展开 `win8.1-2012r2`），然后选择里面的 `pvvx` 目录：
      ![find-virtio-driver-directory](/img/v1.0/vm/find-virtio-driver-directory.png)
   2. 单击 `OK` 来允许安装程序扫描此目录并查找驱动程序。然后，选择 `SUSE Block Driver for Windows` 并单击 `Next` 来加载驱动程序：
      ![select-virtio-block-driver](/img/v1.0/vm/select-virtio-block-driver.png)
   1. 等待安装程序加载驱动程序。如果你选择了正确的驱动程序版本，加载驱动程序后会检测到 `virtio` 卷：
      ![installer-found-virtio-drive](/img/v1.0/vm/installer-found-virtio-drive.png)

4. （可选）如果你使用其它基于 `virtio` 的硬件（例如网络适配器），你需要在完成安装后手动安装这些驱动程序。要安装驱动程序，请打开 VMDP 驱动程序磁盘，然后打开安装程序。

Windows VMDP 驱动包的支持矩阵如下（假设 VMDP 光驱路径为 E）：

| 版本 | 支持 | 驱动路径 |
| :-----: | :-------: | :---------- |
| Windows 7 | 否 | `N/A` |
| Windows Server 2008 | 否 | `N/A` |
| Windows Server 2008r2 | 否 | `N/A` |
| Windows 8 x86(x64) | 是 | `E:\win8-2012\x86(x64)\pvvx` |
| Windows Server 2012 x86(x64) | 是 | `E:\win8-2012\x86(x64)\pvvx` |
| Windows 8.1 x86(x64) | 是 | `E:\win8.1-2012r2\x86(x64)\pvvx` |
| Windows Server 2012r2 x86(x64) | 是 | `E:\win8.1-2012r2\x86(x64)\pvvx` |
| Windows 10 x86(x64) | 是 | `E:\win10-server\x86(x64)\pvvx` |
| Windows Server 2016 x86(x64) | 是 | `E:\win10-server\x86(x64)\pvvx` |
| Windows Server 2019 x86(x64) | 是 | `E:\win10-server\x86(x64)\pvvx` |
| Windows 11 x86(x64) | 是 | `E:\win10-2004\x86(x64)\pvvx` |
| Windows Server 2022 x86(x64) | 是 | `E:\win10-2004\x86(x64)\pvvx` |

:::note

如果你没有使用 `windows-iso-image-base-template` 模板，但仍然需要使用 `virtio` 设备，请确保添加了自定义 Windows virtio 驱动程序来检测硬件。

:::

## 已知问题

### 使用 EFI 模式时 Windows ISO 无法启动

在 Windows 中使用 EFI 模式时，你可能会发现系统使用了 HDD 或 UEFI shell 等其它设备进行启动，如下：

![efi-shell](/img/v1.0/vm/efi-shell.png)

这是因为 Windows 会提示 `Press any key to boot from CD or DVD...` 来让用户决定是否要使用 ISO 启动。要让系统使用 CD 或 DVD 启动，你需要进行人工干预：

![boot-from-cd](/img/v1.0/vm/boot-from-cd.png)

如果系统已经引导到 UEFI shell，你可以键入 `reset` 以强制系统再次重新引导。出现提示后，你可以按下任意键让系统从 Windows ISO 启动。

### 保留内存不足导致虚拟机崩溃

当 Windows VM 分配了超过 8 GiB 内存，但没有配置足够的保留内存时会出现这个问题。VM 会在没有警告的情况下崩溃。

你可以在 **Advanced Options** 选项卡上为模板分配至少 256MiB 的保留内存来解决这个问题：

![reserved-memory-config](/img/v1.0/vm/reserved-memory-config.png)

我们将在 Windows 模板中添加默认的 256MiB 保留内存，以防止后续版本中出现此问题。

### Windows 首次启动时出现 BSoD（蓝屏死机）

这是 Windows Server 2016 及更高版本的 Windows VM 中存在的一个已知问题，即在 Windows 首次启动时可能会出现蓝屏死机，错误代码为 `KMODE_EXCEPTION_NOT_HANDLED`。我们仍在研究这个问题，并将在后续版本中解决此问题。

目前有一种解决方法：通过更新 `/oem/99_custom.yaml` 在 Harvester 中创建或修改文件 `/etc/modprobe.d/kvm.conf`，如下所示：

```YAML
name: Harvester Configuration
stages:
  initramfs:
  - commands: # ...
    files:
    - path: /etc/modprobe.d/kvm.conf
      permissions: 384
      owner: 0
      group: 0
      content: |
          options kvm ignore_msrs=1
      encoding: ""
      ownerstring: ""
      # ...
```

:::note

这仍然是一个实验性的解决方案。有关详细信息，请参阅[此 issue](https://github.com/harvester/harvester/issues/276)。如果你在应用此解决方法后遇到任何问题，请告诉我们。

:::