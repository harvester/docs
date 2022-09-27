---
sidebar_position: 4
sidebar_label: 监控
title: ""
---

# 监控

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

