---
sidebar_position: 1
sidebar_label: Logging
title: ""
keywords:
- Harvester
- harvester
- Logging
---

# Harvester Logging

_Available as of v1.1.0_

The Harvester logging infrastructure allows you to aggregate Harvester logs into an external service such as [Elasticsearch](https://www.elastic.co/elasticsearch/),
[Grafana Loki](https://grafana.com/oss/loki/), or [Splunk](https://www.splunk.com/).

## Collected Logs
See below for a list logs that are collected:
 - Logs from all cluster `Pods`
 - Kernel logs from each node
 - Logs from select systemd services from each node
   - `rke2-server`
   - `rke2-agent`
   - `rancherd`
   - `rancher-system-agent`
   - `wicked`
   - `iscsid`

:::note
While users are able to configure and modify where the aggregated logs are sent, as well as some basic filtering, they cannot change which logs are aggregated.
:::

## Configuring Log Resources

Underneath Banzai Cloud's logging operator are [`fluentd`](https://www.fluentd.org/) and [`fluent-bit`](https://fluentbit.io/), which handle the log routing and collecting respectively.
If desired, you can modify how many resources are dedicated to those components.

### From UI

 1. Navigate to the `Configuration` page under `Monitoring & Logging > Logging`.
 2. Under the `Fluentbit` tab, change the resource requests and limits.
 3. Under the `Fluentd` tab, change the resource requests and limits.
 4. Click `Save` on the bottom right of the screen.

![](/img/v1.1/logging/modify-logging-fluent-resources.png)

### From CLI

You can also change the resource configurations from the command line using `kubectl edit managedchart -n fleet-local rancher-logging` and modifying the relevant files.

For harvester version `>= v1.1.0`, the related paths and default values are:

```yaml
# fluentbit
values.fluentbit.resources.limits.cpu: 200m
values.fluentbit.resources.limits.memory: 200mi
values.fluentbit.resources.requests.cpu: 50m
values.fluentbit.resources.requests.memory: 50mi
---
#fluentd
values.fluentbit.resources.limits.cpu: 200m
values.fluentbit.resources.limits.memory: 200mi
values.fluentbit.resources.requests.cpu: 50m
values.fluentbit.resources.requests.memory: 50mi
```

## Configuring Log Destinations

Logging is backed by the [Banzai Cloud Logging Operator](https://banzaicloud.com/docs/one-eye/logging-operator/), and so is controlled by [`Flows`/`ClusterFlows`](https://banzaicloud.com/docs/one-eye/logging-operator/configuration/flow/) and [`Outputs`/`ClusterOutputs`](https://banzaicloud.com/docs/one-eye/logging-operator/configuration/output/). You can route and filter logs as you like by applying these `CRD`s to the Harvester cluster.

When applying new `Ouptuts` and `Flows` to the cluster, it can take some time for the logging operator to effectively apply them. So please allow a few minutes for the logs to start flowing.

### Clustered vs Namespaced

One important thing to understand when routing logs is the difference between `ClusterFlow` vs `Flow` and `ClusterOutput` vs `Output`. The main difference between the clustered and non-clustered version of each is that the non-clustered versions are namespaced.

The biggest implication of this is that `Flows` can only access `Outputs` that are within the same namespace, but can still access any `ClusterOutput`.

For more information, see the documentation:

 - [`Flows`/`ClusterFlows`](https://banzaicloud.com/docs/one-eye/logging-operator/configuration/flow/)
 - [`Outputs`/`ClusterOutputs`](https://banzaicloud.com/docs/one-eye/logging-operator/configuration/output/)

### From UI

:::note
UI images are for `Output` and `Flow` whose configuration process is almost identical to their clustered counterparts. Any differences will be noted in the steps below.
:::

#### Creating Outputs

 1. Choose the option to create a new `Output` or `ClusterOutput`.
 2. If creating an `Output`, select the desired namespace.
 3. Add a name for the resources.
 4. Select the logging type.
 5. Select the logging output type.

![](/img/v1.1/logging/create-output.png)

 6. Configure the output buffer if necessary.

![](/img/v1.1/logging/create-output-buffer.png)

 7. Add any labels or annotations.

![](/img/v1.1/logging/create-output-labels-and-annotations.png)

 8. Once done, click `Create` on the lower right.

:::note
Depending on the output selected (Splunk, Elasticsearch, etc), there will be additional fields to specify in the form.
:::

##### Output

The fields present in the **Output** form will change depending on the `Output` chosen, in order to expose the fields present for each [output plugin](https://banzaicloud.com/docs/one-eye/logging-operator/configuration/plugins/outputs/).

##### Output Buffer

The `Output Buffer` editor allows you to describe how you want the output buffer to behave. You can find the documentation for the buffer fields [here](https://banzaicloud.com/docs/one-eye/logging-operator/configuration/plugins/outputs/buffer/).

##### Labels & Annotations

You can append labels and annotations to the created resource.

#### Creating Flows

 1. Choose the option to create a new `Flow` or `ClusterFlow`.
 2. If creating a `Flow`, select the desired namespace.
 3. Add a name for the resource.
 4. Select any nodes whose logs to include or exclude.

![](/img/v1.1/logging/create-flow-matches.png)

 5. Select target `Outputs` and `ClusterOutputs`.

![](/img/v1.1/logging/create-flow-outputs.png)

 6. Add any filters if desired.

![](/img/v1.1/logging/create-flow-filters.png)

 7. Once done, click `Create` on the lower left.

##### Matches

Matches allow you to filter which logs you want to include in the `Flow`. The form only allows you to include or exclude node logs, but if needed, you can add other match rules supported by the resource by selecting `Edit as YAML`.

For more information about the match directive, see [Routing your logs with match directive](https://banzaicloud.com/docs/one-eye/logging-operator/configuration/log-routing/).

##### Outputs

Outputs allow you to select one or more `OutputRefs` to send the aggregated logs to. When creating or editing a `Flow` / `ClusterFLow`, it is required that the user selects at least one `Output`.

:::note
There must be at least one existing `ClusterOutput` or `Output` that can be attached to the flow, or you will not be able to create / edit the flow.
:::

##### Filters

Filters allow you to transform, process, and mutate the logs. In the text edit, you will find descriptions of the supported filters, but for more information, you can visit the list of [supported filters](https://banzaicloud.com/docs/one-eye/logging-operator/configuration/plugins/filters/).

### From CLI

To configure log routes via the command line, you only need to define the YAML files for the relevant resources:

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

And then apply them:

```bash
kubectl apply -f elasticsearch-logging.yaml
```

#### Referencing Secrets

There are 3 ways Banzai Cloud allows specifying secret values via yaml values.

The simplest is to use the `value` key, which is a simple string value for the desired secret. This method should only be used for testing and never in production:

```yaml
aws_key_id:
  value: "secretvalue"
```

The next is to use `valueFrom`, which allows referencing a specific value from a secret by a name and key pair:

```yaml
aws_key_id:
   valueFrom:
      secretKeyRef:
         name: <kubernetes-secret-name>
         key: <kubernetes-secret-key>
```

Some plugins require a file to read from rather than simply receiving a value from the secret (this is often the case for CA cert files). In these cases, you need to use `mountFrom`, which will mount the secret as a file to the underlying `fluentd` deployment and point the plugin to the file. The `valueFrom` and `mountFrom` object look the same:

```yaml
tls_cert_path:
   mountFrom:
      secretKeyRef:
         name: <kubernetes-secret-name>
         key: <kubernetes-secret-key>
```

For more information, you can find the related documentation [here](https://banzaicloud.com/docs/one-eye/logging-operator/configuration/plugins/outputs/secret/).

## Example `Outputs`

### Elasticsearch

For the simplest deployment, you can deploy Elasticsearch on your local system using docker:

```sh
docker run --name elasticsearch -p 9200:9200 -p 9300:9300 -e xpack.security.enabled=false -e node.name=es01 -it docker.elastic.co/elasticsearch/elasticsearch:6.8.23
```

Make sure that you have set `vm.max_map_count` to be >= 262144 or the docker command above will fail. Once the Elasticsearch server is up, you can create the yaml file for the `ClusterOutput` and `ClusterFlow`:

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

And apply the file:

```shell
kubectl apply -f elasticsearch-example.yaml
```

After allowing some time for the logging operator to apply the resources, you can test that the logs are flowing:

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

### Graylog
You can follow the instructions [here](https://github.com/w13915984028/harvester-develop-summary/blob/main/integrate-harvester-logging-with-log-servers.md#integrate-harvester-logging-with-graylog) to deploy and view cluster logs via [Graylog](https://www.graylog.org/):

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

### Splunk

You can follow the instructions [here](https://github.com/w13915984028/harvester-develop-summary/blob/main/test-log-event-audit-with-splunk.md) to deploy and view cluster logs via [Splunk](https://www.splunk.com/).

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

### Loki

You can follow the instructions in the [logging HEP](https://github.com/joshmeranda/harvester/blob/logging/enhancements/20220525-system-logging.md) on deploying and viewing cluster logs via [Grafana Loki](https://grafana.com/oss/loki/).

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