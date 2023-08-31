---
id: index
sidebar_position: 1
sidebar_label: 创建虚拟机
title: "创建虚拟机"
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

## 如何创建虚拟机

你可以从 **Virtual Machines** 页面创建一个或多个虚拟机。

:::note

请参阅[此页面](./create-windows-vm.md)创建 Windows 虚拟机。

:::

1. 选择创建单个实例或多个实例。
1. 选择 VM 的命名空间，只有 `harvester-public` 命名空间对所有用户可见。
1. 输入虚拟机名称（必填）。
1. （可选）VM 模板是可选的，你可以选择 `iso-image`、`raw-image` 或 `windows-iso-image` 模板来快速创建虚拟机实例。
1. 配置虚拟机的 CPU 和内存（如果要超额配置，请参阅 [overcommit-config](../advanced/settings.md#overcommit-config)）。
1. 选择 SSH 密钥或上传新密钥。
1. 在 **Volumes** 选项卡上选择自定义虚拟机镜像卷。默认磁盘将是根磁盘。你可以向虚拟机添加更多磁盘。
1. 如果需要配置网络，前往 **Networks** 选项卡。
   1. **Management Network** 是默认添加的。如果配置了 VLAN 网络，则可以去掉它。
   1. 你还可以使用 VLAN 网络向 VM 添加其他网络。你可以先在 **Advanced > Networks** 上配置 VLAN 网络。
1. 运行策略、操作系统类型和 cloud-init 数据等高级选项是可选的。你可以在 **Advanced Options** 选项卡中进行配置。

![create-vm](/img/v1.2/vm/create-vm.png)

## 卷

你可以通过 `Volumes` 选项卡添加一个或多个卷，默认情况下第一个磁盘是根磁盘。你可以通过拖放卷或使用箭头按钮来更改引导顺序。

你可以通过以下类型访问磁盘：

| 类型 | 描述 |
|:--------|:-----------------------------------------------------------------------------------------------|
| disk | disk 磁盘会将卷作为普通磁盘公开给 VM。 |
| cd-rom | cd-rom 磁盘会将卷作为 CD-ROM 驱动器公开给 VM。默认情况下它是只读的。 |

添加新的空卷时，你可以指定卷的 [StorageClass](../advanced/storageclass.md)。对于其他卷（例如 VM 镜像），你可以在创建镜像时定义 `StorageClass`。

![create-vm](/img/v1.2/vm/create-vm-volumes.png)

### 添加容器磁盘

容器磁盘是一种临时存储卷，可以分配给任意数量的虚拟机，并支持在容器镜像仓库中存储和分发虚拟机磁盘。容器磁盘：
- 对于需要复制大量虚拟机工作负载，或注入不需要持久数据的机器驱动程序的用户来说，是一个理想的工具。临时卷专为需要更多存储空间但不关心数据是否在虚拟机重启后持久存储，或仅需要文件中存在一些只读输入数据（例如配置数据或密钥）的虚拟机而设计。
- 对于需要在虚拟机重启时使用持久根磁盘的工作负载来说，不是一个好的解决方案。

容器磁盘是在通过 Docker 镜像创建虚拟机时添加的。创建虚拟机时，请按以下步骤操作：

1. 转到 **Volumes** 选项卡。
1. 选择 **Add Container**。
   ![add-container-volume](/img/v1.2/vm/add-container-volume-1.png)
1. 输入容器磁盘的 **Name**。
1. 选择磁盘 **Type**。
1. 添加 **Docker Image**。
   - 格式为 qcow2 或 raw 的磁盘镜像必须放置在 `/disk` 目录中。
   - 支持 Raw 和 qcow2 格式，但建议使用 qcow2 来减小容器镜像的大小。如果你使用了不受支持的镜像格式，虚拟机将卡在 `Running` 状态。
   - 容器磁盘还支持将磁盘镜像存储在 `/disk` 目录中。你可以在[此处](https://kubevirt.io/user-guide/virtual_machines/disks_and_volumes/#containerdisk-workflow-example)找到创建此类容器镜像的示例。
1. 选择 **Bus** 类型。  
   ![add-container-volume](/img/v1.2/vm/add-container-volume-2.png)

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
network:
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

![](/img/v1.2/vm/qga.png)

:::note

如果你的操作系统是 openSUSE 且版本低于 15.3，请将 `qemu-guest-agent.service` 替换为 `qemu-ga.service`。

:::

### TPM 设备

_从 v1.2.0 起可用_

[可信平台模块 (TPM)](https://en.wikipedia.org/wiki/Trusted_Platform_Module) 是一种使用加密密钥来保护硬件的加密处理器。

根据 [Windows 11 要求](https://learn.microsoft.com/en-us/windows/whats-new/windows-11-requirements)，TPM 2.0 设备是 Windows 11 的硬性要求。

在 Harvester UI 中，你可以通过选中 **Advanced Options** 选项卡中的 `Enable TPM` 来要将仿真 TPM 2.0 设备添加到 VM 中。

:::note

目前仅支持非持久性 vTPM，而且每次关闭虚拟机后其状态都会被清除。因此，请不要启用 [Bitlocker](https://learn.microsoft.com/en-us/windows/security/information-protection/bitlocker/bitlocker-overview)。

:::

## ISO 安装的一次性引导

创建从 cd-rom 引导的虚拟机时，你可以通过使用 **bootOrder** 选项，使操作系统可以在安装镜像时通过 cd-rom 引导，并在安装完成后通过磁盘引导，而且不需要卸载光盘。

以下示例描述了如何安装 [openSUSE Leap 15.4](https://get.opensuse.org/leap/15.4/) ISO 镜像：

1. 点击左侧边栏中的 **Images** 并下载 openSUSE Leap 15.4 ISO 镜像。
2. 点击左侧边栏中的 **Virtual Machines**，然后创建一个 VM。在此步骤中，你需要填写以下 VM 基本配置。
3. 点击 **Volumes** 选项卡，在 **Image** 字段中，选择在步骤 1 中下载的镜像并确保 **Type** 设置为 `cd-rom`。
4. 单击 **Add Volume** 并选择现有的 **StorageClass**。
5. 将 **Volume** 拖到 **Image Volume** 的顶部，如下所示。这样，**Volume**  的**bootOrder** 会变成 `1`。

![one-time-boot-create-vm-bootorder](/img/v1.2/vm/one-time-boot-create-vm-bootorder.png)

6. 单击 **Create**。
7. 打开刚刚创建的 VM web-vnc 并按照安装程序提示的说明进行操作。
8. 安装完成后，按照操作系统的提示重启虚拟机（系统启动后可以取出安装媒体）。
9. 虚拟机重新启动后，它会自动通过磁盘卷引导并启动操作系统。


