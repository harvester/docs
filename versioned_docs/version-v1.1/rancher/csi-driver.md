---
sidebar_position: 5
sidebar_label: Harvester CSI Driver
title: "Harvester CSI Driver"
keywords:
  - Harvester
  - harvester
  - Rancher Integration
---

The Harvester Container Storage Interface (CSI) Driver provides a standard CSI interface used by guest Kubernetes clusters in Harvester. It connects to the host cluster and hot-plugs host volumes to the virtual machines (VMs) to provide native storage performance.

## Deploying

### Prerequisites

- The Kubernetes cluster is built on top of Harvester virtual machines.
- The Harvester virtual machines run as guest Kubernetes nodes are in the same namespace.

:::note

Currently, the Harvester CSI driver only supports single-node read-write(RWO) volumes. Please follow the [issue #1992](https://github.com/harvester/harvester/issues/1992) for future multi-node `read-only`(ROX) and `read-write`(RWX) support.

:::

### Deploying with Harvester RKE1 Node Driver

- Select `Harvester(Out-of-tree)` option (optional. If you don't need to use the Cloud Provider feature at the same time, you can select the `None` option).

    ![](/img/v1.1/rancher/rke-cloud-provider.png)

- Install `Harvester CSI Driver` from the Rancher marketplace.

    ![](/img/v1.1/rancher/install-harvester-csi-driver.png)


### Deploying with Harvester RKE2 Node Driver

When spinning up a Kubernetes cluster using Rancher RKE2 node driver, the Harvester CSI driver will be deployed when Harvester cloud provider is selected.

![select-harvester-cloud-provider](/img/v1.1/rancher/rke2-cloud-provider.png)

### Deploying with Harvester K3s Node Driver

- [Generate addon configuration](https://github.com/harvester/harvester-csi-driver/blob/master/deploy/generate_addon_csi.sh) and put it in K3s VMs `/etc/kubernetes/cloud-config`.

```bash
# depend on kubectl to operate the Harvester cluster
./deploy/generate_addon_csi.sh <serviceaccount name> <namespace>
```

- Install `Harvester CSI Driver` from the Rancher marketplace.

  ![](/img/v1.1/rancher/install-harvester-csi-driver-in-k3s.png)
