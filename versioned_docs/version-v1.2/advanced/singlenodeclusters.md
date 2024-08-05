---
sidebar_position: 7
sidebar_label: Single-Node Clusters
title: "Single-Node Clusters"
description: Support for deployment of single-node clusters
keywords:
- Harvester cluster
- one node
- single node
---

<head>
  <link rel="canonical" href="https://docs.harvesterhci.io/v1.3/advanced/singlenodeclusters"/>
</head>

Harvester supports single-node clusters for implementations that can tolerate lower resilience or require minimal initial deployment resources. You can create single-node clusters using the standard installation methods ([ISO](../install/iso-install.md), [USB](../install/usb-install.md), and [PXE boot](../install/pxe-boot-install.md)).

Single-node clusters support most Harvester features, including the creation of RKE2 clusters and node upgrades (with some limitations). However, this deployment type has the following key disadvantages:

- No high availability: Errors and updates that require rebooting of the node cause downtime to running VMs.
- No multi-replica support: Only one replica is created for each volume in Longhorn.
- No live migration and zero-downtime support during upgrades.

## Prerequisites

Before you begin deploying your single-node cluster, ensure that the following requirements are met.

- Hardware: [Use server-class hardware](../install/requirements.md#hardware-requirements) with sufficient resources to run Harvester and a production workload. Laptops and nested virtualization are not supported.
- Network: [Configure ports](../install/requirements.md#port-requirements-for-harvester-nodes) based on the type of traffic to be transmitted among VMs.

## Replica Count of the Default StorageClass 

Harvester uses StorageClasses to describe how Longhorn must provision volumes. Each StorageClass has a parameter that defines the number of replicas to be created for each volume. 

The default StorageClass `harvester-longhorn` has a replica count value of **3** for high availability. If you use `harvester-longhorn` in your single-node cluster, Longhorn is unable to create the default number of replicas, and volumes are marked as *Degraded* on the [embedded Longhorn UI](../troubleshooting/harvester.md#access-embedded-rancher-and-longhorn-dashboards). 

To avoid this issue, you can perform either of the following actions: 

- Change the [replica count](../install/harvester-configuration.md#installharvesterstorage_classreplica_count) of `harvester-longhorn` to **1** using a [Harvester configuration](../install/harvester-configuration.md) file. 

- [Create a new StorageClass](../advanced/storageclass.md#creating-a-storageclass) with the **Number of Replicas** parameter set to **1**. Once created, locate the new StorageClass in the list and then select **⋮** > **Set as Default**. 

## Upgrades and Maintenance

Single-node clusters do not support [Live Migration](../vm/live-migration.md), so VMs become unavailable during cluster upgrades. You must stop all VMs before starting the upgrade process.

Enabling [Maintenance Mode](../host.md#node-maintenance) is also not possible because that operation relies on Live Migration functionality, and Harvester cannot place the only control plane in Maintenance Mode.

