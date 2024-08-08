---
sidebar_position: 1
sidebar_label: 设置
title: "设置"
---

本文将介绍可在 Harvester 中使用的高级配置。
你可以从仪表盘 UI 或使用 `kubectl` 命令修改 `settings.harvesterhci.io` 自定义资源。

## `additional-ca`

为 Harvester 配置其他受信 CA 证书来访问外部服务。

默认值：none

#### 示例

```
-----BEGIN CERTIFICATE-----
SOME-CA-CERTIFICATES
-----END CERTIFICATE-----
```

:::caution

更改此设置可能会导致单节点集群产生较短的停机时间。

:::

## `auto-disk-provision-paths` [实验功能]

此设置允许 Harvester 自动添加符合给定 glob 模式的磁盘作为虚拟机存储。
你可以使用逗号分隔来提供多个模式。

:::note

此设置仅能添加挂载到系统的格式化磁盘。

:::

:::caution

- 此设置应用于集群中的**每个节点**。
- 这些设备中的所有数据**都会被销毁**。请谨慎使用。

:::

默认值：none

#### 示例

以下示例添加符合 glob 模式 `/dev/sd*` 或 `/dev/hd*` 的磁盘：

```
/dev/sd*,/dev/hd*
```

## `backup-target`

设置自定义备份目标来存储虚拟机备份。支持 NFS 和 S3。
详情请参见 [Longhorn 文档][longhorn-backup-target]。

默认值：none

[longhorn-backup-target]: https://longhorn.io/docs/1.2.2/snapshots-and-backups/backup-and-restore/set-backup-target/#set-up-aws-s3-backupstore

#### 示例

```json
{
  "type": "s3",
  "endpoint": "https://s3.endpoint.svc",
  "accessKeyId": "test-access-key-id",
  "secretAccessKey": "test-access-key",
  "bucketName": "test-bup",
  "bucketRegion": "us‑east‑2",
  "cert": "",
  "virtualHostedStyle": false
}
```

## `cluster-registration-url`

将 Harvester 集群导入 Rancher 以进行多集群管理。

默认值：none

#### 示例

```
https://172.16.0.1/v3/import/w6tp7dgwjj549l88pr7xmxb4x6m54v5kcplvhbp9vv2wzqrrjhrc7c_c-m-zxbbbck9.yaml
```

## `containerd-registry`

