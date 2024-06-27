---
sidebar_position: 6
sidebar_label: 资源配额
title: "资源配额"
keywords:
  - Harvester
  - harvester
  - Rancher
  - rancher
  - 资源配额
Description: ResourceQuota 允许管理员为每个命名空间设置资源限制，从而防止使用过多资源，并确保达到配额时其他命名空间能顺利运行。
---

[ResourceQuota](https://kubernetes.io/docs/concepts/policy/resource-quotas/) 用于限制命名空间内资源的使用。它能帮助管理员控制和限制集群资源的分配，确保在命名空间之间公平并可控地分配资源。

在 Harvester 中，ResourceQuota 可以定义以下资源的使用限制：
- **CPU**：限制计算资源使用，包括 CPU 核心和 CPU 使用时间。
- **内存**：限制内存资源的使用（以字节或其他内存单元为单位）。

## 通过 Rancher 设置 ResourceQuota
在 Rancher UI 中，管理员可以通过以下步骤配置命名空间的资源配额：

1. 单击汉堡菜单并选择 **Virtualization Management** 选项卡。
1. 选择其中一个集群并转到 **Projects/Namespaces** > **Create Project**。
1. 指定项目的 **Name**。接下来，转到 **Resource Quotas** 选项卡并选择 **Add Resource** 选项。在 **Resource Type** 字段中，选择 **CPU Limit** 或 **Memory Limit** 并定义 **Project Limit** 和 **Namespace Default Limit** 值。
   ![](/img/v1.2/rancher/create-project.png)

你可以按如下方式配置 **Namespace** 限制：

1. 找到新创建的项目，然后选择 **Create Namespace**。
1. 指定所需的命名空间 **Name**，并调整限制。
1. 选择 **Create**。
   ![](/img/v1.2/rancher/create-namespace.png)

## 虚拟机内存开销
创建虚拟机 (VM) 后，VM 控制器会将开销资源无缝合并到 VM 的配置中。这些额外资源用于保证虚拟机一致且不间断地运行。请务必注意，由于包含这些开销资源，配置内存限制需要更高的内存预留。

例如，考虑使用以下配置创建新 VM：
- CPU：8 核
- 内存：16Gi

:::note
无论是 Linux 还是 Windows 操作系统都不会影响开销计算。
:::

内存开销在以下部分中计算：
- **内存页表开销**：每 512b RAM 大小占用一位。例如，16Gi 的内存需要 32Mi 的开销。
- **VM 固定开销**：由多个组件组成：
   - `VirtLauncherMonitorOverhead`：25Mi（virt-launcher-monitor 的 `ps` RSS）
   - `VirtLauncherOverhead`：75Mi（virt-launcher 进程的 `ps` RSS）
   - `VirtlogdOverhead`：17Mi（virtlogd 的 `ps` RSS）
   - `LibvirtdOverhead`：33Mi（libvirtd 的 `ps` RSS）
   - `QemuOverhead`：30Mi（qemu 的 `ps` RSS，减去其（stressed）Guest 的 RAM，减去虚拟页表）
- **每个 CPU (vCPU) 8Mi 开销**：此外，每个 vCPU 还添加 8Mi 开销，以及 IOThread 的固定 8Mi 开销。
- **额外增加的开销**：包含各种因素，例如视频 RAM 开销和架构开销。有关更多信息，请参阅[额外开销](https://github.com/kubevirt/kubevirt/blob/2bb88c3d35d33177ea16c0f1e9fffdef1fd350c6/pkg/virt-controller/services/template.go#L1853-L1890)。

此计算表明，VM 实例需要大约 276Mi 的额外内存开销。

有关详细信息，请参阅[内存开销](https://kubevirt.io/user-guide/virtual_machines/virtual_hardware/#memory-overhead)。

有关 Kubevirt 如何计算内存开销的更多信息，请参阅 [kubevirt/pkg/virt-controller/services/template.go](https://github.com/kubevirt/kubevirt/blob/v0.54.0/pkg/virt-controller/services/template.go#L1804)。

## 在迁移过程中自动调整 ResourceQuota
`ResourceQuota` 对象控制的分配资源配额达到其限制时，你将无法迁移虚拟机。迁移过程会自动创建一个镜像源虚拟机资源需求的新 Pod。如果这些 Pod 的创建条件超过定义的配额，则迁移操作无法继续。

_从 v1.2.0 起可用_

在 Harvester 中，`ResourceQuota` 值会在迁移之前动态扩展，以满足目标虚拟机的资源需求。迁移后，ResourceQuotas 将恢复为之前的配置。

请注意自动调整 `ResourceQuota` 大小的以下限制：
- 在虚拟机迁移过程中，`ResourceQuota` 无法更改。
- 提高 `ResourceQuota` 值时，如果你创建、启动或还原其他虚拟机，Harvester 将根据原始 `ResourceQuota` 来验证资源是否足够。如果不满足条件，系统将警告迁移不可进行。
- 扩容 `ResourceQuota` 后，非虚拟机 Pod 与虚拟机 Pod 之间可能会出现资源争用，导致迁移失败。因此，不建议将自定义容器工作负载和虚拟机部署到同一命名空间。
- 由于 webhook 验证器的并发限制，VM 控制器将执行二次验证以确认资源充足。如果资源不足，虚拟机的 `RunStrategy` 将自动配置为 `Halted`，而且新的注解 `harvesterhci.io/insufficient-resource-quota` 将被添加到 VM 对象中，从而告知你 VM 由于资源不足而关闭。
   ![](/img/v1.2/rancher/vm-annotation-insufficient-resource-quota.png)