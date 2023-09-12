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

- 如何在 RKE1 和 RKE2 中部署 Harvester Cloud Provider。
- 如何使用 [Harvester 负载均衡器](#负载均衡器支持)。

## 部署

### 前提
- Kubernetes 集群是在 Harvester 虚拟机之上构建的。
- 作为 Kubernetes 节点运行的 Harvester 虚拟机位于相同的命名空间中。

### 使用 Harvester 主机驱动部署到 RKE1 集群
使用 Harvester 主机驱动启动 RKE 集群时，你可以执行两个步骤来部署 `Harvester` 云提供商：

1. 选择 `Harvester (Out-of-tree)` 选项。

   ![](/img/v1.1/rancher/rke-cloud-provider.png)

2. 从 Rancher 应用市场中安装 `Harvester Cloud Provider`。

   ![](/img/v1.1/rancher/install-harvester-cloud-provider.png)


### 使用 Harvester 主机驱动部署到 RKE2 集群

使用 Harvester 主机驱动启动 RKE2 集群时，选择 `Harvester` 云提供商。然后，主机驱动将自动部署 CSI 驱动和 CCM。

![](/img/v1.1/rancher/rke2-cloud-provider.png)

### 使用 Harvester 主机驱动部署到 K3s 集群[实验性]

使用 Harvester 主机驱动启动 K3s 集群时，你可以执行以下步骤来部署 Harvester Cloud Provider：

1. 为 `harvester-cloud-provider` 生成并注入 Cloud Config。

云提供商需要一个 kubeconfig 文件才能工作，你可以使用 [harvester/cloud-provider-harvester](https://github.com/harvester/cloud-provider-harvester) 仓库中的 [generate_addon.sh](https://raw.githubusercontent.com/harvester/cloud-provider-harvester/master/deploy/generate_addon.sh) 脚本来生成一个有限范围的文件。

:::note

该脚本依赖 `kubectl` 和 `jq` 来操作 Harvester 集群。

该脚本需要访问 `Harvester 集群` kubeconfig 才能工作。

命名空间必须是要在其中创建 Guest 集群的命名空间。

:::

```
./deploy/generate_addon.sh <serviceaccount name> <namespace>
```

输出将如下所示：

```
# ./deploy/generate_addon.sh harvester-cloud-provider default
Creating target directory to hold files in ./tmp/kube...done
Creating a service account in default namespace: harvester-cloud-provider
W1104 16:10:21.234417    4319 helpers.go:663] --dry-run is deprecated and can be replaced with --dry-run=client.
serviceaccount/harvester-cloud-provider configured

Creating a role in default namespace: harvester-cloud-provider
role.rbac.authorization.k8s.io/harvester-cloud-provider unchanged

Creating a rolebinding in default namespace: harvester-cloud-provider
W1104 16:10:21.986771    4369 helpers.go:663] --dry-run is deprecated and can be replaced with --dry-run=client.
rolebinding.rbac.authorization.k8s.io/harvester-cloud-provider configured

Getting uid of service account harvester-cloud-provider on default
Service Account uid: ea951643-53d2-4ea8-a4aa-e1e72a9edc91

Creating a user token secret in default namespace: harvester-cloud-provider-token
Secret name: harvester-cloud-provider-token

Extracting ca.crt from secret...done
Getting user token from secret...done
Setting current context to: local
Cluster name: local
Endpoint: https://HARVESTER_ENDPOINT/k8s/clusters/local

Preparing k8s-harvester-cloud-provider-default-conf
Setting a cluster entry in kubeconfig...Cluster "local" set.
Setting token credentials entry in kubeconfig...User "harvester-cloud-provider-default-local" set.
Setting a context entry in kubeconfig...Context "harvester-cloud-provider-default-local" created.
Setting the current-context in the kubeconfig file...Switched to context "harvester-cloud-provider-default-local".
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

将 `cloud-init user data` 下的输出复制并粘贴到 **Machine Pools >Show Advanced > User Data**。

![](/img/v1.1/rancher/cloud-config-userdata.png)

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
  version: 0.1.13
  helmVersion: v3
```

![](/img/v1.1/rancher/external-cloud-provider-addon.png)

4. 通过以下方式禁用树内云提供商

- 单击 `Edit as YAML` 按钮

![](/img/v1.1/rancher/edit-k3s-cluster-yaml.png)
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

![](/img/v1.1/rancher/k3s-cluster-yaml-content-for-harvester-cloud-provider.png)

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
部署 `Harvester Cloud Provider` 后，你可以使用 Kubernetes `LoadBalancer` 服务将集群内的微服务公开给外部。在你创建 Kubernetes `LoadBalancer` 服务时，会为该服务分配一个 Harvester 负载均衡器，你可以通过 Rancher UI 中的 `Add-on Config` 对其进行编辑。

![](/img/v1.1/rancher/lb-svc.png)


### IPAM
Harvester 的内置负载均衡器同时支持 `pool` 和 `dhcp` 模式。你可以在 Rancher UI 中选择模式，随后 Harvester 将注释 `cloudprovider.harvesterhci.io/ipam` 添加到后面的服务中。

- pool：需要提前在 Harvester 的 `Settings` 中配置一个 IP 地址池。Harvester LoadBalancer Controller 将从 IP 地址池中为负载均衡器分配一个 IP 地址。

   ![](/img/v1.1/rancher/vip-pool.png)

- dhcp：需要 DHCP 服务器。Harvester LoadBalancer Controller 将从 DHCP 服务器请求 IP 地址。

:::note

不允许修改 IPAM 模式。如果需要修改 IPAM 模式，你需要创建一个新 service。

:::

### 健康检查
Harvester 负载均衡器支持 TCP 健康检查。如果启用了`健康检查`选项，你可以在 Rancher UI 中指定参数。

![](/img/v1.1/rancher/health-check.png)

你也可以手动将注释添加到服务来指定参数。支持以下注释：

| 注释键 | 值类型 | 是否必须 | 描述 |
|:---|:---|:---|:---|
| `cloudprovider.harvesterhci.io/healthcheck-port` | string | true | 指定端口。探针将访问由后端服务器 IP 和端口组成的地址。 |
| `cloudprovider.harvesterhci.io/healthcheck-success-threshold` | string | false | 指定健康检查成功阈值。默认值为 1。如果探针连续检测到某个地址的成功次数达到成功阈值，后端服务器就可以开始转发流量。 |
| `cloudprovider.harvesterhci.io/healthcheck-failure-threshold` | string | false | 指定健康检查失败阈值。默认值为 3。如果健康检查失败的数量达到失败阈值，后端服务器将停止转发流量。 |
| `cloudprovider.harvesterhci.io/healthcheck-periodseconds` | string | false | 指定健康检查周期。默认值为 5 秒。 |
| `cloudprovider.harvesterhci.io/healthcheck-timeoutseconds` | string | false | 指定每次健康检查的超时时间。默认值为 3 秒。 |
