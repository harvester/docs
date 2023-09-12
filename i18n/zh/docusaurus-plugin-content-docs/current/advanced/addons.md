---
sidebar_position: 5
sidebar_label: 插件
title: "插件"
---

Harvester 将使用插件（Addon）来提供可选功能。

这样，我们能够确保 Harvester 占用较少的空间，同时用户能够根据他们的实际用例或要求启用/禁用功能。

不同的底层插件支持不同程度的定制。

_从 v1.1.0 起可用_

Harvester v1.2.0 附带了五个插件：
* [pcidevices-controller](./addons/pcidevices.md)
* [vm-import-controller](./addons/vmimport.md)
* [rancher-monitoring](../monitoring/harvester-monitoring.md)
* [rancher-logging](../logging/harvester-logging.md)
* [harvester-seeder](./addons/seeder.md)

![](/img/v1.2/addons/AddonsV120.png)

:::note

**harvester-seeder** 作为 Harvester v1.2.0 中的实验性功能发布，并在 **Name** 中添加了一个 **Experimental** 标签。

:::

你可以通过选择插件并从 **Basic** 选项卡中选择 **⋮** > **Enable** 来启用**已禁用**的插件。

![](/img/v1.2/addons/enable-rancher-logging-addon.png)

成功启用插件后，**State** 将变为 **DeploySuccessful**。

![](/img/v1.2/addons/deploy-successful-addon.png)

你可以通过选择插件并从 **Basic** 选项卡中选择 **⋮** > **Disable** 来禁用**已启用**的插件。

![](/img/v1.2/addons/disable-rancher-monitoring-addon.png)

当插件成功禁用后，**State** 将变为 **Disabled**。

:::note

禁用插件后，配置数据将被存储，以便在再次启用插件时重复使用。

:::