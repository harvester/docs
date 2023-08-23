---
sidebar_position: 8
sidebar_label: Rancher Vcluster
title: "Rancher Vcluster (Experimental)"
---

<head>
  <link rel="canonical" href="https://docs.harvesterhci.io/dev/advanced/rancher-vcluster"/>
</head>

_Available as of v1.2.0_

The `rancher-vcluster` addon allows you to run Rancher as a workload on the underlying Harvester cluster using [vcluster](https://www.vcluster.com/).

![](/img/v1.2/vm-import-controller/EnableAddon.png)

The addon runs a nested K3s cluster in the `rancher-vcluster` namespace and deploys Rancher to this cluster.

During the installation, the ingress for Rancher is synced to the Harvester cluster, allowing end users to access Rancher.

## Installing rancher-vcluster

The `rancher-vcluster` addon is not packaged with Harvester, but you can find it in the [expreimental-addon repo](https://github.com/harvester/experimental-addons).

Assuming you are using the Harvester kubeconfig, you can run the following commands to install the addon:

```
git clone https://github.com/harvester/experimental-addons
kubectl apply -f experimental-addons/rancher-vcluster/rancher-vcluster.yaml
```

## Configuring rancher-vcluster

After installing the addon, you need to configure it from the Harvester UI as follows:

1. Click **Advanced** > **Addons**.
1. Find the `rancher-vcluster` addon and click **⋮ > Edit Config**.

![](/img/v1.2/rancher-vcluster/VclusterConfig.png)

1. In the **Hostname** field, enter a valid DNS record pointing to the Harvester VIP. This is essential as the vcluster ingress is synced to the parent Harvester cluster. A valid hostname is used to filter ingress traffic to the vcluster workload.
1. In the **Bootstrap Password** field, enter the bootstrap password for the new Rancher deployed on the vcluster.

Once the addon is deployed, it can take a few minutes for Rancher to become available. 

You can then access Rancher via the hostname DNS record that you provided.

Rancher can now be used to manage the underlying Harvester cluster. For more information, see [Rancher Integration](../rancher/virtualization-management).