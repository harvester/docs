---
sidebar_position: 2
sidebar_label: 网络
title: "网络"
keywords:
- Harvester
- 网络
---

Harvester 为虚拟机 (VM) 提供了三种类型的虚拟网络，包括：

- 管理网络
- VLAN 网络
- Untagged 网络

管理网络通常用于流量仅在集群内部流动的虚拟机。如果你的虚拟机需要连接到外部网络，请使用 VLAN 网络或 Untagged 网络。

_从 v1.0.1 起可用_

Harvester 还引入了存储网络，用于将存储流量与其他集群内工作负载分开。有关更多信息，请参阅[存储网络文档](../advanced/storagenetwork.md)。


## 管理网络
Harvester 使用 [Canal](https://projectcalico.docs.tigera.io/getting-started/kubernetes/flannel/flannel) 作为默认管理网络。它是一个内置网络，可以直接从集群中使用。
默认情况下，虚拟机的管理网络 IP 只能在集群节点内访问，虚拟机重启后管理网络 IP 会改变。这是需要注意的非典型行为，因为一般我们会认为 VM IP 在重启后会保持不变。

但是，你可以利用 Kubernetes [服务对象](https://kubevirt.io/user-guide/virtual_machines/service_objects/)为你的虚拟机与管理网络创建一个稳定的 IP。

### 如何使用管理网络
由于管理网络是内置的，不需要额外的操作，因此你可以在配置 VM 网络时直接添加它。

![](/img/v1.1/networking/management-network.png)

## VLAN 网络

[Harvester network-controller](https://github.com/harvester/harvester-network-controller) 利用 [multus](https://github.com/k8snetworkplumbingwg/multus-cni) 和 [bridge](https://www.cni.dev/plugins/current/main/bridge/) CNI 插件来实现它自定义的 L2 桥接 VLAN 网络。这有助于将你的虚拟机连接到主机网络接口，并且可以使用物理交换机从内部和外部网络进行访问。

### 如何使用 VLAN 网络

要创建新的 VLAN 网络，转到 **Networks > VM Networks** 页面并单击 **Create** 按钮。

1. 指定名称，选择类型 `L2VlanNetwork`，输入 VLAN ID，并选择集群网络。

   ![](/img/v1.1/networking/create-vlan-network.png)

1. 配置路由以允许主机使用 IPv4 地址连接到 VLAN 网络。VLAN 网络的 CIDR 和网关是路由配置的必备参数。你可以选择以下选项之一来配置路由：
   - Auto(DHCP)：Harvester 网络控制器将使用 DHCP 协议从 DHCP 服务器获取 CIDR 和网关。你也可以指定 DHCP 服务器地址。

   ![](/img/v1.1/networking/create-network-auto.png)

   - Manual：你需要自行指定 CIDR 和网关。

   ![](/img/v1.1/networking/create-network-manual.png)

### 使用 VLAN 网络创建虚拟机
你现在可以使用上面配置的 VLAN 网络创建新 VM：

- 单击 **Virtual Machines** 页面上的 **Create** 按钮。
- 输入所需参数并单击 **Networks** 选项卡。
- 将默认网络配置为 VLAN 网络，或选择要添加的其他网络。

## Untagged 网络

我们都知道，VLAN 网络下的流量具有 VLAN ID 标签，我们可以使用带有 `PVID`（默认值 1）的 VLAN 网络来与正常的未标记流量进行通信。但是，某些网络设备可能不希望接收与上行链路所属交换机上的 native VLAN 匹配的显式标记的 VLAN ID。这也是我们引入 Untagged 网络的原因。

### 如何使用 Untagged 网络
Untagged 网络的使用类似于 [VLAN 网络](./harvester-network.md#如何使用-vlan-网络)。

要创建新的 Untagged 网络，请转到 **Networks > Networks** 页面并单击 **Create** 按钮。你需要指定名称，选择类型 `Untagged Network` 并选择集群网络。

![](/img/v1.1/networking/create-untagged-network.png)

:::note

Harvester v1.1.2 开始，Harvester 支持更新和删除 VM 网络。在更新或删除 VM 网络之前，请停止所有受影响的 VM。

:::