此设置允许你为 Harvester 集群配置私有镜像仓库。你需要在每个节点的 `/etc/rancher/rke2/registries.yaml` 中设置参数的值。有关更多信息，请参阅 [RKE2 - Containerd 容器镜像仓库配置](https://docs.rke2.io/install/containerd_registry_configuration)。

:::note

如果你为私有镜像仓库设置了用户名和密码，系统会先将其保存到 `registries.yaml` 中，然后再自动删除它们以保护凭证。

:::

#### 示例

![containerd-registry](/img/v1.2/advanced/containerd-registry.png)

```json
{
  "Mirrors": {
    "docker.io": {
      "Endpoints": ["https://myregistry.local:5000"],
      "Rewrites": null
    }
  },
  "Configs": {
    "myregistry.local:5000": {
      "Auth": {
        "Username": "testuser",
        "Password": "testpassword"
      },
      "TLS": {
        "InsecureSkipVerify": false
      }
    }
  }
}
```

## `csi-driver-config`

_从 v1.2.0 起可用_

如果你在 Harvester 集群中安装了第三方 CSI Driver，在使用 **Backup & Snapshot** 相关功能之前，你必须通过此参数进行一些必要的配置。

默认：
```
{
  "driver.longhorn.io": {
    "volumeSnapshotClassName": "longhorn-snapshot",
    "backupVolumeSnapshotClassName": "longhorn"
  }
}
```

1. 为新添加的 CSI Driver 添加配置程序。
1. 配置 **Volume Snapshot Class Name**，指用于创建卷快照或虚拟机快照的 `VolumeSnapshotClass` 的名称。
1. 配置 **Backup Volume Snapshot Class Name**，指用于创建虚拟机备份的 `VolumeSnapshotClass` 的名称。

## `default-vm-termination-grace-period-seconds`

_从 v1.2.0 起可用_

指定用于停止虚拟机的默认终止宽限期（以秒为单位）。

默认值：`120`

## `http-proxy`

配置 HTTP 代理以访问外部服务，包括下载镜像和备份到 S3 服务。

默认值：`{}`

你可以设置以下的选项和值：

- HTTP 请求的代理 URL：`"httpProxy": "http://<username>:<pswd>@<ip>:<port>"`
- HTTPS 请求的代理 URL：`"httpsProxy": "https://<username>:<pswd>@<ip>:<port>"`
- 主机名和/或 CIDR 的逗号分隔列表：`"noProxy": "<hostname | CIDR>"`

:::caution

如果你配置了 `httpProxy` 和 `httpsProxy`，那么你必须同时将 Harvester 节点的 CIDR 填入 `noProxy`，否则 Harvester 集群将会崩溃。
如果你还配置了 `cluster-registration-url`，你通常需要将 `cluster-registration-url` 的主机也添加到 `noProxy` 中，否则你无法从 Rancher 访问 Harvester 集群。

:::

#### 示例

```json
{
  "httpProxy": "http://my.proxy",
  "httpsProxy": "https://my.proxy",
  "noProxy": "some.internal.svc,172.16.0.0/16"
}
```

:::note

Harvester 在用户配置的 `no-proxy` 后附加必要的地址，来确保内部流量能正常工作。
例如：`localhost,127.0.0.1,0.0.0.0,10.0.0.0/8,longhorn-system,cattle-system,cattle-system.svc,harvester-system,.svc,.cluster.local`。v1.1.2 开始将 `harvester-system` 添加到列表。

:::

:::caution

更改此设置可能会导致单节点集群产生较短的停机时间。

:::

## `log-level`

配置 Harvester Server 的日志级别。

默认值：`info`

你可以设置以下值。日志级别按照简单到详细排列：

- `panic`
- `fatal`
- `error`
- `warn`, `warning`
- `info`
- `debug`
- `trace`

#### 示例

```
debug
```

## `ntp-servers`

_从 v1.2.0 起可用_

配置 NTP 服务器以在 Harvester 节点上同步时间。

使用此设置，你可以在[安装](../install/harvester-configuration.md#osntp_servers)期间定义 NTP 服务器或在安装后更新 NTP 服务器。

:::caution

修改 NTP 服务器将替换所有节点之前的值。

:::

默认值：""

#### 示例

```
{
  "ntpServers": [
    "0.suse.pool.ntp.org",
    "1.suse.pool.ntp.org"
  ]
}
```

## `overcommit-config`

配置 CPU、内存和存储的资源超售百分比。设置资源超售后，即使物理资源已经用完，也能调度额外的虚拟机。

默认值：`{ "cpu":1600, "memory":150, "storage":200 }`

默认超售比 CPU 1600% 指的是，如果虚拟机的 CPU 资源限制是 `1600m` 核，Harvester 只会向 Kubernetes 调度器请求 `100m` CPU。

#### 示例

```json
{
  "cpu": 1000,
  "memory": 200,
  "storage": 300
}
```

## `release-download-url`

_从 v1.0.1 起可用_

此设置用于配置`升级版本下载`的 URL 地址。Harvester 将从该 URL 托管的 (`${URL}/${VERSION}/version.yaml`) 文件中获取 ISO URL 和校验和值。

默认值：`https://releases.rancher.com/harvester`

#### version.yaml 示例

```
apiVersion: harvesterhci.io/v1beta1
kind: Version
metadata:
  name: ${VERSION}
  namespace: harvester-system
spec:
  isoChecksum: ${ISO_CHECKSUM}
  isoURL: ${ISO_URL}
```

## `server-version`

显示 Harvester Server 的版本。

#### 示例

```
v1.0.0-abcdef-head
```

## `ssl-certificates`

为 Harvester UI/API 配置服务证书。

默认值：`{}`

#### 示例

```json
{
  "ca": "-----BEGIN CERTIFICATE-----\nSOME-CERTIFICATE-ENCODED-IN-PEM-FORMAT\n-----END CERTIFICATE-----",
  "publicCertificate": "-----BEGIN CERTIFICATE-----\nSOME-CERTIFICATE-ENCODED-IN-PEM-FORMAT\n-----END CERTIFICATE-----",
  "privateKey": "-----BEGIN RSA PRIVATE KEY-----\nSOME-PRIVATE-KEY-ENCODED-IN-PEM-FORMAT\n-----END RSA PRIVATE KEY-----"
}
```

:::caution

更改此设置可能会导致单节点集群产生较短的停机时间。

:::

## `ssl-parameters`

修改 Harvester GUI 和 API 启用的 SSL/TLS 协议和密码。

你可以设置以下的选项和值：

- `protocols`：启用的协议。参见 NGINX Ingress Controller 的配置 [`ssl-protocols`](https://kubernetes.github.io/ingress-nginx/user-guide/nginx-configuration/configmap/#ssl-protocols) 来了解支持的输入。

- `ciphers`：启用的密码。参见 NGINX Ingress Controller 的配置 [`ssl-ciphers`](https://kubernetes.github.io/ingress-nginx/user-guide/nginx-configuration/configmap/#ssl-ciphers) 来了解支持的输入。

如果没有提供值，`protocols` 仅会设为 `TLSv1.2`，而 `ciphers` 列表会是 `ECDHE-ECDSA-AES128-GCM-SHA256:ECDHE-ECDSA-AES256-GCM-SHA384:ECDHE-ECDSA-CHACHA20-POLY1305`。

默认值：none

:::note

如果你进行了错误配置，导致无法访问 Harvester GUI 和 API，请参见[故障排查](../troubleshooting/harvester.md#修改-ssltls-启用的协议和密码后无法访问-harvester)。

:::

#### 示例

以下示例将启用的 SSL/TLS 协议设置为 `TLSv1.2` 和 `TLSv1.3`，并把密码列表设置为 `ECDHE-ECDSA-AES128-GCM-SHA256` 和 `ECDHE-ECDSA-CHACHA20-POLY1305`：

```
{
  "protocols": "TLSv1.2 TLSv1.3",
  "ciphers": "ECDHE-ECDSA-AES128-GCM-SHA256:ECDHE-ECDSA-CHACHA20-POLY1305"
}
```

## `storage-network`

默认情况下，Longhorn 使用 Harvester 集群中的默认管理网络，该网络仅限于单个接口，并与集群内的其他工作负载共享。此设置允许你在想要进行网络隔离时配置隔离存储网络。

详情请参考 [Harvester 存储网络](./storagenetwork.md)。

:::caution

如果要更改存储网络，你需要在应用此设置之前关闭所有虚拟机。
IP 范围格式是 IPv4 CIDR，而且是集群节点数的 4 倍。

:::

默认值：""

#### 示例

```
{
  "vlan": 100,
  "clusterNetwork": "storage",
  "range": "192.168.0.0/24"
}
```

## `support-bundle-image`

_从 v1.2.0 起可用_

此配置 Support Bundle 镜像，[rancher/support-bundle-kit](https://hub.docker.com/r/rancher/support-bundle-kit/tags) 提供了各种版本。

默认：
```
{
  "repository": "rancher/support-bundle-kit",
  "tag": "v0.0.25",
  "imagePullPolicy": "IfNotPresent"
}
```

## `support-bundle-namespaces`

_从 v1.2.0 起可用_

在收集 Support Bundle 时指定其他命名空间。默认情况下，Support Bundle 只会从预定义的命名空间捕获资源。

预定义的命名空间列表如下：
- cattle-dashboards
- cattle-fleet-local-system
- cattle-fleet-system
- cattle-fleet-clusters-system
- cattle-monitoring-system
- fleet-local
- harvester-system
- local
- longhorn-system
- cattle-logging-system

如果你选择更多命名空间，它们将附加到预定义的命名空间列表中。

默认值：none

## `support-bundle-timeout`

_从 v1.2.0 起可用_

定义 Support Bundle 的默认超时时间（以分钟为单位）。使用 `0` 禁用超时功能。

默认值：`10`

## `upgrade-checker-enabled`

自动检查是否有可用的 Harvester 升级。

默认值：`true`

#### 示例

```
false
```

## `upgrade-checker-url`

为 Harvester 升级检查配置 URL。只有 `upgrade-checker-enabled` 设为 true 时才可用。

默认值：`https://harvester-upgrade-responder.rancher.io/v1/checkupgrade`

#### 示例

```
https://your.upgrade.checker-url/v99/checkupgrade
```

## `vip-pools`

_自 v1.2.0 起已弃用，请改用 [IP 池](../networking/ippool.md)_

使用 CIDR 或 IP 范围配置 VIP 的全局或命名空间 IP 地址池。

默认值：`{}`

:::note
从 UI 配置多 CIDR 或 IP 范围，只在 Harvester v1.1.1 中可用。
:::

#### 示例

```json
{
  "default": "172.16.0.0/24,172.16.1.0/24",
  "demo": "172.16.2.50-172.16.2.100,172.16.2.150-172.16.3.200"
}
```

## `vm-force-reset-policy`

当节点不可用时，强制重新调度虚拟机。当节点状态变成 `Not Ready` 时，此设置会强制删除该节点上的虚拟机，并在几秒后将虚拟机重新调度到另一个可用的节点。 Harvester 升级检查配置 URL。

默认值：`{"enable":true, "period":300}`

:::note
主机不可用或断电时，虚拟机只会重启，不会迁移。
:::

#### 示例

```json
{
  "enable": "true",
  "period": 300
}
```

## UI 设置

### `branding`

_从 v1.2.0 起可用_

用于通过修改 Harvester 产品名称、Logo 和配色方案来全局自定义 UI 界面。

默认：**Harvester**

![containerd-registry](/img/v1.2/advanced/branding.png)

你可以设置以下选项和值：

- **Private Label**：此选项将大多数出现的 “Harvester” 替换为你提供的值。
- **Logo**：上传深色和浅色的 Logo 来替换顶层导航标题中的 Harvester logo。
- **Favicon**：上传一个网站图标来替换浏览器选项卡中的 Harvester 图标。
- **Primary Color**：使用自定义颜色替换整个 UI 中使用的主颜色。
- **Link Color**：使用自定义链接颜色替换整个 UI 中使用的链接颜色。

### `ui-index`

为 UI 配置 HTML 索引位置。

默认值：`https://releases.rancher.com/harvester-ui/dashboard/latest/index.html`

#### 示例

```
https://your.static.dashboard-ui/index.html
```

### `ui-plugin-index`

为 Harvester 插件配置 JS 地址 (从 Rancher 中访问 Harvester 时使用)。

默认值：`https://releases.rancher.com/harvester-ui/plugin/harvester-latest/harvester-latest.umd.min.js`

#### 示例

```
https://your.static.dashboard-ui/*.umd.min.js
```

### `ui-source`

配置如何加载 UI 源。

你可以设置以下值：

- `auto`：默认。自动检测是否使用绑定的 UI。
- `external`：使用外部 UI 源。
- `bundled`：使用绑定的 UI 源。

#### 示例

```
external
```
