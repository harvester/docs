---
sidebar_position: 13
sidebar_label: Rancher K3k
title: "Rancher K3k (Experimental)"
---

<head>
  <link rel="canonical" href="https://docs.harvesterhci.io/v1.9/advanced/addons/rancher-k3k"/>
</head>

_Available as of v1.9.1_

:::note

**`rancher-k3k`** is an *experimental* add-on. For information about feature maturity, see [Feature Labels](../../getting-started/document-conventions.md#feature-labels).

This add-on is not included in the Harvester ISO, but you can download the manifest (`rancher-k3k-addon.yaml`) from the [Harvester **Releases** page](https://github.com/harvester/harvester/releases). Manifest source files are located in the `addons/standalone` directory of the [Harvester repository](https://github.com/harvester/harvester/tree/v1.9/addons/standalone).

:::

The **`rancher-k3k`** add-on, implemented using [K3k](https://github.com/rancher/k3k), allows you to run Rancher as a workload on the underlying Harvester cluster. This add-on replaces the deprecated [rancher-vcluster](./rancher-vcluster.md) add-on.

The add-on runs a nested K3s cluster in the `rancher-k3k` namespace and deploys Rancher to this cluster.

During the installation, the ingress for Rancher is synced to the Harvester cluster, allowing end users to access Rancher.

:::caution

Running Rancher in a K3k cluster is not as secure as running Rancher on a separate cluster or virtual machine. Users with cluster-level access to the Harvester cluster can access the Rancher instance that is deployed by this add-on.

:::

## Installing the Add-on

**`rancher-k3k`** depends on the **k3k** add-on, which deploys the K3k controller. You must install both add-ons.

If you are using the Harvester kubeconfig file, you can install the add-ons by running the following commands:

1. Install the **k3k** add-on.

    ```
    kubectl apply -f https://raw.githubusercontent.com/harvester/harvester/v1.9/addons/standalone/k3k/addon.yaml
    ```

2. Install the **`rancher-k3k`** add-on.

    ```
    kubectl apply -f https://github.com/harvester/harvester/releases/download/<version>/rancher-k3k-addon.yaml
    ```

    Replace `<version>` with the version of your Harvester cluster (for example, `v1.9.1`).

## Configuring the Add-on

After installation, configure the add-on using the Harvester UI.

1. Go to **Advanced** > **Add-ons**.

2. Locate the **k3k** add-on, and then select **⋮** > **Enable**.

3. Wait until the state of the **k3k** add-on changes to **DeploySuccessful**.

4. Locate the **`rancher-k3k`** add-on, and then select **⋮** > **Edit YAML**.

5. In the `valuesContent` section, change the values of the following fields:

    - `rancher.hostname`: Enter a valid DNS record pointing to the Harvester VIP. This is essential because the Rancher ingress is synced to the parent Harvester cluster. A valid hostname is used to filter ingress traffic to Rancher.
    - `rancher.bootstrapPassword`: Enter the bootstrap password for the new Rancher instance.

    Example:

    ```yaml
    spec:
      chart: rancher-k3k
      enabled: false
      repo: https://charts.harvesterhci.io
      valuesContent: |-
        certManagerVersion: "v1.20.2"
        rancher:
          hostname: "rancher.example.com"
          version: "v2.14.0"
          replicas: 1
          bootstrapPassword: "your-secure-password"
        k3kCluster:
          servers: 1
          version: v1.35.4-k3s1
          storageClassName: "harvester-longhorn"
      version: 1.9.1
    ```

6. Save the changes, and then select **⋮** > **Enable**.

Once the add-on is deployed, Rancher can take a few minutes to become available.

You can then access Rancher using the hostname you provided. The Rancher instance uses a self-signed certificate.

See [Rancher Integration](../../rancher/virtualization-management.md) for more information.

:::note

When you disable the add-on, the PVC remains in the `rancher-k3k` namespace. If you enable the add-on again, the PVC is reused and Rancher's previous state is restored.

If you want to wipe the data, ensure that the PVC is deleted.

:::

## Upgrading Rancher and K3s

You can upgrade the components deployed by the add-on by editing the following fields in the `valuesContent` section:

- `rancher.version`: Version of the Rancher instance
- `k3kCluster.version`: K3s version of the nested cluster

## Moving from rancher-vcluster

**`rancher-k3k`** and **`rancher-vcluster`** are separate add-ons that use different namespaces and volumes. Harvester does not migrate the data of an existing **`rancher-vcluster`** deployment to **`rancher-k3k`**. The Rancher instance deployed by **`rancher-k3k`** is a new instance, so you must import the Harvester cluster again and recreate your Rancher configuration.

## Troubleshooting

See [Importing of Harvester Clusters into Rancher](../../troubleshooting/rancher.md#importing-of-harvester-clusters-into-rancher).
