---
sidebar_position: 4
sidebar_label: Seeder
title: "Seeder"
---

_从 v1.2.0 起可用_

`harvester-seeder` 插件用于在底层节点上执行带外操作。

如果裸机节点支持基于 redfish 的访问，那么该插件还能发现节点上的硬件和硬件事件，然后将硬件与相应的 Harvester 节点相关联。

你可以从 **Addons** 页面启用 `harvester-seeder` 插件。

![](/img/v1.2/vm-import-controller/EnableAddon.png)

启用插件后，找到所需的主机并选择 **Edit Config**，然后转到 **Out-Of-Band Access** 选项卡。

![](/img/v1.2/seeder/EditConfig.png)

![](/img/v1.2/seeder/OutOfBandAccess.png)

`seeder` 利用 `ipmi` 来管理底层节点硬件。

硬件发现和事件检测需要 `redfish` 支持。

## 电源操作

为节点定义带外配置后，你可以将该节点置于 `Maintenance` 模式，该模式允许你根据需要关闭或重启节点。

![](/img/v1.2/seeder/ShutdownReboot.png)

节点关闭后，你还可以选择 **Power On** 来重新开机：

![](/img/v1.2/seeder/PowerOn.png)


## 硬件事件聚合

如果你在 **Out-of-Band Access** 中启用了 **Event**，`seeder` 将利用 `redfish` 来查询底层硬件以获取组件故障和风扇温度信息。

此信息与 Harvester 节点关联，可用作 Kubernetes 事件。

![](/img/v1.2/seeder/HardwareEvents.png)


:::info

有时，你可能会卡在 `Out-Of-Band Access` 部分并看到消息 `Waiting for "inventories.metal.harvesterhci.io" to be ready`。在这种情况下，你需要刷新页面。有关详细信息，请参阅此 [issue](https://github.com/harvester/harvester/issues/4412)。

:::