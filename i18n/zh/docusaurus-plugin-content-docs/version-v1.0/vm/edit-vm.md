---
sidebar_position: 3
sidebar_label: 编辑虚拟机
title: ""
keywords:
  - Harvester
  - harvester
  - Rancher
  - rancher
  - 虚拟机
  - VM
  - 编辑虚拟机
Description: 在 Harvester VM 页面编辑虚拟机。
---

# 编辑虚拟机

## 如何编辑虚拟机

创建虚拟机后，你可以通过单击 `⋮` 按钮并选择 `Edit Configurations` 按钮来编辑虚拟机。

:::note

除了编辑描述之外，你还需要重启虚拟机才能使配置更改生效。

:::

### 基本信息

你可以在 **Basics** 选项卡上配置所需的 CPU 和内存，此配置需要重启 VM 才能生效。

首次启动虚拟机时，SSH 密钥会被注入到 cloud-init 脚本中。为了使修改后的 SSH 密钥在虚拟机启动后生效，你需要在 Guest 操作系统中[重新安装](../faq.md#如何在运行的虚拟机上安装-qemu-guest-agent) cloud-init 脚本。

![edit-vm](/img/v1.0/vm/edit-vm-basics.png)

### 网络

你可以在启动后向 VM 实例添加其他 VLAN 网络。如果你配置了 VLAN 网络，则 `管理网络` 是可选的。

除非你在 Guest 操作系统中手动配置了其他 NIC（例如[将 wicked 用于 OpenSUSE Server](https://doc.opensuse.org/documentation/leap/reference/html/book-reference/cha-network.html#sec-network-manconf) 或[将 netplan 用于 Ubuntu Server](https://ubuntu.com/server/docs/network-configuration)），否则默认情况下不会启用其他 NIC。

![edit-vm](/img/v1.0/vm/edit-vm-networks.png)

有关网络实现的更多详细信息，请参阅[网络](../networking/harvester-network.md)页面。

### 卷

你可以在启动后向 VM 添加其他卷。你还可以在关闭虚拟机后扩展卷的大小，即通过点击虚拟机进入 `Volumes` 选项卡，然后点击 `Edit Image Volume` 来编辑卷的大小。大小调整完成并重启 VM 后，你的磁盘将自动完成扩展。

![edit-vm](/img/v1.0/vm/edit-vm-volumes.png)

### 访问凭证

如果你的 Guest 操作系统安装了 QUEMU GuestAgent，访问凭证将允许你在运行时动态注入基本认证或 SSH 密钥。

有关更多详细信息，请查看参阅[通过 QEMU Guest Agent 进行动态 SSH 密钥注入](./access-to-the-vm.md#通过-qemu-guest-agent-进行动态-ssh-密钥注入)。