---
sidebar_position: 17
sidebar_label: 常见问题
title: "常见问题"
---

本文包含了用户常见的 Harvester 问题。

### 如何通过 SSH 登录到 Harvester 节点？
```shell
$ ssh rancher@node-ip
```

### Harvester 仪表盘的默认登录用户名和密码是什么？
```shell
username: admin
password: # 首次登录时会提示你设置默认密码
```

### 如何访问 Harvester 集群的 kubeconfig 文件？

选项 1：你可以从 Harvester 仪表盘的支持页面下载 kubeconfig 文件。
![harvester-kubeconfig.png](/img/v1.2/harvester-kubeconfig.png)

选项 2：你可以从其中一个 Harvester 管理节点获取 kubeconfig 文件。例如：
```shell
$ sudo su
$ cat /etc/rancher/rke2/rke2.yaml
```

### 如何在运行的虚拟机上安装 qemu-guest-agent
```shell
# cloud-init 只会执行一次。使用以下命令添加 cloud-init 配置后请重新启动它。
$ cloud-init clean --logs --reboot
```
[https://cloudinit.readthedocs.io/en/latest/reference/cli.html#clean](https://cloudinit.readthedocs.io/en/latest/reference/cli.html#clean)

### 如何重置管理员密码？

如果你忘记了管理员密码，请通过命令行进行重置。SSH 到其中一个管理节点并运行以下命令：
```shell
# 切换到 root 并运行：
$ kubectl  -n cattle-system exec $(kubectl --kubeconfig $KUBECONFIG -n cattle-system get pods -l app=rancher --no-headers | head -1 | awk '{ print $1 }') -c rancher -- reset-password
New password for default administrator (user-xxxxx):
<new_password>
```

### 我添加了一个带分区的磁盘。为什么没有被检测到？

从 Harvester v1.0.2 开始，我们不再支持添加其他分区磁盘，因此请务必先删除所有分区（例如，使用 `fdisk`）。

### 为什么有些 Harvester Pod 会变成 ErrImagePull/ImagePullBackOff？

可能是因为你的 Harvester 集群是离线的，并且缺少某些预加载的容器镜像。Kubernetes 有可以对膨胀镜像存储进行垃圾收集的机制。当存储容器镜像的分区存储超过 85% 时，`kubelet` 会尝试根据上次使用镜像的时间来修剪镜像（从最旧的镜像开始），直到占用率再次低于 80%。这些数字（85%/80%）是 Kubernetes 的默认高/低阈值。

要从此状态恢复，请根据集群的配置执行以下操作之一：
- 从集群外部的源中拉取丢失的镜像（如果是离线环境，你可能需要事先设置 HTTP 代理）。
- 手动从 Harvester ISO 镜像导入镜像。

:::note

以 v1.1.2 为例，从官方网址下载 Harvester ISO 镜像。然后从 ISO 镜像中提取镜像列表，从而决定我们要导入哪个镜像 tarball。例如，如果要导入缺少的容器镜像 `rancher/harvester-upgrade`：

```shell
$ curl -sfL https://releases.rancher.com/harvester/v1.1.2/harvester-v1.1.2-amd64.iso -o harvester.iso

$ xorriso -osirrox on -indev harvester.iso -extract /bundle/harvester/images-lists images-lists

$ grep -R "rancher/harvester-upgrade" images-lists/
images-lists/harvester-images-v1.1.2.txt:docker.io/rancher/harvester-upgrade:v1.1.2
```

找出镜像 tarball 的位置，并将其从 ISO 镜像中提取。解压缩提取的 zstd 镜像 tarball。

```shell
$ xorriso -osirrox on -indev harvester.iso -extract /bundle/harvester/images/harvester-images-v1.1.2.tar.zst harvester.tar.zst

$ zstd -d --rm harvester.tar.zst
```

将镜像 tarball 上传到需要恢复的 Harvester 节点。最后，执行以下命令在每个节点上导入容器镜像。

```shell
$ ctr -n k8s.io images import harvester.tar
$ rm harvester.tar
```

:::

- 参考其他节点找到该节点丢失的镜像，然后从仍具有该镜像的节点导出镜像，并将镜像导入到丢失镜像的节点上。

为了防止这种情况发生，如果镜像存储磁盘空间紧张，我们建议在每次成功升级 Harvester 后清理以前版本中未使用的容器镜像。我们提供了一个 [harv-purge-images 脚本](https://github.com/harvester/upgrade-helpers/blob/main/bin/harv-purge-images.sh)，可用于轻松清理磁盘空间，特别容器镜像存储。该脚本必须在每个 Harvester 节点上执行。例如，如果原来是 v1.1.2 的集群现在升级到了 v1.2.0，你可以执行以下操作来丢弃仅在 v1.1.2 中使用但在 v1.2.0 中不再需要的容器镜像：

```shell
# on each node
$ ./harv-purge-images.sh v1.1.2 v1.2.0
```

:::caution

- 该脚本仅下载镜像列表并比较两者以计算两个版本之间的差异。它不与集群通信，因此不知道集群是从哪个版本升级的。
- 我们发布了自 v1.1.0 以来每个版本的镜像列表。对于 v1.1.0 之前的集群，你需要手动清理旧镜像。

:::
