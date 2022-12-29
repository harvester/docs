---
sidebar_position: 3
sidebar_label: Harvester 网络深度解释
title: "Harvester 网络深度解释"
keywords:
- Harvester
- 网络
- 拓扑
---

下面的网络拓扑展示了我们是如何实现 Harvester 网络的。

![](/img/v1.1/networking/topology.png)

该图包含[内置集群网络 mgmt](./clusternetwork.md#内置集群网络) 和一个名为 `oob` 的[自定义集群网络](./clusternetwork.md#自定义集群网络)。

如上所示，Harvester 网络主要关注 OSI 模型第 2 层。我们利用 Linux 网络设备和协议，为 VM 到 VM、VM 到主机以及 VM 到外部网络设备之间的通信构建流量路径。

Harvester 网络由三层组成，包括：

- KubeVirt 网络层

- Harvester 网络层

- 外部网络层

## KubeVirt 网络

KubeVirt 一般用于在 Kubernetes Pod 内运行 VM。KubeVirt 网络在 Pod 和 VM 之间构建网络路径。有关更多信息，请参阅 [KubeVirt 官方文档](https://kubevirt.io/2018/KubeVirt-Network-Deep-Dive.html)。

## Harvester 网络

Harvester 网络旨在构建 Pod 和主机网络之间的网络路径，实现了管理网络、VLAN 网络和 Untagged 网络。我们可以将后面的两个网络称为**桥接网络**，因为桥接对它们的实现非常关键。

### 桥接网络

我们利用 [multus CNI](https://github.com/k8snetworkplumbingwg/multus-cni) 和 [bridge CNI](https://www.cni.dev/plugins/current/main/bridge/) 来实现桥接网络。

1. Multus CNI 是 Kubernetes 的一个容器网络接口 (CNI) 插件，可以将多个网络接口附加到一个 Pod。它允许虚拟机有一个用于管理网络的 NIC，以及多个用于桥接网络的 NIC。

2. 使用网桥 CNI 后，VM Pod 将接入到网络附加定义配置中指定的 L2 网桥。

   ```json
   # Example 1
   {
       "cniVersion": "0.3.1",
       "name": "vlan100",
       "type": "bridge",
       "bridge": "mgmt-br",
       "promiscMode": true,
       "vlan": 100,
   }
   ```

   ```json
   # Example 2
   {
       "cniVersion": "0.3.1",
       "name": "untagged-network",
       "type": "bridge",
       "bridge": "oob-br",
       "promiscMode": true,
       "ipam": {}
   }
   ```

   示例 1 是 VLAN ID 为 100 的典型 VLAN 配置，而示例 2 是没有 VLAN ID 的 Untagged 网络配置。使用示例 1 配置的 VM Pod 将接入网桥 `mgmt-br`，而使用示例 2 的 VM Pod 将接入网桥 `oob-br`。

3. 为了实现高可用和容错，创建绑定真实网卡的 bond 设备，将其作为网桥的上行链路。此 bond 设备允许传输带有目标标签的流量/数据包。

   ```shell
   harvester-0:/home/rancher # bridge -c vlan show dev oob-bo
   port	   vlan ids
   oob-bo	   1 PVID Egress Untagged
              100
              200
   ```

   在上面的示例中，bond `oob-bo` 允许带有标签 1、100 或 200 的包通过。

### 管理网络

管理网络基于 [Canal](https://projectcalico.docs.tigera.io/getting-started/kubernetes/flannel/flannel) 实现。

值得一提的是，Harvester 配置节点 IP 的 Canal 接口，是网桥 `mgmt-br` 或 `mgmt-br` 的 VLAN 子接口。该设计有两个好处：

- 内置的 `mgmt` 集群网络同时支持管理网络和桥接网络。
- 通过 VLAN 网络接口，我们可以为管理网络分配一个 VLAN ID。

作为 mgmt 集群网络的组成部分，网桥 mgmt-br、bond mgmt-bo 和 VLAN 设备无法被删除或更改。


## 外部网络

外部网络设备通常指交换机和 DHCP 服务器。通过集群网络，我们可以将主机网卡分组，并将它们连接到不同的交换机来进行流量隔离。使用说明如下。

- 要允许带有标签的数据包通过，你需要将外部交换机或其他设备（如 DHCP 服务器）的端口类型设置为 Trunk 或 Hybrid 模式，并允许指定的 VLAN 标签。

- 你需要根据对等主机的 Bond 模式在交换机上配置链路聚合。链路聚合支持手动模式和 LACP 模式。下面列出了 Bond 模式和链路聚合模式的对应关系。

   | Bond 模式 | 链路聚合模式 |
   | --- | ----------- |
   | mode 0(balance-rr) | manual |
   | mode 1(active-backup) | none |
   | mdoe 2(balance-oxr) | manual |
   | mode 3(broadcast) | manual |
   | mode 4(802.3ad) | LACP |
   | mode 5(balance-tlb) | none |
   | mode 6(balance-alb) | none |

- 如果你希望 VLAN 中的虚拟机能够通过 DHCP 协议获取 IP 地址，请在 DHCP 服务器中为该 VLAN 配置 IP 池。


