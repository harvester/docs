---
id: requirements
sidebar_position: 1
sidebar_label: Hardware and Network Requirements
title: "Hardware and Network Requirements"
keywords:
- Installation Requirements
description: Outline the Harvester installation requirements
---

<head>
  <link rel="canonical" href="https://docs.harvesterhci.io/v1.8/install/requirements"/>
</head>

As an HCI solution on bare metal servers, there are minimum node hardware and network requirements for installing and running Harvester.

A three-node cluster is required to fully realize the multi-node features of Harvester. The first node that is added to the cluster is by default the management node. When the cluster has three or more nodes, the two nodes added after the first are automatically promoted to management nodes to form a high availability (HA) cluster.

Certain versions of Harvester support the deployment of [single-node clusters](https://docs.harvesterhci.io/v1.3/advanced/singlenodeclusters). Such clusters do not support high availability, multiple replicas, and live migration.

## Hardware Requirements

Harvester nodes have the following hardware requirements and recommendations for installation and testing.

| Hardware | Development/Testing | Production |
| :--- | :--- | :--- |
| CPU | ARM64 or x86_64 (with hardware-assisted virtualization); 8 cores minimum | ARM64 or x86_64 (with hardware-assisted virtualization); 16 cores minimum |
| Memory | 32 GB minimum | 64 GB minimum |
| Disk capacity	| 250 GB minimum (180 GB minimum for [witness nodes](../advanced/witness.md) or when using multiple disks) | 500 GB minimum, 1 TB or more recommended |
| Disk performance | 5,000+ random IOPS per disk (SSD/NVMe); management node storage must meet [etcd](https://support.scc.suse.com/s/kb/360045276411) speed requirements. Only local disks and hardware RAID are supported. | 5,000+ random IOPS per disk (SSD/NVMe); management node storage must meet [etcd](https://support.scc.suse.com/s/kb/360045276411) speed requirements. Only local disks and hardware RAID are supported. |
| Network card count | Management cluster network: 1 NIC required, 2 NICs recommended; VM workload network: 1 NIC required, at least 2 NICs recommended (does not apply to the [witness node](../advanced/witness.md)) | Management cluster network: 1 NIC required, 2 NICs recommended; VM workload network: 1 NIC required, at least 2 NICs recommended (does not apply to the [witness node](../advanced/witness.md)) |
| Network card speed | 1 Gbps Ethernet minimum | 10 Gbps Ethernet minimum |
| Network switch | Port trunking for VLAN support | Port trunking for VLAN support |

:::info important

- Support for legacy BIOS booting is deprecated in v1.7.0 and will be removed in a later release. Existing Harvester clusters that use this boot mode will continue to function, but upgrading to later versions may require re-installation in UEFI mode. Starting with Harvester v1.8.0, new installations are only possible on UEFI systems.
- Mixed-architecture clusters are not supported. Deploy separate clusters to avoid unexpected system behavior.
- For best results, use [YES-certified hardware](https://www.suse.com/yesCertified/home) for SUSE Linux Micro 6.2. Harvester is built on SUSE Linux Enterprise technology and YES-certified hardware has additional validation of driver and system board compatibility. Laptops and nested virtualization are not supported.
- Nested virtualization is not supported on virtual machines running on Harvester.
- Each node must have a unique `product_uuid` (fetched from `/sys/class/dmi/id/product_uuid`) to prevent errors from occurring during VM live migration and other operations. For more information, see [Issue #4025](https://github.com/harvester/harvester/issues/4025).
- Harvester has a [built-in management cluster network](../networking/clusternetwork.md#built-in-cluster-network) (`mgmt`). To achieve high availability and the best performance in production environments, use at least two NICs in each node to set up a bonded NIC for the management network (see step 6 in [ISO Installation](../install/iso-install.md#installation-steps)). You can also create [custom cluster networks](../networking/clusternetwork.md#custom-cluster-network) for VM workloads. Each custom cluster network requires at least two additional NICs to set up a bonded NIC in every involved node of the Harvester cluster. The [witness node](../advanced/witness.md) does not require additional NICs. For more information, see [Cluster Network](../networking/clusternetwork.md#concepts).
- During testing, you can use only one NIC for the [built-in management cluster network](../networking/clusternetwork.md#built-in-cluster-network) (`mgmt`), and for testing the [VM network](../networking/harvester-network.md#create-a-vm-network) that is also carried by `mgmt`. High availability and optimal performance are not guaranteed.
- If the disk only meets the minimum required capacity, you may encounter issues related to the [free system partition space requirement](../upgrade/automatic.md#free-system-partition-space-requirement) during upgrades.
:::

### CPU Specifications

[Live Migration](../vm/live-migration.md) functions correctly only if the CPUs of all physical servers in the [Harvester cluster](../getting-started/glossary.md#harvester-cluster) have the same specifications. This requirement applies to all operations that rely on Live Migration functionality, such as automatic VM migration when [Maintenance Mode](../host/host.md#node-maintenance) is enabled.

Newer CPUs (even those from the same vendor, generation, and family) can have varying capabilities that may be exposed to VM operating systems. To ensure VM stability, Live Migration checks if the CPU capabilities are consistent, and blocks migration attempts when the source and destination are incompatible. 

When creating clusters, adding more hosts to a cluster, and replacing hosts, always use CPUs with the same specifications to prevent operational constraints.

## Network Requirements

Harvester nodes have the following network requirements for installation.

### Port Requirements for Harvester Nodes

Harvester nodes require the following port connections or inbound rules. Typically, all outbound traffic is allowed.

Ports that bind only to `127.0.0.1` are accessible from localhost only and do not require inbound firewall rules; they are included here for completeness.

#### Control-plane Node

| Protocol | Port | Bind Address | Source | Description |
|:---------|:-----|:-------------|:-------|:------------|
| TCP | 22 | `0.0.0.0` | All | SSH |
| TCP | 80 | `0.0.0.0` | All | Harvester UI HTTP (nginx proxy) |
| TCP | 443 | `0.0.0.0` | All | Harvester UI HTTPS (nginx proxy) |
| TCP | 2112 | `0.0.0.0` | All | kube-vip Prometheus metrics |
| TCP | 2379 | `127.0.0.1`, node IP | Harvester management nodes | etcd client port |
| TCP | 2380 | `127.0.0.1`, node IP | Harvester management nodes | etcd peer port |
| TCP | 2381 | `127.0.0.1` only | localhost | etcd metrics/health |
| TCP | 2382 | `127.0.0.1` only | localhost | etcd learner client (HTTP) |
| TCP | 6443 | `0.0.0.0` | All | Kubernetes API server |
| TCP | 9091 | `0.0.0.0` | All | calico-node metrics (Prometheus) |
| TCP | 9099 | `127.0.0.1` only | localhost | Canal/CNI health check |
| TCP | 9345 | `0.0.0.0` | Harvester nodes | RKE2 supervisor API |
| TCP | 9796 | `0.0.0.0` | All | Prometheus node-exporter |
| TCP | 10010 | `127.0.0.1` only | localhost | containerd gRPC |
| TCP | 10248 | `127.0.0.1` only | localhost | kubelet healthz |
| TCP | 10249 | `127.0.0.1` only | localhost | kube-proxy metrics |
| TCP | 10250 | `0.0.0.0` | Kubernetes components | kubelet API |
| TCP | 10256 | `127.0.0.1` only | localhost | kube-proxy health |
| TCP | 10257 | `127.0.0.1` only | localhost | kube-controller-manager |
| TCP | 10258 | `127.0.0.1` only | localhost | cloud-controller-manager |
| TCP | 10259 | `127.0.0.1` only | localhost | kube-scheduler |
| TCP | 30000-32767 | `0.0.0.0` | All | NodePort services (TCP) |
| UDP | 8472 | `0.0.0.0` | Harvester nodes | VXLAN (Flannel/Canal) |
| UDP | 30000-32767 | `0.0.0.0` | All | NodePort services (UDP) |

#### Worker Node

| Protocol | Port | Bind Address | Source | Description |
|:---------|:-----|:-------------|:-------|:------------|
| TCP | 22 | `0.0.0.0` | All | SSH |
| TCP | 80 | `0.0.0.0` | All | Harvester UI HTTP (nginx proxy) |
| TCP | 443 | `0.0.0.0` | All | Harvester UI HTTPS (nginx proxy) |
| TCP | 6443 | `127.0.0.1`, `[::1]` | localhost | Kubernetes API server (RKE2 agent proxy) |
| TCP | 6444 | `127.0.0.1`, `[::1]` | localhost | RKE2 agent API proxy |
| TCP | 9091 | `0.0.0.0` | All | calico-node metrics (Prometheus) |
| TCP | 9099 | `127.0.0.1` only | localhost | Canal/CNI health check |
| TCP | 9796 | `0.0.0.0` | All | Prometheus node-exporter |
| TCP | 10010 | `127.0.0.1` only | localhost | containerd gRPC |
| TCP | 10248 | `127.0.0.1` only | localhost | kubelet healthz |
| TCP | 10249 | `127.0.0.1` only | localhost | kube-proxy metrics |
| TCP | 10250 | `0.0.0.0` | Kubernetes components | kubelet API |
| TCP | 10256 | `127.0.0.1` only | localhost | kube-proxy health |
| TCP | 30000-32767 | `0.0.0.0` | All | NodePort services (TCP) |
| UDP | 8472 | `0.0.0.0` | Harvester nodes | VXLAN (Flannel/Canal) |
| UDP | 30000-32767 | `0.0.0.0` | All | NodePort services (UDP) |

#### Witness Node

| Protocol | Port | Bind Address | Source | Description |
|:---------|:-----|:-------------|:-------|:------------|
| TCP | 22 | `0.0.0.0` | All | SSH |
| TCP | 2379 | `127.0.0.1`, node IP | Harvester management nodes | etcd client port |
| TCP | 2380 | `127.0.0.1`, node IP | Harvester management nodes | etcd peer port |
| TCP | 2381 | `127.0.0.1` only | localhost | etcd metrics/health |
| TCP | 2382 | `127.0.0.1` only | localhost | etcd learner client (HTTP) |
| TCP | 6443 | `127.0.0.1` only | localhost | Kubernetes API server (RKE2 agent proxy) |
| TCP | 6444 | `127.0.0.1` only | localhost | RKE2 agent API proxy |
| TCP | 9091 | `0.0.0.0` | All | calico-node metrics (Prometheus) |
| TCP | 9099 | `127.0.0.1` only | localhost | Canal/CNI health check |
| TCP | 9345 | `0.0.0.0` | Harvester nodes | RKE2 supervisor API |
| TCP | 9796 | `0.0.0.0` | All | Prometheus node-exporter |
| TCP | 10010 | `127.0.0.1` only | localhost | containerd gRPC |
| TCP | 10248 | `127.0.0.1` only | localhost | kubelet healthz |
| TCP | 10249 | `127.0.0.1` only | localhost | kube-proxy metrics |
| TCP | 10250 | `0.0.0.0` | Kubernetes components | kubelet API |
| TCP | 10256 | `127.0.0.1` only | localhost | kube-proxy health |
| TCP | 10258 | `127.0.0.1` only | localhost | cloud-controller-manager |
| UDP | 8472 | `0.0.0.0` | Harvester nodes | VXLAN (Flannel/Canal) |

### Port Requirements for Addons

The following tables list the additional ports opened by optional Harvester addons on each node role, compared to the baseline with no addons enabled.

#### kubeovn-operator (Experimental)

**Control-plane Node**

| Protocol | Port | Bind Address | Source | Description |
|:---------|:-----|:-------------|:-------|:------------|
| TCP | 6641 | node IP | Harvester nodes | OVN Northbound DB |
| TCP | 6642 | node IP | Harvester nodes | OVN Southbound DB |
| TCP | 6643 | node IP | Harvester nodes | OVN JSON-RPC |
| TCP | 6644 | node IP | Harvester nodes | OVN JSON-RPC |
| TCP | 10660 | node IP | Harvester nodes | kube-ovn-controller metrics |
| TCP | 10665 | node IP | Harvester nodes | kube-ovn-daemon metrics/API |
| UDP | 4789 | `0.0.0.0` | Harvester nodes | VXLAN tunnel (Kube-OVN overlay) |

**Worker Node**

| Protocol | Port | Bind Address | Source | Description |
|:---------|:-----|:-------------|:-------|:------------|
| TCP | 8080 | node IP | Harvester nodes | kube-ovn-webhook HTTP |
| TCP | 8443 | `0.0.0.0` | All | kube-ovn-webhook HTTPS |
| TCP | 10660 | node IP | Harvester nodes | kube-ovn-controller metrics |
| TCP | 10665 | node IP | Harvester nodes | kube-ovn-daemon metrics/API |
| UDP | 4789 | `0.0.0.0` | Harvester nodes | VXLAN tunnel (Kube-OVN overlay) |

**Witness Node**

| Protocol | Port | Bind Address | Source | Description |
|:---------|:-----|:-------------|:-------|:------------|
| TCP | 10665 | node IP | Harvester nodes | kube-ovn-daemon metrics/API |
| UDP | 4789 | `0.0.0.0` | Harvester nodes | VXLAN tunnel (Kube-OVN overlay) |


### Port Requirements for Integrating Harvester with Rancher

If you want to [integrate Harvester with Rancher](../rancher/rancher-integration.md), you need to make sure that all Harvester nodes can connect to TCP port **443** of the Rancher load balancer.

When provisioning VMs with Kubernetes clusters from Rancher into Harvester, you need to be able to connect to TCP port **443** of the Rancher load balancer. Otherwise, the cluster won't be manageable by Rancher. For more information, refer to [Rancher Architecture](https://ranchermanager.docs.rancher.com/v2.7/reference-guides/rancher-manager-architecture/communicating-with-downstream-user-clusters).

### Port Requirements for K3s or RKE2 Clusters

For the port requirements for guest clusters deployed inside Harvester VMs, refer to the following links:

- [K3s Networking](https://rancher.com/docs/k3s/latest/en/installation/installation-requirements/#networking)
- [RKE2 Networking](https://docs.rke2.io/install/requirements#networking)

## Time Requirements

A reliable Network Time Protocol (NTP) server is critical for maintaining the correct system time across all nodes in a Kubernetes cluster, especially when running Harvester. Kubernetes relies on etcd, a distributed key-value store, which requires precise time synchronization to ensure data consistency and prevent issues with leader election, log replication, and cluster stability.

Ensuring accurate and consistent time across the cluster is essential for reliability, security, and overall system integrity.
