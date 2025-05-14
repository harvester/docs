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
  <link rel="canonical" href="https://docs.harvesterhci.io/v1.5/advanced/singlenodeclusters"/>
</head>

Harvester supports single-node clusters for implementations that can tolerate lower resilience or require minimal initial deployment resources. You can create single-node clusters using the standard installation methods ([ISO](../install/iso-install.md), [USB](../install/usb-install.md), and [PXE boot](../install/pxe-boot-install.md)).

Single-node clusters support most Harvester features, including the creation of RKE2 clusters and node upgrades (with some limitations). However, this deployment type has the following key disadvantages:

- No high availability: Errors and updates that require rebooting of the node cause downtime to running VMs.
- No live migration and zero-downtime support during upgrades.

## Prerequisites

Before you begin deploying your single-node cluster, ensure that the following requirements are met.

- Hardware: [Use server-class hardware](../install/requirements.md#hardware-requirements) with sufficient resources to run Harvester and a production workload. Laptops and nested virtualization are not supported.
- Network: [Configure ports](../install/requirements.md#port-requirements-for-harvester-nodes) based on the type of traffic to be transmitted among VMs.

## Replica Count of the Default StorageClass 

Harvester uses StorageClasses to describe how Longhorn must provision volumes. Each StorageClass has a parameter that defines the number of replicas to be created for each volume. 

The default StorageClass `harvester-longhorn` has a replica count value of **3** for high availability. If you use `harvester-longhorn` in your single-node cluster, Longhorn is unable to create the default number of replicas, and volumes are marked as *Degraded* on the **Volumes** screen of the Harvester UI. 

To avoid this issue, you can perform either of the following actions: 

- Change the [replica count](../install/harvester-configuration.md#installharvesterstorage_classreplica_count) of `harvester-longhorn` to **1** using a [Harvester configuration](../install/harvester-configuration.md) file. 

- [Create a new StorageClass](../advanced/storageclass.md#creating-a-storageclass) with the **Number of Replicas** parameter set to **1**. Once created, locate the new StorageClass in the list and then select **⋮** > **Set as Default**. 

## Multiple Replicas on a Node with Multiple Disks 

Longhorn creates only one replica for each volume even if the node has multiple disks because **Replica Hard Anti-Affinity** is enabled by default. When a healthy replica already exists on a node, the scheduler is prevented from scheduling new replicas of the same volume on the node.

In high-availability clusters, **Replica Hard Anti-Affinity** ensures volume redundancy. However, this same mechanism can cause volumes to become degraded in single-node clusters (since no other nodes are available for scheduling of new replicas).

If you want Longhorn to create multiple replicas on a node with multiple disks, perform the following steps: 

1. Enable [`Replica Node Level Soft Anti-Affinity`](https://longhorn.io/docs/1.7.0/references/settings/#replica-node-level-soft-anti-affinity): When this setting is enabled, Longhorn schedules new replicas on nodes with existing healthy replicas of the same volume.

1. Disable [`Replica Disk Level Soft Anti-Affinity`](https://longhorn.io/docs/1.7.0/references/settings/#replica-disk-level-soft-anti-affinity): When this setting is disabled, Longhorn does not schedule new replicas on disks with existing healthy replicas of the same volume. Disabling this setting provides failure tolerance for disks in single-node clusters.

1. (Optional) [Create a new StorageClass](../advanced/storageclass.md#creating-a-storageclass) and specify the disk tags that must be matched during volume scheduling.

## Upgrades and Maintenance

Single-node clusters do not support [Live Migration](../vm/live-migration.md), so VMs become unavailable during cluster upgrades. Harvester forcibly shuts down all VMs before starting the upgrade process. You can configure Harvester to automatically restore running VMs using the `restoreVM` option of the [`upgrade-config`](./settings.md#upgrade-config) setting.

Enabling [Maintenance Mode](../host/host.md#node-maintenance) is also not possible because that operation relies on Live Migration functionality, and Harvester cannot place the only control plane in Maintenance Mode.
