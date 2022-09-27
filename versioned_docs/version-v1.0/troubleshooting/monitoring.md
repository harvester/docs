---
sidebar_position: 4
sidebar_label: Monitoring
title: ""
---

# Monitoring

The following sections contain tips to troubleshoot Harvester Monitoring.

## Monitoring is unusable

When the Harvester Dashboard is not showing any monitoring metrics, it can be caused by the following reasons.

### Monitoring is unusable due to Pod being stuck in `Terminating` status

Harvester Monitoring pods are deployed randomly on the cluster Nodes. When the Node hosting the pods accidentally goes down, the related pods may become stuck in the `Terminating` status rendering the Monitoring unusable from the WebUI.

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

Monitoring can be recovered using CLI commands to force delete the related pods. The cluster will redeploy new pods to replace them.

```shell
# Delete each none-running Pod in namespace cattle-monitoring-system.

$ kubectl delete pod --force -n cattle-monitoring-system prometheus-rancher-monitoring-prometheus-0

 pod "prometheus-rancher-monitoring-prometheus-0" force deleted


$ kubectl delete pod --force -n cattle-monitoring-system rancher-monitoring-admission-create-fwjn9

$ kubectl delete pod --force -n cattle-monitoring-system rancher-monitoring-crd-create-9wtzf

$ kubectl delete pod --force -n cattle-monitoring-system rancher-monitoring-grafana-d9c56d79b-ph4nz 

$ kubectl delete pod --force -n cattle-monitoring-system rancher-monitoring-grafana-d9c56d79b-t24sz
```

Wait for a few minutes so that the new pods are created and readied for the Monitoring dashboard to be usable again.

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

