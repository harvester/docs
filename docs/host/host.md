---
sidebar_position: 1
sidebar_label: Host Management
title: ""
---

# Host Management

Users can view and manage Harvester nodes from the host page. The first node always defaults to be a management node of the cluster. When there are three or more nodes, the two other nodes that first joined are automatically promoted to management nodes to form a HA cluster.

:::note

Because Harvester is built on top of Kubernetes and uses etcd as its database, the maximum node fault toleration is one when there are three management nodes.

:::

![host.png](/img/v1.1/host/host.png)

## Node Maintenance

For admin users, you can click **Enable Maintenance Mode** to evict all VMs from a node automatically. It will leverage the `VM live migration` feature to migrate all VMs to other nodes automatically. Note that at least two active nodes are required to use this feature.

![node-maintenance.png](/img/v1.1/host/node-maintenance.png)

## Cordoning a Node

Cordoning a node marks it as unschedulable. This feature is useful for performing short tasks on the node during small maintenance windows, like reboots, upgrades, or decommissions. When you’re done, power back on and make the node schedulable again by uncordoning it.

![cordon-node.png](/img/v1.1/host/cordon-nodes.png)

## Deleting a Node

Deleting a node is done in two phases:

1. Delete the node from Harvester
    - Go to the **Hosts** page
    - On the node you want to modify, click **⋮ > Delete**

2. Uninstall RKE2 from the node
    - Login to the node as root
    - Run `rke2-uninstall.sh` to delete the whole RKE2 service.

:::caution

You will lose all data of the control plane node after deleing the RKE2 service.

:::

:::note

There's a [known issue](https://github.com/harvester/harvester/issues/1497) about node hard delete.
Once resolved, the last step can be skipped.

:::

![delete.png](/img/v1.1/host/delete.png)

## Multi-disk Management - `Tech Preview`

Users can view and add multiple disks as additional data volumes from the host detail page.

1. Go to the **Hosts** page.
2. On the node you want to modify, click **⋮ > Edit Config**.
2. Select the **Disks** tab and click **Add Disks**.
3. Select an additional raw block device to add as an additional data volume.
    - The `Force Formatted` option is required if the block device has never been force-formatted.

:::note

In order for Harvester to identify the disks, each disk needs to have a unique [WWN](https://en.wikipedia.org/wiki/World_Wide_Name). Otherwise, Harvester will refuse to add the disk.
If your disk does not have a WWN, you can format it with the `EXT4` filesystem to help Harvester recognize the disk.

:::

:::note

If you are testing Harvester in a QEMU environment, you'll need to use QEMU v6.0 or later. Previous versions of QEMU will always generate the same WWN for NVMe disks emulation. This will cause Harvester to not add the additional disks, as explained above.

:::

![Edit Config](/img/v1.1/host/edit-config.png)
![Add Disks](/img/v1.1/host/add-disks.png)
