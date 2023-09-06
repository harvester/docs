---
id: index
sidebar_position: 1
sidebar_label: Cluster Network
title: "Cluster Network"
keywords:
- Harvester
- Networking
- ClusterNetwork
- NetworkConfig
- Network
---

<head>
  <link rel="canonical" href="https://docs.harvesterhci.io/v1.1/networking/clusternetwork"/>
</head>

## Concepts

### Cluster Network
_Available as of v1.1.0_

In Harvester v1.1.0, we introduced a new concept called cluster network for traffic isolation.

The following diagram describes a typical network architecture that separates data-center (DC) traffic from out-of-band (OOB) traffic.

![](/img/v1.1/networking/traffic-isolation.png)

We abstract the sum of devices, links, and configurations on a traffic-isolated forwarding path on Harvester as a cluster network.

In the above case, there will be two cluster networks corresponding to two traffic-isolated forwarding paths.

### Network Configuration

Specifications including network devices of the Harvester hosts can be different. To be compatible with such a heterogeneous cluster, we designed the network configuration.

Network configuration only works under a certain cluster network. Each network configuration corresponds to a set of hosts with uniform network specifications. Therefore, multiple network configurations are required for a cluster network on non-uniform hosts.

### Network

A network is an interface in a virtual machine that connects to the host network. As with network configuration, every network except the built-in [management network](./harvester-network.md#management-network) must be under a cluster network.

Harvester supports adding multiple networks to one VM. If a network's cluster network is not enabled on some hosts, the VM that owns this network will not be scheduled to those hosts.

Please refer to [network part](./harvester-network.md) for more details about networks.

### Relationship Between Cluster Network, Network Config, VM Network
The following diagram shows the relationship between a cluster network, a network config, and a VM network.

![](/img/v1.1/networking/relation.png)

All `Network Configs` and `VM Networks` are grouped under a cluster network. 

- A label can be assigned to each host to categorize hosts based on their network specifications.  
- A network config can be added for each group of hosts using a node selector. 

For example, in the diagram above, the hosts in `ClusterNetwork-A` are divided into three groups as follows:
- The first group includes host0, which corresponds to `network-config-A`.
- The second group includes host1 and host2, which correspond to `network-config-B`.
- The third group includes the remaining hosts (host3, host4, and host5), which do not have any related network config and therefore do not belong to `ClusterNetwork-A`.

The cluster network is only effective on hosts that are covered by the network configuration. A VM using a `VM network` under a specific cluster network can only be scheduled on a host where the cluster network is active.

 In the diagram above, we can see that:
- `ClusterNetwork-A` is active on host0, host1, and host2. `VM0` uses `VM-network-A`, so it can be scheduled on any of these hosts.
- `VM1` uses both `VM-network-B` and `VM-network-C`, so it can only be scheduled on host2 where both `ClusterNetwork-A` and `ClusterNetwork-B` are active.
- `VM0`, `VM1`, and `VM2` cannot run on host3 where the two cluster networks are inactive.

Overall, this diagram provides a clear visualization of the relationship between cluster networks, network configurations, and VM networks, as well as how they impact VM scheduling on hosts.

## Cluster Network Details

### Built-in Cluster Network

Harvester provides a built-in cluster network called `mgmt`. It's different from the custom cluster network. The mgmt cluster network:

- Cannot be deleted.
- Does not need any network configuration.
- Is enabled on all hosts and cannot be disabled.
- Shares the same traffic egress with the management network.

If there is no need for traffic separation, you can put all your network under the mgmt cluster network.

### Custom Cluster Network

You are allowed to add the custom cluster network, which will not be available until it's enabled on some hosts by adding a network configuration.

#### How to create a new cluster network

1. To create a cluster network, go to the **Networks > ClusterNetworks/Configs** page and click the **Create** button. You only need to specify the name.

   ![](/img/v1.1/networking/create-clusternetwork.png)

2. Click the **Create Network Config** button on the right of the cluster network to create a new network configuration.

   ![](/img/v1.1/networking/create-network-config-button.png)

3. In the **Node Selector** tab, specify the name and choose one of the three methods to select nodes where the network configuration will apply. If you want to cover the unselected nodes, you can create another network configuration.

   ![](/img/v1.1/networking/select-nodes.png)

4. Click the **Uplink** tab to add the NICs, and configure the bond options and link attributes. The bond mode defaults to `active-backup`.
    
   ![](/img/v1.1/networking/config-uplink.png)

:::note

- The NICs drop-down list shows all the common NICs on all the selected nodes. The drop-down list will change as you select different nodes.
- The text `enp7s3 (1/3 Down)` in the NICs drop-down list indicates that the enp7s3 NIC is down in one of the three selected nodes. In this case, you need to find the NIC, set it up, and refresh this page. After this, it should be selectable.

:::


:::note

Starting with Harvester v1.1.2, Harvester supports updating network configs. Make sure to stop all affected VMs before updating network configs.

:::
