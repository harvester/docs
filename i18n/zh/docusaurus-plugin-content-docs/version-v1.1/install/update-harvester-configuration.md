---
sidebar_position: 6
sidebar_label: 更新 Harvester 配置
title: "安装后更新 Harvester 配置"
keywords:
  - Harvester 配置
  - 配置
Description: 如何在安装完成后更新 Harvester 配置
---

Harvester 的操作系统采用了不可变设计，换言之，操作系统中的大多数文件在重启后会恢复到其预先配置的状态。Harvester OS 会在引导期间从配置文件加载系统组件的预配置值。

本文介绍了如何编辑一些最需要的 Harvester 配置。要更新配置，你必须先更新系统中的运行时值，然后更新配置文件来让更改在重启时保留。

:::note

如果你升级自 `v1.1.2` 之前的版本，示例中的 `cloud-init` 文件为 `/oem/99_custom.yaml`。如果需要，请替换该值。

:::

## DNS 服务器

### 运行时更改

1. 登录到 Harvester 节点并成为 root。有关详细信息，请参阅[如何登录到 Harvester 节点](../troubleshooting/os.md#如何登录到-harvester-节点)。
1. 编辑 `/etc/sysconfig/network/config` 并更新以下行。如果有多个服务器，请使用空格分隔 DNS 服务器地址。

   ```
   NETCONFIG_DNS_STATIC_SERVERS="8.8.8.8 1.1.1.1"
   ```

1. 使用以下命令更新并重新加载配置：

   ```
   netconfig update
   ```

1. 使用 `cat` 命令确认文件 `/etc/resolv.conf` 包含正确的 DNS 服务器：

   ```
   cat /etc/resolv.conf
   ```

### 持久化配置

1. 备份 elemental `cloud-init` 文件 `/oem/90_custom.yaml`，如下：

   ```
   cp /oem/90_custom.yaml /oem/install/90_custom.yaml.$(date --iso-8601=minutes)
   ```

1. 编辑 `/oem/90_custom.yaml` 并更新 yaml 路径 `stages.initramfs[0].commands` 下的值。`commands` 数组必须包含操作 `NETCONFIG_DNS_STATIC_SERVERS` 配置的行。如果该行不存在，则添加该行。

   以下示例添加了更改 `NETCONFIG_DNS_STATIC_SERVERS` 配置的行：

   ```
   stages:
     initramfs:
       - commands:
           - sed -i 's/^NETCONFIG_DNS_STATIC_SERVERS.*/NETCONFIG_DNS_STATIC_SERVERS="8.8.8.8 1.1.1.1"/' /etc/sysconfig/network/config
   ```

   替换 DNS 服务器地址并保存文件。Harvester 将在重启后设置新的服务器。


## NTP 服务器

### 运行时更改

1. 登录到 Harvester 节点并成为 root。有关详细信息，请参阅[如何登录到 Harvester 节点](../troubleshooting/os.md#如何登录到-harvester-节点)。
1. 编辑 `/etc/systemd/timesyncd.conf` 并在 `NTP=` 设置中指定 NTP 服务器：

   ```
   [Time]
   NTP = 0.suse.pool.ntp.org 1.suse.pool.ntp.org
   ```

1. 重启 `systemd-timesyncd.service` 服务：

   ```
   systemctl restart systemd-timesyncd.service
   ```

1. 显示时间同步状态：

   ```
   timedatectl timesync-status
   ```

### 持久化配置

1. 备份 elemental `cloud-init` 文件 `/oem/90_custom.yaml`，如下：

   ```
   cp /oem/90_custom.yaml /oem/install/90_custom.yaml.$(date --iso-8601=minutes)
   ```

1. 编辑 `/oem/90_custom.yaml` 并更新 yaml 路径 `stages.initramfs[0].timesyncd`。`timesyncd` 映射必须采用以下格式：

   ```
   stages:
     initramfs:
     - ...
       timesyncd:
       NTP: 0.suse.pool.ntp.org 1.suse.pool.ntp.org
   ```

1. 编辑 `/oem/90_custom.yaml` 并更新 yaml 路径 `stages.initramfs[0].systemctl.enable`。该数组必须启用两项服务（`systemd-timesyncd` 和 `systemd-time-wait-sync`）：

   ```
   stages:
     initramfs:
     - ...
       systemctl:
       enable:
           systemd-timesyncd
           systemd-time-wait-sync
       disable: []
       start: []
       mask: []
   ```

## `rancher` 用户的 SSH 密钥

### 运行时更改

1. 以 `rancher` 用户身份登录到 Harvester 节点。有关详细信息，请参阅[如何登录到 Harvester 节点](../troubleshooting/os.md#如何登录到-harvester-节点)。
1. 编辑 `/home/rancher/.ssh/authorized_keys` 以添加或删除密钥。

### 持久化配置

1. 备份 elemental `cloud-init` 文件 `/oem/90_custom.yaml`，如下：

   ```
   cp /oem/90_custom.yaml /oem/install/90_custom.yaml.$(date --iso-8601=minutes)
   ```

1. 编辑 `/oem/90_custom.yaml` 并更新 yaml 路径 `stages.network[0].authorized_keys.rancher`。添加或删除 `rancher` 数组中的键：

   ```
   stages:
     network:
     - ...
       authorized_keys:
         rancher:
         - key1
         - key2
   ```


## `rancher` 用户的密码

### 运行时更改

1. 以 `rancher` 用户身份登录到 Harvester 节点。有关详细信息，请参阅[如何登录到 Harvester 节点](../troubleshooting/os.md#如何登录到-harvester-节点)。
1. 要重置 `rancher` 用户的密码，请运行命令 `passwd`。

### 持久化配置

1. 备份 elemental `cloud-init` 文件 `/oem/90_custom.yaml`，如下：

   ```
   cp /oem/90_custom.yaml /oem/install/90_custom.yaml.$(date --iso-8601=minutes)
   ```

1. 编辑 `/oem/90_custom.yaml` 并更新 yaml 路径 `stages.initramfs[0].users.rancher.passwd`。有关以加密形式指定密码的详细信息，请参阅 [`os.password`](./harvester-configuration.md#ospassword) 配置。


## Bonding slave

你可以更新 Harvester 的管理 bonding 接口 `mgmt-bo` 的 slave 接口。

### 运行时更改

1. 登录到 Harvester 节点并成为 root。有关详细信息，请参阅[如何登录到 Harvester 节点](../troubleshooting/os.md#如何登录到-harvester-节点)。
1. 使用以下命令识别接口名称：

   ```
   ip a
   ```

1. 编辑 `/etc/sysconfig/network/ifcfg-mgmt-bo` 并更新与 bonding slave 和 bonding 模式相关的行：

   ```
   BONDING_SLAVE_0='ens5'
   BONDING_SLAVE_1='ens6'
   BONDING_MODULE_OPTS='miimon=100 mode=balance-tlb '
   ```

1. 使用 `wicked ifreload` 命令重启网络：

   ```
   wicked ifreload mgmt-bo
   ```

   :::caution

   配置错误可能会中断 SSH 会话。

   :::

### 持久化配置


1. 备份 elemental cloud-init 文件 `/oem/90_custom.yaml`，如下：

   ```
   cp /oem/90_custom.yaml /oem/install/90_custom.yaml.$(date --iso-8601=minutes)
   ```

1. 编辑 `/oem/90_custom.yaml` 并更新 yaml 路径 `stages.initramfs[0].files`。具体来说，更新 `/etc/sysconfig/network/ifcfg-mgmt-bo` 文件的内容，并相应编辑 `BONDING_SLAVE_X` 和 `BONDING_MODULE_OPTS` 条目：

   ```
   stages:
     initramfs:
     - ...
       files:
       - path: /etc/sysconfig/network/ifcfg-mgmt-bo
         permissions: 384
         owner: 0
         group: 0
         content: |+
             STARTMODE='onboot'
             BONDING_MASTER='yes'
             BOOTPROTO='none'
             POST_UP_SCRIPT="wicked:setup_bond.sh"
  
  
             BONDING_SLAVE_0='ens5'
             BONDING_SLAVE_1='ens6'
  
             BONDING_MODULE_OPTS='miimon=100 mode=balance-tlb '
  
             DHCLIENT_SET_DEFAULT_ROUTE='no'
  
         encoding: ""
         ownerstring: ""
       - path: /etc/sysconfig/network/ifcfg-ens6
         permissions: 384
         owner: 0
         group: 0
         content: |
           STARTMODE='hotplug'
           BOOTPROTO='none'
         encoding: ""
         ownerstring: ""
   ```

   :::note

   如果在安装过程中没有选择接口，则必须添加一个条目来初始化接口。请检查上面示例中的 `/etc/sysconfig/network/ifcfg-ens6` 文件创建。文件名应为 `/etc/sysconfig/network/ifcfg-<interface-name>`。

   :::