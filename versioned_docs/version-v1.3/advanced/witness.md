---
sidebar_position: 8
sidebar_label: Witness Node
title: "Witness Node"
---

<head>
  <link rel="canonical" href="https://docs.harvesterhci.io/v1.3/advanced/witness"/>
</head>

_Available as of v1.3.0_

Harvester clusters deployed in production environments require a control plane for node and pod management. A typical three-node cluster has three management nodes that each contain the complete set of control plane components. One key component is etcd, which Kubernetes uses to store its data (configuration, state, and metadata). The etcd node count must always be an odd number (for example, 3 is the default count in Harvester) to ensure that a quorum is maintained.

Some situations may require you to avoid deploying workloads and user data to management nodes. In these situations, one cluster node can be assigned the *witness* role, which limits it to functioning as an etcd cluster member. The witness node is responsible for establishing a member quorum (a majority of nodes), which must agree on updates to the cluster state.

Witness nodes do not store any data, but the [hardware recommendations](https://etcd.io/docs/v3.3/op-guide/hardware/) for etcd nodes must still be considered. Using hardware with limited resources significantly affects cluster performance, as described in the article [Slow etcd performance (performance testing and optimization)](https://www.suse.com/support/kb/doc/?id=000020100). 

Harvester v1.3.0 supports clusters with two management nodes and one witness node (and optionally, one or more worker nodes). For more information about node roles in Harvester, see [Role Management](../host/host.md#role-management).


:::info important
A node can be assigned the *witness* role only at the time it joins a cluster. Each cluster can have only one witness node.
:::

## Creating a Harvester Cluster with a Witness Node

You can assign the *witness* role to a node when it joins a newly created cluster.

In the following example, a cluster with three nodes was created and the node `harvester-node-1` was assigned the *witness* role. `harvester-node-1` consumes less resources and only has etcd capabilities.

```
NAME↑               STATUS   ROLE                         VERSION               PODS     CPU      MEM    %CPU    %MEM    CPU/A    MEM/A AGE        
harvester-node-0    Ready    control-plane,etcd,master    v1.27.10+rke2r1         70    1095    10143      10      63    10000    15976 4d13h      
harvester-node-1    Ready    etcd                         v1.27.10+rke2r1          7     258     2258       2      14    10000    15976 4d13h      
harvester-node-2    Ready    control-plane,etcd,master    v1.27.10+rke2r1         36     840     6905       8      43    10000    15976 4d13h      
```

Because the cluster must have three nodes, the promote controller will promote the other two nodes. After that, the cluster will have two control-plane nodes and one witness node.

## Workloads on the Witness Node

The witness node only runs the following essential workloads:
- **harvester-node-manager**
- **cloud-controller-manager**
- **etcd**
- **kube-proxy**
- **rke2-canal**
- **rke2-multus**

## Upgrade a Cluster with a Witness Node

The general upgrade requirements and procedures apply to clusters with a witness node. However, the existence of degraded volumes in such clusters may cause upgrade operations to fail. 

## Longhorn Replicas in Clusters with a Witness Node

Harvester uses Longhorn, a distributed block storage system, for management of block device volumes. Longhorn is provisioned to management and worker nodes but not to witness nodes, which do not store any data.

Longhorn creates replicas of each volume to increase availability. Replicas contain a chain of snapshots of the volume, with each snapshot storing the change from a previous snapshot. In Harvester, the default StorageClass `harvester-longhorn` has a replica count value of `3`.

## Limitations

Witness nodes do not store any data. This means that in three-node clusters (no worker nodes), only two replicas are created for each Longhorn volume. However, the default StorageClass `harvester-longhorn` has a replica count value of `3` for high availability. If you use this StorageClass to create volumes, Longhorn is unable to create the configured number of replicas. This results in volumes being marked as **Degraded** on the Longhorn UI.

In summary, you must use a StorageClass that matches the cluster configuration.

- 2 management nodes + 1 witness node: Create a new default StorageClass with the **Number of Replicas** parameter set to **2**. This ensures that only two replicas are created for each Longhorn volume.
- 2 management nodes + 1 witness node + 1 or more worker nodes: You can use the existing default StorageClass.
  
![new storageclass replica 2](/img/v1.3/advanced/new-storageclass-rep-2.png)
![set to default](/img/v1.3/advanced/set-to-default-sc.png)

If you already created volumes using the original default StorageClass, you can modify the replica count on the **Volume** screen of the [embedded Longhorn UI](../troubleshooting/harvester/#access-embedded-rancher-and-longhorn-dashboards).

![redirect-to-longhorn-volume-page](/img/v1.3/advanced/redirect-to-longhorn-vol-page.png)
![update-replica-count-to-2](/img/v1.3/advanced/update-replica-2.png)

## Known Issues

### 1. When creating a cluster with a witness node, the **Network Config: Create** screen on the Harvester UI is unable to identify any NICs that can be used with all nodes.

  ![create network config with all nodes](/img/v1.3/advanced/create-policy-with-all-nodes.png)
  ![no uplink](/img/v1.3/advanced/no-uplink.png)

  The workaround is to select a non-witness node and then select a NIC that can be used with that specific node.

  ![create network config with specific node](/img/v1.3/advanced/create-policy-with-specific-node.png)
  ![get uplink](/img/v1.3/advanced/get-uplink.png)

You must repeat this procedure for every non-witness node in the cluster. The same uplink settings can be used across nodes.

  Related issue: [[BUG] Unable to select NIC to create network config when cluster contains witness node](https://github.com/harvester/harvester/issues/5325)

### 2. When selecting a target node for VM migration, the target list includes the witness node.

![vm migration target witness node](/img/v1.3/advanced/vm-migration-witness-node.png)

Do not select the witness node as the migration target. If you do, VM migration will fail.

  Related issue: [[BUG] The witness node should not be selected as a migration target](https://github.com/harvester/harvester/issues/5338)