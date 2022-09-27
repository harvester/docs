---
sidebar_position: 2
sidebar_label: ISO 安装
title: ""
keywords:
  - Harvester
  - harvester
  - Rancher
  - rancher
  - ISO 安装
Description: 如果需要获取 Harvester ISO，访问 GitHub 上的发行版本进行下载。在安装过程中，你可以选择组建一个新的集群，或者将节点加入到现有的集群中。
---

# ISO 安装

如果需要获取 Harvester ISO 镜像，访问 [GitHub 上的发行版本](https://github.com/harvester/harvester/releases)进行下载。

在安装过程中，你可以选择组建一个新的集群，或者将节点加入到现有的集群中。

注意：这个[视频](https://youtu.be/X0VIGZ_lExQ)概述了 ISO 安装的过程。

<div class="text-center">
<iframe width="950" height="475" src="https://www.youtube.com/embed/X0VIGZ_lExQ" title="YouTube video player" frameborder="0" allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture" allowfullscreen></iframe>
</div>

1. 安装 Harvester ISO 磁盘并通过选择 `Harvester Installer` 来启动服务器。
   ![iso-install.png](/img/v1.0/install/iso-install.png)
1. 通过创建新的 Harvester 集群或加入现有集群来选择安装模式。
1. 选择要安装 Harvester 集群的设备。
   - 注意：默认情况下，Harvester 对 UEFI 和 BIOS 使用 [GPT](https://en.wikipedia.org/wiki/GUID_Partition_Table) 分区架构。如果你使用 BIOS 引导，则可以选择 [MBR](https://en.wikipedia.org/wiki/Master_boot_record)。
      ![iso-install-disk.png](/img/v1.0/install/iso-install-disk.png)
1. 配置主机名并选择管理网络的网络接口。默认情况下，Harvester 将创建一个名为 `harvester-mgmt` 的绑定 NIC，IP 地址可以通过 DHCP 进行配置或静态分配。<small>（注意：Node IP 在 Harvester 集群的生命周期中无法更改。如果使用了 DHCP，用户必须确保 DHCP 服务器始终为同一个节点提供相同的 IP。由于节点 IP 发生变化，相关节点无法加入集群，甚至会破坏集群)。</small>

   ![iso-installed.png](/img/v1.0/install/iso-nic-config.gif)
1. （可选）配置 DNS 服务器。使用逗号作为分隔符。
1. 配置用于访问集群或加入集群中其他节点的 `Virtual IP`<small>（注意：如果你的 IP 地址是通过 DHCP 配置的，则需要在 DHCP 服务器上配置静态 MAC 到 IP 地址的映射，以便拥有持久的 Virtual IP，VIP 必须与所有节点 IP 都不一样）。</small>
1. 配置 `cluster token`。这个 Token 会用于将其他节点添加到集群中。
1. 为主机配置登录密码。默认的 SSH 用户是 `rancher`。
1. 建议配置 NTP 服务器以确保所有节点的时间同步。默认值是 `0.suse.pool.ntp.org`。
1. （可选）如果你需要使用 HTTP 代理来访问外部环境，在此处输入代理的 URL。否则，请留空。
1. （可选）你可以从远端服务器 URL 导入 SSH 密钥。你的 GitHub 公钥可以与 `https://github.com/<username>.keys` 一起使用。
1. （可选）如果你需要使用 [Harvester 配置文件](./harvester-configuration.md)来自定义主机，在此处输入 HTTP URL。
1. 确认安装选项后，Harvester 会自动安装到你的主机上。安装过程可能需要几分钟。
1. 主机会在安装完成后重启。重启后，包含管理 URL 和状态的 Harvester 控制台会显示。你可以使用 `F12` 在 Harvester 控制台和 Shell 之间切换。
1. 网页界面的默认 URL 是 `https://your-virtual-ip`。
   ![iso-installed.png](/img/v1.0/install/iso-installed.png)
1. 在首次登录时，你会收到为默认 `admin` 用户设置密码的提示。
   ![first-login.png](/img/v1.0/install/first-time-login.png)
