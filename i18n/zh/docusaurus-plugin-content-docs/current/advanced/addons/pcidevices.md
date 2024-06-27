---
sidebar_position: 2
sidebar_label: PCI 设备
title: "PCI 设备"
---

_从 v1.1.0 起可用_

在 Harvester 中，`PCIDevice` 指的是具有 PCI 地址的主机设备。
你可以创建 `PCIDeviceClaim` 资源或使用 UI，通过虚拟机监控程序将设备直通到 VM。通过虚拟机监控程序直通设备后，VM 可以直接访问设备并高效地使用设备。虚拟机甚至可以安装该设备的驱动程序。

该过程是通过 `pcidevices-controller` 插件来完成的。

要使用 PCI 设备功能，你需要先启用 `pcidevices-controller` 插件。

![](/img/v1.2/vm-import-controller/EnableAddon.png)

成功部署 `pcidevices-controller` 插件后，可能需要几分钟时间进行扫描并使 PCIDevice CRD 变得可用。
![](/img/v1.2/pcidevices/PcideviceEnabled.png)
## 在 PCI 设备上启用直通

1. 前往 `Advanced > PCI Devices` 页面：

   ![](/img/v1.2/pcidevices/advanced-pcidevices-index.png)

1. 通过输入提供商名称（例如 NVIDIA、Intel 等）或设备名称搜索你的设备：

   ![](/img/v1.2/pcidevices/search-pcidevices.png)

1. 选择要启用直通的设备：

   ![](/img/v1.2/pcidevices/select-pcidevices.png)

1. 然后，单击 **Enable Passthrough** 并阅读警告消息。如果你想启用这些设备，请单击 **Enable** 并等待所有设备的状态变为 `Enabled`。
   :::caution
   请不要使用`宿主机专用`的 PCI 设备（例如，管理网络和 VLAN 网络的网卡）。错误的设备分配可能会损坏你的集群（包括节点故障）。
   :::

   ![](/img/v1.2/pcidevices/enable-pcidevices-inprogress.png)

   ![](/img/v1.2/pcidevices/enable-pcidevices-done.png)

## 将 PCI 设备附加到 VM

启用这些 PCI 设备后，你可以导航到 **Virtual Machines** 页面并选择 **Edit Config** 来直通这些设备。

![](/img/v1.2/pcidevices/vm-pcidevices-edit-config.png)

选择 **PCI Devices** 并使用 **Available PCI Devices** 下拉菜单。从显示的列表中选择要附加的设备，然后单击 **Save**。

![](/img/v1.2/pcidevices/vm-pcidevices-attach.png)


## 在 VM 内使用直通的 PCI 设备

启动 VM 并在 VM 中运行 `lspci`，即使 VM 中的 PCI 地址不一定与主机中的 PCI 地址匹配，附加的 PCI 设备也将显示在这里。


## 在 VM 内为 PCI 设备安装驱动程序

这里涉及的操作与在主机中安装驱动程序一样。PCI 透传功能将主机设备绑定到 `vfio-pci` 驱动程序，让 VM 能够使用自己的驱动程序。你可以查看安装在 VM 中的 NVIDIA 驱动程序的[屏幕截图](https://tobilehman.com/posts/suse-harvester-pci/#toc)，其中包括证明设备驱动程序可以正常工作的 CUDA 示例。

## SRIOV 网络设备
_从 v1.2.0 起可用_

![](/img/v1.2/pcidevices/SriovNetworkDevicesLink.png)

`pcidevices-controller` 插件现在可以扫描底层主机上的网络接口并检查它们是否支持 SRIOV Virtual Function (VF)。如果找到有效的设备，`pcidevices-controller` 将生成一个新的`SRIOVNetworkDevice` 对象。

![](/img/v1.2/pcidevices/SriovNetworkDevicesList.png)

要在 SriovNetworkDevice 上创建 VF，你可以单击 **⋮ > Enable**，然后定义 **Number of Virtual Functions**。
![](/img/v1.2/pcidevices/SriovNetworkDeviceEnable.png)

![](/img/v1.2/pcidevices/SriovNetworkVFDefinition.png)

`pcidevices-controller` 将定义网络接口上的 VF，并为新创建的 VF 报告新的 PCI 设备状态。

![](/img/v1.2/pcidevices/SriovNetworkDevicesVFStatus.png)

下次重新扫描时，`pcidevices-controller` 将为 VF 创建 PCIDevices。这可能需要 1 分钟的时间。

你现在可以导航到 **PCI Devices** 页面来查看新设备。

我们还引入了一个新的过滤器来帮助你通过底层网络接口来过滤 PCI 设备。

![](/img/v1.2/pcidevices/SriovNetworkDevicesFilter.png)

新创建的 PCI 设备可以像其他 PCI 设备一样直通到虚拟机。
![](/img/v1.2/pcidevices/SriovNetworkDevicesFilterResult.png)