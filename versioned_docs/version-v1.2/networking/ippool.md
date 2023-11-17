---
sidebar_position: 5
sidebar_label: IP Pool
title: "IP Pool"
keywords:
- IP Pool
---
_Available as of v1.2.0_

Harvester IP Pool is a built-in IP address management (IPAM) solution exclusively available to Harvester load balancers (LBs).

## Features
- **Multiple IP ranges:** Each IP pool can contain multiple IP ranges or CIDRs.
- **Allocation history:** The IP pool keeps track of the allocation history of every IP address and prioritizes assigning previously allocated addresses by load balancer name.
  ```yaml
  status:
    allocatedHistory:
      192.168.178.8: default/rke2-default-lb-pool-2fab9ac0
  ```
- **Scope:** IP pools can be confined to a particular network, project, namespace, or guest cluster.

## How to create 
To create a new IP pool:

1. Go to the **Networks** > **IP Pools** page and select **Create**.
1. Specify the **Name** of the IP pool.
1. Go to the **Range** tab to specify the **IP ranges** for the IP pool. You can add multiple IP ranges.
   ![](/img/v1.2/networking/multiple-ranges.png)
1. Go to the **Selector** tab to specify the **Scope** and **Priority** of the IP pool.
   ![](/img/v1.2/networking/ippool-scope.png)

## Selection policy
Each IP pool will have a specific range, and you can specify the corresponding requirements in the LB `annotations`. IP pools that meet the specified requirements will automatically assign IP addresses to LBs.

- LBs utilize the following annotations to express requirements (all annotations are optional):
  - `loadbalancer.harvesterhci.io/network` specifies the VM network the guest cluster nodes use.
  - `loadbalancer.harvesterhci.io/project` and `loadbalancer.harvesterhci.io/namespace` identify the project and namespace of the VMs that comprise the guest cluster.
  - `loadbalancer.harvesterhci.io/cluster` denotes the name of the guest cluster.
- The IP pool has a selector, including network and scope, to match the requirements of the LB.
  - Network is a hard condition. The optional IP pool must match the value of the LB annotation `loadbalancer.harvesterhci.io/network`.
  - Every IP pool, except the global IP pool, has a unique scope different from others if its priority is `0`. The project, namespace, or cluster name of LBs should be in the scope of the IP pool if they want to get an IP from this pool.
- `spec.selector.priority` specifies the priority of the IP Pool. The larger the number, the higher the priority. If the priority is not `0`, the value should differ. The priority helps you to migrate the old IP pool to the new one.
- If the IP Pool has a scope that matches all projects, namespaces, and guest clusters, it's called a global IP pool, and only one global IP pool is allowed. If there is no IP pool matching the requirements of the LB, the IPAM will allocate an IP address from the global IP pool if it exists.

### Examples
- **Example 1:** You wish to set up an IP pool within the range `192.168.100.0/24` for the `default` namespace. In this scenario, all load balancers within the `default` namespace will receive an IP address from this designated IP pool:
  
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

- **Example 2:** You have a guest cluster `rke2` deployed within the network `default/vlan1`, and its `project/namespace` name is `product/default`. If you want to configure an exclusive IP pool range `192.168.10.10-192.168.10.20` for it. Refer to the following `YAML` config:
  
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

- **Example 3:** If you have specified the IP pool `default-ip-pool` for the `default` namespace, you want to migrate the IP pool `default-ip-pool` to a different IP pool `default-ip-pool-2` with range `192.168.200.0/24`. It's not allowed to specify over one IP pool for the same scope, but you can give the IP pool `default-ip-pool-2` a higher priority than `default-ip-pool`. Refer to the following `YAML` config:
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

- **Example 4:** You want to configure a global IP pool with a CIDR range of `192.168.20.0/24`:
  
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

## Allocation policy
- The IP pool prioritizes the allocation of previously assigned IP addresses based on their allocation history.
- IP addresses are assigned in ascending order.

:::note

Starting with Harvester v1.2.0,  the `vip-pools` setting is deprecated. Following the upgrade, this setting will be automatically migrated to the Harvester IP pools.

:::
