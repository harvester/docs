---
sidebar_position: 2
sidebar_label: ISO 安装
title: "ISO 安装"
keywords:
  - Harvester
  - harvester
  - Rancher
  - rancher
  - ISO 安装
Description: 如果需要获取 Harvester ISO，访问 GitHub 上的发行版本进行下载。在安装过程中，你可以选择组建一个新的集群，或者将节点加入到现有的集群中。
---

Harvester 作为可启动的设备镜像提供，你可以使用 ISO 镜像将其直接安装在裸机服务器上。要获取 ISO 镜像，请从 [Harvesterreleases](https://github.com/harvester/harvester/releases) 页面下载 **💿harvester-v1.x.x-amd64.iso**。

在安装过程中，你可以选择**创建新的 Harvester 集群**或**将节点加入现有的 Harvester 集群**。

以下[视频](https://youtu.be/X0VIGZ_lExQ)概述了 ISO 安装的过程。

<div class="text-center">
<iframe width="800" height="400" src="https://www.youtube.com/embed/X0VIGZ_lExQ" title="YouTube video player" frameborder="0" allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture" allowfullscreen></iframe>
</div>

## 安装步骤

1. 挂载 Harvester ISO 文件并通过选择 `Harvester Installer` 来启动服务器。

   ![iso-install.png](/img/v1.1/install/iso-install.png)

1. 使用箭头键选择安装模式。默认情况下，第一个节点将是集群的管理节点。

   ![choose-installation-mode.png](/img/v1.1/install/choose-installation-mode.png)

   - `Create a new Harvester cluster`：创建一个全新的 Harvester 集群。

   - `Join an existing Harvester cluster`：加入现有的 Harvester 集群。你需要要加入的集群的 VIP 和集群 Token。

   :::info
   当有 3 个节点时，首先添加的另外 2 个节点会自动提升为管理节点，从而形成 HA 集群。如果你想提升其它地区的管理节点，你可以在执行自定义主机的步骤时提供一个 [Harvester 配置](./harvester-configuration.md)的 URL，在 [os.labels](./harvester-configuration.md#oslabels) 中添加节点标签 `topology.kubernetes.io/zone`。在这种情况下，至少需要三个不同的地区。
   :::

1. 选择要安装 Harvester 集群的安装磁盘。默认情况下，Harvester 对 UEFI 和 BIOS 使用 [GUID 分区表 (GPT)](https://en.wikipedia.org/wiki/GUID_Partition_Table) 分区架构。如果你使用 BIOS 启动，则可以选择 [Master boot record (MBR)](https://en.wikipedia.org/wiki/Master_boot_record)。

   ![iso-install-disk.png](/img/v1.1/install/iso-install-disk.png)

1. 选择要存储虚拟机数据的数据磁盘。建议选择单独的磁盘来存储 VM 数据。

   ![iso-install-disk.png](/img/v1.1/install/iso-select-data-disk.png)

1. 配置节点的 `HostName`。

   ![config-hostname.png](/img/v1.1/install/config-hostname.png)

1. 配置管理网络的网络接口。默认情况下，Harvester 创建一个名为 `mgmt-bo` 的 bond NIC，IP 地址可以通过 DHCP 配置或静态分配。

   :::note
   在 Harvester 集群的整个生命周期中都无法更改节点 IP。如果你使用 DHCP，则必须确保 DHCP 服务器始终为同一节点提供相同的 IP。如果节点 IP 发生变化，相关节点将无法加入集群，甚至可能破坏集群。
   :::

   ![iso-installed.png](/img/v1.1/install/iso-nic-config.png)

1. （可选）配置 `DNS Servers`。使用逗号作为分隔符来添加更多 DNS 服务器。要使用默认 DNS 服务器，将其留空。

   ![config-dns-server.png](/img/v1.1/install/config-dns-server.png)

1. 选择 `VIP Mode` 以配置虚拟 IP (VIP)。该 VIP 用于访问集群或让其他节点加入集群。

   :::note
   如果使用了 DHCP 配置 IP 地址，你需要在 DHCP 服务器上配置静态 MAC 到 IP 地址映射，从而获得持久性的虚拟 IP (VIP)，并且 VIP 必须是唯一的。
   :::

   ![config-virtual-ip.png](/img/v1.1/install/config-virtual-ip.png)

1. 配置 `Cluster token`。这个 Token 用于将其他节点添加到集群中。

   ![config-cluster-token.png](/img/v1.1/install/config-cluster-token.png)

1. 配置并确认用于访问节点的 `Password`。默认的 SSH 用户是 `rancher`。

   ![config-password.png](/img/v1.1/install/config-password.png)

1. 配置 `NTP服务器` 以确保所有节点的时间同步。默认为 `0.suse.pool.ntp.org`。使用逗号作为分隔符来添加更多 NTP 服务器。

   ![config-ntp-server.png](/img/v1.2/install/config-ntp-server.png)

1. （可选）如果你需要使用 HTTP 代理来访问外部环境，请输入 `Proxy address`。否则，请留空。

   ![config-proxy.png](/img/v1.1/install/config-proxy.png)

1. （可选）你可以选择通过提供 `HTTP URL` 导入 SSH 密钥。例如，使用你的 GitHub 公钥 `https://github.com/<username>.keys`。

   ![import-ssh-keys.png](/img/v1.1/install/import-ssh-keys.png)

1. （可选）如果你需要使用 [Harvester 配置文件](./harvester-configuration.md)来自定义主机，在此处输入 `HTTP URL`。

   ![remote-config.png](/img/v1.1/install/remote-config.png)

1. 检查并确认你的安装选项。确认安装选项后，Harvester 会安装到你的主机上。安装可能需要几分钟。

   ![confirm-install.png](/img/v1.1/install/confirm-install.png)

1. 安装完成后，你的节点将重启。重启后，Harvester 控制台将显示管理 URL 和状态。网页界面的默认 URL 是 `https://your-virtual-ip`。你可以使用 `F12` 从 Harvester 控制台切换到 Shell，然后键入 `exit` 返回到 Harvester 控制台。

   ![iso-installed.png](/img/v1.1/install/iso-installed.png)

1. 在首次登录时，你会收到为默认 `admin` 用户设置密码的提示。

   ![first-login.png](/img/v1.1/install/first-time-login.png)

<!-- :::note
In some cases, if you are using an older VGA connector, you may encounter an `panic: invalid dimensions` error with ISO installation. See issue [#2937](https://github.com/harvester/harvester/issues/2937#issuecomment-1278545927) for a workaround.
::: -->

## 已知问题

### 使用较旧的显卡或显示器时，安装程序可能会崩溃

如果你使用的是较旧的显卡/显示器，你可能会在 ISO 安装过程中遇到 `panic: invalid dimensions` 错误。

![invalid-dimensions.png](/img/v1.1/install/invalid-dimensions.png)

我们正在处理这个已知问题，并将在未来的版本中修复它。以下是一个临时解决方法：

1. 使用 ISO 启动，然后按 `E` 编辑第一个菜单项：

   ![grub-menu.png](/img/v1.1/install/grub-menu.png)

1. 将 `vga=792` 附加到以 `$linux` 开头的行：

   ![edit-menu-entry.png](/img/v1.1/install/edit-menu-entry.png)

1. 按 `Ctrl+X` 或 `F10` 启动。
