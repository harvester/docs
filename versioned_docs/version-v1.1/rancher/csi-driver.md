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

## Passthrough Custom StorageClass

Starting with Harvester CSI driver v0.1.15, you can create a PersistentVolumeClaim (PVC) based on a different StorageClass.

Harvester CSI driver v0.1.15 is supported out of the box starting with the following RKE2 versions; for RKE1 you need to manually install the CSI driver chart:
- v1.23.16+rke2r1 and later
- v1.24.10+rke2r1 and later
- v1.25.6+rke2r1 and later
- v1.26.1+rke2r1 and later
- v1.27.1+rke2r1 and later

### Prerequisites

Please add the following additional perquisites to your Harvester cluster. The Harvester CSI driver requires proper **RBAC** to display error messages. This is important for displaying an error message when creating a PVC with a StorageClass that does not exist, as shown in the following figure.

![](/img/v1.1/rancher/error_event_csi_driver.png)


Perform the following steps to setup **RBAC** to enable seeing error messages.

1. Create a new `clusterrole` named `harvesterhci.io:csi-driver` with the following manifest.
```
apiVersion: rbac.authorization.k8s.io/v1
kind: ClusterRole
metadata:
  labels:
    app.kubernetes.io/component: apiserver
    app.kubernetes.io/name: harvester
    app.kubernetes.io/part-of: harvester
  name: harvesterhci.io:csi-driver
rules:
- apiGroups:
  - storage.k8s.io
  resources:
  - storageclasses
  verbs:
  - get
  - list
  - watch
```

2. Then create the `clusterrolebinding` to associate with  the new `clusterrole` with the following manifest.
```
apiVersion: rbac.authorization.k8s.io/v1
kind: ClusterRoleBinding
metadata:
  name: <namespace>-<serviceaccount name>
roleRef:
  apiGroup: rbac.authorization.k8s.io
  kind: ClusterRole
  name: harvesterhci.io:csi-driver
subjects:
- kind: ServiceAccount
  name: <serviceaccount name>
  namespace: <namespace>
```

Make sure the `serviceaccount name` and `namespace` are the same as your cloud provider. Perform the following steps to see the `serviceaccount name` and `namespace` for your cloud provider.

1. Find the `rolebinding` for your cloud provider .

```
# kubectl get rolebinding -A |grep harvesterhci.io:cloudprovider
default                                 default-rke2-guest-01                                ClusterRole/harvesterhci.io:cloudprovider             7d1h
```

2. Get the `subjects` info on this `rolebinding`.
```
kubectl get rolebinding default-rke2-guest-01 -n default -o yaml |yq -e '.subjects'
```

3. Find the `ServiceAccount` info as follows:
```
- kind: ServiceAccount
  name: rke2-guest-01
  namespace: default
```

### Deploying

1. Create a new StorageClass that you would like to use in your guest k8s cluster. You can refer to the [StorageClasses](https://docs.harvesterhci.io/dev/advanced/storageclass) for more details.

  As show in the following figure, create a new StorageClass named **replica-2**.

  ![](/img/v1.1/rancher/sc-replica-2.png)

  For example, create a new StorageClass on the downstream cluster as follows associated with the StorageClass created on the Harvester Cluster named **replica-2**.

  ![](/img/v1.1/rancher/downstream-cluster-sc-creation.png)

  :::note

  When choosing a **Provisioner**, select **Harvester (CSI)**. The parameter **Host StorageClass** should be the StorageClass created on the Harvester Cluster.

  :::
  
1. You can now create a PVC based on this new **StorageClass**, which uses the **Host StorageClass** to provision volumes on the bare-metal cluster.