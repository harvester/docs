---
sidebar_position: 2
sidebar_label: StorageClass
title: "StorageClass"
---

<head>
  <link rel="canonical" href="https://docs.harvesterhci.io/v1.5/advanced/storageclass"/>
</head>

A StorageClass allows administrators to describe the **classes** of storage they offer. Different Longhorn StorageClasses might map to replica policies, or to node schedule policies, or disk schedule policies determined by the cluster administrators. This concept is sometimes called **profiles** in other storage systems.

:::note

For information about support for volume provisioning using external container storage interface (CSI) drivers, see [Third-Party Storage Support](../advanced/csidriver.md).

:::

## Creating a StorageClass

<Tabs>
<TabItem value="ui" label="UI" default>

:::caution

Once the StorageClass is created, you can only edit the description. All other settings are fixed.

:::

1. On the Harvester UI, go to **Advanced > StorageClasses**.

    ![](/img/v1.2/storageclass/create_storageclasses_entry.png)

1. In the general information section, configure the following settings:

    - **Name**: Name of the StorageClass.
    - **Description** (optional): Description of the StorageClass.
    - **Provisioner**: Provisioner that determines the volume plugin to be used for provisioning volumes.

1. On the **Parameters** tab, configure the following settings:

    - **Number of Replicas**: Number of replicas created for each Longhorn volume. The default value is `3`. 
    - **Stale Replica Timeout**: Number of minutes Longhorn waits before cleaning up a replica with the status `ERROR`. The default value is `30`.
    - **Node Selector** (optional): Node tags to be matched during volume scheduling. You can add node tags on the host configuration screen (**Host -> Edit Config**).
    - **Disk Selector** (optional): Disk tags to be matched during volume scheduling. You can add disk tags on the host configuration screen (**Host -> Edit Config**).
    - **Migratable**: Whether [Live Migration](../vm/live-migration.md) is supported. The default value is `Yes`.

1. On the **Customize** tab, configure the following settings:

    - **Reclaim Policy**: Volumes dynamically created by a StorageClass have the reclaim policy specified in the **Reclaim Policy** field of the StorageClass. The default value is `Delete`.
      - `Delete`: Deletes volumes and the underlying devices when the volume claim is deleted.
      - `Retain`: Retains the volume for manual cleanup.

    - **Allow Volume Expansion**: Volumes can be configured to be expandable. The default value is `Enabled`, which allows you to resize the volume by editing the corresponding PVC object.

      :::note

      You can only use the volume expansion feature to increase the volume size.

      :::

    - **Volume Binding Mode**: You can specify when volume binding and dynamic provisioning should occur. The default value is `Immediate`.
      - **Immediate**: Binds and provisions a volume once the PVC is created.
      - **WaitForFirstConsumer**: Binds and provisions a volume once a virtual machine using the PVC is created.

1. Click **Create**.

</TabItem>
<TabItem value="api" label="API">

```yaml
apiVersion: storage.k8s.io/v1
kind: StorageClass
metadata:
  annotations:
    storageclass.beta.kubernetes.io/is-default-class: 'true'
    storageclass.kubernetes.io/is-default-class: 'true'
  name: single-replica
parameters:
  migratable: 'false'
  numberOfReplicas: '1'
  staleReplicaTimeout: '30'
provisioner: driver.longhorn.io
reclaimPolicy: Delete
volumeBindingMode: Immediate
allowVolumeExpansion: true
```

</TabItem>
<TabItem value="terraform" label="Terraform">

```hcl
resource "harvester_storageclass" "single-replica" {
  name = "single-replica"

  is_default = "true"
  allow_volume_expansion = "true"
  volume_binding_mode = "immediate"
  reclaim_policy = "delete"

  parameters = {
    "migratable"          = "false"
    "numberOfReplicas"    = "1"
    "staleReplicaTimeout" = "30"
  }
}
```

</TabItem>
</Tabs>

## Data Locality Settings

You can use the `dataLocality` parameter when at least one replica of a Longhorn volume must be scheduled on the same node as the pod that uses the volume (whenever possible).

Harvester officially supports data locality as of **v1.3.0**. This applies even to volumes created from [images](../image/upload-image.md). To configure data locality, create a new StorageClass on the Harvester UI (**Storage Classess** > **Create** > **Parameters**) and then add the following parameter:

- **Key**: `dataLocality`
- **Value**: `disabled` or `best-effort`

![](/img/v1.3/storageclass/data-locality.png)

### Data Locality Options

Harvester currently supports the following options:

- `disabled`: When applied, Longhorn may or may not schedule a replica on the same node as the pod that uses the volume. This is the default option. 

- `best-effort`: When applied, Longhorn always attempts to schedule a replica on the same node as the pod that uses the volume. Longhorn does not stop the volume even when a local replica is unavailable because of an environmental limitation (for example, insufficient disk space or incompatible disk tags).

:::note

Longhorn provides a third option called `strict-local`, which forces Longhorn to keep only one replica on the same node as the pod that uses the volume. Harvester does not support this option because it can affect certain operations such as [VM Live Migration](../vm/live-migration.md)

:::

For more information, see [Data Locality](https://longhorn.io/docs/1.6.0/high-availability/data-locality/) in the Longhorn documentation.

## Use Cases

### HDD Scenario

With the introduction of *StorageClass*, users can now use **HDDs** for tiered or archived cold storage.

:::caution

HDD is not recommended for guest RKE2 clusters or VMs with good performance disk requirements.

:::

#### Recommended Practice

First, add your HDD on the `Host` page and specify the disk tags as needed, such as`HDD` or `ColdStorage`. For more information on how to add extra disks and disk tags, see [Multi-disk Management](../host/host.md#multi-disk-management) for details.

![](/img/v1.2/storageclass/add_hdd_on_host_page.png)

![](/img/v1.2/storageclass/add_tags.png)

Then, create a new `StorageClass` for the HDD (use the above disk tags). For hard drives with large capacity but slow performance, the number of replicas can be reduced to improve performance.

![](/img/v1.2/storageclass/create_hdd_storageclass.png)

You can now create a volume using the above `StorageClass` with HDDs mostly for cold storage or archiving purpose.

![](/img/v1.2/storageclass/create_volume_hdd.png)
