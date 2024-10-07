---
sidebar_position: 5
sidebar_label: Harvester CSI Driver
title: "Harvester CSI Driver"
keywords:
  - Harvester
  - harvester
  - Rancher 集成
---

Harvester CSI Driver 提供了一个标准的 CSI 接口，供 Harvester 中所创建的 Kubernetes 集群使用。这个 CIS 接口连接到主机集群，并将主机卷热插拔到虚拟机来提供裸金属集群磁盘的存储性能。

## 部署

### 前提

- Kubernetes 集群是在 Harvester 虚拟机之上构建的。
- 作为 Guest Kubernetes 节点运行的 Harvester 虚拟机均位于相同的 Harvester 命名空间中。
- Harvester 虚拟机 Guest 的主机名与其​​相应的 Harvester 虚拟机名称匹配。使用 Harvester CSI Driver 时，Guest 集群 Harvester VM 的主机名必须与其 Harvester VM 名称相同。我们希望在后续 Harvester 版本中[消除此限制](https://github.com/harvester/harvester/issues/4396)。

:::note

目前，Harvester CSI Driver 仅支持单节点读写 (RWO) 卷。请留意 [issue #1992](https://github.com/harvester/harvester/issues/1992) 以获得后续多节点 `read-only` (ROX) 和 `read-write` (RWX) 的支持。

:::

### 使用 Harvester RKE1 主机驱动进行部署

- 选择 `Harvester (Out-of-tree)` 选项（可选，如不需要同时使用 Cloud Provider 功能可以选择 `None` 选项）。

   ![](/img/v1.1/rancher/rke-cloud-provider.png)

- 从 Rancher 应用市场安装 `Harvester CSI Driver`：

   ![](/img/v1.1/rancher/install-harvester-csi-driver.png)


### 使用 Harvester RKE2 主机驱动进行部署

当使用 Rancher RKE2 主机驱动启动 Kubernetes 集群时，Harvester CSI Driver 会在选中 Harvester Cloud Provider 后被自动部署。

![select-harvester-cloud-provider](/img/v1.1/rancher/rke2-cloud-provider.png)

#### 在 RKE2 集群中手动安装 CSI Driver

如果你想在不启用 Harvester Cloud Provider 的情况下部署 Harvester CSI Driver，在 `Cloud Provider` 字段中选择 `Default - RKE2 Embedded` 或 `External`。如果你使用的是 Rancher v2.6，请选择 `None`。

![](/img/v1.1/rancher/non-harvester-cloud-provider.png)

#### 前提

确保你满足以下前提条件：
- 系统上安装了 `kubectl` 和 `jq`。
- 你拥有裸机 Harvester 集群的 `kubeconfig` 文件。
   ```
   export KUBECONFIG=/path/to/your/harvester-kubeconfig
   ```

![](/img/v1.1/rancher/creating_guest_cluster.png)

执行以下步骤手动部署 Harvester CSI Driver：
#### 部署 Harvester CSI Driver

1. 生成 cloud-config。

   你可以使用 [generate_addon_csi.sh](https://raw.githubusercontent.com/harvester/harvester-csi-driver/master/deploy/generate_addon_csi.sh) 脚本生成 `kubeconfig` 文件。你可以在 [harvester/harvester-csi-driver](https://github.com/harvester/harvester-csi-driver) 仓库中找到该文件。按照以下步骤获取 `cloud-config` 和 `cloud-init` 数据：

   `<serviceaccount name>` 通常对应 Guest 集群的名称（下图中 **Cluster Name** 的值），`<namespace>` 需要匹配 Guest 集群的命名空间（**Namespace** 的值）。

   ```
   # ./generate_addon_csi.sh <serviceaccount name> <namespace> RKE2
   ```

   ```
   ########## cloud-config ############
   apiVersion: v1
   clusters:
   - cluster: <token>
       server: https://<YOUR HOST HARVESTER VIP>:6443
     name: default
   contexts:
   - context:
       cluster: default
       namespace: default
       user: rke2-guest-01-default-default
     name: rke2-guest-01-default-default
   current-context: rke2-guest-01-default-default
   kind: Config
   preferences: {}
   users:
   - name: rke2-guest-01-default-default
     user:
       token: <token>

   ########## cloud-init user data ############
   write_files:
     - encoding: b64
       content: YXBpVmVyc2lvbjogdjEKY2x1c3RlcnM6Ci0gY2x1c3RlcjoKICAgIGNlcnRpZmljYXRlLWF1dGhvcml0eS1kYXRhOiBMUzB0TFMxQ1JVZEpUaUJEUlZKVVNVWkpRMEZVUlMwdExTMHRDazFKU1VKbFZFTkRRVklyWjBGM1NVSkJaMGxDUVVSQlMwSm5aM0ZvYTJwUFVGRlJSRUZxUVd0TlUwbDNTVUZaUkZaUlVVUkVRbXg1WVRKVmVVeFlUbXdLWTI1YWJHTnBNV3BaVlVGNFRtcG5NVTE2VlhoT1JGRjNUVUkwV0VSVVNYcE5SRlY1VDFSQk5VMVVRVEJOUm05WVJGUk5lazFFVlhsT2FrRTFUVlJCTUFwTlJtOTNTa1JGYVUxRFFVZEJNVlZGUVhkM1dtTnRkR3hOYVRGNldsaEtNbHBZU1hSWk1rWkJUVlJaTkU1VVRURk5WRkV3VFVSQ1drMUNUVWRDZVhGSENsTk5ORGxCWjBWSFEwTnhSMU5OTkRsQmQwVklRVEJKUVVKSmQzRmFZMDVTVjBWU2FsQlVkalJsTUhFMk0ySmxTSEZEZDFWelducGtRa3BsU0VWbFpHTUtOVEJaUTNKTFNISklhbWdyTDJab2VXUklNME5ZVURNeFZXMWxTM1ZaVDBsVGRIVnZVbGx4YVdJMGFFZE5aekpxVVdwQ1FVMUJORWRCTVZWa1JIZEZRZ292ZDFGRlFYZEpRM0JFUVZCQ1owNVdTRkpOUWtGbU9FVkNWRUZFUVZGSUwwMUNNRWRCTVZWa1JHZFJWMEpDVWpaRGEzbEJOSEZqYldKSlVESlFWVW81Q2xacWJWVTNVV2R2WjJwQlMwSm5aM0ZvYTJwUFVGRlJSRUZuVGtsQlJFSkdRV2xCZUZKNU4xUTNRMVpEYVZWTVdFMDRZazVaVWtWek1HSnBZbWxVSzJzS1kwRnhlVmt5Tm5CaGMwcHpMM2RKYUVGTVNsQnFVVzVxZEcwMVptNTZWR3AxUVVsblRuTkdibFozWkZRMldXWXpieTg0ZFRsS05tMWhSR2RXQ2kwdExTMHRSVTVFSUVORlVsUkpSa2xEUVZSRkxTMHRMUzBLCiAgICBzZXJ2ZXI6IGh0dHBzOi8vMTkyLjE2OC4wLjEzMTo2NDQzCiAgbmFtZTogZGVmYXVsdApjb250ZXh0czoKLSBjb250ZXh0OgogICAgY2x1c3RlcjogZGVmYXVsdAogICAgbmFtZXNwYWNlOiBkZWZhdWx0CiAgICB1c2VyOiBya2UyLWd1ZXN0LTAxLWRlZmF1bHQtZGVmYXVsdAogIG5hbWU6IHJrZTItZ3Vlc3QtMDEtZGVmYXVsdC1kZWZhdWx0CmN1cnJlbnQtY29udGV4dDogcmtlMi1ndWVzdC0wMS1kZWZhdWx0LWRlZmF1bHQKa2luZDogQ29uZmlnCnByZWZlcmVuY2VzOiB7fQp1c2VyczoKLSBuYW1lOiBya2UyLWd1ZXN0LTAxLWRlZmF1bHQtZGVmYXVsdAogIHVzZXI6CiAgICB0b2tlbjogZXlKaGJHY2lPaUpTVXpJMU5pSXNJbXRwWkNJNklreGhUazQxUTBsMWFsTnRORE5TVFZKS00waE9UbGszTkV0amNVeEtjM1JSV1RoYVpUbGZVazA0YW1zaWZRLmV5SnBjM01pT2lKcmRXSmxjbTVsZEdWekwzTmxjblpwWTJWaFkyTnZkVzUwSWl3aWEzVmlaWEp1WlhSbGN5NXBieTl6WlhKMmFXTmxZV05qYjNWdWRDOXVZVzFsYzNCaFkyVWlPaUprWldaaGRXeDBJaXdpYTNWaVpYSnVaWFJsY3k1cGJ5OXpaWEoyYVdObFlXTmpiM1Z1ZEM5elpXTnlaWFF1Ym1GdFpTSTZJbkpyWlRJdFozVmxjM1F0TURFdGRHOXJaVzRpTENKcmRXSmxjbTVsZEdWekxtbHZMM05sY25acFkyVmhZMk52ZFc1MEwzTmxjblpwWTJVdFlXTmpiM1Z1ZEM1dVlXMWxJam9pY210bE1pMW5kV1Z6ZEMwd01TSXNJbXQxWW1WeWJtVjBaWE11YVc4dmMyVnlkbWxqWldGalkyOTFiblF2YzJWeWRtbGpaUzFoWTJOdmRXNTBMblZwWkNJNkltTXlZak5sTldGaExUWTBNMlF0TkRkbU1pMDROemt3TFRjeU5qWXpNbVl4Wm1aaU5pSXNJbk4xWWlJNkluTjVjM1JsYlRwelpYSjJhV05sWVdOamIzVnVkRHBrWldaaGRXeDBPbkpyWlRJdFozVmxjM1F0TURFaWZRLmFRZmU1d19ERFRsSWJMYnUzWUVFY3hmR29INGY1VnhVdmpaajJDaWlhcXB6VWI0dUYwLUR0cnRsa3JUM19ZemdXbENRVVVUNzNja1BuQmdTZ2FWNDhhdmlfSjJvdUFVZC04djN5d3M0eXpjLVFsTVV0MV9ScGJkUURzXzd6SDVYeUVIREJ1dVNkaTVrRWMweHk0X0tDQ2IwRHQ0OGFoSVhnNlMwRDdJUzFfVkR3MmdEa24wcDVXUnFFd0xmSjdEbHJDOFEzRkNUdGhpUkVHZkUzcmJGYUdOMjdfamR2cUo4WXlJQVd4RHAtVHVNT1pKZUNObXRtUzVvQXpIN3hOZlhRTlZ2ZU05X29tX3FaVnhuTzFEanllbWdvNG9OSEpzekp1VWliRGxxTVZiMS1oQUxYSjZXR1Z2RURxSTlna1JlSWtkX3JqS2tyY3lYaGhaN3lTZ3o3QQo=
       owner: root:root
       path: /var/lib/rancher/rke2/etc/config-files/cloud-provider-config
       permissions: '0644'
   ```

   将 `cloud-init user data` 下的输出复制并粘贴到 **Machine Pools >Show Advanced > User Data**。

2. 设置 cloud-provider-config。

   应用上述 cloud-init 用户数据后，你需要创建 cloud-provider-config。

   你可以再次检查路径 `/var/lib/rancher/rke2/etc/config-files/cloud-provider-config`。

   :::note

   要更改 cloud-provider-config 路径，你需要更新 cloud-init 用户数据。

   :::

3. 安装 Harvester CSI Driver。

   从 Rancher 应用市场安装 `Harvester CSI Driver` chart（请注意，默认情况下不需要更改 `cloud-config` 路径）。
   ![](/img/v1.1/rancher/install_csi_rancher_marketplace.png)

   ![](/img/v1.1/rancher/donot_change_cloud_config_path.png)

执行上述步骤后，你应该能够看些 CSI Driver pod 已启动并运行，要进行验证，你可以使用默认 storageClass `harvester` 来配置新的 PVC。

### 使用 Harvester K3s 主机驱动进行部署

你可以按照**前提**中 RKE2 部分描述的[部署 Harvester CSI Driver](./csi-driver.md#部署-harvester-csi-driver) 步骤进行操作。

唯一的区别是你需要如下更改脚本命令：

```
# ./generate_addon_csi.sh <serviceaccount name> <namespace> k3s
```

## 直通自定义存储类

从 Harvester CSI Driver v0.1.15 开始，你可以基于不同的 StorageClass 创建 PersistentVolumeClaim (PVC)。

从以下 RKE2 版本开始，我们开箱即用地支持 Harvester CSI Driver v0.1.15。如果你是用的是 RKE1，则需要手动安装 CSI Driver Chart：
- v1.23.16+rke2r1 and later
- v1.24.10+rke2r1 and later
- v1.25.6+rke2r1 and later
- v1.26.1+rke2r1 and later
- v1.27.1+rke2r1 and later

### 前提

请将以下内容添加到你的 Harvester 集群中。Harvester CSI Driver 需要适当的 **RBAC** 才能显示错误消息。这对于在使用不存在的 StorageClass 创建 PVC 时显示错误消息很重要，如下图所示。

![](/img/v1.1/rancher/error_event_csi_driver.png)


执行以下步骤来设置 **RBAC** 以启用错误消息查看。

1. 使用以下清单创建一个名为 `harvesterhci.io:csi-driver` 的新 `clusterrole`。

   ```
   apiVersion: rbac.authorization.k8s.io/v1
   kind: ClusterRole
   metadata:
     labels:
       app.kubernetes.io/component: apiserver
       app.kubernetes.io/name: harvester
       app.kubernetes.io/part-of: harvester
     name: harvesterhci.io:csi-driver
   rules:
   - apiGroups:
     - storage.k8s.io
     resources:
     - storageclasses
     verbs:
     - get
     - list
     - watch
   ```

2. 然后，使用以下清单创建 `clusterrolebinding` 以关联新的 `clusterrole`。

   ```
   apiVersion: rbac.authorization.k8s.io/v1
   kind: ClusterRoleBinding
   metadata:
     name: <namespace>-<serviceaccount name>
   roleRef:
     apiGroup: rbac.authorization.k8s.io
     kind: ClusterRole
     name: harvesterhci.io:csi-driver
   subjects:
   - kind: ServiceAccount
     name: <serviceaccount name>
     namespace: <namespace>
   ```

确保 `serviceaccount name` 和 `namespace` 与你的云提供商匹配。执行以下步骤来查看你云提供商的 `serviceaccount name` 和 `namespace`。

1. 找到你的云提供商的 `rolebinding`。

   ```
   # kubectl get rolebinding -A |grep harvesterhci.io:cloudprovider
   default                                 default-rke2-guest-01                                ClusterRole/harvesterhci.io:cloudprovider             7d1h
   ```

2. 获取此 `rolebinding` 的 `subjects` 信息。

   ```
   kubectl get rolebinding default-rke2-guest-01 -n default -o yaml |yq -e '.subjects'
   ```

3. 找到如下 `ServiceAccount` 信息：

   ```
   - kind: ServiceAccount
     name: rke2-guest-01
     namespace: default
   ```

### 部署

1. 创建一个要在 Guest K8s 集群中使用的新 StorageClass。你可以参考 [StorageClasses](../advanced/storageclass.md) 了解更多详情。

   如下图所示，新建一个名为 **replica-2** 的 StorageClass。

   ![](/img/v1.1/rancher/sc-replica-2.png)

   例如，如下所示在下游集群上创建一个名为 **replica-2** 的新 StorageClass，与在 Harvester 集群上创建的 StorageClass 相关联。

   ![](/img/v1.1/rancher/downstream-cluster-sc-creation.png)

   :::note

   在 **Provisioner** 中选择 **Harvester (CSI)**。**Host StorageClass** 是在 Harvester 集群上创建的 StorageClass。

   :::

1. 你现在可以基于这个新的 **StorageClass** 创建 PVC，它使用 **Host StorageClass** 在裸机集群上配置卷。