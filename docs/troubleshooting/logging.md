---
sidebar_position: 5
sidebar_label: Logging
title: "Logging"
---

<head>
  <link rel="canonical" href="https://docs.harvesterhci.io/v1.6/troubleshooting/logging"/>
</head>

The following sections contain tips to troubleshoot Harvester Logging.

## Failed to enable `rancher-logging` Add-On

### Issue Description

When the `rancher-logging` add-on is enabled, it shows failure.

![](/img/v1.6/troubleshooting/logging-installation-failure-due-to-conflict.png)

Example:

Log from `cattle-logging-system/helm-install-rancher-logging` pod:

```sh
Error: INSTALLATION FAILED: Unable to continue with install: ClusterRole "logging-admin" in namespace "" exists
and cannot be imported into the current release: invalid ownership metadata;
annotation validation error: key "meta.helm.sh/release-name" must equal "rancher-logging":
current value is "hvst-upgrade-md54b-upgradelog-operator"
```

![](/img/v1.6/troubleshooting/failed-to-enable-logging.png)

### Root Cause

When an upgrade is started, the `Enable Logging` option can be selected. If the option is ticked, the background processing depends on if the addon [rancher-logging] is enabled. 

![](/img/v1.6/troubleshooting/upgrade-with-enable-logging.png)

If `rancher-logging` addon is disabled, the `upgrade contrller` creates following `logging` and `managedchart` object to log things happened in the upgrade.

```sh
$ kubectl get upgrade.harvesterhci -A
NAMESPACE          NAME                 AGE
harvester-system   hvst-upgrade-hpfnw   36s  

$ kubectl get logging -A
NAME                                          LOGGINGREF             CONTROLNAMESPACE       
hvst-upgrade-hpfnw-upgradelog-infra           harvester-upgradelog   harvester-system        // newly created by upgrade controller
hvst-upgrade-hpfnw-upgradelog-operator-root                          cattle-logging-system   // newly created by upgrade controller

$ kubectl get managedchart -A
NAMESPACE     NAME                                     AGE
fleet-local   hvst-upgrade-hpfnw-upgradelog-operator   18s  // newly created by upgrade controller
```

If `rancher-logging` addon is enabled, the `upgrade contrller` creates following `logging` object to log things happened in the upgrade.

```sh
$ kubectl get upgrade.harvesterhci -A
NAMESPACE          NAME                 AGE
harvester-system   hvst-upgrade-9sn4x   14s

$ kubectl get managedchart -A
NAMESPACE     NAME                     AGE

$ kubectl get logging -A
NAME                                  LOGGINGREF                     CONTROLNAMESPACE        
hvst-upgrade-9sn4x-upgradelog-infra   harvester-upgradelog           harvester-system        // newly created by upgrade controller
rancher-logging-kube-audit            harvester-kube-audit-log-ref   cattle-logging-system   // originally created by rancher-logging addon
rancher-logging-root                                                 cattle-logging-system   // originally created by rancher-logging addon
```

The issue happens when the operations are done on below steps.

1. Disable `rancher-logging` addon

1. Kick off the `ugprade` with `Enable Logging` option ticked

1. Enable `rancher-logging` addon, it reports error

There is another case:

1. Disable `rancher-logging` addon

1. Kick off the `ugprade` with `Enable Logging` option ticked

1. Wait until the upgrade is done

1. Due to a known bug [managedchart is not cleared](https://github.com/harvester/harvester/issues/7654), the `managedchart` and `logging` objects are not effectively removed

1. Enable `rancher-logging` addon, it reports error


### Workaround

1. Disable `rancher-logging` add-on

1. Wait until the upgrade is successful or removed

1. Check the above mentioned `managedchart` and `logging` object, if their names start with `hvst-upgrade-`, manually delete them

1. Enable `rancher-logging` add-on

:::note

1. When the upgrade is ongoging, do not enable or disable the `rancher-logging` addon, to avoid conflict with upgrde log. This is mandatory checked from Harvester v1.7.0.

1. Check all the addons before the upgrade, ensure they are in healthy status. This is mandatory checked from Harvester v1.7.0.

:::

### Related Issue

https://github.com/harvester/harvester/issues/9289

https://github.com/harvester/harvester/issues/9644
