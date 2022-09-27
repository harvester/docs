---
sidebar_position: 1
sidebar_label: Harvester Node Driver
title: ""
keywords:
  - Harvester
  - harvester
  - Rancher
  - rancher
  - Harvester Node Driver
Description: The Harvester node driver is used to provision VMs in the Harvester cluster. In this section, you'll learn how to configure Rancher to use the Harvester node driver to launch and manage Kubernetes clusters.
---

# Harvester Node Driver

The Harvester node driver is used to provision VMs in the Harvester cluster. In this section, you'll learn how to configure Rancher to use the Harvester node driver to launch and manage Kubernetes clusters.

A node driver is the same as a [Docker Machine driver](https://docs.docker.com/machine/), and the project repo is available at [harvester/docker-machine-driver-harvester](https://github.com/harvester/docker-machine-driver-harvester).

You can now provision RKE1/RKE2 Kubernetes clusters in Rancher `v2.6.3+` with the built-in Harvester node driver. 
Additionally, Harvester now can provide built-in [Load Balancer support](../cloud-provider.md) as well as raw cluster [persistent storage](../csi-driver.md) support to the guest Kubernetes cluster.

While you can [upload and view `.ISO` images in the Harvester UI](../../upload-image.md#upload-images-via-local-file), the same capability is not available in the Rancher UI. For more information on this, see the [Rancher docs](https://rancher.com/docs/rancher/v2.6/en/virtualization-admin/#harvester-node-driver).

:::note

Harvester v1.0.0 is compatible with Rancher `v2.6.3+` only.

:::

## Harvester Node Driver

The Harvester node driver is enabled by default from Rancher `v2.6.3`. You can go to `Cluster Management` > `Drivers` > `Node Drivers` page to manage the Harvester node driver manually.

When the Harvester node driver is enabled, you can create Kubernetes clusters on top of the Harvester cluster and manage them from Rancher.

![rke1-cluster](/img/v1.1/rancher/rke1-node-driver.png)

## RKE1 Kubernetes Cluster
Click to learn [how to create RKE1 Kubernetes Clusters](./rke1-cluster.md).

## RKE2 Kubernetes Cluster
Click to learn [how to create RKE2 Kubernetes Clusters](./rke2-cluster.md).

## K3s Kubernetes Cluster
Click to learn [how to create k3s Kubernetes Clusters](./k3s-cluster.md).


## Topology Spread Constraints

_Available as of v1.0.3_

In your guest Kubernetes cluster, you can use [topology spread constraints](https://kubernetes.io/docs/concepts/scheduling-eviction/topology-spread-constraints/) to control how workloads are spread across the Harvester VMs among failure-domains such as regions and zones. This can help to achieve high availability as well as efficient resource utilization of your cluster resources.


### Sync Topology Labels to the Guest Cluster Node

During the cluster installation, the Harvester node driver will automatically help synchronize topology labels from VM nodes to guest cluster nodes. Currently, only `region` and `zone` typology labels are supported.

:::note

Label synchronization will only take effect during guest node initialization. To avoid node drifts to another region or zone, it is recommended to add the [node affinity rules](./rke2-cluster.md#add-node-affinity) during the cluster provisioning, so that the VMs can be scheduled to the same zone even after rebuilding.

:::

1. Configuring topology labels on the Harvester nodes through `Hosts > Edit Config > Labels`. e.g., add the topology labels as follows:
   ```yaml
   topology.kubernetes.io/region: us-east-1
   topology.kubernetes.io/zone: us-east-1a
   ```
   ![](/img/v1.1/rancher/node-add-affinity-labels.png)

1. Creating a guest Kubernetes cluster using the Harvester node driver and it is recommended to add the [node affinity rules](./rke2-cluster.md#add-node-affinity), this will help to avoid node drifting to other zones after VM rebuilding.

1. After the cluster is successfully deployed, confirm that guest Kubernetes node labels are successfully synchronized from the Harvester VM node.

1. Now deploy workloads on your guest Kubernetes cluster, and you should be able to manage them using the [topology spread constraints](https://kubernetes.io/docs/concepts/scheduling-eviction/topology-spread-constraints/).