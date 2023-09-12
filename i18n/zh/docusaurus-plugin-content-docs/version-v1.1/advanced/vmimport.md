---
sidebar_position: 5
sidebar_label: VM 导入
title: "VM 导入"
---

_从 v1.1.0 起可用_

从 v1.1.0 开始，你可以将 VMWare 和 OpenStack 虚拟机导入到 Harvester。

这是通过 vm-import-controller 插件来实现的。

要使用 VM 导入功能，你需要启用 vm-import-controller 插件。

![](/img/v1.1/vm-import-controller/EnableAddon.png)

默认情况下，vm-import-controller 使用从 /var/lib/kubelet 挂载的临时存储。

在迁移过程中，大型 VM 的节点可能会用尽挂载点上的空间，进而导致后续调度失败。

为避免这种情况，建议用户启用由 PVC 支持的存储并自定义所需的存储量。根据最佳实践，PVC 的大小应该是要迁移的最大 VM 大小的两倍。因为 PVC 用作下载 VM 的临时空间，并将磁盘转换为原始镜像文件，所以此设置是必不可少的。

![](/img/v1.1/vm-import-controller/ConfigureAddon.png)

## vm-import-controller

目前，支持以下源的 provider：
* VMWare
* OpenStack

## API
vm-import-controller 引入了两个 CRD。

### 源
源（Source）允许用户定义有效的源集群。

例如：

```yaml
apiVersion: migration.harvesterhci.io/v1beta1
kind: VmwareSource
metadata:
  name: vcsim
  namespace: default
spec:
  endpoint: "https://vscim/sdk"
  dc: "DCO"
  credentials:
    name: vsphere-credentials
    namespace: default
```

该 Secret 包含 vCenter 端点的凭证：

```yaml
apiVersion: v1
kind: Secret
metadata:
  name: vsphere-credentials
  namespace: default
stringData:
  "username": "user"
  "password": "password"
```

作为调协过程的一部分，控制器将登录到 vCenter 并验证源的 `spec` 中指定的 `dc` 是否有效。

通过此检查后，源将被标记为 Ready 并可用于虚拟机迁移：

```shell
$ kubectl get vmwaresource.migration
NAME      STATUS
vcsim   clusterReady
```

对于基于 OpenStack 的源集群，示例定义如下：

```yaml
apiVersion: migration.harvesterhci.io/v1beta1
kind: OpenstackSource
metadata:
  name: devstack
  namespace: default
spec:
  endpoint: "https://devstack/identity"
  region: "RegionOne"
  credentials:
    name: devstack-credentials
    namespace: default
```

该 Secret 包含 OpenStack 端点的凭证：

```yaml
apiVersion: v1
kind: Secret
metadata:
  name: devstack-credentials
  namespace: default
stringData:
  "username": "user"
  "password": "password"
  "project_name": "admin"
  "domain_name": "default"
  "ca_cert": "pem-encoded-ca-cert"
```

OpenStack 源的调协过程会尝试列出项目中的虚拟机并将源标记为 Ready：

```shell
$ kubectl get opestacksource.migration
NAME       STATUS
devstack   clusterReady
```

### VirtualMachineImport
VirtualMachineImport CRD 提供了定义源 VM 并映射到实际源集群以执行 VM 导出/导入的方法。

VirtualMachineImport 示例如下所示：

```yaml
apiVersion: migration.harvesterhci.io/v1beta1
kind: VirtualMachineImport
metadata:
  name: alpine-export-test
  namespace: default
spec:
  virtualMachineName: "alpine-export-test"
  networkMapping:
  - sourceNetwork: "dvSwitch 1"
    destinationNetwork: "default/vlan1"
  - sourceNetwork: "dvSwitch 2"
    destinationNetwork: "default/vlan2"
  sourceCluster:
    name: vcsim
    namespace: default
    kind: VmwareSource
    apiVersion: migration.harvesterhci.io/v1beta1
```

这将触发控制器导出 VMWare 源集群上名为 “alpine-export-test” 的 VM，从而将 VM 导出、处理并重新创建到 Harvester 集群中。

此过程需要一段时间，具体取决于虚拟机的大小。用户应该可以在定义的虚拟机中看到为每个磁盘创建的 `VirtualMachineImages`。

`networkMapping` 中的项目列表用于定义源网络接口是如何映射到 Harvester 网络的。

如果未找到匹配项，每个不匹配的网络接口都会附加到默认的 `managementNetwork`。

成功导入虚拟机后，对象将反映以下状态：

```shell
$ kubectl get virtualmachineimport.migration
NAME                    STATUS
alpine-export-test      virtualMachineRunning
openstack-cirros-test   virtualMachineRunning

```

同样，用户也可以为 OpenStack 源定义 VirtualMachineImport：

```yaml
apiVersion: migration.harvesterhci.io/v1beta1
kind: VirtualMachineImport
metadata:
  name: openstack-demo
  namespace: default
spec:
  virtualMachineName: "openstack-demo" #Name or UUID for instance
  networkMapping:
  - sourceNetwork: "shared"
    destinationNetwork: "default/vlan1"
  - sourceNetwork: "public"
    destinationNetwork: "default/vlan2"
  sourceCluster:
    name: devstack
    namespace: default
    kind: OpenstackSource
    apiVersion: migration.harvesterhci.io/v1beta1
```

:::note
OpenStack 允许用户拥有多个同名的实例。在这种情况下，建议用户使用 Instance ID。使用名称时，调协逻辑会尝试执行从名称到 ID 的查询。
:::