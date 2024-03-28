---
sidebar_position: 4
sidebar_label: 负载均衡器
title: "负载均衡器"
keywords:
- 负载均衡器
---
_从 v1.2.0 起可用_

Harvester 负载均衡器 (LB) 是内置的四层负载均衡器，可以在 Harvester 虚拟机 (VM) 或 Guest Kubernetes 集群上部署的工作负载之间分配传入流量。

## 虚拟机负载均衡器

### 功能
Harvester VM 负载均衡器支持以下功能：

- **地址分配**：从 DHCP 服务器或预定义的 IP 池中获取 LB IP 地址。
- **协议支持**：支持使用 TCP 和 UDP 协议进行负载均衡。
- **多个监听器**：创建多个监听器来处理不同端口或其他协议的传入流量。
- **标签选择器**：LB 使用标签选择器来匹配后端服务器。因此，你需要为要添加到负载均衡器的后端虚拟机配置相应的标签。
- **运行状况检查**：仅将流量发送到运行状况良好的后端实例。

### 限制
Harvester VM 负载均衡器具有以下限制：

- **命名空间限制**：此限制有利于管理权限，并确保 LB 仅使用与后端服务器位于同一命名空间的虚拟机。
- **仅支持 IPv4**：LB 仅与虚拟机的 IPv4 地址兼容。
- **Guest Agent 安装**：需要在每个后端 VM上 安装 Guest Agent 才能获取 IP 地址。
- **连接要求**：必须在后端虚拟机和 Harvester 主机之间建立网络连接。当虚拟机有多个 IP 地址时，LB 会选择第一个作为后端地址。
- **访问限制**：VM LB 地址仅在与 Harvester 主机相同的网络内公开。要从外网访问负载均衡器，你需要提供从外部到负载均衡器地址的路由。

:::note

由于 guest agent 不可用于 Windows VM，因此 Harvester VM 负载均衡器不支持 Windows VM。

:::

### 创建方式
要创建新的 Harvester VM 负载均衡器：
1. 前往 **Networks > Load Balancer** 页面并选择 **Create**。
1. 选择 **Namespace** 并指定 **Name**。
1. 进入 **Basic** 选项卡选择 IPAM 模式，可以是 **DHCP** 或 **IP Pool**。如果选择 **IP Pool**，请先准备一个 IP 池，指定 IP 池名称，或选择 **auto**。 如果选择 **auto**，负载均衡会根据 [IP 池选择策略](./ippool.md#选择策略)自动选择 IP 池。
   ![](/img/v1.2/networking/create-lb-01.png)
1. 转到 **Listeners** 选项卡添加监听器。你必须为每个监听器指定 **Port**、**Protocol** 和 **Backend Port**。
   ![](/img/v1.2/networking/create-lb-02.png)
1. 转到 **Backend Server Selector** 选项卡添加标签选择器。要将虚拟机添加到负载均衡器中，请进入 **Virtual Machine > Instance Labels** 选项卡为虚拟机添加相应的标签。
   ![](/img/v1.2/networking/create-lb-03.png)
1. 进入 **Health Check** 页签开启健康检查并指定参数，包括 **Port**、**Success Threshold**、**Failure Threshold**、**Interval** 和 **Timeout**（如果后端服务支持健康检查）。有关更多信息，请参阅[健康检查](#健康检查)。
   ![](/img/v1.2/networking/create-lb-04.png)

### 健康检查
Harvester 负载均衡器支持 TCP 健康检查。如果启用了 `Health Check` 选项，你可以在 Harvester UI 中指定参数。

![](/img/v1.2/networking/health-check.png)

| 名称 | 值类型 | 是否必须 | 默认 | 描述 |
|:-------------------------------|:-----------|:---|:--------|:---|
| 健康检查端口 | int | true | N/A | 指定端口。探针将访问由后端服务器 IP 和端口组成的地址。 |
| 健康检查成功阙值 | int | false | 1 | 指定健康检查成功阈值。默认禁用。如果探针连续检测到某个地址的成功次数达到成功阈值，后端服务器就可以开始转发流量。 |
| 健康检查失败阈值 | int | false | 3 | 指定健康检查失败阈值。默认禁用。如果健康检查失败的数量达到失败阈值，后端服务器将停止转发流量。 |
| 健康检查周期 | int | false | 5 | 指定健康检查周期（秒）。默认禁用。 |
| 健康检查超时 | int | false | 3 | 指定每次健康检查的超时时间（秒）。默认禁用。 |

## Guest Kubernetes 集群负载均衡器
你可以结合使用 Harvester 负载均衡器与 Harvester Cloud Provider，为 Guest 集群中的 LB 服务提供负载均衡。
![](/img/v1.2/networking/guest-kubernetes-cluster-lb.png)
使用 Harvester Cloud Provider 在 Guest 集群上创建、更新或删除 LB 服务时，Harvester Cloud Provider 将自动创建 Harvester LB。

有关更多信息，请参阅 [Harvester Cloud Provider](../rancher/cloud-provider.md)。
