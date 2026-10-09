---
sidebar_position: 13
sidebar_label: Rancher K3k
title: "Rancher K3k"
---

<head>
  <link rel="canonical" href="https://docs.harvesterhci.io/v1.8/advanced/addons/rancher-k3k"/>
</head>

:::note

**rancher-k3k** is an *Experimental* add-on. It is not included in the Harvester ISO, but you can download it from the [experimental-addons repository](https://github.com/harvester/experimental-addons). For more information about experimental features, see [Feature Labels](../../getting-started/document-conventions.md#feature-labels).

:::

The **rancher-k3k** add-on allows you to run Rancher as a workload on a Harvester cluster using [K3k](https://github.com/rancher/k3k).

The add-on provisions a nested K3s cluster in the `rancher-k3k` namespace and deploys Rancher onto it. During installation, the add-on syncs the Rancher ingress to the Harvester cluster, providing user access to the Rancher UI and API.

## Installing the Add-On

If you are using the Harvester kubeconfig file, you can install the add-on by running the following command:


## Configuring the Add-On

1. On the Harvester UI, go to **Advanced** > **Add-ons**.

1. Locate the **k3k** add-on, and then select **⋮** -> **Enable**.

1. Wait a few minutes for the add-on to be deployed and marked **Ready**.

1. Locate the **rancher-k3k** add-on, and then select **⋮** > **Edit YAML**.

1. In the `valuesContent` section, specify the target `hostname` and `bootstrapPassword`.

    

After the add-on is deployed, Rancher may take a few minutes to become available. Ensure your DNS resolves the specified hostname to the Harvester cluster ingress IP address before accessing the Rancher UI.

For more information, see [Rancher Integration](../../rancher/virtualization-management.md).

:::note

**rancher-k3k** is deployed on a K3k cluster with Rancher bootstrapped during cluster initialization.

When you disable the add-on, the associated PVC remains in the `rancher-k3k` namespace. If you enable the add-on again, this PVC is reused and Rancher's previous state is restored.

To permanently delete the data, you must manually delete the PVC after disabling the add-on.

:::

## Troubleshooting

See [Importing of Harvester Clusters into Rancher](../../troubleshooting/rancher.md#importing-of-harvester-clusters-into-rancher).
