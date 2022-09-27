---
sidebar_position: 1
sidebar_label: 创建虚拟机
title: ""
keywords:
  - Harvester
  - harvester
  - Rancher
  - rancher
  - 虚拟机
  - VM
  - 创建虚拟机
Description: 从"虚拟机"页面创建一个或多个虚拟机。
---

# 创建虚拟机

## 如何创建虚拟机

你可以从 **Virtual Machines** 页面创建一个或多个虚拟机。

:::note

请参阅[此页面](./create-windows-vm.md)创建 Windows 虚拟机。

:::

1. 选择创建单个实例或多个实例。
1. 选择 VM 的命名空间，只有 `harvester-public` 命名空间对所有用户可见。
1. 输入虚拟机名称（必填）。
1. （可选）VM 模板是可选的，你可以选择 `iso-image`、`raw-image` 或 `windows-iso-image` 模板来快速创建虚拟机实例。
1. 配置虚拟机的 CPU 和内存（如果要超额配置，请参阅 [overcommit-config](../settings/settings.md#overcommit-config)）。
1. 选择 SSH 密钥或上传新密钥。
1. 在 **Volumes** 选项卡上选择自定义虚拟机镜像卷。默认磁盘将是根磁盘。你可以向虚拟机添加更多磁盘。
1. 如果需要配置网络，前往 **Networks** 选项卡。
   1. **Management Network** 是默认添加的。如果配置了 VLAN 网络，则可以去掉它。
   1. 你还可以使用 VLAN 网络向 VM 添加其他网络。你可以先在 **Advanced > Networks** 上配置 VLAN 网络。
1. 运行策略、操作系统类型和 cloud-init 数据等高级选项是可选的。你可以在 **Advanced Options** 选项卡中进行配置。

![create-vm](/img/v1.0/vm/create-vm.png)

## 卷

你可以通过 `Volumes` 选项卡添加一个或多个卷，默认情况下第一个磁盘是根磁盘。你可以通过拖放卷或使用箭头按钮来更改引导顺序。

你可以通过以下类型访问磁盘：

| 类型 | 描述 |
|:--------|:-----------------------------------------------------------------------------------------------|
| disk | disk 磁盘会将卷作为普通磁盘公开给 VM。 |
| cd-rom | cd-rom 磁盘会将卷作为 CD-ROM 驱动器公开给 VM。默认情况下它是只读的。 |

![create-vm](/img/v1.0/vm/create-vm-volumes.png)

:::info Container Disk

`Container disk` 是可以分配给任意数量 VM 的临时存储设备。因此，对于需要复制大量 VM 工作负载，或注入不需要持久数据的主机驱动的用户而言，Container disk 是非常好用的。

注意：如果你的工作负载需要跨 VM 重启的持久根磁盘，则不推荐使用 Container Disk。

:::

## 网络

你可以通过 `Networks` 选项卡将 `management network`  或 `VLAN network` 添加到 VM 实例。如果你配置了 VLAN 网络，则 `management network` 是可选的。

网络接口是通过 `Type` 字段配置的。它们描述了 Guest 操作系统中虚拟接口的属性：

| 类型 | 描述 |
|:-----------|:-------------------------------------------------|
| bridge | 使用 Linux 网桥连接 |
| masquerade | 使用 iptables 规则连接到 NAT 流量 |

### 管理网络

管理网络是每个集群的默认网络，它可以为虚拟机的 eth0 网卡网络提供一个集群内可以访问的网络解决方案（如果虚拟机重启默认分配的 IP 将会发生变化）。

默认情况下，你可以通过集群节点内的管理网络访问虚拟机。

### 其他网络

你也可以使用 Harvester 的内置 [VLAN 网络](../networking/harvester-network.md) 来辅助网络连接虚拟机。

在网桥 VLAN 中，虚拟机通过 Linux `bridge` 连接到主机网络。网络 IPv4 地址通过 DHCPv4 分配给虚拟机。虚拟机需要配置为使用 DHCP 来获取 IPv4 地址。

## 高级选项

### 运行策略

_从 v1.0.2 起可用_

在 v1.0.2 之前，Harvester 使用 `Running`（布尔值）字段来确定 VM 实例应否运行。但是，有时候布尔值不足以满足用户的需求。例如，在某些情况下，用户希望从虚拟机内部关闭实例。如果使用 `Running` 字段，VM 将立即重启。

为了满足更多用户的需求，我们引入了 `RunStrategy` 字段。该字段的条件与 `Running` 有些重叠，因此二者是互斥的。目前我们定义了四个 `RunStrategy`：

- Always：VM 实例将始终存在。如果 VM 实例崩溃，则会生成一个新实例。这与 `Running: true` 相同。

- RerunOnFailure（默认）：如果前一个实例在错误状态下失败，将重新生成一个 VM 实例。如果 Guest 成功停止（例如从 Guest 内部关闭），则不会重新创建。

- Manual：VM 实例的存在与否仅由 `start/stop/restart` VirtualMachine 操作控制。

- Stop：将没有 VM 实例。如果 Guest 已经在运行，它将被停止。这与 `Running: false` 相同。


### 云配置

Harvester 支持将启动脚本分配给虚拟机实例，该脚本在 VM 初始化时自动执行。

这些脚本通常用于将用户和 SSH 密钥自动注入虚拟机，从而远程访问主机。例如，启动脚本可用于将凭证注入 VM，从而允许在远程主机上运行的 Ansible Job 访问和配置 VM。


#### Cloud-init
[Cloud-init](https://cloudinit.readthedocs.io/en/latest/) 是一个被广泛使用的工具，它是跨平台云实例初始化的行业标准方法。所有主流云镜像提供商（如 SUSE、Redhat、Ubuntu 等）都支持 cloud-init，因此 cloud-init 是向 VM 提供启动脚本的常用方法。

Harvester 支持通过临时磁盘将自定义 cloud-init 启动脚本注入到 VM 实例中。安装了 cloud-init 包的 VM 将检测临时磁盘，并在启动时执行自定义用户数据和网络数据脚本。




默认用户的密码配置示例：

```YAML
#cloud-config
password: password
chpasswd: { expire: False }
ssh_pwauth: True
```

使用 DHCP 的网络数据配置示例：

```YAML
version: 1
config:
  - type: physical
    name: eth0
    subnets:
      - type: dhcp
  - type: physical
    name: eth1
    subnets:
      - type: dhcp
```

你还可以使用 `Advanced > Cloud Config Templates` 功能为 VM 创建预定义的 cloud-init 配置模板。

#### 安装 QEMU GuestAgent
QEMU GuestAgent 是在虚拟机实例上运行的 Daemon 进程，它将有关 VM、用户、文件系统和辅助网络的信息传递给主机。

`Install guest agent` 复选框在创建新 VM 时默认启用。

![](/img/v1.0/vm/qga.png)

:::note

如果你的操作系统是 openSUSE 且版本低于 15.3，请将 `qemu-guest-agent.service` 替换为 `qemu-ga.service`。

:::
