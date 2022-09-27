---
sidebar_position: 1
sidebar_label: Requirements
title: ""
keywords:
- Installation Requirements
Description: Outline the Harvester installation requirements
---
# Requirements
As an HCI solution on bare metal servers, Harvester has some minimum requirements as outlined below.

## Hardware Requirements
To get the Harvester server up and running the following minimum hardware is required:
  
| Type             | Requirements                                                                                                                                                                                          |
|:-----------------|:------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------|
| CPU              | x86_64 only. Hardware-assisted virtualization is required. 8-core processor minimum; 16-core or above preferred                                                                                       |
| Memory           | 32 GB minimum, 64 GB or above preferred                                                                                                                                                               |
| Disk Capacity    | 140 GB minimum for testing, 500 GB or above preferred for production                                                                                                                                  |
| Disk Performance | 5,000+ random IOPS per disk(SSD/NVMe). Management nodes (first 3 nodes) must be [fast enough for Etcd](https://www.ibm.com/cloud/blog/using-fio-to-tell-whether-your-storage-is-fast-enough-for-etcd) |
| Network Card     | 1 Gbps Ethernet minimum for testing, 10Gbps Ethernet recommended for production                                                                                                                       |
| Network Switch   | Trunking of ports required for VLAN support                                                                                                                                                           |
  
  We recommend server-class hardware for best results. Laptops and nested virtualization are not officially supported.

## Networking

### Harvester Hosts Inbound Rules

| Protocol  |   Port	                 |  Source	                                |   Description                           |
|:----------|:---------------------------|:-----------------------------------------|:----------------------------------------|
| TCP	    |   2379	                 |  Harvester management nodes	            |   Etcd client port                      |
| TCP       | 	2381                     | 	Harvester management nodes              | 	Etcd health checks                    |
| TCP       | 	2380                     | 	Harvester management nodes              | 	Etcd peer port                        |
| TCP       | 	10010                    | 	Harvester management and compute nodes  | 	Containerd                            |
| TCP       | 	6443                     | 	Harvester management nodes              | 	Kubernetes API                        |
| TCP       | 	9345                     | 	Harvester management nodes              | 	Kubernetes API                        |
| TCP       | 	10252                    | 	Harvester management nodes              | 	Kube-controller-manager health checks |
| TCP       | 	10257                    | 	Harvester management nodes              | 	Kube-controller-manager secure port   |
| TCP       | 	10251                    | 	Harvester management nodes              | 	Kube-scheduler health checks          |
| TCP       | 	10259                    | 	Harvester management nodes              | 	Kube-scheduler secure port            |
| TCP       | 	10250                    | 	Harvester management and compute nodes  | 	Kubelet                               |
| TCP       | 	10256                    | 	Harvester management and compute nodes  | 	Kube-proxy health checks              |
| TCP       | 	10258                    | 	Harvester management nodes              | 	Cloud-controller-manager              |
| TCP       | 	9091                     | 	Harvester management and compute nodes  | 	Canal calico-node felix               |
| TCP       | 	9099                     | 	Harvester management and compute nodes  | 	Canal CNI health checks               |
| UDP       | 	8472                     | 	Harvester management and compute nodes  | 	Canal CNI with VxLAN                  |
| TCP       | 	2112                     | 	Harvester management nodes              | 	Kube-vip                              |
| TCP       | 	6444                     | 	Harvester management and compute nodes  | 	RKE2 agent                            |
| TCP       | 	6060                     | 	Harvester management and compute nodes  | 	Node-disk-manager                     |
| TCP       | 	10246/10247/10248/10249	 |  Harvester management and compute nodes	|   Nginx worker process                  |
| TCP       | 	8181                     | 	Harvester management and compute nodes  | 	Nginx-ingress-controller              |
| TCP       | 	8444                     | 	Harvester management and compute nodes  | 	Nginx-ingress-controller              |
| TCP       | 	10245                    | 	Harvester management and compute nodes  | 	Nginx-ingress-controller              |
| TCP       | 	80                       | 	Harvester management and compute nodes  | 	Nginx                                 |
| TCP       | 	9796                     | 	Harvester management and compute nodes  | 	Node-exporter                         |
| TCP       | 	30000-32767	             |  Harvester management and compute nodes  | 	NodePort port range                   |
| TCP       | 	22                       | 	Harvester management and compute nodes  | 	sshd                                  |
| UDP       | 	68                       | 	Harvester management and compute nodes  | 	Wicked                                |
| TCP       | 	3260                     | 	Harvester management and compute nodes	|   iscsid                                |

Typically, all outbound traffic will be allowed.

### Integrating Harvester with Rancher

If you want to [integrate Harvester with Rancher](../rancher/rancher-integration.md), you need to make sure, that all Harvester nodes can connect to TCP port 443 of the Rancher load balancer.

The VMs of Kubernetes clusters, that are provisioned from Rancher into Harvester, also need to be able to connect to TCP port 443 of the Rancher load balancer. Otherwise the cluster won't be manageable by Rancher. For more information see also [Rancher Architecture](https://rancher.com/docs/rancher/v2.6/en/overview/architecture/).

#### Guest clusters
As for the port requirements for the guest clusters deployed inside Harvester virtual machines, refer to the following links.

- K3s: [https://rancher.com/docs/k3s/latest/en/installation/installation-requirements/#networking](https://rancher.com/docs/k3s/latest/en/installation/installation-requirements/#networking)
- RKE: [https://rancher.com/docs/rke/latest/en/os/#ports](https://rancher.com/docs/rke/latest/en/os/#ports)
- RKE2: [https://docs.rke2.io/install/requirements/#networking](https://docs.rke2.io/install/requirements/#networking)

