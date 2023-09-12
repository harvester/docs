---
sidebar_position: 5
sidebar_label: Harvester 配置
title: "Harvester 配置"
keywords:
  - Harvester
  - harvester
  - Rancher
  - rancher
  - Harvester 配置
Description: 你可以在手动或自动安装期间提供 Harvester 配置文件，来进行特定的配置。
---

## 配置示例

你可以在手动或自动安装期间提供 Harvester 配置文件，来进行特定的配置。以下是一个配置示例：

```yaml
scheme_version: 1
server_url: https://cluster-VIP:443
token: TOKEN_VALUE
os:
  ssh_authorized_keys:
    - ssh-rsa AAAAB3NzaC1yc2EAAAADAQAB...
    - github:username
  write_files:
  - encoding: ""
    content: test content
    owner: root
    path: /etc/test.txt
    permissions: '0755'
  hostname: myhost
  modules:
    - kvm
    - nvme
  sysctls:
    kernel.printk: "4 4 1 7"
    kernel.kptr_restrict: "1"
  dns_nameservers:
    - 8.8.8.8
    - 1.1.1.1
  ntp_servers:
    - 0.suse.pool.ntp.org
    - 1.suse.pool.ntp.org
  password: rancher
  environment:
    http_proxy: http://myserver
    https_proxy: http://myserver
  labels:
    topology.kubernetes.io/zone: zone1
    foo: bar
    mylabel: myvalue
install:
  mode: create
  management_interface:
    interfaces:
    - name: ens5
      hwAddr: "B8:CA:3A:6A:64:7C"
    method: dhcp
  force_efi: true
  device: /dev/sda
  data_disk: /dev/sdb
  silent: true
  iso_url: http://myserver/test.iso
  poweroff: true
  no_format: true
  debug: true
  tty: ttyS0
  vip: 10.10.0.19
  vip_hw_addr: 52:54:00:ec:0e:0b
  vip_mode: dhcp
  force_mbr: false
  addons:
    harvester_vm_import_controller:
      enabled: false
      values_content: ""
    harvester_pcidevices_controller:
      enabled: false
      values_content: ""
    rancher_monitoring:
      enabled: true
      values_content: ""
    rancher_logging:
      enabled: false
      values_content: ""
    harvester_seeder:
      enabled: false
      values_content: ""
system_settings:
  auto-disk-provision-paths: ""
```

## 配置参考

下文提供所有配置密钥的参考。

:::caution

**安全风险**：配置文件包含应保密的凭证。请不要公开配置文件。

:::

:::note

**配置优先级**：如果你在安装 Harvester 期间提供了远程 Harvester 配置文件，Harvester 配置文件不会覆盖你之前填写和选择的输入值。换言之，你在安装期间输入的值优先级更高。
例如，如果你在 Harvester 配置文件中指定了 `os.hostname`，并且在安装过程中填写了 `hostname` 字段，那么你填写的值将优先于 Harvester 配置文件中的 `os.hostname`。

:::

### `scheme_version`

#### 定义

为后续配置迁移保留的 scheme 版本。

如果要将配置迁移到新的 scheme 版本，此设置是必需的。它能告诉 Harvester 以前的版本以及迁移的需求。

:::note
该字段在当前的 Harvester 版本中不起作用。
:::

:::caution
确保你的自定义配置始终具有正确的 scheme 版本。
:::

### `server_url`

#### 定义

`server_url` 是 Harvester 集群的 URL，用于在集群中加入新的`节点`。

对于使用 `JOIN` 模式进行的安装，配置是必须的。`server_url` 的默认格式是 `https://cluster-VIP:443`。

:::note

