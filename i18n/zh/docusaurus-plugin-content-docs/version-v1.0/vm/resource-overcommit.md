---
sidebar_position: 8
sidebar_label: 资源超量
title: ""
keywords:
  - Harvester
  - 过度使用
  - 过度配置
  - 膨胀
Description: 过度使用 VM 资源。
---

# 资源超量

Harvester 支持全局配置 CPU、内存和存储资源的过载百分比。[`overcommit-config`](../settings/settings.md#overcommit-config) 让你在物理资源被充分利用的情况下调度额外的虚拟机。

Harvester 支持在计算节点上超量使用 CPU 和 RAM。这样，你能通过降低实例性能来增加在云上运行的实例数量。Compute 服务默认使用以下比率：

- CPU 分配率：1600%
- RAM 分配率：150%
- 存储分配率：200%

:::note

暂时不支持经典的内存超量使用或内存膨胀。换句话说，虚拟机实例使用的内存一旦分配就无法返回。

:::

## 配置全局 [`overcommit-config`](../settings/settings.md#overcommit-config)

按照以下步骤修改全局 `overcommit-config`，修改后的配置会应用到所有新创建的虚拟机上：

1. 转到 **Advanced > Settings** 页面。
1. 找到 `overcommit-config` 设置。
1. 配置所需的 CPU、内存和存储比率。

## 为单个虚拟机配置超量使用

如果你需要为单个虚拟机配置超量使用，请单独调整目标 VirtualMachine 资源的 ` spec.template.spec.domain.resources.<memory|cpu>` 值。请注意，通过修改这些值，你将接管 Harvester 对虚拟机资源管理的控制。

## 预留更多系统内存

默认情况下，Harvester 从分配给虚拟机的内存中预留一定数量的系统内存。在大多数情况下，这不会导致任何问题。但是，某些操作系统（例如 Windows 2022）会需要比预留量更多的内存。

为了解决这个问题，Harvester 在 VirtualMachine 自定义资源上提供了一个 `harvesterhci.io/reservedMemory` 注释，用于指定要预留的内存量。例如，如果你决定为 VM 的系统预留 200 MiB，请添加 `harvesterhci.io/reservedMemory: 200Mi`：

```diff
 apiVersion: kubevirt.io/v1
 kind: VirtualMachine
 metadata:
   annotations:
+    harvesterhci.io/reservedMemory: 200Mi
     kubevirt.io/latest-observed-api-version: v1
     kubevirt.io/storage-observed-api-version: v1alpha3
     network.harvesterhci.io/ips: '[]'
   ...
   ...
```

## 为什么虚拟机调度不均匀？

虚拟机的调度依赖于 kube-scheduler 的底层行为。我们提供了专门的文章来解释细节。要了解更多信息，请参阅 [Harvester 知识库：VM 调度](https://harvesterhci.io/kb/vm-scheduling/)。
