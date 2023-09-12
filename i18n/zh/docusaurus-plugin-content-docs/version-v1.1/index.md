---
sidebar_position: 1
sidebar_label: Harvester 介绍
slug: /
title: "Harvester 介绍"
keywords:
  - Harvester
  - harvester
  - Rancher
  - rancher
  - Harvester 介绍
Description: Harvester 是基于 Kubernetes 构建的开源超融合基础架构 (HCI) 软件。它是 vSphere 和 Nutanix 的开源替代方案。
---
:::info
我们会定期更新中文文档，如需查看最新的文档内容，请访问[英文文档](https://docs.harvesterhci.io/)。
:::

[Harvester](https://harvesterhci.io/) 是一款基于 Kubernetes 构建的现代、开放、可互操作的[超融合基础架构（HCI）](https://en.wikipedia.org/wiki/Hyper-converged_infrastructure)产品。它是一个开源替代方案，专为寻求[云原生](https://about.gitlab.com/topics/cloud-native/) HCI 解决方案的运维人员而设计。Harvester 运行在裸金属服务器上，提供集成的虚拟化和分布式存储功能。除了传统的虚拟机之外，Harvester 还通过与 [Rancher](https://ranchermanager.docs.rancher.com/integrations-in-rancher/harvester) 集成来支持容器化环境。它可以统一传统的虚拟化基础架构，同时支持在中心到边缘的位置采用容器。

## Harvester 架构

Harvester 架构由尖端的开源技术组成：
- **Linux 操作系统**。[Elemental for SLE-Micro 5.3](https://github.com/rancher/elemental-toolkit) 是 Harvester 的核心，它是一个不可变的 Linux 发行版，旨在尽量减少 Kubernetes 集群中节点的操作系统维护工作。
- **建立在 Kubernetes 之上**。[Kubernetes](https://kubernetes.io/) 已成为主流的基础架构语言，而 Harvester 是包含 Kubernetes 的 HCI 解决方案。
- **使用 Kubevirt 进行虚拟化管理**。[Kubevirt](https://kubevirt.io/) 在 Kubernetes 之上使用 KVM 来提供虚拟化管理。
- **使用 Longhorn 进行存储管理**。[Longhorn](https://longhorn.io/) 提供分布式块存储和分层。
- **通过 Grafana 和 Prometheus 进行观察**。[Grafana](https://grafana.com/) 和 [Prometheus](https://prometheus.io/) 提供强大的监控和记录功能。作为可启动的设备镜像提供，

![](/img/v1.1/architecture.svg)

## Harvester 功能

Harvester 是一个企业就绪、易于使用的基础设施平台，它使用本地、直接连接的存储而不是复杂的外部 SAN。它使用 Kubernetes API 作为跨容器和虚拟机工作负载的统一自动化语言。Harvester 的一些主要功能包括：
- **易于上手**。由于 Harvester 作为可启动的设备镜像提供，因此你可以使用 [ISO 镜像](https://github.com/harvester/harvester/releases)将其直接安装在裸机服务器上，也可以使用 [iPXE](./install/pxe-boot-install.md) 脚本进行自动安装。
- **虚拟机生命周期管理**。轻松创建、编辑、克隆和删除虚拟机，包括 SSH-Key 注入、cloud-init 配置、以及图形和串行端口控制台。
- **VM 热迁移**。将虚拟机迁移到不同的主机或节点，没有停机时间。
- **虚拟机备份、快照和恢复**。从 NFS、S3 服务器或 NAS 设备备份你的虚拟机，然后使用备份来恢复故障的虚拟机，或在其他集群上创建新的虚拟机。
- **存储管理**。Harvester 支持分布式块存储和分层。卷代表存储，你可以轻松创建、编辑、克隆或导出卷。
- **网络管理**。支持使用虚拟 IP (VIP) 和多个网卡 (NIC)。如果你的 VM 需要连接到外部网络，请创建 VLAN 或 Untagged 网络。
- **与 Rancher 集成**。通过 Rancher 的**虚拟化管理**页面直接在 Rancher 中访问 Harvester，并管理你的虚拟机工作负载和 Kubernetes 集群。

## Harvester 仪表板

Harvester 提供了一个功能强大且易于使用的网页仪表板，用于可视化和管理你的基础设施。安装 Harvester 后，你可以从节点的终端访问 Harvester 仪表板的 IP 地址。

<div class="text-center">
   <iframe width="99%" height="450" src="https://www.youtube.com/embed/Ngsk7m6NYf4" title="YouTube video player" frameborder="0" allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture" allowfullscreen></iframe>
</div>
