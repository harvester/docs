---
sidebar_position: 4
sidebar_label: 监控
title: "监控"
---

本文介绍了对 Harvester Monitoring 进行故障排除的提示。

## Monitoring 不可用

如果 Harvester Dashboard 没有显示任何监控指标，可能原因如下。

### Pod 卡在 `Terminating` 状态导致 Monitoring 无法使用

Harvester Monitoring pod 随机部署在集群节点上。当托管 Pod 的节点意外宕机时，相关的 Pod 可能会卡在 `Terminating` 状态，导致 WebUI 无法使用 Monitoring。

```shell
$ kubectl get pods -n cattle-monitoring-system

NAMESPACE                   NAME                                                     READY   STATUS        RESTARTS   AGE
cattle-monitoring-system    prometheus-rancher-monitoring-prometheus-0               3/3     Terminating   0          3d23h
cattle-monitoring-system    rancher-monitoring-admission-create-fwjn9                0/1     Terminating   0          137m
cattle-monitoring-system    rancher-monitoring-crd-create-9wtzf                      0/1     Terminating   0          137m
cattle-monitoring-system    rancher-monitoring-grafana-d9c56d79b-ph4nz               3/3     Terminating   0          3d23h
cattle-monitoring-system    rancher-monitoring-grafana-d9c56d79b-t24sz               0/3     Init:0/2      0          132m

cattle-monitoring-system    rancher-monitoring-kube-state-metrics-5bc8bb48bd-nbd92   1/1     Running       4          4d1h
...

```

你可以使用 CLI 命令强制删除相关 Pod 来恢复监控。集群将重新部署新的 Pod 来替换它们。

```shell
# 删除命名空间 cattle-monitoring-system 中所有未运行的 Pod。

$ kubectl delete pod --force -n cattle-monitoring-system prometheus-rancher-monitoring-prometheus-0

 pod "prometheus-rancher-monitoring-prometheus-0" force deleted


$ kubectl delete pod --force -n cattle-monitoring-system rancher-monitoring-admission-create-fwjn9

$ kubectl delete pod --force -n cattle-monitoring-system rancher-monitoring-crd-create-9wtzf

$ kubectl delete pod --force -n cattle-monitoring-system rancher-monitoring-grafana-d9c56d79b-ph4nz

$ kubectl delete pod --force -n cattle-monitoring-system rancher-monitoring-grafana-d9c56d79b-t24sz
```

等待几分钟，以便创建新的 Pod 并准备好让 Monitoring 仪表板再次可用。

```
$ kubectl get pods -n cattle-monitoring-system

NAME                                                     READY   STATUS     RESTARTS   AGE
prometheus-rancher-monitoring-prometheus-0               0/3     Init:0/1   0          98s
rancher-monitoring-grafana-d9c56d79b-cp86w               0/3     Init:0/2   0          27s
...

$ kubectl get pods -n cattle-monitoring-system

NAME                                                     READY   STATUS    RESTARTS   AGE
prometheus-rancher-monitoring-prometheus-0               3/3     Running   0          7m57s
rancher-monitoring-grafana-d9c56d79b-cp86w               3/3     Running   0          6m46s
...

```

## 扩展 PV/卷的大小

`Harvester` 集成了 `Longhorn` 作为默认的存储解决方案。

Harvester `Monitoring` 使用 `Persistent Volume (PV)` 来存储运行数据。集群运行一段时间后，你可能需要扩展 `PV` 的大小。

