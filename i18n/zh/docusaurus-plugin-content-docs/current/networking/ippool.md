---
sidebar_position: 5
sidebar_label: IP 池
title: "IP 池"
keywords:
- IP 池
---
_从 v1.2.0 起可用_

Harvester IP 池是专门供 Harvester 负载均衡器 (LB) 使用的内置 IP 地址管理 (IPAM) 解决方案。

## 功能
- **多个 IP 范围**：每个 IP 池可以包含多个 IP 范围或 CIDR。
- **分配历史记录**：IP 池会跟踪每个 IP 地址的分配历史记录，并按负载均衡器名称优先分配先前分配的地址。
   ```yaml
   status:
     allocatedHistory:
       192.168.178.8: default/rke2-default-lb-pool-2fab9ac0
   ```
- **作用范围**：IP 池可以限制为特定网络、项目、命名空间或 Guest 集群。

## 创建方式
要创建新的 IP 池：

1. 转至 **Networks** > **IP Pools** 页面并选择 **Create**。
1. 指定 IP 池的 **Name**。
1. 转至 **Range** 选项卡指定 IP 池​​的 **IP 范围**。你可以添加多个 IP 范围。
   ![](/img/v1.2/networking/multiple-ranges.png)
1. 进入 **Selector** 选项卡指定 IP 池​​的 **Scope** 和 **Priority**。
   ![](/img/v1.2/networking/ippool-scope.png)

## 选择策略
每个 IP 池都会有一个特定的范围，你可以在 LB `注解`中指定相应的要求。满足条件的 IP 池会自动为 LB 分配 IP 地址。

- LB 将使用以下注释来表达要求（所有注释都是可选的）：
   - `loadbalancer.harvesterhci.io/network` 指定 Guest 集群节点使用的 VM 网络。
   - `loadbalancer.harvesterhci.io/project` 和 `loadbalancer.harvesterhci.io/namespace` 标识了组成 Guest 集群的 VM 的项目和命名空间。
   - `loadbalancer.harvesterhci.io/cluster` 表示 Guest 集群的名称。
- IP 池有一个选择器，包括网络和范围，用来匹配 LB 的要求。
   - 网络是硬性条件。可选 IP 池必须与 LB 注释 `loadbalancer.harvesterhci.io/network` 的值匹配。
   - 如果优先级为 `0`，则除全局 IP 池之外的每个 IP 池都具有与其他 IP 池不同的唯一范围。要从 IP 池中获取 IP，LB 的项目、命名空间或集群名称需要在 IP 池的范围内。
- `spec.selector.priority` 指定了 IP 池​​的优先级。数字越大，优先级越高。如果优先级不是 `0`，则该值应该不同。优先级可帮助你将旧 IP 池迁移到新 IP 池。
- 如果 IP 池的范围匹配所有项目、命名空间和 Guest 集群，则称为全局 IP 池，只允许有一个全局 IP 池。如果没有符合 LB 要求的 IP 池，IPAM 将从全局 IP 池（如果存在）中分配 IP 地址。

### 示例
- **示例 1**：你希望为 `default` 命名空间设置 `192.168.100.0/24` 范围内的 IP 池。在此场景中，`default` 命名空间内的所有负载均衡器都将从该 IP 池获取 IP 地址：

   ```yaml
   apiVersion: networking.harvesterhci.io/v1beta1
   kind: IPPool
   metadata:
     name: default-ip-pool
   spec:
     ranges:
     - subnet: 192.168.100.0/24
     selector:
       scope:
         namespace: default
   ```

- **示例 2**：你在网络 `default/vlan1` 中部署了一个 Guest 集群 `rke2`，其 `project/namespace` 名称是 `product/default`。要为其配置独占的 IP 池范围 `192.168.10.10-192.168.10.20`，参考以下 `YAML` 配置：

   ```yaml
   apiVersion: networking.harvesterhci.io/v1beta1
   kind: IPPool
   metadata:
     name: rke2-ip-pool
   spec:
     ranges:
     - subnet: 192.168.10.0/24
       rangeStart: 192.168.10.10
       rangeEnd: 192.168.10.20
     selector:
       network: default/vlan1
       scope:
         project: product
         namespace: default
         cluster: rke2
   ```

- **示例 3**：如果你已为 `default` 命名空间指定 IP 池 `default-ip-pool`，则需要将 IP 池 `default-ip-pool` 迁移到另一个 IP 池 `default-ip-pool-2`，其范围为 `192.168.200.0/24`。不允许为同一范围指定多个 IP 池，但你可以为 IP 池 `default-ip-pool-2` 指定比 `default-ip-pool` 更高的优先级。参考以下 `YAML` 配置：
-

```yaml
apiVersion: networking.harvesterhci.io/v1beta1
kind: IPPool
metadata:
  name: default-ip-pool-2
spec:
  ranges:
  - subnet: 192.168.200.0/24
  selector:
    priority: 1  # The priority is higher than default-ip-pool
    scope:
      namespace: default
```

- **示例 4**：你想要配置 CIDR 范围为 `192.168.20.0/24` 的全局 IP 池：

   ```yaml
   apiVersion: networking.harvesterhci.io/v1beta1
   kind: IPPool
   metadata:
     name: global-ip-pool
   spec:
     ranges:
     - subnet: 192.168.20.0/24
     selector:
       scope:
         project: "*"
         namespace: "*"
         cluster: "*"
   ```

## 分配策略
- IP 池会根据分配历史优先分配先前分配的 IP 地址。
- IP 地址按升序分配。

:::note

从 Harvester v1.2.0 开始，`vip-pools` 设置已弃用。升级后，此设置将自动迁移到 Harvester IP 池。

:::
