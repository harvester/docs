---
sidebar_position: 1
sidebar_label: Storage Class
title: ""
---

# Storage Class

A StorageClass allows administrators to describe the **classes** of storage they offer. Different Longhorn StorageClasses might map to replica policies, or to node schedule policies, or disk schedule policies determined by the cluster administrators. This concept is sometimes called **profiles** in other storage systems.

## Creating a Storage Class
You can create one or more StorageClasses from the **Advanced > Storage Classes** page.

:::note

After a StorageClass is created, nothing can be changed except `Description`.

:::

### Header Section
1. **Name**: name of the StorageClass
1. **Description** (optional): description of the StorageClass

### Parameters Tab

#### Number of Replicas

The number of replicas created for each volume in Longhorn. Defaults to `3`.

#### Stale Replica Timeout

Determines when Longhorn would clean up an error replica after the replica's status is ERROR. The unit is minute. Defaults to `30` minutes in Harvester.

#### Node Selector (Optional)

Select the node tags to be matched in the volume scheduling stage. You can add node tags by going to **Host > Edit Config**.

#### Disk Selector (Optional)

Select the disk tags to be matched in the volume scheduling stage. You can add disk tags by going to **Host > Edit Config**.

#### Migratable

Whether [Live Migration](../vm/live-migration.md) is supported. Defaults to `Yes`.

### Customize Tab

#### Reclaim Policy

Volumes dynamically created by a StorageClass will have the reclaim policy specified in the `reclaimPolicy` field of the class. The `Delete` mode is used by default.

1. `Delete`: Deletes volumes and the underlying devices when the volume claim is deleted.
2. `Retain`: Retains the volume for manual cleanup.

#### Allow Volume Expansion

Volumes can be configured to be expandable. This feature is `Enabled` by default, which allows users to resize the volume by editing the corresponding PVC object.

:::note

You can only use the volume expansion feature to grow a Volume, not to shrink it.

:::

#### Volume Binding Mode

The `volumeBindingMode` field controls when volume binding and dynamic provisioning should occur. The `Immediate` mode is used by default.

1. `Immediate`: Binds and provisions a persistent volume once the PersistentVolumeClaim is created.
2. `WaitForFirstConsumer`: Binds and provisions a persistent volume once a VM using the PersistentVolumeClaim is created.