为确保高可用的 Harvester 集群，请使用 Harvester 集群 [VIP](#installvip) 或 `server_url` 中的域名。

:::

#### 示例

```yaml
server_url: https://cluster-VIP:443
install:
  mode: join
```

### `token`

#### 定义

集群密文或节点 Token。如果该值符合节点 Token 的格式，它将自动被认为是一个节点 Token。否则，它将被视为集群密文。

为了将一个新节点加入 Harvester 集群，Token 应该与服务器所拥有的相匹配。

#### 示例

```yaml
token: myclustersecret
```

节点 Token

```yaml
token: "K1074ec55daebdf54ef48294b0ddf0ce1c3cb64ee7e3d0b9ec79fbc7baf1f7ddac6::node:77689533d0140c7019416603a05275d4"
```

### `os.ssh_authorized_keys`

#### 定义

应该添加到默认用户 `rancher` 的 SSH 授权密钥的列表。SSH 密钥可以通过使用 `github:${USERNAME}` 格式从 GitHub 用户账户获取。这是通过从 `https://github.com/${USERNAME}.keys` 中下载密钥来实现的。

#### 示例

```yaml
os:
  ssh_authorized_keys:
    - "ssh-rsa AAAAB3NzaC1yc2EAAAADAQABAAABAQC2TBZGjE+J8ag11dzkFT58J3XPONrDVmalCNrKxsfADfyy0eqdZrG8hcAxAR/5zuj90Gin2uBR4Sw6Cn4VHsPZcFpXyQCjK1QDADj+WcuhpXOIOY3AB0LZBly9NI0ll+8lo3QtEaoyRLtrMBhQ6Mooy2M3MTG4JNwU9o3yInuqZWf9PvtW6KxMl+ygg1xZkljhemGZ9k0wSrjqif+8usNbzVlCOVQmZwZA+BZxbdcLNwkg7zWJSXzDIXyqM6iWPGXQDEbWLq3+HR1qKucTCSxjbqoe0FD5xcW7NHIME5XKX84yH92n6yn+rxSsyUfhJWYqJd+i0fKf5UbN6qLrtd/D"
    - "github:ibuildthecloud"
```

### `os.write_files`

启动时写入磁盘的文件列表。`encoding` 字段指定内容的编码。`encoding` 的值可以为：

- `""`：内容数据以纯文本形式写入。在这种情况下，也可以省略 `encoding` 字段。
- `b64`、`base64`：内容数据采用 base64 编码。
- `gz`、`gzip`：内容数据经过 gzip 压缩。
- `gz+base64`、`gzip+base64`、`gz+b64`、`gzip+b64`：内容数据先经过 gzip 压缩然后再 base64 编码。

示例

```yaml
os:
  write_files:
  - encoding: b64
    content: CiMgVGhpcyBmaWxlIGNvbnRyb2xzIHRoZSBzdGF0ZSBvZiBTRUxpbnV4...
    owner: root:root
    path: /etc/connman/main.conf
    permissions: '0644'
  - content: |
      # My new /etc/sysconfig/samba file

      SMDBOPTIONS="-D"
    path: /etc/sysconfig/samba
  - content: !!binary |
      f0VMRgIBAQAAAAAAAAAAAAIAPgABAAAAwARAAAAAAABAAAAAAAAAAJAVAAAAAA
      AEAAHgAdAAYAAAAFAAAAQAAAAAAAAABAAEAAAAAAAEAAQAAAAAAAwAEAAAAAAA
      AAAAAAAAAwAAAAQAAAAAAgAAAAAAAAACQAAAAAAAAAJAAAAAAAAcAAAAAAAAAB
      ...
    path: /bin/arch
    permissions: '0555'
  - content: |
      15 * * * * root ship_logs
    path: /etc/crontab
```

### `os.persistent_state_paths`

#### 定义

`os.persistent_state_paths` 选项用于配置自定义路径，对文件所做的修改将在重启后保留。对这些路径中的文件所做的任何更改都不会在重启后丢失。

#### 示例

请参阅以下示例配置在 Harvester 中安装 `rook-ceph`：

```yaml
os:
  persistent_state_paths:
    - /var/lib/rook
    - /var/lib/ceph
  modules:
    - rbd
    - nbd
```

### `os.after_install_chroot_commands`

#### 定义

你可以使用 `after_install_chroot_commands` 添加其他软件包。[elemental-toolkit](https://rancher.github.io/elemental-toolkit/docs/) 提供的 `after-install-chroot` 阶段允许你执行不受文件系统写入限制的命令，确保系统重启后用户定义的命令能够保留。

#### 示例

请参阅以下示例配置，在 Harvester 中安装 RPM 包：

```yaml
os:
  after_install_chroot_commands:
    - rpm -ivh <the url of rpm package>

```

DNS 解析在 `after-install-chroot 阶段`不可用，并且 `nameserver` 可能不可用。如果需要通过 URL 访问域名来安装包，请先创建一个临时的 `/etc/resolv.conf` 文件。例如：

```yaml
os:
  after_install_chroot_commands:
    - "rm -f /etc/resolv.conf && echo 'nameserver 8.8.8.8' | sudo tee /etc/resolv.conf"
    - "mkdir /usr/local/bin"
    - "curl -fsSL -o get_helm.sh https://raw.githubusercontent.com/helm/helm/main/scripts/get-helm-3 && chmod 700 get_helm.sh && ./get_helm.sh"
    - "rm -f /etc/resolv.conf && ln -s /var/run/netconfig/resolv.conf /etc/resolv.conf"
```


:::note

升级 Harvester 会导致 `after-install-chroot` 对操作系统所做的更改丢失。你还必须配置 `after-upgrade-chroot` 以使你的更改在升级过程中保留。升级 Harvester 之前，请参阅[运行时持久性更改](https://rancher.github.io/elemental-toolkit/docs/customizing/runtime_persistent_changes/)。

:::

### `os.hostname`

#### 定义

设置系统主机名。如果用户不提供值，安装程序将生成一个随机主机名。

#### 示例

```yaml
os:
  hostname: myhostname
```

### `os.modules`

#### 定义

启动时要加载的内核模块列表。

#### 示例

```yaml
os:
  modules:
    - kvm
    - nvme
```

### `os.sysctls`

#### 定义

启动时要设置的内核 sysctl。这些配置与你在 `/etc/sysctl.conf` 中找到的配置类似。
指定的值必须是字符串。

#### 示例

```yaml
os:
  sysctls:
    kernel.printk: 4 4 1 7 # YAML 解析器读取为字符串。
    kernel.kptr_restrict: "1" # 强制 YAML 解析器读取为字符串。
```

### `os.dns_nameservers`

#### 定义

**备用** DNS 名称服务器。如果 DHCP 或操作系统中没有配置 DNS，则使用备用 DNS 名称服务器。

#### 示例

```yaml
os:
  dns_nameservers:
    - 8.8.8.8
    - 1.1.1.1
```

### `os.ntp_servers`

#### 定义

**备用** NTP 服务器。如果操作系统中的其他位置没有配置 NTP，则使用备用 NTP 服务器。强烈建议你配置 `os.ntp_servers` 以避免主机之间的时间同步问题。

#### 示例

```yaml
os:
  ntp_servers:
    - 0.suse.pool.ntp.org
    - 1.suse.pool.ntp.org
```

### `os.password`

#### 定义

默认用户 `rancher` 的密码。默认情况下，`rancher` 用户没有密码。
如果你在运行时设置密码，密码会在下次启动时重置。密码可以是明文或加密形式。获得这种加密密码最容易的方法，是在 Linux 系统上更改你的密码，并从 `/etc/shadow` 复制第二个字段的值。你也可以使用 OpenSSL 来加密密码。对于 Harvester 支持的加密算法，请参考下表。

| 算法 | 命令 | 支持 |
|:---:|:---:|:---:|
| SHA-512 | `openssl passwd -6` | 是 |
| SHA-256 | `openssl passwd -5` | 是 |
| MD5 | `openssl passwd -1` | 是 |
| MD5, Apache variant | `openssl passwd -apr1` | 是 |
| AIX-MD5 | `openssl passwd -aixmd5` | 否 |

#### 示例

加密形式：
```yaml
os:
  password: "$6$kZYUnRaTxNdg4W8H$WSEJydGWsNpaRbbbRdTDLJ2hDLbkizxSFGW2RtexlqG6njEATaGQG9ssztjaKDCsaNUPBZ1E1YdsvSLMAi/IO/"
```

明文形式：

```yaml
os:
  password: supersecure
```

### `os.environment`

#### 定义

要在 K3s 和其他进程（如启动进程）上设置的环境变量。
此字段主要用于设置 HTTP 代理。

#### 示例

```yaml
os:
  environment:
    http_proxy: http://myserver
    https_proxy: http://myserver
```

:::note

此示例为**基本的操作系统组件**设置 HTTP(S) 代理。
如果需要为 Harvester 组件（如获取外部镜像和备份到 S3）配置 HTTP(S) 代理，请参见 [Settings/http-proxy](../advanced/settings.md#http-proxy)。

:::

### `os.labels`

#### 定义

要添加到节点的标签。

#### 示例

```yaml
os:
  labels:
    topology.kubernetes.io/zone: zone1
    foo: bar
    mylabel: myvalue
```

### `install.mode`

#### 定义

Harvester 安装模式：

- `create`：创建新的 Harvester 安装。
- `join`：加入现有的 Harvester 安装。此模式需要指定 `server_url`。

#### 示例

```yaml
install:
  mode: create
```

### `install.management_interface`

#### 定义

为主机配置网络接口。有效的配置字段是：

- `method`：为该网络分配 IP 的方法。支持：
   - `static`：手动分配 IP 和 网关。
   - `dhcp`：向 DHCP 服务器请求一个 IP。
- `ip`：此网络的静态 IP。如果选择了 `static` 方法，则必须设置此字段。
- `subnet_mask`：此网络的子网掩码。如果选择了 `static` 方法，则必须设置此字段。
- `gateway`：此网络的网关。如果选择了 `static` 方法，则必须设置此字段。
- `interfaces`：接口名称数组。如果指定了该字段，安装程序会将这些 NIC 组合成单个逻辑绑定接口。
   - `interfaces.name`：绑定网络的从接口的名称。
   - `interfaces.hwAddr`：接口的硬件 MAC 地址。
- `bond_options`：绑定接口的选项。详情请参见[此处](https://www.kernel.org/doc/Documentation/networking/bonding.txt)。如果不指定，则使用以下选项：
   - `mode: balance-tlb`
   - `miimon: 100`
- `mtu`：接口的 MTU。
- `vlan_id`：接口的 VLAN ID。

:::note

Harvester 使用 [systemd 网络命名方案](https://www.freedesktop.org/software/systemd/man/systemd.net-naming-scheme.html)。
安装前请确保目标机器上存在接口名称。

:::

#### 示例

```yaml
install:
  mode: create
  management_interface:
    interfaces:
    - name: ens5
      hwAddr: "B8:CA:3A:6A:64:7D"     # hwAddr 是可选的
    method: dhcp
    bond_options:
      mode: balance-tlb
      miimon: 100
    mtu: 1492
    vlan_id: 101
```

### `install.force_efi`

即使未检测到 EFI，也强制安装 EFI。默认值：`false`。

### `install.device`

用于安装操作系统的设备。

如果你的机器通过 PXE 安装包含了多个物理存储设备，最好使用 `/dev/disk/by-id/$id` 或 `/dev/disk/by-path/$path` 来指定存储设备。

### `install.silent`

保留。

### `install.iso_url`

如果从 kernel/vmlinuz 而不是 ISO 启动，则从这个 ISO 下载和安装。

### `install.poweroff`

安装完成后关闭机器，而不是重启机器。

### `install.no_format`

如果布局已经存在，不进行分区和格式化。

### `install.debug`

为安装的系统启用日志管理和调试来运行安装。

### `install.persistent_partition_size`

#### 定义

为 `COS_PERSISTENT` 分区配置大小，单位可以是 `Gi` 或 `Mi`。该分区用于存储系统包、容器镜像等数据。默认及最小值为 `150Gi`。

#### 示例

```yaml
install:
  persistent_partition_size: 150Gi
```

### `install.tty`

#### 定义

用于控制台的 tty 设备。

#### 示例

```yaml
install:
  tty: ttyS0,115200n8
```

### `install.vip`
### `install.vip_mode`
### `install.vip_hw_addr`

#### 定义

- `install.vip`：Harvester 管理 endpoint 的 VIP。安装后，用户可以通过 URL `https://<VIP>` 访问 Harvester GUI。
- `install.vip_mode`
   - `dhcp`：Harvester 会发送 DHCP 请求来获取 VIP。需要指定 `install.vip_hw_addr` 字段。
   - `static`：Harvester 使用静态 VIP。
- `install.vip_hw_addr`：与 VIP 对应的硬件地址。用户需要配置本地的 DHCP 服务器来提供配置的 VIP。当 `install.vip_mode` 设为 `dhcp` 时，必须指定该字段。

详情请参见[管理地址](./management-address.md)。

#### 示例

配置静态 VIP。

```yaml
install:
  vip: 192.168.0.100
  vip_mode: static
```

配置 DHCP VIP。

```yaml
install:
  vip: 10.10.0.19
  vip_mode: dhcp
  vip_hw_addr: 52:54:00:ec:0e:0b
```

### `install.force_mbr`

#### 定义

默认情况下，Harvester 在 UEFI 和 BIOS 系统上都使用 GPT 分区方案。
但是，如果你遇到兼容性问题，可以在 BIOS 系统上强制使用 MBR 分区方案。

:::note

如果 [`install.data_disk`](#installdata_disk) 配置的存储设备与 [`install.device`](#installdevice) 相同，Harvester 会创建一个额外的分区来存储 VM 数据。
在强制使用 MBR 时，不会创建额外的分区，而且虚拟机数据将存储在与操作系统数据共享的分区中。

:::

#### 示例

```yaml
install:
  force_mbr: true
```

### `install.data_disk`

_从 v1.0.1 起可用_

#### 定义

设置默认存储设备来存储 VM 数据。

如果你的机器通过 PXE 安装包含了多个物理存储设备，最好使用 `/dev/disk/by-id/$id` 或 `/dev/disk/by-path/$path` 来指定存储设备。

默认值：与 [`install.device`](#installdevice) 设置的存储设备相同

#### 示例

```yaml
install:
  data_disk: /dev/sdb
```

### `install.addons`

_从 v1.2.0 起可用_

#### 定义

设置 Harvester 插件的默认启用/禁用状态。

默认：禁用插件。

#### 示例

```yaml
install:
  addons:
    rancher_monitoring:
      enabled: true
    rancher_logging:
      enabled: false
```

Harvester v1.2.0 附带了五个插件：

- vm-import-controller (chartName: `harvester-vm-import-controller`)
- pcidevices-controller (chartName: `harvester-pcidevices-controller`)
- rancher-monitoring
- rancher-logging
- harvester-seeder (experimental)

### `install.harvester.storage_class.replica_count`

_从 v1.1.2 起可用_

#### 定义

设置 Harvester 默认存储类 `harvester-longhorn` 的副本数。

默认值：3

支持值：1、2、3。所有其他值均视为 3。

在边缘场景中，用户可能部署单节点 Harvester 集群，因此可以将该值设置为 1。在大多数场景下，为了实现存储高可用，建议你保留默认值 3。

有关更多信息，请参阅 [longhorn-replica-count](https://longhorn.io/docs/1.4.1/references/settings/#default-replica-count)。

#### 示例

```yaml
install:
  harvester:
    storage_class:
      replica_count: 1
```

### `install.harvester.longhorn.default_settings.guaranteedEngineManagerCPU`

_从 v1.2.0 起可用_

#### 定义

在每个节点上为每个 Longhorn engine manager Pod 预留的可分配 CPU 总量默认百分比。

默认值：12

支持值：0-12。所有其他值均视为 12。

该整数值表示要在各个节点上为每个 engine manager Pod 保留的可分配 CPU 总数百分比。

在边缘场景中，用户可能部署单节点 Harvester 集群，因此可以将该参数设置为小于 12 的值。在大多数场景下，为了实现系统高可用，建议保留默认值。

在设置该值之前，请参阅 [longhorn-guaranteed-engine-manager-cpu](https://longhorn.io/docs/1.4.1/references/settings/#guaranteed-engine-manager-cpu) 了解更多详细信息。

#### 示例

```yaml
install:
  harvester:
    longhorn:
      default_settings:
        guaranteedEngineManagerCPU: 6
```

### `install.harvester.longhorn.default_settings.guaranteedReplicaManagerCPU`

_从 v1.2.0 起可用_

#### 定义

在每个节点上为每个 Longhorn replica manager Pod 预留的可分配 CPU 总量默认百分比。

默认值：12

支持值：0-12。所有其他值均视为 12。

该整数值表示要在各个节点上为每个 replica manager Pod 保留的可分配 CPU 总数百分比。

在边缘场景中，用户可能部署单节点 Harvester 集群，在这种情况下可以将该参数设置为小于 12 的值。在大多数场景下，为了实现系统高可用，建议保留默认值。

在设置该值之前，请参阅 [longhorn-guaranteed-replica-manager-cpu](https://longhorn.io/docs/1.4.1/references/settings/#guaranteed-replica-manager-cpu) 了解更多详细信息。

#### 示例

```yaml
install:
  harvester:
    longhorn:
      default_settings:
        guaranteedReplicaManagerCPU: 6
```

### `system_settings`

#### 定义

你可以通过配置 `system_settings` 覆盖默认的 Harvester 系统设置。
有关其他信息和所有选项的列表，请参见[设置](../advanced/settings.md)页面。

:::note

仅当 Harvester 以 `Create` 模式安装时，覆盖系统设置才有效。
如果你使用 `join` 模式安装 Harvester，则会忽略此设置。
`join` 模式安装会采用现有 Harvester 系统的设置。

:::

#### 示例

下面的示例覆盖了 `containerd-registry`、`http-proxy` 和 `ui-source` 的设置。值必须是 `string`。

```yaml
system_settings:
  containerd-registry: '{"Mirrors": {"docker.io": {"Endpoints": ["https://myregistry.local:5000"]}}, "Configs": {"myregistry.local:5000": {"Auth": {"Username": "testuser", "Password": "testpassword"}, "TLS": {"InsecureSkipVerify": false}}}}'
  http-proxy: '{"httpProxy": "http://my.proxy", "httpsProxy": "https://my.proxy", "noProxy": "some.internal.svc"}'
  ui-source: auto
```
