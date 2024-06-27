---
sidebar_position: 4
sidebar_label: 存储网络
title: "存储网络"
---

Harvester 内置 Longhorn 作为存储系统，用于为 VM 和 Pod 提供块设备卷。如果用户希望将 Longhorn 复制流量与 Kubernetes 集群网络（即管理网络）或其它集群工作负载隔离开来，用户可以为 Longhorn 复制流量分配一个专用的存储网络来提高网络带宽和性能。

有关更多信息，请参阅 [Longhorn 存储网络](https://longhorn.io/docs/1.4.3/advanced-resources/deploy/storage-network/)。

:::note

不建议直接配置 Longhorn 设置，因为这可能会导致出现未测试过的情况。

:::

## 前提

在配置 Harvester 存储网络设置之前，你需要先进行一些操作：

- 配置好 Cluster Network 和 VLAN Config。
   - 用户必须确保已配置好 Cluster Network，VLAN Config 能够覆盖所有节点，而且所有节点的网络链接正常。
- 停止了所有 VM。
   - 我们建议使用以下命令检查 VM 状态，结果应该是空的。
   - `kubectl get -A vmi`
- 停止了连接到 Longhorn 卷的所有 Pod。
   - 用户可以使用 Harvester 存储网络设置跳过此步骤。Harvester 将自动停止与 Longhorn 相关的 Pod。
- 所有正在进行的镜像上传或下载操作都应已完成或删除。

:::caution

如果 Harvester 集群是从 v1.0.3 升级来的，请在继续下一步之前检查是否已正确安装 Whereabouts CNI。我们始终建议按照本指南进行检查。[Issue 3168](https://github.com/harvester/harvester/issues/3168) 描述了 Harvester 集群可能无法正确安装 Whereabouts CNI。

- 使用以下命令验证 `ippools.whereabouts.cni.cncf.io` CRD 是否存在。
   - `kubectl get crd ippools.whereabouts.cni.cncf.io`
- 如果 Harvester 集群没有 `ippools.whereabouts.cni.cncf.io`，请在配置 `storage-network` 之前添加[这两个 CRD](https://github.com/harvester/harvester/tree/v1.1.0/deploy/charts/harvester/dependency_charts/whereabouts/crds)。
```
kubectl apply -f https://raw.githubusercontent.com/harvester/harvester/v1.1.0/deploy/charts/harvester/dependency_charts/whereabouts/crds/whereabouts.cni.cncf.io_ippools.yaml
kubectl apply -f https://raw.githubusercontent.com/harvester/harvester/v1.1.0/deploy/charts/harvester/dependency_charts/whereabouts/crds/whereabouts.cni.cncf.io_overlappingrangeipreservations.yaml
```

:::

## 配置示例

- VLAN ID
   - 请检查你的网络交换机设置，并为存储网络提供专用的 VLAN ID。
- 配置好 Cluster Network 和 VLAN Config。
   - 如需更多信息，请参阅网络页面，然后配置 `Cluster Network` 和 `VLAN Config`，但不要配置 `Network`。
- 存储网络的 IP 范围
   - IP 范围不能与 Kubernetes 集群网络冲突或重叠（`10.42.0.0/16`、`10.43.0.0/16`、`10.52.0.0/16` 和 `10.53.0.0/16` 是保留的）。
   - IP 范围应采用 IPv4 CIDR 格式，并且 Longhorn Pod 使用存储网络，如下所示：
      - `instance-manger-e` 和 `instance-manager-r` Pod：每个节点需要 2 个 IP。升级过程中，这些 Pod 会存在两个版本（旧版本和新版本），升级成功后旧版本将被删除。
      - `backing-image-ds` pod：用于处理后台镜像数据源的动态上传和下载。镜像上传或下载完成后，这些 Pod 将被删除。
      - `backing-image-manager` Pod：每个磁盘 1 个 IP，类似于 instance manager Pod。升级过程中，两个版本将共存，升级完成后旧版本将被删除。
      - 所需的 IP 数量使用此公式计算：`所需的 IP 数量 = 节点数量 * 4 + 磁盘数量 * 2 + 要下载/上传的镜像数量`。
   - 例如，如果你的集群有 5 个节点，每个节点有 2 个磁盘，同时上传 10 个镜像，则 IP 范围应大于或等于 `/26` (`5 * 4 + 5 * 2 * 2 + 10 = 50`）。


我们将使用下面的配置为例来详细说明存储网络：

- 存储网络的 VLAN ID：`100`
- 集群网络：`storage`
- IP范围：`192.168.0.0/24`

## 配置过程

Harvester 将使用配置来创建 Multus NetworkAttachmentDefinition，停止与 Longhorn 卷相关的 Pod，更新 Longhorn 设置，并重新启动以前的 Pod。

### 应用 Harvester 存储网络设置之前

这里有两种情况：
- VM VLAN 流量和 Longhorn 存储网络使用同一组物理接口。
- VM VLAN 流量和 Longhorn 存储网络使用不同的物理接口。

Longhorn 将通过图中红线所示的接口发送复制流量。

#### 相同的物理接口

以下示例将 `eth2` 和 `eth3` 用于虚拟机 VLAN 流量和 Longhorn 存储网络。

请参考**网络**页面使用 `eth2` 和 `eth3` 来配置 `ClusterNetwork` 和 `VLAN Config`，并记住下一步骤需要用的 `ClusterNetwork` 名称。

![storagenetwork-same.png](/img/v1.2/storagenetwork/storagenetwork-same.png)


#### 不同的物理接口

`eth2` 和 `eth3` 用于 VM VLAN 流量。`eth4` 和 `eth5` 用于 Longhorn 存储网络。

请参考**网络**页面使用 `eth4` 和 `eth5` 来配置 `ClusterNetwork` 和 `VLAN Config`（用于存储网络），并记住下一步骤需要用的 `ClusterNetwork` 名称。

![storagenetwork-diff.png](/img/v1.2/storagenetwork/storagenetwork-diff.png)

### Harvester 存储网络设置

Harvester 存储网络需要 `range`、`clusterNetwork`、`vlan` 字段来构建用于存储网络的 Multus NetworkAttachmentDefinition。你可以通过 Web UI 或 CLI 来应用此设置。

#### Web UI

你可以在 `Settings > storage-network` 页面上轻松修改 Harvester 存储网络设置。

![storagenetwork-ui.png](/img/v1.2/storagenetwork/storagenetwork-ui.png)

#### CLI

你可以使用以下命令来编辑 Harvester 存储网络设置。

```bash
kubectl edit settings.harvesterhci.io storage-network
```

值为 JSON 字符串或空字符串，如下所示。

```json
{
    "vlan": 100,
    "clusterNetwork": "storage",
    "range": "192.168.0.0/24"
}
```

完整配置与以下示例类似。

```yaml
apiVersion: harvesterhci.io/v1beta1
kind: Setting
metadata:
  name: storage-network
value: '{"vlan":100,"clusterNetwork":"storage","range":"192.168.0.0/24"}'
```

:::caution

由于设计原因，如果 JSON 字符串中存在多余的和无关紧要的字符，Harvester 会将其视为不同的配置。

:::

### 应用 Harvester 存储网络设置后

应用 Harvester 的存储网络设置后，Harvester 将停止所有与 Longhorn 卷相关的 Pod。Harvester 的一些 Pod 将在设置期间被停止：

- Prometheus
- Grafana
- Alertmanager
- VM Import Controller

Harvester 还将创建一个新的 NetworkAttachmentDefinition 并更新 Longhorn Storage Network 设置。

更新 Longhorn 设置后，Longhorn 将重启所有 `instance-manager-r`、`instance-manager-e` 和 `backing-image-manager` Pod 来应用新的网络配置，并且 Harvester 将重启 Pod。

:::note

Harvester 不会自动启动 VM。用户应该在下一节时检查配置是否已完成，并按需手动启动虚拟机。

:::

### 验证配置是否完成

#### 步骤 1

检查 Harvester Storage Network 设置的状态是否为 `True` 以及类型是否为 `configured`。

```bash
kubectl get settings.harvesterhci.io storage-network -o yaml
```

完整的设置示例：

```yaml
apiVersion: harvesterhci.io/v1beta1
kind: Setting
metadata:
  annotations:
    storage-network.settings.harvesterhci.io/hash: da39a3ee5e6b4b0d3255bfef95601890afd80709
    storage-network.settings.harvesterhci.io/net-attach-def: ""
    storage-network.settings.harvesterhci.io/old-net-attach-def: ""
  creationTimestamp: "2022-10-13T06:36:39Z"
  generation: 51
  name: storage-network
  resourceVersion: "154638"
  uid: 2233ad63-ee52-45f6-a79c-147e48fc88db
status:
  conditions:
  - lastUpdateTime: "2022-10-13T13:05:17Z"
    reason: Completed
    status: "True"
    type: configured
```

#### 步骤 2

验证所有 Longhorn `instance-manager-e`、`instance-manager-r` 和 `backing-image-manager` Pod 的准备情况，并确认他们的网络配置正确。

执行以下命令来检查 Pod 的详细信息：


```bash
kubectl -n longhorn-system describe pod <pod-name>
```

如果你遇到类似以下的事件，则存储网络可能已耗尽其可用 IP：

```bash
Events:
  Type     Reason                  Age                    From     Message
  ----     ------                  ----                   ----     -------
  ....

  Warning  FailedCreatePodSandBox  2m58s                  kubelet  Failed to create pod sandbox: rpc error: code = Unknown desc = failed to setup network for
 sandbox "04e9bc160c4f1da612e2bb52dadc86702817ac557e641a3b07b7c4a340c9fc48": plugin type="multus" name="multus-cni-network" failed (add): [longhorn-system/ba
cking-image-ds-default-image-lxq7r/7d6995ee-60a6-4f67-b9ea-246a73a4df54:storagenetwork-sdfg8]: error adding container to network "storagenetwork-sdfg8": erro
r at storage engine: Could not allocate IP in range: ip: 172.16.0.1 / - 172.16.0.6 / range: net.IPNet{IP:net.IP{0xac, 0x10, 0x0, 0x0}, Mask:net.IPMask{0xff,
0xff, 0xff, 0xf8}}

  ....
```

请重新配置存储网络，使其具有足够的 IP 范围。

:::note

如果存储网络的 IP 已用完，你在上传/下载镜像时可能会遇到相同的错误。请删除相关镜像并重新配置存储网络，使其具有足够的 IP 范围。

:::

#### 步骤 3

检查 `k8s.v1.cni.cncf.io/network-status` 注释，确保存在名为 `lhnet1` 的接口，并且 IP 地址在指定的 IP 范围内。

用户可以使用以下命令来列出所有 Longhorn Instance Manager：

```bash
kubectl get pods -n longhorn-system -l longhorn.io/component=instance-manager -o yaml
```

正确的网络示例：

```yaml
apiVersion: v1
kind: Pod
metadata:
  annotations:
    cni.projectcalico.org/containerID: 2518b0696f6635896645b5546417447843e14208525d3c19d7ec6d7296cc13cd
    cni.projectcalico.org/podIP: 10.52.2.122/32
    cni.projectcalico.org/podIPs: 10.52.2.122/32
    k8s.v1.cni.cncf.io/network-status: |-
      [{
          "name": "k8s-pod-network",
          "ips": [
              "10.52.2.122"
          ],
          "default": true,
          "dns": {}
      },{
          "name": "harvester-system/storagenetwork-95bj4",
          "interface": "lhnet1",
          "ips": [
              "192.168.0.3"
          ],
          "mac": "2e:51:e6:31:96:40",
          "dns": {}
      }]
    k8s.v1.cni.cncf.io/networks: '[{"namespace": "harvester-system", "name": "storagenetwork-95bj4",
      "interface": "lhnet1"}]'
    k8s.v1.cni.cncf.io/networks-status: |-
      [{
          "name": "k8s-pod-network",
          "ips": [
              "10.52.2.122"
          ],
          "default": true,
          "dns": {}
      },{
          "name": "harvester-system/storagenetwork-95bj4",
          "interface": "lhnet1",
          "ips": [
              "192.168.0.3"
          ],
          "mac": "2e:51:e6:31:96:40",
          "dns": {}
      }]
    kubernetes.io/psp: global-unrestricted-psp
    longhorn.io/last-applied-tolerations: '[{"key":"kubevirt.io/drain","operator":"Exists","effect":"NoSchedule"}]'

Omitted...
```


### 手动启动虚拟机

验证配置后，用户可以按需手动启动虚拟机。