参照 `Longhorn` 卷的[扩展指南](https://longhorn.io/docs/1.3.2/volumes-and-nodes/expansion/)，`Harvester` 将说明如何进行卷的大小扩展。

### 查看卷

#### 使用嵌入式 Longhorn WebUI

根据[此文档](../troubleshooting/harvester.md#访问嵌入式-rancher-和-longhorn-仪表板)访问嵌入式 Longhorn WebUI。

Longhorn 仪表板默认视图。

![](/img/v1.2/troubleshooting/2-longhorn-dashboard.png)

单击 `Volume` 列出所有现有的卷。

![](/img/v1.2/troubleshooting/3-view-all-volume.png)

#### 使用 CLI

你还可以使用 `kubectl` 来查看所有卷。

```
# kubectl get pvc -A
NAMESPACE                  NAME                                                                                             STATUS   VOLUME                                     CAPACITY   ACCESS MODES   STORAGECLASS         AGE
cattle-monitoring-system   alertmanager-rancher-monitoring-alertmanager-db-alertmanager-rancher-monitoring-alertmanager-0   Bound    pvc-1b2fbbe9-14b1-4a65-941a-7d5645a89977   5Gi        RWO            harvester-longhorn   43h
cattle-monitoring-system   prometheus-rancher-monitoring-prometheus-db-prometheus-rancher-monitoring-prometheus-0           Bound    pvc-7c6dcb61-51a9-4a38-b4c5-acaa11788978   50Gi       RWO            harvester-longhorn   43h
cattle-monitoring-system   rancher-monitoring-grafana                                                                       Bound    pvc-b2b2c07c-f7cd-4965-90e6-ac3319597bf7   2Gi        RWO            harvester-longhorn   43h

# kubectl get volume -A
NAMESPACE         NAME                                       STATE      ROBUSTNESS   SCHEDULED   SIZE          NODE     AGE
longhorn-system   pvc-1b2fbbe9-14b1-4a65-941a-7d5645a89977   attached   degraded                 5368709120    harv31   43h
longhorn-system   pvc-7c6dcb61-51a9-4a38-b4c5-acaa11788978   attached   degraded                 53687091200   harv31   43h
longhorn-system   pvc-b2b2c07c-f7cd-4965-90e6-ac3319597bf7   attached   degraded                 2147483648    harv31   43h
```

### 缩减 Deployment

要停止挂载`卷`，你需要先缩减正在使用`卷`的 `Deployment`。

以下示例将针对 `rancher-monitoring-grafana` 使用的 PVC。

在命名空间 `cattle-monitoring-system` 中找到 `Deployment`。

```
# kubectl get deployment -n cattle-monitoring-system
NAME                                    READY   UP-TO-DATE   AVAILABLE   AGE
rancher-monitoring-grafana              1/1     1            1           43h  // target deployment
rancher-monitoring-kube-state-metrics   1/1     1            1           43h
rancher-monitoring-operator             1/1     1            1           43h
rancher-monitoring-prometheus-adapter   1/1     1            1           43h
```

将 `rancher-monitoring-grafana` Deployment 缩减为 0。

```
# kubectl scale --replicas=0 deployment/rancher-monitoring-grafana -n cattle-monitoring-system
```

检查 Deployment 和卷。

```
# kubectl get deployment -n cattle-monitoring-system
NAME                                    READY   UP-TO-DATE   AVAILABLE   AGE
rancher-monitoring-grafana              0/0     0            0           43h  // scaled down
rancher-monitoring-kube-state-metrics   1/1     1            1           43h
rancher-monitoring-operator             1/1     1            1           43h
rancher-monitoring-prometheus-adapter   1/1     1            1           43h

# kubectl get volume -A
NAMESPACE         NAME                                       STATE      ROBUSTNESS   SCHEDULED   SIZE          NODE     AGE
longhorn-system   pvc-1b2fbbe9-14b1-4a65-941a-7d5645a89977   attached   degraded                 5368709120    harv31   43h
longhorn-system   pvc-7c6dcb61-51a9-4a38-b4c5-acaa11788978   attached   degraded                 53687091200   harv31   43h
longhorn-system   pvc-b2b2c07c-f7cd-4965-90e6-ac3319597bf7   detached   unknown                  2147483648             43h  // volume is detached
```

### 扩展卷

在 Longhorn WebUI 中，相关卷的状态会变成 `Detached`。点击 `Operation` 栏中的图标，然后选择 `Expand Volume`。

![](/img/v1.2/troubleshooting/4-select-volume-to-expand.png)

输入一个新的大小，然后 `Longhorn` 会将卷扩展到这个大小。

![](/img/v1.2/troubleshooting/5-expand-volue-to-new-size.png)

### 扩展 Deployment

将`卷`扩展到目标大小后，你需要将上述 Deployment 扩展到其原始副本的大小。在上述 `rancher-monitoring-grafana` 示例中，原始副本的值为 1。

```
# kubectl scale --replicas=1 deployment/rancher-monitoring-grafana -n cattle-monitoring-system

```

再次检查 Deployment。

```
# kubectl get deployment -n cattle-monitoring-system
NAME                                    READY   UP-TO-DATE   AVAILABLE   AGE
rancher-monitoring-grafana              1/1     1            1           43h  // scaled up
rancher-monitoring-kube-state-metrics   1/1     1            1           43h
rancher-monitoring-operator             1/1     1            1           43h
rancher-monitoring-prometheus-adapter   1/1     1            1           43h
```

`卷`已附加到新的 Pod。

![](/img/v1.2/troubleshooting/6-after-scale-up.png)

至此，你已将`卷`扩展到新的大小，Pod 可以正常使用卷。

