---
sidebar_position: 5
sidebar_label: Rancher Manager
title: "Rancher Manager (Experimental)"
---

<head>
  <link rel="canonical" href="https://docs.harvesterhci.io/v1.6/advanced/addons/rancher-vcluster"/>
</head>

:::note

**rancher-vcluster** is an *experimental* add-on. It is not included in the Harvester ISO, but you can download it from the [experimental-addons repository](https://github.com/harvester/experimental-addons). For more information about experimental features, see [Feature Labels](../../getting-started/document-conventions.md#feature-labels).

:::

The **rancher-vcluster** add-on allows you to run Rancher as a workload on the underlying Harvester cluster and is implemented using [vCluster](https://www.vcluster.com).

The add-on runs a nested K3s cluster in the **rancher-vcluster** namespace and deploys Rancher to this cluster.

During the installation, the ingress for Rancher is synced to the Harvester cluster, allowing end users to access Rancher.

## Installing the Add-on

If you are using the Harvester kubeconfig file, you can install the add-on by running the following command:

```
kubectl apply -f https://raw.githubusercontent.com/harvester/experimental-addons/main/rancher-vcluster/rancher-vcluster.yaml
```

## Configuring the Add-on

After installation, configure the add-on using the Harvester UI.

1. Go to **Advanced** > **Add-ons**.

1. Locate the **rancher-vcluster** add-on, and then select **⋮** > **Edit Config**.

    ![](/img/v1.2/rancher-vcluster/VclusterConfig.png)

1. In the **Hostname** field, enter a valid DNS record pointing to the Harvester VIP. This is essential as the vcluster ingress is synced to the parent Harvester cluster. A valid hostname is used to filter ingress traffic to the vcluster workload.

1. In the **Bootstrap Password** field, enter the bootstrap password for the new Rancher deployed on the vcluster.

Once the add-on is deployed, Rancher can take a few minutes to become available. 

You can then access Rancher via the hostname DNS record that you provided.

See [Rancher Integration](../../rancher/virtualization-management.md) for more information.

:::note

**rancher-vcluster** is deployed on a `vcluster` Statefulset that uses a Longhorn PVC named `data-rancher-vcluster-0`.

When you disable the add-on, the PVC remains in the `rancher-vcluster` namespace. If you enable the add-on again, the PVC is reused and Rancher's previous state is restored.

If you want to wipe the data, ensure that the PVC is deleted.

:::

## Troubleshooting

See [Importing of Harvester Clusters into Rancher](../../troubleshooting/rancher.md#importing-of-harvester-clusters-into-rancher).
