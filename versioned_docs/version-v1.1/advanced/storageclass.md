---
sidebar_position: 2
sidebar_label: Storage Class
title: "Storage Class"
---

A StorageClass allows administrators to describe the **classes** of storage they offer. Different Longhorn StorageClasses might map to replica policies, or to node schedule policies, or disk schedule policies determined by the cluster administrators. This concept is sometimes called **profiles** in other storage systems.

## Creating a Storage Class
You can create one or more StorageClasses from the **Advanced > Storage Classes** page.

![](/img/v1.1/storageclass/create_storageclasses_entry.png)

:::note

After a StorageClass is created, nothing can be changed except `Description`.

:::

### Header Section
1. **Name**: name of the StorageClass
1. **Description** (optional): description of the StorageClass

![](/img/v1.1/storageclass/create_storageclasses_header_sections.png)

### Parameters Tab

#### Number of Replicas

The number of replicas created for each volume in Longhorn. Defaults to `3`.

![](/img/v1.1/storageclass/create_storageclasses_replicas.png)

#### Stale Replica Timeout

Determines when Longhorn would clean up an error replica after the replica's status is ERROR. The unit is minute. Defaults to `30` minutes in Harvester.

![](/img/v1.1/storageclass/create_storageclasses_stale_timeout.png)

#### Node Selector (Optional)

Select the node tags to be matched in the volume scheduling stage. You can add node tags by going to **Host > Edit Config**.

![](/img/v1.1/storageclass/create_storageclasses_node_selector.png)

#### Disk Selector (Optional)

Select the disk tags to be matched in the volume scheduling stage. You can add disk tags by going to **Host > Edit Config**.

![](/img/v1.1/storageclass/create_storageclasses_disk_selector.png)

#### Migratable

Whether [Live Migration](../vm/live-migration.md) is supported. Defaults to `Yes`.

![](/img/v1.1/storageclass/create_storageclasses_migratable.png)

### Customize Tab

#### Reclaim Policy

Volumes dynamically created by a StorageClass will have the reclaim policy specified in the `reclaimPolicy` field of the class. The `Delete` mode is used by default.

1. `Delete`: Deletes volumes and the underlying devices when the volume claim is deleted.
2. `Retain`: Retains the volume for manual cleanup.

![](/img/v1.1/storageclass/customize_tab_reclaim_policy.png)

#### Allow Volume Expansion

Volumes can be configured to be expandable. This feature is `Enabled` by default, which allows users to resize the volume by editing the corresponding PVC object.

![](/img/v1.1/storageclass/customize_tab_allow_vol_expansion.png)

:::note

You can only use the volume expansion feature to grow a Volume, not to shrink it.

:::

#### Volume Binding Mode

The `volumeBindingMode` field controls when volume binding and dynamic provisioning should occur. The `Immediate` mode is used by default.

1. `Immediate`: Binds and provisions a persistent volume once the PersistentVolumeClaim is created.
2. `WaitForFirstConsumer`: Binds and provisions a persistent volume once a VM using the PersistentVolumeClaim is created.

![](/img/v1.1/storageclass/customize_tab_vol_binding_mode.png)


## Appendix - Use Case

### HDD Scenario

With the introduction of *StorageClass*, users can now use **HDDs** for tiered or archived cold storage.

:::caution

HDD is not recommended for guest RKE2 clusters or VMs with good performance disk requirements.

:::

#### Recommended Practice

First, add your HDD on the `Host` page and specify the disk tags as needed, such as`HDD` or `ColdStorage`. For more information on how to add extra disks and disk tags, see [Multi-disk Management](https://docs.harvesterhci.io/v1.1/host/#multi-disk-management) for details.

![](/img/v1.1/storageclass/add_hdd_on_host_page.png)

![](/img/v1.1/storageclass/add_tags.png)

Then, create a new `StorageClass` for the HDD (use the above disk tags). For hard drives with large capacity but slow performance, the number of replicas can be reduced to improve performance. For details, see [storageclass](https://docs.harvesterhci.io/v1.1/advanced/storageclass) for details.

![](/img/v1.1/storageclass/create_hdd_storageclass.png)

You can now create a volume using the above `StorageClass` with HDDs mostly for cold storage or archiving purpose.

![](/img/v1.1/storageclass/create_volume_hdd.png)