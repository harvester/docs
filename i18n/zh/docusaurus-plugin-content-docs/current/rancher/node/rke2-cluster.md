---
sidebar_position: 3
sidebar_label: 创建 RKE2 Kubernetes 集群
title: "创建 RKE2 Kubernetes 集群"
---

现在，你可以使用内置的 Harvester 主机驱动在 Rancher 中的 Harvester 集群上配置 RKE2 Kubernetes 集群。

![rke2-cluster](/img/v1.2/rancher/rke2-k3s-node-driver.png)

:::note

- Harvester 主机驱动需要 [VLAN 网络](../../networking/harvester-network.md#vlan-网络)。
- Harvester 主机驱动仅支持云服务镜像（Cloud Image）。
- 有关 Harvester 中部署的 Guest 集群的端口要求，请参阅[此文档](../../install/requirements.md#k3s-或-rkerke2-集群的端口要求)。
- 有关 RKE2 与 Harvester Cloud Provider 的支持矩阵，请参阅[此网站](https://www.suse.com/suse-harvester/support-matrix/all-supported-versions/)。

:::

### 向后兼容性通知

:::note

如果你使用 Harvester Cloud Provider **v0.2.2** 或更高版本，请注意已知的向后兼容性问题。如果你的 Harvester 版本低于 **v1.2.0** 并且打算使用较新的 RKE2 版本（即 >= `v1.26.6+rke2r1`、`v1.25.11+rke2r1 `、`v1.24.15+rke2r1`），在继续升级 Kubernetes 集群或 Harvester Cloud Provider 之前，必须将 Harvester 集群升级到 v1.2.0 或更高版本。

有关详细的支持矩阵，请参阅官方[网站](https://www.suse.com/suse-harvester/support-matrix/all-supported-versions/)的 **Harvester CCM & CSI Driver with RKE2 Releases** 部分。

:::


### 创建云凭证

1. 单击 **☰ > Cluster Management**。
2. 单击 **Cloud Credentials**。
3. 单击 **Create**。
4. 单击 **Harvester**。
5. 输入你的云凭证名称。
6. 选择 **Imported Harvester Cluster**。
7. 单击 **Create**。

![create-harvester-cloud-credentials](/img/v1.2/rancher/create-cloud-credentials.png)

### 创建 RKE2 Kubernetes 集群

用户可以通过 RKE2 主机驱动从**集群管理**页面创建 RKE2 Kubernetes 集群。

1. 点击 **Clusters** 菜单。
2. 点击 **Create** 按钮。
3. 切换到 **RKE2/K3s**。
4. 选择 Harvester 主机驱动。
5. 选择 **Cloud Credential**。
6. 输入 **Cluster Name**（必须）。
7. 选择 **Namespace**（必须）。
8. 选择 **Image**（必须）。
9. 选择 **Network Name**（必须）。
10. 输入 **SSH User**（必须）。
11. （可选）配置 **Show Advanced > User Data** 以安装 VM 所需的包。
```yaml
#cloud-config
packages:
  - iptables
```

:::note

Calico 和 Canal 网络要求在节点上安装 `iptables` 或 `xtables-nft` 包。详情请参阅 [RKE2 已知问题](https://docs.rke2.io/known_issues#canal-and-ip-exhaustion)。

:::


12. 单击 **Create**。

![create-rke2-harvester-cluster-1](/img/v1.2/rancher/create-rke2-harvester-cluster-1.png)
![create-rke2-harvester-cluster-2](/img/v1.2/rancher/create-rke2-harvester-cluster-2.png)
![create-rke2-harvester-cluster-3](/img/v1.2/rancher/create-rke2-harvester-cluster-3.png)

:::note

- RKE2 1.21.5 + rke2r2 或更高版本提供内置的 Harvester Cloud Provider 和 Guest CSI 驱动集成。
- Harvester 主机驱动仅支持导入的 Harvester 集群。

:::

#### 添加节点亲和性

_从 v1.0.3 + Rancher v2.6.7 起可用_

Harvester 主机驱动现在支持通过节点亲和性规则将一组主机调度到特定节点，这能提供高可用性并提高资源的利用率。

你可以在集群创建期间将节点亲和性添加到主机池中：

1. 单击 `Show Advanced` 按钮并单击 `Add Node Selector`：
   ![affinity-add-node-selector](/img/v1.2/rancher/affinity-rke2-add-node-selector.png)
2. 如果你希望调度程序仅在满足规则时调度主机，请将优先级设置为 `Required`。
3. 点击 `Add Rule` 指定节点亲和规则，例如，对于 [topology spread constraints](./node-driver.md#拓扑分布约束) 用例，你可以添加 `region` 和 `zone` 标签，如下：
   ```yaml
   key: topology.kubernetes.io/region
   operator: in list
   values: us-east-1
   ---
   key: topology.kubernetes.io/zone
   operator: in list
   values: us-east-1a
   ```
   ![affinity-add-rules](/img/v1.2/rancher/affinity-rke2-add-rules.png)

#### 添加工作负载亲和性

_从 v1.2.0 + Rancher v2.7.6 起可用_

有了工作负载亲和性规则，你可以根据已在节点上运行的工作负载（VM 和 Pod）的标签（而不是节点标签）来限制可以在哪些节点上调度你的机器。

你可以在集群创建期间将工作负载亲和性规则添加到机器池中：

1. 选择 **Show Advanced**，然后选择 **Add Workload Selector**。
   ![affinity-add-workload-selector](/img/v1.2/rancher/affinity-rke2-add-workload-selector.png)
2. 选择 **Type**，**Affinity** 或 **Anti-Affinity**。
3. 选择 **Priority**。**Prefered** 表示可选规则，**Required** 表示必选规则。
4. 为目标工作负载选择命名空间。
5. 选择 **Add Rule** 以指定工作负载亲和性规则。
6. 设置 **Topology Key** 以指定将 Harvester 主机划分为不同拓扑的标签键。

有关更多信息，请参阅 [Kubernetes Pod 亲和性和反亲和性文档](https://kubernetes.io/docs/concepts/scheduling-eviction/assign-pod-node/#inter-pod-affinity-and-anti-affinity)。

### 更新 RKE2 Kubernetes 集群

RKE2 机器池下面突出显示的字段表示 Harvester VM 配置。对这些字段的任何修改都会触发节点重新配置。

![rke2-harvester-fields](/img/v1.2/rancher/rke2-harvester-fields.png)

### 在离线环境中使用 Harvester RKE2 主机驱动

RKE2 配置依赖 `qemu-guest-agent` 包来获取虚拟机的 IP。

Calico 和 Canal 要求在节点上安装 `iptables` 或 `xtables-nft` 包。

但是，你可能无法在离线环境中安装软件包。

你可以使用以下选项解决安装限制：

- 选项 1：使用预先配置了所需软件包（例如 `iptables`、`qemu-guest-agent`）的 VM 镜像。
- 选项 2：转到 **Show Advanced** > **User Data** 来允许虚拟机通过 HTTP(S) 代理安装所需的软件包。

Harvester 节点模板中的用户数据示例：
```
#cloud-config
apt:
  http_proxy: http://192.168.0.1:3128
  https_proxy: http://192.168.0.1:3128
```
