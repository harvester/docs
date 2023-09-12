---
sidebar_position: 8
sidebar_label: 仅安装 Harvester 二进制文件
title: "仅安装 Harvester 二进制文件"
keywords:
  - Harvester
  - harvester
  - Rancher
  - rancher
  - ISO 安装
Description: 如果需要获取 Harvester ISO，访问 GitHub 上的发行版本进行下载。安装过程中，你可以选择仅安装二进制文件。
---

_从 v1.2.0 起可用_

`Install Harvester binaries only` 模式允许你仅安装和配置二进制文件，是云和边缘用例的理想选择。

![choose-installation-mode.png](/img/v1.2/install/choose-installation-mode.png)

### 背景
目前，启动新的 Harvester 节点时，它需要成为集群中的第一个节点或加入现有集群。
当你已经足够了解安装 Harvester 节点的环境时，这两种模式非常有用。
但是，对于裸机云提供商和边缘等用例，这些安装模式会将操作系统和 Harvester 内容加载到节点，但你无法配置网络。而且，K8s 和网络配置将不会被应用。

如果选择 `Install Harvester binaries only`，你需要在首次启动后执行其他配置：

- Harvester 的创建/加入选项
- 管理网络接口详细信息
- 集群令牌
- 节点密码

然后，安装程序将应用端点配置并启动 Harvester。你无需进一步重新启动。

### 流盘模式
Harvester 发布了预装 Harvester 的原始镜像工件。Harvester 安装程序现在支持将预安装的镜像直接流式传输到磁盘，从而更好地与云提供商集成。

在 `Equinix Metal`上，你可以使用以下内核参数来使用流模式：

```
ip=dhcp net.ifnames=1 rd.cos.disable rd.noverifyssl root=live:http://${artifactEndpoint}/harvester-v1.2.0-rootfs-amd64.squashfs harvester.install.automatic=true harvester.scheme_version=1 harvester.install.device=/dev/vda  harvester.os.password=password harvester.install.raw_disk_image_path=http://${artifactEndpoint}/harvester-v1.2.0-amd64.raw harvester.install.mode=install console=tty1 harvester.install.tty=tty1 harvester.install.config_url=https://metadata.platformequinix.com/userdata harvester.install.management_interface.interfaces="name:enp1s0" harvester.install.management_interface.method=dhcp harvester.install.management_interface.bond_options.mode=balance-tlb harvester.install.management_interface.bond_options.miimon=100
```

:::note
流式传输到磁盘时，建议将原始磁盘工件托管在更靠近目标的位置，因为原始磁盘工件接近 16G。
:::