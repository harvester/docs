---
sidebar_position: 8
sidebar_label: Rancher Vcluster
title: "Rancher Vcluster (Experimental)"
---

<head>
  <link rel="canonical" href="https://docs.harvesterhci.io/v1.1/advanced/rancher-vcluster"/>
</head>

_Available as of v1.2.0_

The `rancher-vcluster` addon allows users to run `rancher` as workload on the underlying harvester cluster using [vcluster](https://www.vcluster.com/).

![](/img/v1.2/vm-import-controller/EnableAddon.png)

The addon runs a nested k3s cluster in the `rancher-vcluster` namespace, and deploys `rancher` to this cluster.

As part of the install the ingress for rancher is sync'd to the harvester cluster. This allows end users to access this `rancher`

## Installing rancher-vcluster addon

The `rancher-vcluster` addon is not package with harvester. It is available in the [expreimental-addon repo](https://github.com/harvester/experimental-addons)

To install the addon users need to perform the following steps:

_This assumes user is using the harvester kubeconfig_
```
git clone https://github.com/harvester/experimental-addons
kubectl apply -f experimental-addons/rancher-vcluster/rancher-vcluster.yaml
```

## Configuring rancher-vcluster addon

To enable the `rancher-vcluster` some mandatory items are need for the addon config:

![](/img/v1.2/rancher-vcluster/VclusterConfig.png)

The addon config requires the following input:
* Hostname: A valid dns record pointing to the harvester vip. This is essential as the vcluster ingress is synced to the parent harvester cluster. A valid hostname is used to filter traffic by ingress to the vcluster workload.
* Bootstrap Password: The bootstrap password for the new rancher deploy on vcluster.

Once the addon is deployed, it can take a few minutes for rancher to be available. 

Users can then access this rancher via the Hostname dns record supplied during install.

The new rancher can then be used to manage the underlying harvester cluster using the [rancher integration](../rancher/virtualization-management)