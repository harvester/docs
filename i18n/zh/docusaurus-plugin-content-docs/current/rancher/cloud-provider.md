---
sidebar_position: 4
sidebar_label: Harvester Cloud Provider
title: "Harvester Cloud Provider"
keywords:
  - Harvester
  - harvester
  - RKE
  - rke
  - RKE2
  - rke2
  - Harvester Cloud Provider
Description: Harvester 中的 k8s 集群使用的 Harvester Cloud Provider 提供了一个 CSI 接口和 Cloud Controller Manager (CCM)，来实现一个内置的负载均衡器。
---

你可以使用内置的 Harvester 主机驱动在 Rancher 中配置 [RKE1](./node/rke1-cluster.md) 和 [RKE2](./node/rke2-cluster.md) 集群。Harvester 会为这些 Kubernetes 集群提供[负载均衡器](#负载均衡器支持)和 Harvester 集群[存储直通](./csi-driver.md)支持。

你将在本文中学习：

- 如何在 RKE1 和 RKE2 集群中部署 Harvester Cloud Provider。
- 如何使用 [Harvester 负载均衡器](#负载均衡器支持)。

### 向后兼容性通知

:::note

如果你使用 Harvester Cloud Provider **v0.2.2** 或更高版本，请注意已知的向后兼容性问题。如果你的 Harvester 版本低于 **v1.2.0** 并且打算使用较新的 RKE2 版本（即 >= `v1.26.6+rke2r1`、`v1.25.11+rke2r1 `、`v1.24.15+rke2r1`），在继续升级 Kubernetes 集群或 Harvester Cloud Provider 之前，必须将 Harvester 集群升级到 v1.2.0 或更高版本。

有关详细的支持矩阵，请参阅官方[网站](https://www.suse.com/suse-harvester/support-matrix/all-supported-versions/)的 **Harvester CCM & CSI Driver with RKE2 Releases** 部分。

:::

## 部署

### 前提
- Kubernetes 集群是在 Harvester 虚拟机之上构建的。
- 作为 Kubernetes 节点运行的 Harvester 虚拟机位于相同的命名空间中。
- Harvester 虚拟机 Guest 的主机名与其​​相应的 Harvester 虚拟机名称匹配。使用 Harvester CSI Driver 时，Guest 集群 Harvester VM 的主机名必须与其 Harvester VM 名称相同。我们希望在后续 Harvester 版本中[消除此限制](https://github.com/harvester/harvester/issues/4396)。

### 使用 Harvester 主机驱动部署到 RKE1 集群
使用 Harvester 主机驱动启动 RKE 集群时，你可以执行两个步骤来部署 `Harvester` 云提供商：

1. 选择 `Harvester (Out-of-tree)` 选项。

   ![](/img/v1.2/rancher/rke-cloud-provider.png)

2. 从 Rancher 应用市场中安装 `Harvester Cloud Provider`。

   ![](/img/v1.2/rancher/install-harvester-cloud-provider.png)


### 使用 Harvester 主机驱动部署到 RKE2 集群

使用 Harvester 主机驱动启动 RKE2 集群时，选择 `Harvester` 云提供商。然后，主机驱动将自动部署 CSI 驱动和 CCM。

![](/img/v1.2/rancher/rke2-cloud-provider.png)

### 部署到 RKE2 自定义集群（实验性）

![](/img/v1.2/rancher/custom.png)
1. 使用 `generate_addon.sh` 生成 cloud-config 并将其放入每个自定义节点上的 `/etc/kubernetes/cloud-config` 目录中。

   ```
   curl -sfL https://raw.githubusercontent.com/harvester/cloud-provider-harvester/master/deploy/generate_addon.sh | bash -s <serviceaccount name> <namespace>
   ```

:::note

`generate_addon.sh` 脚本依赖 `kubectl` 和` jq ` 来操作 Harvester 集群。

该脚本需要访问 `Harvester 集群` kubeconfig 才能工作。你可以在其中一个 Harvester 管理节点的 `/etc/rancher/rke2/rke2.yaml` 路径中找到 `kubeconfig` 文件。

命名空间必须是要在其中创建 Guest 集群的命名空间。

:::


2. 将 **Cloud Provider** 配置为 `Harvester` 并选择 **Create** 以启动集群。
   ![](/img/v1.2/rancher/create-custom-rke2.png)

### 使用 Harvester 主机驱动部署到 K3s 集群（实验性）

使用 Harvester 主机驱动启动 K3s 集群时，你可以执行以下步骤来部署 Harvester Cloud Provider：

1. 使用 `generate_addon.sh` 生成 cloud-config。

   ```
   curl -sfL https://raw.githubusercontent.com/harvester/cloud-provider-harvester/master/deploy/generate_addon.sh | bash -s <serviceaccount name> <namespace>
   ```

   输出将如下所示：

   ```
   ########## cloud config ############
   apiVersion: v1
   clusters:
   - cluster:
       certificate-authority-data: <CACERT>
       server: https://HARVESTER-ENDPOINT/k8s/clusters/local
     name: local
   contexts:
   - context:
       cluster: local
       namespace: default
       user: harvester-cloud-provider-default-local
     name: harvester-cloud-provider-default-local
   current-context: harvester-cloud-provider-default-local
   kind: Config
   preferences: {}
   users:
   - name: harvester-cloud-provider-default-local
     user:
       token: <TOKEN>
   
   
   ########## cloud-init user data ############
   write_files:
   - encoding: b64
     content: <CONTENT>
     owner: root:root
     path: /etc/kubernetes/cloud-config
     permissions: '0644'
   ```

2. 将 `cloud-init user data` 的内容复制并粘贴到 **Machine Pools >Show Advanced > User Data**。
   ![](/img/v1.2/rancher/cloud-config-userdata.png)

3. 将 `harvester-cloud-provider` 的以下 `HelmChart` YAML 添加到 **Cluster Configuration > Add-On Config > Additional Manifest**。

   ```
   apiVersion: helm.cattle.io/v1
   kind: HelmChart
   metadata:
     name: harvester-cloud-provider
     namespace: kube-system
   spec:
     targetNamespace: kube-system
     bootstrap: true
     repo: https://charts.harvesterhci.io/
     chart: harvester-cloud-provider
     version: 0.2.2
     helmVersion: v3
   ```

   ![](/img/v1.2/rancher/external-cloud-provider-addon.png)

4. 通过以下方式禁用`树内` cloud provider：

   - 单击 `Edit as YAML` 按钮。

   ![](/img/v1.2/rancher/edit-k3s-cluster-yaml.png)
   - 禁用 `servicelb` 并设置 `disable-cloud-controller: true` 来禁用默认的 K3s 云控制器。
   ```yaml
       machineGlobalConfig:
         disable:
           - servicelb
         disable-cloud-controller: true
   ```

   - 添加 `cloud-provider=external` 以使用 Harvester Cloud Provider。
   ```yaml
       machineSelectorConfig:
         - config:
             kubelet-arg:
             - cloud-provider=external
             protect-kernel-defaults: false
   ```

   ![](/img/v1.2/rancher/k3s-cluster-yaml-content-for-harvester-cloud-provider.png)

有了这些设置，K3s 集群应该可以在你使用外部云提供商时成功配置。


## 升级 Cloud Provider

### 升级 RKE2
你可以通过升级 RKE2 版本来升级 Cloud Provider。要升级 RKE2 集群，你可以在 Rancher UI 中执行以下操作：
1. 单击 **☰ > Cluster Management**。
2. 找到要升级的 guest 集群，然后选择 **⋮ > Edit Config**。
3. 选择 **Kubernetes Version**。
4. 单击 **Save**。

### 升级 RKE/K3s
你可以通过 Rancher UI 升级 RKE/K3s cloud provider，如下所示：
1. 单击 **☰ > RKE/K3s Cluster > Apps > Installed Apps**。
2. 找到 cloud provider 表并选择 **⋮ > Edit/Upgrade**。
3. 选择 **Version**。
4. 单击 **Next > Update**。

## 负载均衡器支持
部署 Harvester Cloud Provider 后，你可以使用 Kubernetes `LoadBalancer` 服务将集群内的微服务公开给外部。创建 Kubernetes `LoadBalancer` 服务时会为该服务分配一个专有的 Harvester 负载均衡器，你可以通过 Rancher UI 中的 `Add-on Config` 对其进行调整。

![](/img/v1.2/rancher/lb-svc.png)


### IPAM
Harvester 内置的负载均衡器提供 **DHCP** 和 **Pool** 两种模式，你可以通过添加注释 `cloudprovider.harvesterhci.io/ipam: $mode` 来将它配置到相应的服务。从 Harvester Cloud Provider >= v0.2.0 开始，我们还引入了独特的**共享 IP** 模式。在此模式下，service 会与其他 service 共享其负载均衡器 IP。

- **DCHP**：需要 DHCP 服务器。Harvester 负载均衡器将从 DHCP 服务器请求 IP 地址。

- **Pool**：必须先配置 [IP 池](../networking/ippool.md)。Harvester 负载均衡器控制器将遵循 [IP 池选择策略](../networking/ippool.md#选择策略)为负载均衡器 service 分配 IP。

- **共享 IP**：创建新的负载均衡器 service 时，你可以重新利用现有的负载均衡器 service IP。新 service 指的是次要 service，而当前选择的 service 是主要 service。要在次要 service 中指定主要 service，你可以添加注解 `cloudprovider.harvesterhci.io/primary-service: $primary-service-name`。然而，有两个已知的限制：
   - 共享同一 IP 地址的 service 不能使用同一个端口。
   - 次要 service 不能与其他 service 共享其 IP。

:::note

不允许修改 `IPAM` 模式。如果你打算更改 `IPAM` 模式，则必须创建新 service。

:::

## 健康检查

Harvester Cloud Provider v0.2.0 开始不再需要对 Guest Kubernetes 集群内的 `LoadBalancer` 服务进行额外的运行状况检查。相反，你可以为工作负载配置 [liveness](https://kubernetes.io/docs/tasks/configure-pod-container/configure-liveness-readiness-startup-probes/#define-a-tcp-liveness-probe) 和 [readiness](https://kubernetes.io/docs/tasks/configure-pod-container/configure-liveness-readiness-startup-probes/#define-readiness-probes) 探针。因此，任何不可用的 Pod 都将自动从负载均衡器端点中删除，以实现相同的预期结果。
