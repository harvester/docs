---
sidebar_position: 5
sidebar_label: IP Pool
title: "IP Pool"
keywords:
- IP Pool
---

<head>
  <link rel="canonical" href="https://docs.harvesterhci.io/v1.8/networking/ippool"/>
</head>

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
1. Go to the **Selector** tab to specify the **Selector**, **Scope** and **Priority** of the IP pool.
   ![](/img/v1.2/networking/ippool-scope.png)

When you operate from the Harvester UI, the `Scope` only includes `Namespace`. Click `Add Scope` to add new items.

### Create IP Pool from Rancher Manager UI

If the Harvester cluster is imported to `Rancher Manager` from `Rancher Manager UI > Virtualization Management`, the `Network` tab in the IP Pools section looks different.

![](/img/v1.6/networking/create-ippool-from-rancher-manager.png)

The `Scope` includes `Project`, `Namespace` and `Guest Kubernetes Cluster`. For more information, see [Multi-Tenancy Example](../rancher/virtualization-management.md#multi-tenancy-example) and [Projects and Kubernetes Namespaces with Rancher](https://ranchermanager.docs.rancher.com/how-to-guides/new-user-guides/manage-clusters/projects-and-namespaces#about-projects).

When a pool has only one `Scope` and each selects `All`, then this IP Pool is marked as **global** automatically.

## Selection policy

Each IP pool will have a specific range, and you can specify the corresponding requirements in the LB `annotations`. IP pools that meet the specified requirements will automatically assign IP addresses to LBs.

- LBs utilize the following annotations to express requirements (all annotations are optional):
  - `loadbalancer.harvesterhci.io/network` specifies the VM network the guest cluster nodes use. If this annotation is omitted, the mutator automatically selects the first Multus network defined in the guest cluster's virtual machine instances.
  - `loadbalancer.harvesterhci.io/project` and `loadbalancer.harvesterhci.io/namespace` identify the project and namespace of the VMs that comprise the guest cluster.
  - `loadbalancer.harvesterhci.io/cluster` denotes the name of the guest cluster.
- The IP pool has a selector, including network and scope, to match the requirements of the LB.
  - Network is a **hard condition**. The target IP pool must match the value of the LB annotation `loadbalancer.harvesterhci.io/network`.
  - Every IP pool, except the **global** IP pool, has a unique scope different from others if its priority is `0`. The project, namespace, or cluster name of LBs should be in the scope of the IP pool if they want to get an IP from this pool.
- `spec.selector.priority` specifies the priority of the IP Pool. The larger the number, the higher the priority. If the priority is not `0`, the value should differ. The priority helps you to migrate the old IP pool to the new one.
- If the IP Pool has a scope that matches all projects, namespaces, and guest clusters, it's called a **global** IP pool, and only one **global** IP pool is allowed under one **Network**. If there is no IP pool matching the requirements of the LB, the IPAM will allocate an IP address from the **global** IP pool if it exists and matches the **Network**.

:::caution

**Legacy Behavior (Harvester v1.8 and earlier):**

- The entire system was restricted to a maximum of one **global** IP pool.
- Network matching was not enforced, meaning a **global** IP pool could inadvertently allocate IPs to the incorrect network.

**Current Behavior (Harvester v1.9.0 and later):**

- You may define at most one **global** IP pool per specific VM Network.
- Network matching is strictly enforced. An IP pool with an empty `.spec.selector.network` will **not** be selected for allocation, even if it is marked as **global**.

- For guidance on resource allocation, see [IPPool Best Practices](#ippool-for-guest-cluster-type-loadbalancer).

:::

### Guest Cluster Load Balancer Network Resolution

When a user or application creates a `LoadBalancer` service inside a guest cluster, the `cloud-provider-harvester` sends a creation request to the Harvester API server in the management cluster.

Before the resource is persisted, the Harvester load balancer mutating **webhook** is invoked to automatically resolve the correct network annotation. Once this synchronous resolution phase is complete, the object is saved, and control is handed over to the **backend controller** to asynchronously handle IP pool matching and allocation.

#### Network Resolution Workflow

**Legacy Behavior (Harvester v1.8 and earlier):**

During the automatic resolution phase, the webhook performs a basic network lookup:
* It fetches all VMIs with the label `harvesterhci.io/creator:docker-machine-driver-harvester` from the load balancer's namespace.
* It filters for VMIs that use the `cluster-name` as a prefix.
* It selects the first multus-network name.


**Current Behavior (Harvester v1.9.0 and later):**

The webhook automatically resolves the network by evaluating the following conditions in sequential order before handing the resource off to the backend controller:

1.  **Existing Load Balancer Annotation**
    If the `loadbalancer.harvesterhci.io/network` annotation is already present and non-empty, its value is used directly.

1.  **Management Network Annotation**
    If the `cloudprovider.harvesterhci.io/managementNetwork` annotation is present and non-empty, its value is used.

1.  **Cluster Name Label Lookup**
    The webhook fetches all VMIs matching the label `guestcluster.harvesterhci.io/name: <cluster-name>` from the load balancer's namespace. It then selects the first multus-network name.

1.  **Legacy Driver Label Fallback**
    The webhook fetches all VMIs with the label `harvesterhci.io/creator:docker-machine-driver-harvester` from the load balancer's namespace, filters for VMIs using `cluster-name` as a prefix, and selects the first multus-network name.

    :::note

    This final step serves as a fallback path to maintain backward compatibility with guest clusters deployed using Harvester v1.8 and earlier versions.

    :::

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
      - project: product
        namespace: default
        guestCluster: rke2
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
    labels:
      loadbalancer.harvesterhci.io/global-ip-pool: 'true' # Added automatically by Harvester
  spec:
    ranges:
    - subnet: 192.168.20.0/24
    selector:
      network: default/vlan1
      scope:
      - project: "*"
        namespace: "*"
        guestCluster: "*"
  ```

## Allocation policy
- The IP pool prioritizes the allocation of previously assigned IP addresses based on their allocation history.
- IP addresses are assigned in ascending order.

## Best Practice

### IPPool for VM type Loadbalancer

1. It is better to [Create IP Pool from Harvester UI directly](#how-to-create), which leaves the selector scope `Project` and `Guest Kubernetes Cluster` blank.

1. If you can only [Create IP Pool from Rancher Managery UI](#create-ip-pool-from-rancher-manager-ui), set the scope `Project` and `Guest Kubernetes Cluster` to be `All` or `None`.

### IPPool for Guest Cluster type Loadbalancer

1. It is better to [Create IP Pool from Rancher Managery UI](#create-ip-pool-from-rancher-manager-ui), because it allows you to tune `Project`, `Namespace` and `Guest Kubernetes Cluster` for better resource management and isolation.

1. Be careful when creating **global** IP pool as one guest cluster might allocate too many IPs and starve other clusters. The pool can't be deleted if any of the IPs is still in use.

1. Starting with v1.9.0, an IP pool with an empty `.spec.selector.network` will not be selected for allocation, even if it is marked as **global**. Always set the correct `.spec.selector.network`.

1. **Use project/namespace-scoped pools for better isolation:** Since each guest cluster is deployed within a specific project and namespace, you should create IP pools scoped to that project or namespace with defined IP ranges. This approach offers several advantages:
    * **Granular Control:** A single network can support multiple non-global pools, allowing you to partition IP availability across different projects or namespaces.
    * **Resource Protection:** The exhaustion of one pool does not affect others, even though they share the same underlying network.
    * **Scalability:** It is easier to increase an IP pool's range than to decrease it. Shrinking a range is difficult when the currently used IPs are dispersed throughout the range (e.g., a pool of [1-10] where IPs 1, 5, and 9 are already in use). Consequently, a best practice is to start with a smaller, conservative range and expand as needed.
