---
sidebar_position: 1
sidebar_label: 要求
title: ""
keywords:
- 安装要求
Description: Harvester 安装要求概述
---
# 要求
Harvester 是裸机服务器上的 HCI 解决方案，以下是 Harvester 安装的最低要求。

## 硬件要求
硬件需要满足以下要求，才可以启动和运行 Harvester：

| 类型 | 要求 |
|:-----------------|:------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------|
| CPU | 仅支持 x86_64。需要硬件辅助虚拟化。最少需要 8 核处理器，建议使用 16 核处理器。 |
| 内存 | 32 GB（至少）。建议使用 64 GB 或以上的内存。 |
| 磁盘容量 | 140 GB（至少）用于测试，建议在生产中使用 500 GB 或以上的磁盘。 |
| 磁盘性能 | 每个磁盘 5,000+ 随机 IOPS (SSD/NVMe)。管理节点（前 3 个节点）必须[对 etcd 而言足够快](https://www.ibm.com/cloud/blog/using-fio-to-tell-whether-your-storage-is-fast-enough-for-etcd)。 |
| 网卡 | 1 Gbps 以太网（至少）用于测试，建议在生产中使用 10 Gbps 或以上的以太网。 |
| 网络交换机 | VLAN 支持所需的端口中继。 |

建议使用服务器级硬件以获得最佳效果。笔记本电脑和嵌套虚拟化不受官方支持。

## 网络

### Harvester 主机入站规则

| 协议 | 端口 | 源 | 描述 |
|:----------|:---------------------------|:-----------------------------------------|:----------------------------------------|
| TCP | 2379 | Harvester 管理节点 | etcd 客户端端口 |
| TCP | 2381 | Harvester 管理节点 | etcd 健康检查 |
| TCP | 2380 | Harvester 管理节点 | etcd 对等端口 |
| TCP | 10010 | Harvester 管理和计算节点 | Containerd |
| TCP | 6443 | Harvester 管理节点 | Kubernetes API |
| TCP | 9345 | Harvester 管理节点 | Kubernetes API |
| TCP | 10252 | Harvester 管理节点 | Kube-controller-manager 健康检查 |
| TCP | 10257 | Harvester 管理节点 | Kube-controller-manager 安全端口 |
| TCP | 10251 | Harvester 管理节点 | Kube-scheduler 健康检查 |
| TCP | 10259 | Harvester 管理节点 | kube-scheduler 安全端口 |
| TCP | 10250 | Harvester 管理和计算节点 | Kubelet |
| TCP | 10256 | Harvester 管理和计算节点 | Kube-proxy 健康检查 |
| TCP | 10258 | Harvester 管理节点 | Cloud-controller-manager |
| TCP | 9091 | Harvester 管理和计算节点 | Canal calico-node felix |
| TCP | 9099 | Harvester 管理和计算节点 | Canal CNI 健康检查 |
| UDP | 8472 | Harvester 管理和计算节点 | 使用 VxLAN 的 Canal CNI |
| TCP | 2112 | Harvester 管理节点 | Kube-vip |
| TCP | 6444 | Harvester 管理和计算节点 | RKE2 Agent |
| TCP | 6060 | Harvester 管理和计算节点 | Node-disk-manager |
| TCP | 10246/10247/10248/10249 | Harvester 管理和计算节点 | Nginx worker 进程 |
| TCP | 8181 | Harvester 管理和计算节点 | Nginx-ingress-controller |
| TCP | 8444 | Harvester 管理和计算节点 | Nginx-ingress-controller |
| TCP | 10245 | Harvester 管理和计算节点 | Nginx-ingress-controller |
| TCP | 80 | Harvester 管理和计算节点 | Nginx |
| TCP | 9796 | Harvester 管理和计算节点 | Node-exporter |
| TCP | 30000-32767 | Harvester 管理和计算节点 | NodePort 端口范围 |
| TCP | 22 | Harvester 管理和计算节点 | sshd |
| UDP | 68 | Harvester 管理和计算节点 | Wicked |
| TCP | 3260 | Harvester 管理和计算节点 | iscsid |

所有出站流量通常都是允许的。

### 将 Harvester 与 Rancher 集成

如果你想[将 Harvester 与 Rancher 集成](../rancher/rancher-integration.md)，你需要确保所有 Harvester 节点都可以连接到 Rancher 负载均衡器的 TCP 端口 443。

从 Rancher 配置到 Harvester 的 Kubernetes 集群的虚拟机也需要能够连接到 Rancher 负载均衡器的 TCP 端口 443，否则 Rancher 将无法管理集群。如需更多信息，请参阅 [Rancher 架构](https://rancher.com/docs/rancher/v2.6/en/overview/architecture/)。

#### Guest 集群
对于部署在 Harvester 虚拟机中的 Guest 集群的端口要求，请参阅以下链接：

- K3s: [https://rancher.com/docs/k3s/latest/en/installation/installation-requirements/#networking](https://rancher.com/docs/k3s/latest/en/installation/installation-requirements/#networking)
- RKE: [https://rancher.com/docs/rke/latest/en/os/#ports](https://rancher.com/docs/rke/latest/en/os/#ports)
- RKE2: [https://docs.rke2.io/install/requirements/#networking](https://docs.rke2.io/install/requirements/#networking)

