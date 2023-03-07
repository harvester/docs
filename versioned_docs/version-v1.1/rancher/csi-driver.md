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

You can also deploy Harvester CSI Driver manually if you have already deployed the Harvester node driver manually. Perform the following steps to manually deploy the Harvester CSI Driver. 

1. Generate the addon config.

:::note

The script uses `kubectl` and `jq` to operate the Harvester cluster. The script needs access to the `Harvester Cluster` kubeconfig to work. The `<serviceaccount name>` is usually your guest cluster name, and the `<namespace>` needs to match the namespace of the guest cluster.

:::

- Install `jq`:
```
# apt install jq
```

- Set up `kubectl` and the kubeconfig file (the kubeconfig should allow you to access the `Harvester Cluster`):
```
# export KUBECONFIG=kubeconfig
# export PATH="${PATH}:/var/lib/rancher/rke2/bin"
```

You can generate the kubeconfig file using the [generate_addon_csi.sh](https://raw.githubusercontent.com/harvester/harvester-csi-driver/master/deploy/generate_addon_csi.sh) script. It is available on the [harvester/harvester-csi-driver](https://github.com/harvester/harvester-csi-driver) repo.

```
# ./generate_addon_csi.sh <serviceaccount name> <namespace>
```
Get the `addon` yaml from the output of the script above.

![](/img/v1.1/rancher/csi_addon_yaml.png)

1. Create the addon config file and add the `addon` yaml from the output above.

```
# mkdir -p /var/lib/rancher/rke2/etc/config-files
# vim /var/lib/rancher/rke2/etc/config-files/csi_addon.yaml
```

1. Install Harvester CSI Driver.

Install `Harvester CSI Driver` from the Rancher marketplace.
![](/img/v1.1/rancher/install_csi_rancher_marketplace.png)

You do not need to change the cloud-config path:
![](/img/v1.1/rancher/donot_change_cloud_config_path.png)

The Harvester CSI driver should now be deployed successfully.
### Deploying with Harvester K3s Node Driver

- [Generate addon configuration](https://github.com/harvester/harvester-csi-driver/blob/master/deploy/generate_addon_csi.sh) and put it in K3s VMs `/etc/kubernetes/cloud-config`.

```
# depend on kubectl to operate the Harvester cluster
./deploy/generate_addon_csi.sh <serviceaccount name> <namespace>
```

- Install `Harvester CSI Driver` from the Rancher marketplace.

  ![](/img/v1.1/rancher/install-harvester-csi-driver-in-k3s.png)
