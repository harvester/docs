---
title: Glossary
sidebar_label: Glossary
keywords:
- Harvester
- glossary
- terminology
---

<head>
  <link rel="canonical" href="https://docs.harvesterhci.io/v1.3/glossary"/>
</head>

## **guest cluster** / **guest Kubernetes cluster**

Group of integrated Kubernetes worker machines that are running in a VM that is part of a Harvester cluster. Guest clusters form the underlying infrastructure for running containerized workloads.

Creating guest clusters involves pulling images from either the internet or a private registry. You can create guest clusters using both the Harvester UI and the Rancher UI.

## **guest cluster node** / **guest node**

Kubernetes worker machine that uses guest cluster resources to run workloads. 

Guest nodes are managed through a control plane that controls pod-related activity and maintains the desired cluster state.

## **Harvester cluster** 

Group of integrated physical servers (hosts) on which the Harvester hypervisor is installed. These servers pool compute and storage resources to provide an environment for running virtual machines that can host guest clusters.

A three-node cluster is required to fully realize the multi-node features of Harvester, particularly high availability. Certain versions of Harvester allow you to create clusters with two management nodes and one [witness node](/advanced/witness.md) (and optionally, one or more worker nodes). You can also create [single-node clusters](./advanced/singlenodeclusters.md) that support most Harvester features (excluding high availability, multi-replica support, and live migration).

Harvester clusters can be imported into and managed by Rancher. Within the Rancher context, an imported Harvester cluster is known as a "downstream user cluster" (often abbreviated to "downstream cluster"). The Rancher term refers to any Kubernetes cluster that is connected to a Rancher Management Server.

## **Harvester hypervisor** 

Specialized operating system and [software stack](./#harvester-architecture) that runs on a single physical server.

## **Harvester node**

Physical server on which the Harvester hypervisor is installed. 

Each node that joins a Harvester cluster must be assigned a [role](https://docs.harvesterhci.io/v1.3/host/#role-management) that determines the functions the node can perform within the cluster. All Harvester nodes process data but not all can store data.

## **Harvester Node Driver**

Driver that Rancher uses to provision virtual machines in a Harvester cluster, and to launch and manage guest Kubernetes clusters in those VMs.