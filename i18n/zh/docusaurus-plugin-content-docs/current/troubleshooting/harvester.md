---
sidebar_position: 2
sidebar_label: Harvester
title: "Harvester"
---

## HTTP Proxy 设置错误导致多节点集群部署失败

### 没有 Harvester 配置文件的 ISO 安装

#### 在 Harvester 安装期间配置 HTTP 代理

在某些环境中，你会在安装 Harvester 时配置 [OS Environment](../install/harvester-configuration.md#osenvironment) 的 [http-proxy](../airgap.md#在安装期间配置-http-代理)。

#### 在第一个节点就绪后配置 HTTP 代理

第一个节点安装成功后，登录到 `Harvester GUI` 以配置 [Harvester 系统设置](../install/harvester-configuration.md#system_settings)的 [http-proxy](../airgap.md#在-harvester-设置中配置-http-代理)。

然后继续向集群添加更多节点。

#### 一个节点不可用

你可能遇到的问题：

```
第一个节点安装成功。

第二个节点安装成功。

第三个节点安装成功。

然后第二个节点变为 Unavialable 状态，而且无法自动恢复。
```

#### 解决方案

当集群中的节点不使用 HTTP Proxy 进行相互通信时，成功安装第一个节点后，你需要为这些节点使用的 CIDR 配置 [http-proxy.noProxy](../airgap.md#在-harvester-设置中配置-http-代理)。

例如，如果你的集群通过 DHCP/静态设置将 CIDR `172.26.50.128/27` 的 IP 分配给节点，请将此 CIDR 添加到 `noProxy`。

设置好之后，你就可以继续往集群中添加新的节点了。

有关详细信息，请参阅 [Harvester issue 3091](https://github.com/harvester/harvester/issues/3091)。

### 具有 Harvester 配置文件的 ISO 安装

如果在 ISO 安装时使用了 Harvester 配置文件，请在 [Harvester System Settings](../install/harvester-configuration.md#system_settings) 中配置适当的 `http-proxy`。

### PXE 引导安装

使用 [PXE 引导安装](../install/pxe-boot-install.md)时，请在 [OS Environment](../install/harvester-configuration.md#osenvironment) 和 [Harvester System Settings](../install/harvester-configuration.md#system_settings) 中配置合适的 `http-proxy`。

## 生成 Support Bundle

你可以按照以下步骤在 Harvester GUI 中生成 Support Bundle：

- Harvester 网页 UI 的左下角点击 `Support`：
   ![](/img/v1.2/troubleshooting/harvester-sb-support-link.png)

- 单击 `Generate Support Bundle` 按钮：
   ![](/img/v1.2/troubleshooting/harvester-sb-support-button.png)

- 输入支持包的描述并点击 `Create` 以生成和下载 Support Bundle：
   ![](/img/v1.2/troubleshooting/harvester-sb-support-modal.png)

## 访问嵌入式 Rancher 和 Longhorn 仪表板

_从 v1.1.0 起可用_

你现在可以直接在 `Support` 页面上访问嵌入式 Rancher 和 Longhorn 仪表板，但必须先前往 `Preferences` 页面并选中 `Advanced Features` 下的 `Enable Extension developer features`。

![](/img/v1.2/troubleshooting/support-access-embedded-ui.png)

:::note

我们仅支持使用嵌入式 Rancher 和 Longhorn 仪表板进行调试和验证。
对于 Rancher 的多集群和多租户集成，请参见[文档](../rancher/rancher-integration.md)。

:::

## 修改 SSL/TLS 启用的协议和密码后无法访问 Harvester

如果你修改了 [SSL/TLS 启用的协议和密码设置](../advanced/settings.md#ssl-parameters)后无法访问 Harvester GUI 和 API，很有可能是由于错误配置的 SSL/TLS 协议和密码导致 NGINX Ingress Controller 停止运行。
请按照以下步骤来进行重置：

1. 按照[常见问题](../faq.md)的描述 SSH 到 Harvester 节点，并切换成 `root` 用户：
```
$ sudo -s
```
2. 使用 `kubectl` 手动编辑 `ssl-parameters`：
```
# kubectl edit settings ssl-parameters
```
3. 删除 `value: ...` 行，然后 NGINX Ingress Controller 就会使用默认的协议和密码：
```
apiVersion: harvesterhci.io/v1beta1
default: '{}'
kind: Setting
metadata:
  name: ssl-parameters
...
value: '{"protocols":"TLS99","ciphers":"WRONG_CIPHER"}' # <- Delete this line
```
4. 保存修改。退出编辑器后，你会看到以下响应：
```
setting.harvesterhci.io/ssl-parameters edited
```

你也可以进一步检查 `rke2-ingress-nginx-controller` Pod 的日志，来确认 NGINX Ingress Controller 是否能正常运行。


## 网络接口未显示

由于接口未显示，你可能需要帮助才能查找具有 10G 上行链路的正确接口。当 ixgbe 模块由于检测到不支持的 SFP+ 模块类型而无法加载时，上行链路不会显示。

#### 如何识别不受支持的 SFP 问题？

执行命令 `lspci | grep -i net` 查看​​连接到主板的网卡端口数。你可以运行命令 `ip a` 收集检测到的接口的信息。如果检测到的接口数量少于已识别的 NIC 端口数量，那么问题可能是由于使用了不受支持的 SFP+ 模块而引起的。

##### 测试

你可以执行简单的测试来验证问题是否由不支持的 SFP+ 造成的。在运行的节点上执行以下步骤：

1. 使用以下内容手动创建文件 `/etc/modprobe.d/ixgbe.conf`：

```
options ixgbe allow_unsupported_sfp=1
```

1. 然后运行以下命令：

```
rmmod ixgbe && modprobe ixgbe
```

如果上述步骤成功并且显示缺少的接口，我们可以确认问题是不受支持的 SFP+。不过，上述测试并不是永久性的，重启后会被刷新。

#### 解决方案

由于支持问题，Intel 限制其 NIC 上使用的 SFP 类型。要让上述更改持久存在，建议在安装过程中将以下内容添加到 [config.yaml](/install/harvester-configuration.md) 中。

```YAML
os:
  write_files:
  - content: |
     options ixgbe allow_unsupported_sfp=1
    path: /etc/modprobe.d/ixgbe.conf
  - content: |
      name: "reload ixgbe module"
      stages:
        boot:
          - commands:
            - rmmod ixgbe && modprobe ixgbe
    path: /oem/99_ixgbe.yaml
```
