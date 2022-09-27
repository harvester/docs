---
sidebar_position: 1
sidebar_label: 概述
title: ""
keywords:
  - Harvester
  - harvester
  - Rancher
  - rancher
  - 网络
  - network
  - VLAN
  - vlan
Description: Harvester 构建在 Kubernetes 之上，而 Kubernetes 使用 [CNI](https://github.com/containernetworking/cni) 作为网络提供商和 Kubernetes Pod 网络之间的接口。因此，我们也基于 CNI 实现 Harvester 网络。此外，Harvester UI 集成了网络配置，来实现用户友好的虚拟机网络配置。
---

# 概述

在实际生产环境中，我们建议你的主机使用多个网卡，一个用于节点访问，一个用于 VM 网络。如果你的主机有多个 NIC，请参阅[多个 NIC](multiple-nics-vlan-aware-switch.md) 以了解最佳实践。否则，请参阅[单 NIC](single-nic-vlan-aware-switch.md) 最佳实践。

:::note

如果 `bond` 接口配置了多个 NIC，除非 Harvester 节点有多个 `bond` 接口。否则请参阅单 NIC 场景。

:::

## 最佳实践

- [具有 VLAN 感知交换机的多个 NIC](multiple-nics-vlan-aware-switch.md)
- [具有非 VLAN 感知交换机的多个 NIC](multiple-nics-non-vlan-aware-switch.md)
- [具有 VLAN 感知交换机的单个 NIC](single-nic-vlan-aware-switch.md)
- [带有非 VLAN 感知交换机的单个 NIC](single-nic-non-vlan-aware-switch.md)
