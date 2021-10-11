---
sidebar_position: 2
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

A node driver is the same as a [Docker Machine driver](https://docs.docker.com/machine/drivers/), and the project repo is available at [harvester/docker-machine-driver-harvester](https://github.com/harvester/docker-machine-driver-harvester).

Users can now provision RKE1/RKE2 Kubernetes clusters in Rancher `v2.6.1` using the built-in Harvester Node Driver. 
Additionally, Harvester now can provide built-in [Load Balancer support](./cloud-provider.md) as well as raw cluster [persistent storage](./csi-driver.md) support to the guest Kubernetes cluster.

!!!note
    Currently Rancher v2.6.1 is the only version that is compatible with Harvester v0.3.0.

## Enable Harvester Node Driver

The Harvester node driver is not enabled by default from the Rancher UI, click the `Cluster Management` tab to enable the Harvester node driver.

1. click the `Drivers` page and click the `Node Drivers` tab 
2. select the Harvester node driver and click `Active` to enable the Harvester node driver.

![](assets/enable-node-driver.png)

Now users can spin up Kubernetes clusters on top of the Harvester cluster, and manage them there.

## RKE1 Kubernetes Cluster
Click to view [how to creat RKE1 Kubernetes Cluster](./rke1-cluster.md)

## RKE2 Kubernetes Cluster
Click to view [how to creat RKE2 Kubernetes Cluster](./rke2-cluster.md)