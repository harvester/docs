---
sidebar_position: 1
sidebar_label: 安装
title: "安装"
---

本节介绍如何在安装失败的情况下进行故障排除或获取帮助。

## 登录到 Harvester 安装程序（实时操作系统）

你可以按下 `CTRL + ALT + F2` 组合键来切换到另一个 TTY，并使用以下凭证进行登录：

- 用户：`rancher`
- 密码：`rancher`

## 满足硬件要求

- 检查你的硬件是否满足完成安装的[最低要求](../install/requirements.md#硬件要求)。

## 收到提示信息：`"Loading images. This may take a few minutes..."`

- 这是因为系统没有默认路由，导致安装程序卡在当前状态。你可以执行以下命令来检查路由状态：

```shell
$ ip route
default via 10.10.0.10 dev mgmt-br proto dhcp        <-- Does a default route exist?
10.10.0.0/24 dev mgmt-br proto kernel scope link src 10.10.0.15
```

- 检查 DHCP 服务器是否提供默认路由选项。你也可以附上从 `/run/cos/target/rke2.log` 获取的信息。

## 修改 Agent 节点的集群 Token

如果 Agent 无法加入集群，可能与集群 Token 与服务器节点 Token 不一致有关。
为了确认问题，你可以连接到你的 Agent 节点（例如使用 [SSH](./os.md#如何登录到-harvester-节点)），并运行以下命令来检查 `rancherd` 的服务日志：

```shell
$ sudo journalctl -b -u rancherd
```

如果 Agent 节点中设置的集群 Token 与服务器节点 Token 不匹配，你会发现以下信息中的几个条目：

```shell
msg="Bootstrapping Rancher (master-head/v1.21.5+rke2r1)"
msg="failed to bootstrap system, will retry: generating plan: insecure cacerts download from https://192.168.122.115:443/cacerts: Get \"https://192.168.122.115:443/cacerts\": EOF"
```

要解决这个问题，你需要在 `rancherd` 配置文件 `/etc/rancher/rancherd/config.yaml` 中更新 Token 的值。

例如，如果服务器节点中设置的集群 Token 是 `ThisIsTheCorrectOne`，你需要更新 Token 的值，如下：

```yaml
token: 'ThisIsTheCorrectOne'
```

为了确保在重启后仍能维持更改，更新操作系统配置文件 `/oem/99_custom.yaml` 的 `token` 的值：

```yaml
name: Harvester Configuration
stages:
  ...
  initramfs:
  - commands:
    - rm -f /etc/sysconfig/network/ifroute-mgmt-br
    files:
    - path: /etc/rancher/rancherd/config.yaml
      permissions: 384
      owner: 0
      group: 0
      content: |
        role: cluster-init
        token: 'ThisIsTheCorrectOne' # <- Update this value
        kubernetesVersion: v1.21.5+rke2r1
        labels:
         - harvesterhci.io/managed=true
      encoding: ""
      ownerstring: ""
```

:::note

要查看当前集群 Token 的值，请登录到你的服务器节点（例如用 SSH）并查看 `/etc/rancher/rancherd/config.yaml` 文件。例如，你可以运行以下命令来仅显示 Token 的值：

```bash
$ sudo yq eval .token /etc/rancher/rancherd/config.yaml
```

:::

## 收集故障排除信息

在报告安装失败问题时，请包括以下信息：

- 安装失败的截图。
- 系统信息和日志。
   - 从 v1.0.2 开始可用

   请按照[登录 Harvester 安装程序（实时操作系统）](#登录到-harvester-安装程序实时操作系统)中的说明进行登录。然后，运行以下命令生成包含故障排除信息的 tarball：

   ```
   supportconfig -k -c
   ```

   命令输出的消息会包含生成的 tarball 路径。例如，以下示例中的路径为 `/var/loq/scc_aaa_220520_1021 804d65d-c9ba-4c54-b12d-859631f892c5.txz`：

   ![](/img/v1.1/troubleshooting/installation-support-config-example.png)

   :::note

   如果在 Harvester 配置文件中将 [`install.debug`](../install/harvester-configuration.md#installdebug) 字段设置为 `true`，则 PXE 引导安装失败会自动生成一个 tarball。

   :::

   - v1.0.2 之前的版本

   请获取以下文件的内容：

   ```
   /var/log/console.log
   /run/cos/target/rke2.log
   /tmp/harvester.*
   /tmp/cos.*
   ```

   以及以下命令的输出：

   ```
   blkid
   dmesg
   ```
