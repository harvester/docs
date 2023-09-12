---
sidebar_position: 1
sidebar_label: 日志
title: "日志"
keywords:
- Harvester
- 日志
- 审计
- 事件
---

_从 v1.2.0 起可用_

了解 `Harvester 集群`中正在发生/已经发生的事情是非常重要的。

`Harvester` 在集群通电后会立即收集`集群运行日志`、kubernetes `审计`和`事件`日志，这有助于监控、记录、审计和排除故障。

`Harvester` 支持将这些日志发送到各种日志服务器上。

:::note
日志数据的大小与集群规模、工作负载等因素有关。`Harvester` 不使用持久存储在集群内存储日志数据。用户需要设置一个日志服务器来接收相应的日志。
:::

现在的日志功能通过插件实现，并且在新安装中默认禁用。

安装后，你可以从 Harvester UI 启用/禁用 `rancher-logging` [插件](../advanced/addons.md)。

你还可以通过自定义 [harvester-configuration](../install/harvester-configuration.md#installaddons) 文件在 Harvester 中启用/禁用 `rancher-logging` 插件。

对于从 v1.1.x 升级的 Harvester 集群，日志功能会自动转换为插件并像以前一样保持启用状态。

## 上层架构

[Banzai Cloud Logging Operator](https://banzaicloud.com/docs/one-eye/logging-operator/) 现在支持使用 `Harvester` 和 `Rancher` 作为内部日志解决方案。

![](/img/v1.2/logging/fluent-operator.png)

在 Harvester 的实践中，`Logging`、`Audit` 和 `Event` 共享一个架构，`Logging` 是基础架构，而 `Audit` 和 `Event` 在它之上。

## 日志

Harvester 日志基础架构支持将 Harvester 日志聚合到外部服务中，例如 [Graylog](https://www.graylog.org)、[Elasticsearch](https://www.elastic.co/elasticsearch/)、[Splunk](https://www.splunk.com/)、[Grafana Loki](https://grafana.com/oss/loki/) 等。

### 收集的日志
收集的日志如下：
- 所有集群 `Pod` 的日志
- 每个`节点`的内核日志
- 每个节点所选的 systemd 服务的日志
   - `rke2-server`
   - `rke2-agent`
   - `rancherd`
   - `rancher-system-agent`
   - `wicked`
   - `iscsid`

:::note
用户可以配置和修改聚合日志的发送位置，以及一些基本的过滤条件。不支持更改收集哪些日志。
:::

### 配置日志资源

Banzai Cloud Logging Operator 下面是 [`fluentd` ](https://www.fluentd.org/)和 [`fluent-bit`](https://fluentbit.io/)，它们分别处理日志路由和收集。
如果需要，你可以修改专用于这些组件的资源数量。

#### 使用 UI

1. 转到 **Advanced** > **Addons** 页面并选择 **rancher-logging** 插件。
2. 在 **Fluentbit** 选项卡中，更改资源请求和限制。
3. 在 **Fluentd** 选项卡中，更改资源请求和限制。
4. 完成 **rancher-logging** 插件设置后，选择 **Save**。

![](/img/v1.2/logging/modify-logging-resources-from-addon.png)

:::note

UI 配置仅在启用 **rancher-logging** 插件时可见。

:::

#### 使用 CLI

你可以使用以下 `kubectl` 命令更改 `rancher-logging` 插件的资源配置：`kubectl edit addons.harvesterhci.io -n cattle-logging-system rancher-logging`。

资源路径和默认值如下。

```
apiVersion: harvesterhci.io/v1beta1
kind: Addon
metadata:
  name: rancher-logging
  namespace: cattle-logging-system
spec:
  valuesContent: |
    fluentbit:
      resources:
        limits:
          cpu: 200m
          memory: 200Mi
        requests:
          cpu: 50m
          memory: 50Mi
    fluentd:
      resources:
        limits:
          cpu: 1000m
          memory: 800Mi
        requests:
          cpu: 100m
          memory: 200Mi
```

:::note

禁用插件后，你仍然可以调整配置。这些更改仅在你重新启用插件后才会生效。

:::

### 配置日志目标

Logging 由 [Banzai Cloud Logging Operator](https://banzaicloud.com/docs/one-eye/logging-operator/) 提供支持，因此由 [`Flows`/`ClusterFlows`](https://banzaicloud.com/docs/one-eye/logging-operator/configuration/flow/) 和 [`Outputs`/`ClusterOutputs`](https://banzaicloud.com/docs/one-eye/logging-operator/configuration/output/) 控制。你可以通过将这些 `CRD` 应用到 Harvester 集群来对日志进行路由和过滤。

将新的 `Ouptuts` 和 `Flows` 应用到集群时，Logging Operator 可能需要一些时间才能使应用生效。因此，请等待几分钟让日志开始流动。

#### 集群化 VS 命名空间化

在路由日志时，你需要了解 `ClusterFlow`/`Flow` 和 `ClusterOutput`/`Output` 之间的区别。集群和非集群版本之间的主要区别在于非集群版本是命名空间化的。

这样做的最大意义，是 `Flows` 只能访问同一命名空间内的 `Outputs`，但仍然可以访问任何 `ClusterOutput`。

有关更多信息，请参阅文档：

- [`Flows`/`ClusterFlows`](https://banzaicloud.com/docs/one-eye/logging-operator/configuration/flow/)
- [`Outputs`/`ClusterOutputs`](https://banzaicloud.com/docs/one-eye/logging-operator/configuration/output/)

#### 使用 UI

:::note
UI 截图是 `Output` 和 `Flow`，它们的配置过程几乎与 ClusterOutput 和 ClusterFlow 相同。如果存在任何差异，我们都会在步骤中注明。
:::

##### 创建 Outputs

1. 选择创建新 `Output` 或 `ClusterOutput` 的选项。
2. 如果创建 `Output`，请选择所需的命名空间。
3. 为资源添加名称。
4. 选择 Logging 类型。
5. 选择 Logging 输出类型。

![](/img/v1.2/logging/create-output.png)

6. 如有必要，配置 Output Buffer。

![](/img/v1.2/logging/create-output-buffer.png)

7. 添加标签或注释。

![](/img/v1.2/logging/create-output-labels-and-annotations.png)

8. 完成后，单击右下角的 `Create`。

:::note
根据选择的输出（Splunk、Elasticsearch 等），在表单中指定其他字段。
:::

###### Output

**Output** 表单中显示的字段将根据所选的 `Output` 而不同，以便公开每个 [output plugin](https://banzaicloud.com/docs/one-eye/logging-operator/configuration/plugins/outputs/) 的字段。

###### Output Buffer

`Output Buffer` 编辑器允许你描述期望的 output buffer 行为方式。你可以在[此处](https://banzaicloud.com/docs/one-eye/logging-operator/configuration/plugins/outputs/buffer/)找到 buffer 字段的文档。

###### 标签和注释

你可以将标签和注释附加到创建的资源。

##### 创建 Flows

1. 选择创建新 `Flow` 或 `ClusterFlow` 的选项。
2. 如果创建 `Flow`，请选择所需的命名空间。
3. 为资源添加名称。
4. 选择要包括或排除日志的节点。

![](/img/v1.2/logging/create-flow-matches.png)

5. 选择目标 `Outputs` 和 `ClusterOutputs`。

![](/img/v1.2/logging/create-flow-outputs.png)

6. 如果需要，添加过滤器。

![](/img/v1.2/logging/create-flow-filters.png)

7. 完成后，单击左下角的 `Create`。

###### Matches

Matches 允许你过滤要包含在 `Flow` 中的日志。该表单仅允许你包含或排除节点日志，但如果需要，你可以通过选择 `Edit as YAML` 来添加资源支持的其他匹配规则。

有关 match 指令的更多信息，请参阅[使用 match 指令路由日志](https://banzaicloud.com/docs/one-eye/logging-operator/configuration/log-routing/)。

###### Outputs

Outputs 允许你选择一个或多个 `OutputRefs` 来发送聚合的日志。创建或编辑 `Flow`/`ClusterFlow` 时，用户至少需要选择一个 `Output`。

:::note
必须至少有一个可以附加到 Flow 的现有 `ClusterOutput` 或 `Output`，否则你将无法创建/编辑 Flow。
:::

###### 过滤器

过滤器用于转换、处理和改变日志。你可以在文本编辑器中找到支持的过滤器的说明。要了解更多信息，你可以查看[支持的过滤器](https://banzaicloud.com/docs/one-eye/logging-operator/configuration/plugins/filters/)。

#### 使用 CLI

通过命令行配置日志路由，你只需要定义相关资源的 YAML 文件即可：

```yaml
# elasticsearch-logging.yaml
apiVersion: logging.banzaicloud.io/v1beta1
kind: Output
metadata:
   name: elasticsearch-example
   namespace: fleet-local
   labels:
      example-label: elasticsearch-example
   annotations:
      example-annotation: elasticsearch-example
spec:
   elasticsearch:
      host: <url-to-elasticsearch-server>
      port: 9200
---
apiVersion: logging.banzaicloud.io/v1beta1
kind: Flow
metadata:
   name: elasticsearch-example
   namespace: fleet-local
spec:
   match:
      - select: {}
   globalOutputRefs:
      - elasticsearch-example
```

然后应用它们：

```bash
kubectl apply -f elasticsearch-logging.yaml
```

##### 引用 Secret

Banzai Cloud 支持使用以下三种方式通过 YAML 值来指定 Secret 值。

最简单的是使用 `value` 键，它是所需 Secret 的简单字符串值。此方法应仅用于测试，切勿用于生产：

```yaml
aws_key_id:
  value: "secretvalue"
```

第二种方法是使用 `valueFrom`，它允许你通过 name/key 对来引用 Secret 的特定值：

```yaml
aws_key_id:
   valueFrom:
      secretKeyRef:
         name: <kubernetes-secret-name>
         key: <kubernetes-secret-key>
```

一些插件需要读取文件，不能简单地从 Secret 中接收一个值（例如 CA 证书文件）。在这些情况下，你需要使用 `mountFrom`，它将 Secret 作为文件挂载到底层 `fluentd` Deployment 并将插件指向该文件。`valueFrom` 和 `mountFrom` 对象是相同的：

```yaml
tls_cert_path:
   mountFrom:
      secretKeyRef:
         name: <kubernetes-secret-name>
         key: <kubernetes-secret-key>
```

如需更多信息，你可以在[此处](https://banzaicloud.com/docs/one-eye/logging-operator/configuration/plugins/outputs/secret/)找到相关文档。

### 示例 `Outputs`

#### Elasticsearch

对于最简单的 Deployment，你可以使用 Docker 在本地系统上部署 Elasticsearch：

```sh
docker run --name elasticsearch -p 9200:9200 -p 9300:9300 -e xpack.security.enabled=false -e node.name=es01 -it docker.elastic.co/elasticsearch/elasticsearch:6.8.23
```

确保你已将 `vm.max_map_count` 设置为 >= 262144，否则上述 Docker 命令将失败。Elasticsearch 服务器启动后，你可以为 `ClusterOutput` 和 `ClusterFlow` 创建 YAML 文件：

```shell
cat << EOF > elasticsearch-example.yaml
apiVersion: logging.banzaicloud.io/v1beta1
kind: ClusterOutput
metadata:
  name: elasticsearch-example
  namespace: cattle-logging-system
spec:
  elasticsearch:
    host: 192.168.0.119
    port: 9200
    buffer:
      timekey: 1m
      timekey_wait: 30s
      timekey_use_utc: true
---
apiVersion: logging.banzaicloud.io/v1beta1
kind: ClusterFlow
metadata:
  name: elasticsearch-example
  namespace: cattle-logging-system
spec:
  match:
    - select: {}
  globalOutputRefs:
    - elasticsearch-example
EOF
```

然后应用文件：

```shell
kubectl apply -f elasticsearch-example.yaml
```

允许 Logging Operator 应用资源一段时间后，你可以测试日志是否正在流动：

```shell
$ curl localhost:9200/fluentd/_search
{
  "took": 1,
  "timed_out": false,
  "_shards": {
    "total": 5,
    "successful": 5,
    "skipped": 0,
    "failed": 0
  },
  "hits": {
    "total": 11603,
    "max_score": 1,
    "hits": [
      {
        "_index": "fluentd",
        "_type": "fluentd",
        "_id": "yWHr0oMBXcBggZRJgagY",
        "_score": 1,
        "_source": {
          "stream": "stderr",
          "logtag": "F",
          "message": "I1013 02:29:43.020384       1 csi_handler.go:248] Attaching \"csi-974b4a6d2598d8a7a37b06d06557c428628875e077dabf8f32a6f3aa2750961d\"",
          "kubernetes": {
            "pod_name": "csi-attacher-5d4cc8cfc8-hd4nb",
            "namespace_name": "longhorn-system",
            "pod_id": "c63c2014-9556-40ce-a8e1-22c55de12e70",
            "labels": {
              "app": "csi-attacher",
              "pod-template-hash": "5d4cc8cfc8"
            },
            "annotations": {
              "cni.projectcalico.org/containerID": "857df09c8ede7b8dee786a8c8788e8465cca58f0b4d973c448ed25bef62660cf",
              "cni.projectcalico.org/podIP": "10.52.0.15/32",
              "cni.projectcalico.org/podIPs": "10.52.0.15/32",
              "k8s.v1.cni.cncf.io/network-status": "[{\n    \"name\": \"k8s-pod-network\",\n    \"ips\": [\n        \"10.52.0.15\"\n    ],\n    \"default\": true,\n    \"dns\": {}\n}]",
              "k8s.v1.cni.cncf.io/networks-status": "[{\n    \"name\": \"k8s-pod-network\",\n    \"ips\": [\n        \"10.52.0.15\"\n    ],\n    \"default\": true,\n    \"dns\": {}\n}]",
              "kubernetes.io/psp": "global-unrestricted-psp"
            },
            "host": "harvester-node-0",
            "container_name": "csi-attacher",
            "docker_id": "f10e4449492d4191376d3e84e39742bf077ff696acbb1e5f87c9cfbab434edae",
            "container_hash": "sha256:03e115718d258479ce19feeb9635215f98e5ad1475667b4395b79e68caf129a6",
            "container_image": "docker.io/longhornio/csi-attacher:v3.4.0"
          }
        }
      },

      ...

    ]
  }
}
```

#### Graylog
你可以按照[此处](https://github.com/w13915984028/harvester-develop-summary/blob/main/integrate-harvester-logging-with-log-servers.md#integrate-harvester-logging-with-graylog)的说明通过 [Graylog](https://www.graylog.org/) 部署和查看集群日志：

```yaml
apiVersion: logging.banzaicloud.io/v1beta1
kind: ClusterFlow
metadata:
  name: "all-logs-gelf-hs"
  namespace: "cattle-logging-system"
spec:
  globalOutputRefs:
    - "example-gelf-hs"
---
apiVersion: logging.banzaicloud.io/v1beta1
kind: ClusterOutput
metadata:
  name: "example-gelf-hs"
  namespace: "cattle-logging-system"
spec:
  gelf:
    host: "192.168.122.159"
    port: 12202
    protocol: "udp"
```

#### Splunk

你可以按照[此处](https://github.com/w13915984028/harvester-develop-summary/blob/main/test-log-event-audit-with-splunk.md)的说明通过 [Splunk](https://www.splunk.com/) 部署和查看集群日志：

```yaml
apiVersion: logging.banzaicloud.io/v1beta1
kind: ClusterOutput
metadata:
  name: harvester-logging-splunk
  namespace: cattle-logging-system
spec:
 splunkHec:
    hec_host: 192.168.122.101
    hec_port: 8088
    insecure_ssl: true
    index: harvester-log-index
    hec_token:
      valueFrom:
        secretKeyRef:
          key: HECTOKEN
          name: splunk-hec-token2
    buffer:
      chunk_limit_size: 3MB
      timekey: 2m
      timekey_wait: 1m
---
apiVersion: logging.banzaicloud.io/v1beta1
kind: ClusterFlow
metadata:
   name: harvester-logging-splunk
   namespace: cattle-logging-system
spec:
   filters:
      - tag_normaliser: {}
   match:
   globalOutputRefs:
      - harvester-logging-splunk
```

#### Loki

你可以按照 [logging HEP](https://github.com/joshmeranda/harvester/blob/logging/enhancements/20220525-system-logging.md) 中的说明通过 [Grafana Loki](https://grafana.com/oss/loki/) 部署和查看集群日志：

```yaml
apiVersion: logging.banzaicloud.io/v1beta1
kind: ClusterFlow
metadata:
  name: harvester-loki
  namespace: cattle-logging-system
spec:
  match:
    - select: {}
  globalOutputRefs:
    - harvester-loki
---
apiVersion: logging.banzaicloud.io/v1beta1
kind: ClusterOutput
metadata:
  name: harvester-loki
  namespace: cattle-logging-system
spec:
  loki:
    url: http://loki-stack.cattle-logging-system.svc:3100
    extra_labels:
      logOutput: harvester-loki
```

## 审计

Harvester 收集 Kubernetes `audit`（审计）并能够将 `audit` 发送到各种类型的日志服务器。

指导 `kube-apiserver` 的策略文件在[这里](https://github.com/harvester/harvester-installer/blob/5991dcf6307aa5da79c5d6926566541f48105778/pkg/config/templates/rke2-92-harvester-kube-audit-policy.yaml)。

### 审计定义

在 `kubernetes`中，[审计（audit）](https://kubernetes.io/docs/tasks/debug/debug-cluster/audit/)数据由 `kube-apiserver` 根据定义的策略生成。

```
...
Audit policy
Audit policy defines rules about what events should be recorded and what data they should include. The audit policy object structure is defined in the audit.k8s.io API group. When an event is processed, it's compared against the list of rules in order. The first matching rule sets the audit level of the event. The defined audit levels are:

None - don't log events that match this rule.
Metadata - log request metadata (requesting user, timestamp, resource, verb, etc.) but not request or response body.
Request - log event metadata and request body but not response body. This does not apply for non-resource requests.
RequestResponse - log event metadata, request and response bodies. This does not apply for non-resource requests.
```

### 审计日志格式

#### Kubernetes 中的审计日志格式

Kubernetes apiserver 使用以下 JSON 格式将审计记录到本地文件中。

```
{
"kind":"Event",
"apiVersion":"audit.k8s.io/v1",
"level":"Metadata",
"auditID":"13d0bf83-7249-417b-b386-d7fc7c024583",
"stage":"RequestReceived",
"requestURI":"/apis/flowcontrol.apiserver.k8s.io/v1beta2/prioritylevelconfigurations?fieldManager=api-priority-and-fairness-config-producer-v1",
"verb":"create",
"user":{"username":"system:apiserver","uid":"d311c1fe-2d96-4e54-a01b-5203936e1046","groups":["system:masters"]},
"sourceIPs":["::1"],
"userAgent":"kube-apiserver/v1.24.7+rke2r1 (linux/amd64) kubernetes/e6f3597",
"objectRef":{"resource":"prioritylevelconfigurations",
"apiGroup":"flowcontrol.apiserver.k8s.io",
"apiVersion":"v1beta2"},
"requestReceivedTimestamp":"2022-10-19T18:55:07.244781Z",
"stageTimestamp":"2022-10-19T18:55:07.244781Z"
}
```

#### 在发送到日志服务器之前的审计日志格式

Harvester 在将 `audit` 日志发送到日志服务器之前不会改变审计日志。

### 审计日志 Output/ClusterOutput

要输出审计相关日志，`Output`/`ClusterOutput` 要求 `loggingRef` 的值为 `harvester-kube-audit-log-ref `。

通过 Harvester 仪表板进行配置时会自动添加该字段。

从 `Type` 下拉列表中选择 `Audit Only`。

![](/img/v1.2/logging/cluster-output-type.png)

通过 CLI 进行配置时，请手动添加该字段。

示例：

```
apiVersion: logging.banzaicloud.io/v1beta1
kind: ClusterOutput
metadata:
  name: "harvester-audit-webhook"
  namespace: "cattle-logging-system"
spec:
  http:
    endpoint: "http://192.168.122.159:8096/"
    open_timeout: 3
    format:
      type: "json"
    buffer:
      chunk_limit_size: 3MB
      timekey: 2m
      timekey_wait: 1m
  loggingRef: harvester-kube-audit-log-ref   # this reference is fixed and must be here
```

### 审计日志 Flow/ClusterFlow

要路由审计相关日志，`Flow`/`ClusterFlow` 要求 `loggingRef` 的值为 `harvester-kube-audit-log-ref `。

通过 Harvester 仪表板进行配置时会自动添加该字段。

选择 `Audit` 类型。

![](/img/v1.2/logging/cluster-flow-type.png)

通过 CLI 进行配置时，请手动添加该字段。

示例：

```
apiVersion: logging.banzaicloud.io/v1beta1
kind: ClusterFlow
metadata:
  name: "harvester-audit-webhook"
  namespace: "cattle-logging-system"
spec:
  globalOutputRefs:
    - "harvester-audit-webhook"
  loggingRef: harvester-kube-audit-log-ref  # this reference is fixed and must be here
```

### Harvester

## 事件

Harvester 收集 Kubernetes `event`（事件）并能够将 `event` 发送到各种类型的日志服务器。

### 事件定义

Kubernetes `events` 是向你展示集群内正在发生的事情的对象，例如调度程序做出了哪些决定或 Pod 被驱逐出节点的原因。所有核心组件和扩展（Operator/控制器）都可以通过 API Server 创建事件。

事件与各种组件生成的日志消息没有直接关系，并且不受日志详细程度级别的影响。组件创建事件时通常会发出相应的日志消息。事件是 API Server 在短时间内（通常是一小时后）收集的垃圾，换言之，事件可用于了解正在发生的问题，但你必须收集它们才能调查以前的事件。

如果某事情没有按照预期工作，应用程序和基础设施操作会首先查看事件。如果故障是早期事件导致的，或者你需要在事后分析故障，则需要将事件保留更长的时间。

### 事件日志格式

#### Kubernetes 中的事件日志格式

`kubernetes event` 示例：

```
        {
            "apiVersion": "v1",
            "count": 1,
            "eventTime": null,
            "firstTimestamp": "2022-08-24T11:17:35Z",
            "involvedObject": {
                "apiVersion": "kubevirt.io/v1",
                "kind": "VirtualMachineInstance",
                "name": "vm-ide-1",
                "namespace": "default",
                "resourceVersion": "604601",
                "uid": "1bd4133f-5aa3-4eda-bd26-3193b255b480"
            },
            "kind": "Event",
            "lastTimestamp": "2022-08-24T11:17:35Z",
            "message": "VirtualMachineInstance defined.",
            "metadata": {
                "creationTimestamp": "2022-08-24T11:17:35Z",
                "name": "vm-ide-1.170e43cbdd833b62",
                "namespace": "default",
                "resourceVersion": "604626",
                "uid": "0114f4e7-1d4a-4201-b0e5-8cc8ede202f4"
            },
            "reason": "Created",
            "reportingComponent": "",
            "reportingInstance": "",
            "source": {
                "component": "virt-handler",
                "host": "harv1"
            },
            "type": "Normal"
        },
```

#### 发送到日志服务器之前的事件日志格式

每个 `event log`  的格式为：`{"stream":"","logtag":"F","message":"","kubernetes":{""}}`。`kubernetes event` 在 `message` 字段中。

```
{
"stream":"stdout",

"logtag":"F",

"message":"{
\\"verb\\":\\"ADDED\\",

\\"event\\":{\\"metadata\\":{\\"name\\":\\"vm-ide-1.170e446c3f890433\\",\\"namespace\\":\\"default\\",\\"uid\\":\\"0b44b6c7-b415-4034-95e5-a476fcec547f\\",\\"resourceVersion\\":\\"612482\\",\\"creationTimestamp\\":\\"2022-08-24T11:29:04Z\\",\\"managedFields\\":[{\\"manager\\":\\"virt-controller\\",\\"operation\\":\\"Update\\",\\"apiVersion\\":\\"v1\\",\\"time\\":\\"2022-08-24T11:29:04Z\\"}]},\\"involvedObject\\":{\\"kind\\":\\"VirtualMachineInstance\\",\\"namespace\\":\\"default\\",\\"name\\":\\"vm-ide-1\\",\\"uid\\":\\"1bd4133f-5aa3-4eda-bd26-3193b255b480\\",\\"apiVersion\\":\\"kubevirt.io/v1\\",\\"resourceVersion\\":\\"612477\\"},\\"reason\\":\\"SuccessfulDelete\\",\\"message\\":\\"Deleted PodDisruptionBudget kubevirt-disruption-budget-hmmgd\\",\\"source\\":{\\"component\\":\\"disruptionbudget-controller\\"},\\"firstTimestamp\\":\\"2022-08-24T11:29:04Z\\",\\"lastTimestamp\\":\\"2022-08-24T11:29:04Z\\",\\"count\\":1,\\"type\\":\\"Normal\\",\\"eventTime\\":null,\\"reportingComponent\\":\\"\\",\\"reportingInstance\\":\\"\\"}
}",

"kubernetes":{"pod_name":"harvester-default-event-tailer-0","namespace_name":"cattle-logging-system","pod_id":"d3453153-58c9-456e-b3c3-d91242580df3","labels":{"app.kubernetes.io/instance":"harvester-default-event-tailer","app.kubernetes.io/name":"event-tailer","controller-revision-hash":"harvester-default-event-tailer-747b9d4489","statefulset.kubernetes.io/pod-name":"harvester-default-event-tailer-0"},"annotations":{"cni.projectcalico.org/containerID":"aa72487922ceb4420ebdefb14a81f0d53029b3aec46ed71a8875ef288cde4103","cni.projectcalico.org/podIP":"10.52.0.178/32","cni.projectcalico.org/podIPs":"10.52.0.178/32","k8s.v1.cni.cncf.io/network-status":"[{\\n    \\"name\\": \\"k8s-pod-network\\",\\n    \\"ips\\": [\\n        \\"10.52.0.178\\"\\n    ],\\n    \\"default\\": true,\\n    \\"dns\\": {}\\n}]","k8s.v1.cni.cncf.io/networks-status":"[{\\n    \\"name\\": \\"k8s-pod-network\\",\\n    \\"ips\\": [\\n        \\"10.52.0.178\\"\\n    ],\\n    \\"default\\": true,\\n    \\"dns\\": {}\\n}]","kubernetes.io/psp":"global-unrestricted-psp"},"host":"harv1","container_name":"harvester-default-event-tailer-0","docker_id":"455064de50cc4f66e3dd46c074a1e4e6cfd9139cb74d40f5ba00b4e3e2a7ab2d","container_hash":"docker.io/banzaicloud/eventrouter@sha256:6353d3f961a368d95583758fa05e8f4c0801881c39ed695bd4e8283d373a4262","container_image":"docker.io/banzaicloud/eventrouter:v0.1.0"}

}

```

### 事件日志 Output/ClusterOutput

事件与 `Logging` 共享 `Output`/`ClusterOutput`。

从 `Type` 下拉列表中选择 `Logging/Event`。

![](/img/v1.2/logging/cluster-output-type.png)

### 事件日志 Flow/ClusterFlow

与普通的 Logging `Flow`/`ClusterFlow` 相比，`Event` 相关的 `Flow`/`ClusterFlow` 多了一个匹配字段，其值为 `event-tailer`。

通过 Harvester 仪表板进行配置时会自动添加该字段。

从 `Type` 下拉列表中选择 `Event`。

![](/img/v1.2/logging/cluster-flow-type.png)

通过 CLI 进行配置时，请手动添加该字段。

示例：

```
apiVersion: logging.banzaicloud.io/v1beta1
kind: ClusterFlow
metadata:
  name: harvester-event-webhook
  namespace: cattle-logging-system
spec:
  filters:
  - tag_normaliser: {}
  match:
  - select:
      labels:
        app.kubernetes.io/name: event-tailer
  globalOutputRefs:
    - harvester-event-webhook
```
