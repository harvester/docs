---
sidebar_position: 3
sidebar_label: Glossary
title: "Glossary"
keywords:
- Harvester
- glossary
- terminology
- concepts
---

<head>
  <link rel="canonical" href="https://docs.harvesterhci.io/v1.7/getting-started/glossary"/>
</head>

## **cluster network**

Traffic-isolated forwarding path for transmission of network traffic in the Harvester cluster.

## **guest cluster** / **guest Kubernetes cluster**

Group of integrated Kubernetes nodes that run in virtual machines on top of a Harvester cluster. 

You can create RKE2 and K3s guest clusters using the Harvester and Rancher interfaces. Creating guest clusters involves pulling images from either the internet or a private registry.

Guest clusters form the main infrastructure for running container workloads. Certain versions of Harvester and Rancher allow you to deploy container workloads [directly to Harvester clusters](../rancher/rancher-integration.md#harvester-baremetal-container-workload-support-experimental) (with some limitations).

## **guest node** / **guest cluster node**

Kubernetes worker virtual machine that uses guest cluster resources to run container workloads.

Guest nodes are managed through a control plane that controls pod-related activity and maintains the desired cluster state.

## **Harvester cluster** 

Group of integrated physical servers (hosts) on which the Harvester hypervisor is installed. These servers collectively manage compute, memory, and storage resources to provide an environment for running virtual machines.

A three-node cluster is required to fully realize the multi-node features of Harvester, particularly high availability. Certain versions of Harvester allow you to create clusters with two management nodes and one [witness node](../advanced/witness.md) (and optionally, one or more worker nodes). You can also create [single-node clusters](../advanced/singlenodeclusters.md) that support most Harvester features (excluding high availability, multi-replica support, and live migration).

Harvester clusters can be imported into and managed by Rancher. Within the Rancher context, an imported Harvester cluster is known as a "managed cluster" or "downstream user cluster" (often abbreviated to "downstream cluster"). The Rancher term refers to any Kubernetes cluster that is connected to a Rancher server.

Certain versions of Harvester and Rancher allow you to deploy container workloads directly to Harvester clusters (with some limitations). When this [experimental feature](../rancher/rancher-integration.md#harvester-baremetal-container-workload-support-experimental) is enabled, container workloads seamlessly interact with virtual machine workloads.

## **Harvester hypervisor** 

Specialized operating system and [software stack](../index.md#harvester-architecture) that runs on a single physical server.

## **Harvester ISO**

Installation image that contains the core operating system components and all required container images, which are preloaded during installation.

## **Harvester node**

Physical server on which the Harvester hypervisor is installed. 

Each node that joins a Harvester cluster must be assigned a [role](../host/host.md#role-management) that determines the functions the node can perform within the cluster. All Harvester nodes process data but not all can store data.

## **Harvester Cloud Provider**

Component that enables a Rancher-managed Harvester cluster to function as a [native cloud backend for guest Kubernetes clusters](../rancher/cloud-provider.md). The Harvester Cloud Provider integrates the Kubernetes cloud controller manager (CCM) and container storage interface (CSI) driver, allowing guest clusters to dynamically request and manage Harvester-native resources (load balancer and storage) without manual intervention.

## **Harvester CSI Driver**

Driver that [provides a standard container storage interface (CSI) for guest Kubernetes clusters](../rancher/csi-driver.md), allowing container workloads to use the storage solution integrated with the underlying Harvester cluster. This component enables hotplugging of volumes to the virtual machines to provide native storage performance.

## **Harvester Node Driver**

Driver that Rancher uses to [provision virtual machines in a Harvester cluster](../rancher/node/node-driver.md), and to launch and manage guest Kubernetes clusters on top of those virtual machines.

## **live migration**

Process of [moving a running virtual machine to another node](../vm/live-migration.md) within the same Harvester cluster without interrupting the guest operating system and causing workload downtime. Live migration can occur only when the [prerequisites](../vm/live-migration.md#prerequisites) are met and when the affected virtual machines are [live-migratable](../vm/live-migration.md#live-migratable-virtual-machines).

## **mgmt**

Cluster network that is [automatically created](../networking/clusternetwork.md#built-in-cluster-network) during Harvester cluster deployment and is always enabled on all hosts. Harvester uses `mgmt` for intra-cluster communications and cluster management tasks.

## **net install ISO**

Installation image that contains only the [core Harvester operating system components](../install/net-install.md), allowing the installer to boot and then install the operating system on a disk. After installation is completed, the operating system pulls all required container images from the internet.

## **network configuration**

Definition of how a set of cluster nodes with uniform network specifications connects to a specific cluster network.

## **overlay network**

Virtual network representing a virtual layer 2 switch that [encapsulates and forwards traffic between virtual machines](../networking/harvester-network.md#overlay-network-experimental). Overlay networks support advanced software-defined networking (SDN) capabilities such as virtual private clouds (VPCs) and subnets for virtual machine workloads.

## **storage network**

Network for [isolating Longhorn replication traffic](../advanced/storagenetwork.md) from intra-cluster traffic on `mgmt` and other cluster-wide workloads.

## **VLAN trunk network**

Virtual network that provides a virtual machine with a single network interface that can carry traffic for [multiple, overlapping VLAN ID ranges](../networking/harvester-network.md#vlan-trunk-network) simultaneously. When a virtual machine is attached to a VLAN trunk network, the guest operating system and applications are allowed to send and receive packets tagged with any of the VLAN IDs within the specified range.

## **VM migration network**

Network for [isolating virtual machine migration traffic](../advanced/vm-migration-network.md) from intra-cluster traffic on `mgmt` and other cluster-wide workloads.

## **VM network**

Virtual network linked to a specific cluster network that enables communication between virtual machines and the external network.

## **witness node**

[Non-computing node](../advanced/witness.md) used solely to maintain cluster consensus. It ensures the system can reach a majority decision (quorum) on cluster updates even if a management node becomes unavailable or a network failure occurs.

Witness nodes do not run workloads and store data. Each Harvester cluster can have only one witness node.