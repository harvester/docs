---
sidebar_position: 13
sidebar_label: Rancher K3k
title: "Rancher K3k Addon"
---

<head>
  <link rel="canonical" href="https://docs.harvesterhci.io/v1.9/advanced/addons/rancher-k3k"/>
</head>

:::note

**rancher-k3k** is an *Experimental* add-on. It is not included in the Harvester ISO, but you can download the manifest (`rancher-k3k-addon.yaml`) from the [Harvester **Releases** page](https://github.com/harvester/harvester/releases). Manifest source files are located in the `addons/standalone` directory of the [Harvester repository](https://github.com/harvester/harvester/tree/master/addons/standalone). For more information about experimental features, see [Feature Labels](../../getting-started/document-conventions.md#feature-labels).

:::

The **rancher-k3k** add-on allows you to run Rancher as a workload on the underlying Harvester cluster and is implemented using [k3k](https://github.com/rancher/k3k).

The add-on runs a nested K3s cluster in the **rancher-k3k** namespace and deploys Rancher to this cluster.

During the installation, the ingress for Rancher is synced to the Harvester cluster, allowing end users to access Rancher.

## Installing the Add-on

If you are using the Harvester kubeconfig file, you can install the add-on by running the following commands:

### Install k3k Add-on
```
kubectl apply -f https://github.com/harvester/harvester/releases/download/<version>/k3k-addon.yaml
```

### Install rancher-k3k Add-on
```
kubectl apply -f https://github.com/harvester/harvester/releases/download/<version>/rancher-k3k-addon.yaml
```

Replace `<version>` with the version of your Harvester cluster (for example, `v1.10.0`).

## Configuring the Add-on

After installation, configure the add-on using the Harvester UI.

1. Go to **Advanced** > **Add-ons**.

2. Locate the **k3k** add-on, and then select **⋮** > **Enable**.

3. Wait a few minutes for add-on to be deployed and marked ready.

4. Locate the **rancher-k3k** add-on, and then select **⋮** > **Edit Yaml**.

5. Change the fields `hostname`, `bootstrapPassword` in **valuesContent** section

```
spec:
  chart: rancher-k3k
  enabled: false
  repo: https://charts.harvesterhci.io
  valuesContent: |-
    certManagerVersion: "v1.20.2"
    rancher:
      hostname: ""
      version: "v2.14.0"
      replicas: 1
      bootstrapPassword: "password"
    k3kCluster:
      servers: 1
      version: v1.35.4-k3s1
      storageClassName: "harvester-longhorn"
  version: 1.10.0
```

6. Save changes and then select **⋮** > **Enable**.

Once the add-on is deployed, Rancher can take a few minutes to become available. 

You can then access Rancher via the hostname DNS record that you provided.

See [Rancher Integration](../../rancher/virtualization-management.md) for more information.

:::note

**rancher-k3k** is deployed on a `k3k` cluster with `rancher` bootstrapped as part of cluster init.

When you disable the add-on, the PVC remains in the `rancher-k3k` namespace. If you enable the add-on again, the PVC is reused and Rancher's previous state is restored.

If you want to wipe the data, ensure that the PVC is deleted.

:::

## Troubleshooting

See [Importing of Harvester Clusters into Rancher](../../troubleshooting/rancher.md#importing-of-harvester-clusters-into-rancher).
