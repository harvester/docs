---
sidebar_position: 1
sidebar_label: 硬件和网络要求
title: "硬件和网络要求"
keywords:
- 安装要求
Description: Harvester 安装要求概述
---

Harvester 是运行在裸机服务器上的 HCI 解决方案，要正常运行和安装 Harvester，节点硬件和网络需要满足最低要求。

## 硬件要求

要进行安装和测试，Harvester 节点硬件的要求和推荐设置如下：

| 类型 | 要求和推荐 |
|:-----------------|:------------------------------------------------------------------------------------------------------------------------------------------|
| CPU | 仅支持 x86_64。需要硬件辅助虚拟化。8 核（至少）用于测试；生产中需要 16 核或以上 |
| 内存 | 32 GB（至少）用于测试；生产中需要 64 GB 或以上 |
| 磁盘容量 | 250 GB（至少）用于测试（使用多个磁盘时至少 180 GB）；生产中需要 500 GB 或以上 |
| 磁盘性能 | 每个磁盘 5,000+ 随机 IOPS (SSD/NVMe)。管理节点（前 3 个节点）必须[对 etcd 而言足够快](https://www.suse.com/support/kb/doc/?id=000020100)。 |
| 网卡 | 1 Gbps 以太网（至少）用于测试；生产中需要使用 10 Gbps 或以上的以太网 |
| 网络交换机 | VLAN 支持所需的端口中继。 |

:::info

要充分发挥 Harvester 的多节点特性，你需要一个三节点集群。

- 第一个节点默认为集群的管理节点。
- 当节点数量大于等于三个时，先添加的另外两个节点会自动升级为管理节点，从而形成一个高可用 (HA) 集群。
- 建议使用服务器级硬件以获得最佳效果。笔记本电脑和嵌套虚拟化不受官方支持。
- Linux 中从 `/sys/class/dmi/id/product_uuid` 获取的 `product_uuid` 必须在每个节点中是唯一的。否则，虚拟机热迁移等功能将受到影响。有关详细信息，请参阅 [#4025](https://github.com/harvester/harvester/issues/4025)。

:::

## 网络要求

Harvester 节点具有以下网络要求。

### Harvester 节点的端口要求

Harvester 节点需要以下端口连接或入站规则。所有出站流量通常都是允许的。

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

### 将 Harvester 与 Rancher 集成的端口要求

如果你想[将 Harvester 与 Rancher 集成](../rancher/rancher-integration.md)，你需要确保所有 Harvester 节点都可以连接到 Rancher 负载均衡器的 TCP 端口 **443**。

使用 Rancher 将 Kubernetes 集群虚拟机配置到 Harvester 时，你需要能够连接到 Rancher 负载均衡器的 TCP 端口 **443**，否则 Rancher 将无法管理集群。有关更多信息，请参阅 [Rancher 架构](https://ranchermanager.docs.rancher.com/v2.7/reference-guides/rancher-manager-architecture/communicating-with-downstream-user-clusters)。

### K3s 或 RKE/RKE2 集群的端口要求

对于部署在 Harvester 虚拟机中的 Guest 集群的端口要求，请参阅以下链接：

- [K3s 网络](https://rancher.com/docs/k3s/latest/en/installation/installation-requirements/#networking)
- [RKE 端口](https://rancher.com/docs/rke/latest/en/os/#ports)
- [RKE2 网络](https://docs.rke2.io/install/requirements#networking)
