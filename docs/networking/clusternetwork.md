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
  <link rel="canonical" href="https://docs.harvesterhci.io/v1.4/networking/index"/>
</head>

## Concepts

### Cluster Network
_Available as of v1.1.0_

In Harvester v1.1.0, we introduced a new concept called cluster network for traffic isolation.

The following diagram describes a typical network architecture that separates data-center (DC) traffic from out-of-band (OOB) traffic.

![](/img/v1.2/networking/traffic-isolation.png)

We abstract the sum of devices, links, and configurations on a traffic-isolated forwarding path on Harvester as a cluster network.

In the above case, there will be two cluster networks corresponding to two traffic-isolated forwarding paths.

### Network Configuration

Specifications including network devices of the Harvester hosts can be different. To be compatible with such a heterogeneous cluster, we designed the network configuration.

Network configuration only works under a certain cluster network. Each network configuration corresponds to a set of hosts with uniform network specifications. Therefore, multiple network configurations are required for a cluster network on non-uniform hosts.

### VM Network

A VM network is an interface in a virtual machine that connects to the host network. As with a network configuration, every network except the built-in [management network](./harvester-network.md#management-network) must be under a cluster network.

Harvester supports adding multiple networks to one VM. If a network's cluster network is not enabled on some hosts, the VM that owns this network will not be scheduled to those hosts.

Please refer to [network part](./harvester-network.md) for more details about networks.

### Relationship Between Cluster Network, Network Config, VM Network
The following diagram shows the relationship between a cluster network, a network config, and a VM network.

![](/img/v1.2/networking/relation.png)

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

Harvester provides a built-in cluster network called `mgmt`. It's different from the custom cluster network. The `mgmt` cluster network:

- Cannot be deleted.
- Does not need any network configuration.
- Is enabled on all hosts and cannot be disabled.
- Shares the same traffic egress with the management network.

If there is no need for traffic separation, you can put all your network under the mgmt cluster network.

### Custom Cluster Network

You are allowed to add the custom cluster network, which will not be available until it's enabled on some hosts by adding a network configuration.

:::note

Before creating a new cluster network, ensure that the [hardware requirements](../install/requirements.md#hardware-requirements) are met.

The [witness node](../advanced/witness.md) is generally not involved in the custom cluster network.

:::

## Configurations

### How to Create a new Cluster Network

1. To create a new cluster network, go to the **Networks > ClusterNetworks/Configs** page and click the **Create** button. You only need to specify the name.

   ![](/img/v1.2/networking/create-clusternetwork.png)

2. Click the **Create Network Config** button on the right of the cluster network to create a new network configuration.

   ![](/img/v1.2/networking/create-network-config-button.png)

3. In the **Node Selector** tab, specify the name and choose one of the three methods to select nodes where the network configuration will apply. If you want to cover the unselected nodes, you can create another network configuration.

   ![](/img/v1.2/networking/select-nodes.png)

:::note

The method **Select all nodes** works only when all nodes use the exact same dedicated NICs for this specific custom cluster network. In other situations (for example, when the cluster has a [witness node](../advanced/witness.md)), you must select either of the remaining methods.

:::

4. Click the **Uplink** tab to add the NICs, and configure the bond options and link attributes. The bond mode defaults to `active-backup`.

   ![](/img/v1.2/networking/config-uplink.png)

:::note

- The NICs drop-down list shows all the common NICs on all the selected nodes. The drop-down list will change as you select different nodes.
- The text `enp7s3 (1/3 Down)` in the NICs drop-down list indicates that the enp7s3 NIC is down in one of the three selected nodes. In this case, you need to find the NIC, set it up, and refresh this page. After this, it should be selectable.

:::

:::note

Starting with Harvester v1.1.2, Harvester supports updating network configs. Make sure to stop all affected VMs before updating network configs.

To simplify cluster maintenance, create one network configuration for each node or group of nodes. Without dedicated network configurations, certain maintenance tasks (for example, replacing old NICs with NICs in different slots) will require you to stop and/or migrate the affected VMs before updating the network configuration.

:::

### How to Change the Network Config

Changes on the existing `Network Config` may affect both the Harvester VMs/workloads and the external devices/systems like Switches/Routers. For more information, please see [Network Topology](./deep-dive.md#network-topology).

#### Change the MTU of Network Config which has no Storage Network attached

You may plan to change the `MTU` of an existing `Cluster Network`. And the [Storage Network](../advanced/storagenetwork.md#harvester-storage-network-setting) is not enabled or not attached to this `Cluster Network`.

The `MTU` on each `Network Config` of an existing custom `Cluster Network` is strictly to be identical. There are many restrictions to change the `MTU`, the following steps should be followed:

1. Stop all the VMs which are attached to the target `Cluster Network`, this can be checked via the [VM Network](./harvester-network.md#create-a-vm-network) and [VM attached Secondary Network](../vm/create-vm.md#secondary-network). When any of the VMs is still running, Harvester will refuse the change.

2. Check the number of `Network Config` of the target `Cluster Network`, if the number is greater than one, then repeat the operations below until there is only one `Network Config` left:

    1. Record the `Node Selector` of a `Network Config`;

    1. Remove this `Network Config`;

3. Change the `MTU` of the last `Network Config`.

4. Check the `MTU` on the selected Harvester nodes via the Linux `ip link` command, the related `*-br` device like `cn-data-br` should be `UP` and with the new `MTU`.

```
Harvester node $ ip link

                                                  |new MTU|              |state UP|
3: cn-data-br: <BROADCAST,MULTICAST,UP,LOWER_UP> mtu 9000 qdisc noqueue state UP mode DEFAULT group default qlen 1000
    link/ether 52:54:00:6e:5c:2a brd ff:ff:ff:ff:ff:ff
```

:::note

When the state is `UNKNOWN`, a possible cause is the MTU does not match between Harvester and external Switch/Router.

:::

5. Test the new MTU on Harvester nodes via command like `ping` to another Harvester node (with the new MTU) or an external IP.

```
Suppose a CIDR `192.168.100.0/24` and gateway `192.168.100.1` is prepared for the cn-data network.


1. Set an IP on bridge device

$ ip addr add dev cn-data-br 192.168.100.100/24

2. Add a route for destination IP like `8.8.8.8` via the gateway

$ ip route add 8.8.8.8 via 192.168.100.1 dev cn-data-br

3. ping 8.8.8.8

$ ping 8.8.8.8 -I 192.168.100.100
PING 8.8.8.8 (8.8.8.8) from 192.168.100.100 : 56(84) bytes of data.
64 bytes from 8.8.8.8: icmp_seq=1 ttl=59 time=8.52 ms
64 bytes from 8.8.8.8: icmp_seq=2 ttl=59 time=8.90 ms
64 bytes from 8.8.8.8: icmp_seq=3 ttl=59 time=8.74 ms
64 bytes from 8.8.8.8: icmp_seq=4 ttl=59 time=9.19 ms


4. ping with different size to validate new MTU

$ ping 8.8.8.8 -s 8800 -I 192.168.100.100

PING 8.8.8.8 (8.8.8.8) from 192.168.100.100 : 8800(8828) bytes of data

# the `-s` specify the ping packet size, which can test if the new MTU really works

5. Remove the added test route

$ ip route delete 8.8.8.8 via 192.168.100.1 dev cn-data-br

6. Remove the added test ip

$ ip addr delete 192.168.100.100/24 dev cn-data-br

```

6. Add those `Network Config` which were removed on Step 2, each should set the `MTU` to the new value. And run step 4, 5 to test and verify the new `MTU`.

7. Start the VMs mentioned in step 1.

:::note

- The `MTU` affects both of the Harvester nodes and the infrastructure networking devices like Switches and Routers, the careful planning and testing are required to sure the new `MTU`. For more information, please see [Network Topology](./deep-dive.md#network-topology).

- Service is interrupted while the whole process.

- This method does not work on the built-in `mgmt Cluster Network`.

:::

#### Change the MTU of Network Config which has Storage Network Attached

You may plan to change the `MTU` of an existing `Cluster Network`. And the [Storage Network](../advanced/storagenetwork.md#harvester-storage-network-setting) is enabled or attached to this `Cluster Network`. The `Storage Network` is dedicatedly used by `Longhorn`, the default CSI driver of Harvester cluster. Because the `Longhorn` is responsible for at least the [root disk](../vm/create-vm.md#volumes) of all VMs, this change will affect all the VMs.

The `MTU` on each `Network Config` of an existing custom `Cluster Network` is strictly to be identical. There are many restrictions to change the `MTU`, the following steps should be followed:

1. Stop all the VMs.

2. Disable the Harvester [Storage Network](../advanced/storagenetwork.md#harvester-storage-network-setting). Wait and [Verify Configuration is Completed](../advanced/storagenetwork.md#verify-configuration-is-completed).

3. Check the number of `Network Config` of the target `Cluster Network`, if the number is greater than one, then repeat the operations below until there is only one `Network Config` left:

    1. Record the `Node Selector` of a `Network Config`;

    1. Remove this `Network Config`;

4. Change the `MTU` of the last `Network Config`.

::: note

The MUT on the peer external Switch/Router's port needs to be changed accordingly.

:::

5. Check the `MTU` on the selected Harvester nodes via the Linux `ip link` command, the related `*-br` device like `cn-data-br` should be `UP` and with the new `MTU`.

```
Harvester node $ ip link

                                                  |new MTU|              |state UP|

3: cn-data-br: <BROADCAST,MULTICAST,UP,LOWER_UP> mtu 9000 qdisc noqueue state UP mode DEFAULT group default qlen 1000
    link/ether 52:54:00:6e:5c:2a brd ff:ff:ff:ff:ff:ff
```

:::note

When the state is `UNKNOWN`, a possible cause is the MTU does not match between Harvester and external Switch/Router.

:::

6. Test the new MTU on Harvester nodes via command like `ping` to another Harvester node (with the new MTU) or an external IP.

```
Suppose a CIDR `192.168.100.0/24` and gateway `192.168.100.1` is prepared for the cn-data network.


1. Set an IP on bridge device

$ ip addr add dev cn-data-br 192.168.100.100/24

2. Add a route for destination IP like `8.8.8.8` via the gateway

$ ip route add 8.8.8.8 via 192.168.100.1 dev cn-data-br

3. ping 8.8.8.8

$ ping 8.8.8.8 -I 192.168.100.100
PING 8.8.8.8 (8.8.8.8) from 192.168.100.100 : 56(84) bytes of data.
64 bytes from 8.8.8.8: icmp_seq=1 ttl=59 time=8.52 ms
64 bytes from 8.8.8.8: icmp_seq=2 ttl=59 time=8.90 ms
64 bytes from 8.8.8.8: icmp_seq=3 ttl=59 time=8.74 ms
64 bytes from 8.8.8.8: icmp_seq=4 ttl=59 time=9.19 ms


4. ping with different size to validate new MTU

$ ping 8.8.8.8 -s 8800 -I 192.168.100.100

PING 8.8.8.8 (8.8.8.8) from 192.168.100.100 : 8800(8828) bytes of data

# the `-s` specify the ping packet size, which can test if the new MTU really works


5. Remove the added test route

$ ip route delete 8.8.8.8 via 192.168.100.1 dev cn-data-br

6. Remove the added test ip

$ ip addr delete 192.168.100.100/24 dev cn-data-br

```

7. Add those `Network Config` which were removed on Step 3, each should set the `MTU` to the new value. And run step 5, 6 to test and verify the new `MTU`.

8. Enable and set the Harvester [Storage Network](../advanced/storagenetwork.md#harvester-storage-network-setting), note the [Prerequisites](../advanced/storagenetwork.md#prerequisites) are met in the above steps. Wait and [Verify Configuration is Completed](../advanced/storagenetwork.md#verify-configuration-is-completed).

9. Start the VMs mentioned in step 1.

:::note

- The `MTU` affects both of the Harvester nodes and the infrastructure networking devices like Switches and Routers, the careful planning and testing are required to sure the new `MTU`. For more information, please see [Network Topology](./deep-dive.md#network-topology).

- Service is interrupted while the whole process.

- This method does not work on the built-in `mgmt Cluster Network`.

:::
