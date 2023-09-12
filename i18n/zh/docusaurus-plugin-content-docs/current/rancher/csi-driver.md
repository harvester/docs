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
- 作为 Kubernetes 节点运行的 Harvester 虚拟机位于相同的命名空间中。
- Harvester 虚拟机 Guest 的主机名与其​​相应的 Harvester 虚拟机名称匹配。使用 Harvester CSI Driver 时，Guest 集群 Harvester VM 的主机名必须与其 Harvester VM 名称相同。我们希望在后续 Harvester 版本中[消除此限制](https://github.com/harvester/harvester/issues/4396)。

:::note

目前，Harvester CSI Driver 仅支持单节点读写 (RWO) 卷。请留意 [issue #1992](https://github.com/harvester/harvester/issues/1992) 以获得后续多节点 `read-only` (ROX) 和 `read-write` (RWX) 的支持。

:::

### 使用 Harvester RKE1 主机驱动进行部署

- 选择 `Harvester (Out-of-tree)` 选项。

   ![](/img/v1.2/rancher/rke-cloud-provider.png)

- 从 Rancher 应用市场安装 `Harvester CSI Driver`：

   ![](/img/v1.2/rancher/install-harvester-csi-driver.png)


### 使用 Harvester RKE2 主机驱动进行部署

使用 Rancher RKE2 主机驱动启动 Kubernetes 集群时，Harvester CSI Driver 会在选中 Harvester Cloud Provider 后被自动部署。

![select-harvester-cloud-provider](/img/v1.2/rancher/rke2-cloud-provider.png)

### 在 RKE2 集群中手动安装 CSI Driver

如果你希望在不启用 Harvester Cloud Provider 的情况下安装 Harvester CSI Driver，可以参考以下步骤：

#### 手动安装的先决条件

确保你满足以下前提条件：
- 系统上安装了 `kubectl` 和 `jq`。
- 你拥有裸机 Harvester 集群的 `kubeconfig` 文件。你可以在其中一个 Harvester 管理节点的 `/etc/rancher/rke2/rke2.yaml` 路径中找到 `kubeconfig` 文件。
   ```shell
   export KUBECONFIG=/path/to/your/harvester-kubeconfig
   ```

执行以下步骤手动部署 Harvester CSI Driver：
#### 部署 Harvester CSI Driver

1. 生成 `cloud-config`。你可以使用 [generate_addon_csi.sh](https://raw.githubusercontent.com/harvester/harvester-csi-driver/master/deploy/generate_addon_csi.sh) 脚本生成 `cloud-config` 文件。你可以在 [harvester/harvester-csi-driver](https://github.com/harvester/harvester-csi-driver) 仓库中找到该文件。

   `<serviceaccount name>` 通常对应于你的 Guest 集群名称，而 `<namespace>` 应与计算机池的命名空间匹配。

   ```shell
   ./generate_addon_csi.sh <serviceaccount name> <namespace> RKE2
   ```
   ![](/img/v1.1/rancher/creating_guest_cluster.png)

   生成的输出类似以下内容：
   ```shell
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

1. 将 `cloud-init user data` 的内容复制并粘贴到 **Machine Pools** > **Show Advanced** > **User Data**。
   ![](/img/v1.2/rancher/cloud-config-userdata.png)

   应用上述 cloud-init 用户数据后将创建 `cloud-provider-config` 文件。你可以在 Guest Kubernetes 节点上的路径 `/var/lib/rancher/rke2/etc/config-files/cloud-provider-config` 中找到它。

1. 将 **Cloud Provider** 配置为 **Default - RKE2 Embedded** 或 **External**。

   ![](/img/v1.2/rancher/non-harvester-cloud-provider.png)

1. 选择 **Create** 来创建 RKE2 集群。
1. RKE2 集群准备就绪后，从 Rancher 市场安装 **Harvester CSI Driver** Chart。默认情况下，你不需要更改 **cloud-config** 路径。

   ![](/img/v1.2/rancher/install_csi_rancher_marketplace.png)

   ![](/img/v1.2/rancher/donot_change_cloud_config_path.png)

通过执行上述步骤，你应该能看到这些 CSI Driver Pod 已在 `kube-system` 命名空间上运行，并且你可以通过在 RKE2 集群上使用默认 StorageClass `harvester` 配置新的 PVC 来验证它。

### 使用 Harvester K3s 主机驱动进行部署

你可以按照 RKE2 部分描述的[部署 Harvester CSI Driver](./csi-driver.md#部署-harvester-csi-driver) 步骤进行操作。

唯一的区别是生成 `cloud-init` 配置的部分，你需要将 provider 类型指定为 `k3s`：

```shell
./generate_addon_csi.sh <serviceaccount name> <namespace> k3s
```

## 直通自定义存储类

从 Harvester CSI Driver v0.1.15 开始，你可以在 Kubernetes 集群上使用不同的 Harvester StorageClass 来创建 PersistentVolumeClaim (PVC)。

:::note

以下 RKE2 版本开始开箱即用地支持 Harvester CSI Driver v0.1.15。对于 RKE1，你需要手动安装 CSI Driver Chart：
- v1.23.16+rke2r1 and later
- v1.24.10+rke2r1 and later
- v1.25.6+rke2r1 and later
- v1.26.1+rke2r1 and later
- v1.27.1+rke2r1 and later

:::

### 前提

将以下先决条件添加到 Harvester 集群，确保 Harvester CSI Driver 能正确显示错误消息。正确设置 RBAC 对于显示错误消息至关重要，尤其是在创建使用不存在的 StorageClass 的 PVC 时，如下图所示：

![](/img/v1.2/rancher/error_event_csi_driver.png)

请按照以下步骤设置 **RBAC** 以显示错误消息：

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

1. 使用以下清单通过相关的 `serviceaccount` 创建一个与上面的 `clusterrole` 关联的 `clusterrolebinding`。

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

   确保 `serviceaccount name` 和 `namespace` 与你的云提供商设置匹配。执行以下步骤来检索详细信息。

   1. 找到与你的云提供商关联的 `rolebinding`：

      ```
      $ kubectl get rolebinding -A |grep harvesterhci.io:cloudprovider
      default                                 default-rke2-guest-01                                ClusterRole/harvesterhci.io:cloudprovider             7d1h
      ```

   1. 从此 `rolebinding` 中提取 `subjects` 信息：

      ```
      $ kubectl get rolebinding default-rke2-guest-01 -n default -o yaml |yq -e '.subjects'
      ```

   1. 识别 `ServiceAccount` 信息：

      ```
      - kind: ServiceAccount
        name: rke2-guest-01
        namespace: default
      ```

### 部署
现在，你可以创建一个要在 Kubernetes 集群中使用的新 StorageClass。

1. 管理员可以在裸机 Harvester 集群中创建所需的 [StorageClass](../advanced/storageclass.md)（例如 **replica-2**）。

   ![](/img/v1.2/rancher/sc-replica-2.png)

1. 然后，在 Kubernetes 集群上，创建一个与 Harvester 集群中名为 **replica-2** 的 StorageClass 关联的新 StorageClass：

   ![](/img/v1.2/rancher/downstream-cluster-sc-creation.png)

   :::note

   - 在 **Provisioner** 中选择 **Harvester (CSI)**。**Host StorageClass** 参数需要匹配在 Harvester 集群上创建的 StorageClass 名称。
   - Kubernetes 集群所有者可以请求 Harvester 集群管理员创建一个新的 StorageClass。
   - 如果将 `Host StorageClass` 字段留空，则将使用 Harvester 集群的默认 StorageClass。

   :::

1. 你现在可以基于这个新的 **StorageClass** 创建 PVC，它使用 **Host StorageClass** 在裸机 Harvester 集群上配置卷。