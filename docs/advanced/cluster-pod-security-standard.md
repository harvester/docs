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

**enabled**: when `true` ensures a [baseline](https://kubernetes.io/docs/concepts/security/pod-security-standards/#baseline) standard is applied to all non-Harvester system specific namespaces. Core Harvester features are verified to work at the `baseline` level. Once enabled, direct changes to the namespace PSS configuration are forbidden. All modifications must be done via the Harvester settings UI or API.

**whitelistedNamespacesList**: cluster admins can specify a list of namespaces to be skipped from pod security standard application.

**privilegedNamespacesList**: cluster admins can specify a list of namespaces which will have [privileged](https://kubernetes.io/docs/concepts/security/pod-security-standards/#privileged) pod security standard applied.

**restrictedNamespacesList**: cluster admins can specify a list of namespaces which will have [restricted](https://kubernetes.io/docs/concepts/security/pod-security-standards/#restricted) pod security standard applied.

## Configuring pod security standards

Cluster-wide pod security standards can be applied using the `cluster-pod-security-standard` setting.

<Tabs>
<TabItem value="ui" label="UI" default>

#### Enable the Pod Security Standard Setting

1. Go to **Advanced > Settings > cluster-pod-security-standard**.
1. Select **Edit Setting**.
1. Select **Enabled**.
1. Use the **Whitelisted Namespaces**, **Privileged Namespaces**, **Restricted Namespaces** settings to designate pod security standards to specific namespaces.
    * For each setting, multiple namespaces can be specified by separating them with a comma.
1. Click **Save**.

#### Disable the Pod Security Standard Setting

1. Go to **Advanced > Settings > cluster-pod-security-standard**.
1. Select **Disabled**.
1. Click **Save**.

</TabItem>

<TabItem value="cli" label="CLI">

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

</TabItem>
</Tabs>

:::note

The following list of system namespaces are always whitelisted to ensure the proper functioning of Harvester. Their PSS settings cannot be modified:

* `calico-apiserver`
* `calico-system`
* `cattle-alerting`
* `cattle-csp-adapter-system`
* `cattle-elemental-system`
* `cattle-epinio-system`
* `cattle-externalip-system`
* `cattle-fleet-local-system`
* `cattle-fleet-system`
* `cattle-gatekeeper-system`
* `cattle-global-data`
* `cattle-global-nt`
* `cattle-impersonation-system`
* `cattle-istio`
* `cattle-istio-system`
* `cattle-logging`
* `cattle-logging-system`
* `cattle-monitoring-system`
* `cattle-neuvector-system`
* `cattle-prometheus`
* `cattle-provisioning-capi-system`
* `cattle-resources-system`
* `cattle-sriov-system`
* `cattle-system`
* `cattle-ui-plugin-system`
* `cattle-windows-gmsa-system`
* `cert-manager`
* `cis-operator-system`
* `fleet-default`
* `ingress-nginx`
* `istio-system`
* `kube-node-lease`
* `kube-public`
* `kube-system`
* `longhorn-system`
* `rancher-alerting-drivers`
* `security-scan`
* `tigera-operator`
* `harvester-system`
* `rancher-vcluster`
* `cattle-dashboards`
* `fleet-local`
* `local`
* `forklift`

:::
