---
sidebar_position: 1
sidebar_label: Host Management
title: "Host Management"
---

<head>
  <link rel="canonical" href="https://docs.harvesterhci.io/v1.2/host"/>
</head>

Users can view and manage Harvester nodes from the host page. The first node always defaults to be a management node of the cluster. When there are more than three nodes, the two other nodes that first joined are automatically promoted to management nodes to form a HA cluster.

:::note

Because Harvester is built on top of Kubernetes and uses etcd as its database, the maximum node fault toleration is one when there are three management nodes.

:::

![host.png](./assets/host.png)

## Node Maintenance

Admin users can enable Maintenance Mode (select **⋮ > Enable Maintenance Mode**) to automatically evict all virtual machines from a node. This mode leverages the **live migration** feature to migrate the virtual machines to other nodes, which is useful when you need to reboot, upgrade firmware, or replace hardware components. At least two active nodes are required to use this feature.

![node-maintenance.png](./assets/node-maintenance.png)

## Cordoning a Node

Cordoned nodes are marked as unschedulable. Cordoning is useful when you want to prevent new workloads from being scheduled on a node. You can uncordon a node to make it schedulable again.

![cordon-node.png](./assets/cordon-nodes.png)

## Multi-disk Management - `Tech Preview`

Users can view and add multiple disks as additional data volumes from the host detail page.

1. Go to the **Hosts** page.
2. On the node you want to modify, click **⋮ > Edit Config**.
2. Select the **Disks** tab and click **Add Disks**.
3. Select either an additional raw block device or partition to add as an additional data volume.
    - The `Force Formatted` option is required when adding an entire raw block device to form a single root disk partition using the ext4 filesystem.
    - The `Force Formatted` option is optional when adding partitions where the filesystem type is `ext4`, `XFS` or cannot be found. It is required when adding partitions of any other filesystem type.

![Edit Config](assets/edit-config.png)
![Add Disks](assets/add-disks.png)
