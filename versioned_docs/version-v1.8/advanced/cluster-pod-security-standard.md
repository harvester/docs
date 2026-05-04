---
sidebar_position: 14
sidebar_label: Cluster Pod Security Standards
title: "Harvester Cluster Pod Security Standard Setting"
---


<head>
  <link rel="canonical" href="https://docs.harvesterhci.io/v1.8/advanced/cluster-pod-security-standard"/>
</head>

 Starting from v1.8.0, Harvester provides a more flexible way for cluster admins to apply [Kubernetes Pod Security Standards](https://kubernetes.io/docs/concepts/security/pod-security-standards/) by changing a setting.

This is useful for users leveraging Harvester for bare metal workloads.



## Background

Harvester users running baremetal workloads in large multi-tenant environments may need to avoid privileged escalation. 

Users could manually apply pod security standards using the following knowledge base [document](https://harvesterhci.io/kb/2025/05/08/using-pod-security-standard).

The new setting simplifies setup of cluster-wide pod security standards.

The setting is disabled by default.

```json
{
  "enabled":false,
  "whitelistedNamespacesList":"", 
  "privilegedNamespacesList":"",
  "restrictedNamespacesList":""
}
```

The various fields are as follows

**enabled**: when `true` ensures a [baseline](https://kubernetes.io/docs/concepts/security/pod-security-standards/#baseline) standard is applied to all non harvester system specific namespaces. Core Harvester features are verified to work at the `baseline` level. Once enabled, direct changes to the namespace PSS configuration are forbidden. All modifications must be done via the Harvester settings UI or API.

**whitelistedNamespacesList**: cluster admins can specify a list of namespaces to be skipped from pod security standard application.

**privilegedNamespacesList**: cluster admins can specify a list of namespaces which will have [privileged](https://kubernetes.io/docs/concepts/security/pod-security-standards/#privileged) pod security standard applied.

**restrictedNamespacesList**: cluster admins can specify a list of namespaces which will have [restricted](https://kubernetes.io/docs/concepts/security/pod-security-standards/#restricted) pod security standard applied.


## Configuring pod security standards
Cluster-wide pod security standards can be applied using the `cluster-pod-security-standard` setting.

 To enable this setting, check its current value:
```shell
kubectl get settings.harvesterhci.io cluster-pod-security-standard
NAME                            VALUE
cluster-pod-security-standard
```

Update the setting as follows:
```shell
kubectl patch settings.harvesterhci.io cluster-pod-security-standard --type='json' -p='[{"op": "replace", "path": "/value", "value": "{\"enabled\":true,\"whitelistedNamespacesList\":\"default\",\"restrictedNamespacesList\":\"demo,restricted-ns\",\"privilegedNamespacesList\":\"demo2,privileged-ns\"}"}]'
```

Verify that the setting was applied:
```shell
kubectl get settings.harvesterhci.io cluster-pod-security-standard
NAME                            VALUE
cluster-pod-security-standard   {"enabled":true,"whitelistedNamespacesList":"default","restrictedNamespacesList":"demo,restricted-ns","privilegedNamespacesList":"demo2,privileged-ns"}
```