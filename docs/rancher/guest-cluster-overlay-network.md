---
sidebar_position: 11
sidebar_label: Guest Cluster using Overlay Network
title: "Guest Cluster using Overlay Network"
keywords:
  - Harvester
  - Rancher
  - KubeOVN
---

<head>
  <link rel="canonical" href="https://docs.harvesterhci.io/v1.9/rancher/guest-cluster-overlay-network"/>
</head>

## Provisioning Downstream Kubernetes Clusters on Harvester Using Rancher and Kube-OVN Networking

### Introduction

Rancher provides centralized management for Kubernetes clusters across multiple environments. When integrated with Harvester, Rancher can provision guest Kubernetes clusters directly on virtual machine infrastructure managed by Harvester.

Using the Harvester Node Driver, Rancher automatically creates virtual machines that serve as control plane and worker nodes. This simplifies cluster deployment and lifecycle management by providing a single interface for infrastructure and Kubernetes operations.

While guest clusters can use traditional virtual machine networking, they can also leverage Kube-OVN overlay or underlay networking to provide a flexible and Kubernetes-native networking model for workloads.

### Guest Clusters from KubeOVN Underlay Network

Deploying guest clusters on Kube-OVN Pure Underlay Networks is functionally similar to using traditional VM VLAN networks, but with the added advantages of Kube-OVN features including Network Policies and tenant-isolated VPCs.

Setup the underlay infrastructure [Create an underlay network](../networking/kubeovn-pureunderlay.md#underlay-configuration) to create guest clusters VMs.

### Guest Clusters from KubeOVN Overlay Network

TThis requires configuring a VPC NAT Gateway to provide inbound and outbound connectivity for the VM nodes through DNAT and SNAT.

Setup the overlay infrastructure [Create a VPC NAT Gateway](../networking/kubeovn-vpcnatgateway.md#kubeovn-as-secondary-cni) to create guest clusters VMs.

#### Architecture

* Harvester provides the virtual machine infrastructure for Kubernetes control plane and worker nodes.
* Rancher provisions and manages the lifecycle of the guest cluster.
* Kube-OVN provides networking within the guest cluster using overlay tunnels between Kubernetes nodes.
* Pod communication is encapsulated and transported across the overlay network connecting the Kubernetes nodes.

#### Benefits of Using Kube-OVN overlay network

Kube-OVN overlay networking enables downstream Kubernetes clusters to manage pod networking independently of the underlying Harvester infrastructure network. This simplifies cluster deployment, reduces dependence on physical network configuration, allows clusters to scale without additional VLAN planning, and provides a consistent networking model across environments.

### Provisioning Steps

#### Importing Harvester into Rancher

Harvester clusters are imported through Rancher's Virtualization Management interface.

After importing:

- Rancher recognizes the cluster as a Harvester provider.
- Virtual machine resources become available through Rancher.
- Harvester can be selected as an infrastructure provider when creating downstream clusters.

For detailed import procedures, refer to: [Harvester Virtualization Management](./virtualization-management.md#importing-harvester-cluster)

#### Provisioning a Downstream Kubernetes Cluster

Rancher uses the Harvester Node Driver to automatically provision the required virtual machines and bootstrap Kubernetes on them.

For detailed downstream cluster create procedures, refer to: [Harvester Node Driver](./node/rke2-cluster.md)

- Under the Network Name use KubeOVN's overlay or underlay network

![](/img/v1.9/rancher/gc-overlayvmnetwork.png)

![](/img/v1.9/rancher/gc-overlayvm.png)
