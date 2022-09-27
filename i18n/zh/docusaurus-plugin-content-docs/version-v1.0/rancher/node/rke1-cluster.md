---
sidebar_position: 2
sidebar_label: 创建 RKE1 Kubernetes 集群
title: ""
---

# 创建 RKE1 Kubernetes 集群

你可以使用内置的 Harvester 主机驱动在 Rancher `2.6.3` 中配置在 Harvester 集群之上的 RKE1 Kubernetes 集群。

![rke1-cluster](/img/v1.0/rancher/rke1-node-driver.png)

:::note

- Harvester 主机驱动需要 VLAN 网络。

:::

在创建由 Harvester 基础架构托管的 Kubernetes 集群时，[节点模板](https://rancher.com/docs/rancher/v2.6/en/cluster-provisioning/rke-clusters/node-pools/#node-templates)用于配置集群节点。这些模板使用 Docker Machine 配置选项来定义节点的操作系统镜像以及设置/参数。

节点模板可以使用`云凭证`来访问在基础设施提供商中配置节点所需的凭证信息。多个节点模板可以使用相同的`云凭证`。通过使用`云凭证`，你不必为同一云提供商重新输入访问密钥。`云凭证`存储为 Kubernetes 密文。

你可以在两种情况下创建`云凭据`：

- [在为集群创建节点模板期间](https://rancher.com/docs/rancher/v2.6/en/cluster-provisioning/rke-clusters/node-pools/#node-templates)。
- 在"用户设置"页面。

所有`云凭证`都绑定到你的用户配置文件，不能与其他用户共享。

### 创建你的云凭证

1. 单击 **☰ > Cluster Management**。
1. 单击 **Cloud Credentials**。
1. 单击 **Create**。
1. 单击 **Harvester**。
1. 输入你的云凭证名称。
1. 选择 **Imported Harvester** 或 **External Harvester**。
1. 单击 **Create**。

![create-harvester-cloud-credentials](/img/v1.0/rancher/create-cloud-credentials.png)

### 创建节点模板

你可以使用 Harvester 主机驱动为你的 Kubernetes 集群创建节点模板并创建节点池。

1. 配置**云凭证**。
1. 配置**实例选项**：
   * 配置 CPU，内存和磁盘。
   * 选择与 `cloud-init` 配置兼容的操作系统镜像。
   * 选择 主机驱动能够连接的网络，目前仅支持 `VLAN`。
   * 输入 SSH 用户。用户名会用于 SSH 到节点。例如，Ubuntu 云镜像的默认用户将是 `ubuntu`。
1. （可选）如果你需要自定义虚拟机的 cloud-init 配置，设置 **Advanced Options**：
1. 输入 **RANCHER TEMPLATE** 名称。

![](/img/v1.0/rancher/node-template.png)

详情请参见[基础设施提供商托管的节点](https://rancher.com/docs/rancher/v2.6/en/cluster-provisioning/rke-clusters/node-pools/)。

#### 添加节点亲和性

_从 v1.0.3 + Rancher v2.6.7 起可用_

Harvester 主机驱动现在支持通过节点亲和性规则将一组主机调度到特定节点，这能提供高可用性并提高资源的利用率。

你可以在集群创建期间将节点亲和性添加到节点模板中，单击 `Add Node Template` 或通过 `RKE1 Configuration > Node Templates` 编辑现有节点模板：

1. 单击 `Advanced Options` 选项卡并单击 `Add Node Selector`：
   ![affinity-add-node-selector](/img/v1.0/rancher/affinity-add-node-selector.png)
1. 如果你希望调度程序仅在满足规则时调度主机，请将优先级设置为 `Required`。
1. 点击 `Add Rule` 指定节点亲和规则，例如，对于 [topology spread constraints](./node-driver.md#拓扑分布约束) 用例，你可以添加 `region` 和 `zone` 标签，如下：
   ```yaml
   key: topology.kubernetes.io/region
   operator: in list
   values: us-east-1
   ---
   key: topology.kubernetes.io/zone
   operator: in list
   values: us-east-1a
   ```
   ![affinity-add-rules](/img/v1.0/rancher/affinity-add-rules.png)
1. 点击 `Create` 保存节点模板。集群安装完成后，你可以查看其主机节点是否按照亲和性规则进行调度。


### 创建 RKE1 Kubernetes 集群

用户可以通过 Harvester RKE1 主机驱动从**集群管理**页面创建 RKE1 Kubernetes 集群。

1. 点击 **Clusters** 菜单。
1. 点击 **Create** 按钮。
1. 切换到 **RKE1**。
1. 选择 Harvester 主机驱动。
1. 输入 **Cluster Name**（必须）。
1. 输入 **Name Prefix**（必须）。
1. 输入 **Template**（必须）。
1. 选择 **Etcd** 和 **Control**（必须）。
1. 如果你需要使用 Harvester [Cloud Provider](../cloud-provider.md) 和 [CSI 驱动](../csi-driver.md)，在**集群选项**中，把 `Cloud Provider` 配置为 `Harvester`。
   ![](/img/v1.0/rancher/enable-harvester-cloud-provider.png)
1. 单击 **Create**。

![create-rke-harvester-cluster](/img/v1.0/rancher/create-rke-harvester-cluster.png)

### 在离线环境中使用 Harvester RKE1 主机驱动

RKE1 配置依赖 `qemu-guest-agent` 来获取虚拟机的 IP，并依赖 `docker` 来设置 RKE 集群。但是，在离线环境中安装 `qemu-guest-agent` 和 `docker` 可能不可行。

你可以使用以下选项解决安装限制：

选项 1：使用安装了 `qemu-guest-agent` 和 `docker` 的虚拟机镜像。

选项 2：配置 `cloud init` 用户数据，使虚拟机能够通过 HTTP(S) 代理安装 `qemu-guest-agent` 和 `docker`。

Harvester 节点模板中的用户数据示例：
```
#cloud-config
apt:
  http_proxy: http://192.168.0.1:3128
  https_proxy: http://192.168.0.1:3128
write_files:
- path: /etc/environment
  content: |
    HTTP_PROXY="http://192.168.0.1:3128"
    HTTPS_PROXY="http://192.168.0.1:3128"
  append: true
```
