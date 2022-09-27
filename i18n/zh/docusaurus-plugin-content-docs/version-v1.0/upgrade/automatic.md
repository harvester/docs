---
sidebar_position: 1
sidebar_label: 升级 Harvester
title: ""
keywords:
  - Harvester
  - harvester
  - Rancher
  - rancher
  - 升级 Harvester
Description: 升级 Harvester 有两种方法。你可以使用 ISO 镜像或通过 UI 进行升级。
---

# 升级 Harvester

## 升级支持矩阵

下表介绍了版本的升级路径：

| 原版本 | 支持的新版本 |
|----------------------|--------------------------|
| [v1.0.2](./v1-0-2-to-v1-0-3.md) | v1.0.3 |
| [v1.0.1](./previous-releases/v1-0-1-to-v1-0-2.md) | v1.0.2 |
| [v1.0.0](./previous-releases/v1-0-0-to-v1-0-1.md) | v1.0.1 |

## 开始升级

我们仍在努力实现零停机升级。请在升级 Harvester 集群之前按照以下步骤操作：

:::caution

- 在升级 Harvester 集群之前，我们强烈建议：
   - 关闭所有虚拟机（Harvester GUI -> Virtual Machines -> 选择虚拟机 -> Actions -> Stop）。
   - 备份虚拟机。
- 不要在升级期间操作集群，例如，创建新的虚拟机、上传新的镜像等。
- 确保你的硬件符合**首选**[硬件要求](../index.md#硬件要求)。这是因为升级会消耗中间资源。
- 确保每个节点至少有 25 GB 的可用空间 (`df -h /usr/local/`)。

:::

:::caution

- 确保所有节点的时间同步。建议使用 NTP 服务器来同步时间。如果你在安装期间没有配置 NTP 服务器，你可以**在每个节点上**手动添加一个 NTP 服务器：

   ```
   $ sudo -i

   # 添加时间服务器
   $ vim /etc/systemd/timesyncd.conf
   [ntp]
   NTP=0.pool.ntp.org

   # 启用并启动 systemd-timesyncd
   $ timedatectl set-ntp true

   # 检查状态
   $ sudo timedatectl status
   ```

:::

:::caution

- 连接到 PCI 网桥的 NIC 可能会在升级后重命名。请查看[知识库](https://harvesterhci.io/kb/nic-naming-scheme)了解更多信息。

:::

- 请务必先阅读本文档顶部的警告内容。
- Harvester 会定期检查是否有新的可升级版本。如果有新版本，仪表板页面上会显示升级按钮。
   - 如果集群处于离线环境中，请先参阅[准备离线升级](#准备离线升级)。你还可以使用该部分中的方法加速 ISO 下载。
- 导航到 Harvester GUI，然后单击仪表板页面上的升级按钮：

   ![](/img/v1.0/upgrade/upgrade_button.png)

- 选择要升级的版本：

   ![](/img/v1.0/upgrade/upgrade_select_version.png)

- 单击顶部的圆圈以显示升级进度：
   ![](/img/v1.0/upgrade/upgrade_progress.png)


## 准备离线升级

:::caution

请务必先查看[升级支持矩阵](#升级支持矩阵)了解可升级的版本。

:::

- 从 [Releases 页面](https://github.com/harvester/harvester/releases)下载 Harvester ISO 文件。
- 将 ISO 保存到本地 HTTP 服务器。假设文件托管在 `http://10.10.0.1/harvester.iso` 中。
- 从 Releases 页面下载版本文件，例如 `https://releases.rancher.com/harvester/{version}/version.yaml`。

   - 替换 `version.yaml` 文件中的 `isoURL` 值：

      ```
      apiVersion: harvesterhci.io/v1beta1
      kind: Version
      metadata:
        name: v1.0.2
        namespace: harvester-system
      spec:
        isoChecksum: <SHA-512 checksum of the ISO>
        isoURL: http://10.10.0.1/harvester.iso  # change to local ISO URL
        releaseDate: '20220512'
      ```

   - 假设文件托管在 `http://10.10.0.1/version.yaml` 中。

- 登录到其中一个 controlplane 节点。
- 成为 root 并创建一个版本：

   ```
   rancher@node1:~> sudo -i
   rancher@node1:~> kubectl create -f http://10.10.0.1/version.yaml
   ```

- Harvester GUI Dashboard 页面上应显示升级按钮。
