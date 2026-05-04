---
sidebar_position: 7
sidebar_label: Storage Migration
title: "Storage Migration"
keywords:
- Volume
- Storage Migration
- StorageClass
- Live Migration
description: Migrate VM volumes between different StorageClasses without data loss.
---

<head>
  <link rel="canonical" href="https://docs.harvesterhci.io/v1.7/volume/storage-migration"/>
</head>

Storage migration allows you to move VM volumes data from one StorageClass to another. This is useful when you need to change the storage backend for a VM — for example, migrating from Longhorn replicated storage to LVM local storage for better performance, or from local storage to replicated storage for higher availability.

Harvester supports two modes of storage migration:

- **Online Storage Migration**: Migrates volumes while the VM is running. The guest OS is unaware of the underlying disk movement.
- **Offline Data Migration**: Clones volume data to a new StorageClass when the volume is not attached to any running VM.

## Prerequisites

- The target StorageClass must already exist in the cluster.
- The target storage backend must have sufficient capacity to hold the volume data.
- For online migration, the VM must be running and [live-migratable](../vm/live-migration.md#live-migratable-virtual-machines).

## Online Storage Migration

Use online storage migration when the VM cannot be shut down and you need to move its volumes to a different StorageClass. Under the hood, Harvester leverages [KubeVirt's volume migration](https://kubevirt.io/user-guide/storage/volume_migration/) mechanism — the system triggers a VM live migration while copying the volume data to the target volume in the background.

### Steps

1. Create a new PVC with the desired target StorageClass. Ensure the PVC has sufficient capacity (equal to or greater than the source volume).

2. Navigate to the **Virtual Machines** page, find the target VM, and select **⋮ > Migrate Storage**.

3. Select the volume you want to migrate and choose the target PVC.

4. Confirm the migration. The system begins copying volume data in the background while the VM continues running.

5. Monitor the migration progress on the VM detail page.

### Cancelling an Online Migration

1. Navigate to the **Virtual Machines** page, find the VM with an in-progress migration, and select **⋮ > Cancel Storage Migration**.

2. The controller aborts the ongoing VM live migration. The VM continues to run with the original volume and no data is lost.

3. The target PVC is not automatically cleaned up. You are responsible for deleting it if it is no longer needed.

### Limitations

The following limitations are inherited from KubeVirt's volume migration:

- The VM must be migrated to a different node during storage migration. Same-node storage migration is not supported.
- Shareable disks are not supported due to data consistency concerns with multiple writers.
- Hotplugged disks cannot be migrated.
- `virtiofs` disks are not supported as they lack live-migration capability.
- LUN disks cannot be migrated when the destination StorageClass differs from the source.
- Migrating between two `ReadWriteOnce` PVCs backed by local storage is only permitted when the PVCs reside on different nodes.
- Only `PersistentVolumeClaim` and `DataVolume` sources are supported.

## Offline Data Migration

Use offline data migration when the volume is not attached to any running VM. This mode uses CDI (Containerized Data Importer) to clone the volume data to a new PVC on the target StorageClass.

### Steps

1. Ensure the volume is not attached to any running VM. If the VM is running, shut it down first.

2. Navigate to the **Volumes** page, find the volume you want to migrate, and select **⋮ > Data Migration**.

3. In the dialog, specify:
   - **Target Volume Name**: The name for the new volume.
   - **Target StorageClass**: The destination StorageClass.

4. Click **Confirm**. The system creates a CDI DataVolume that clones the data from the source volume.

5. Monitor the cloning progress on the Volumes page via the DataVolume status.

6. Once the migration is complete, the new volume appears in the Volumes list. You can then replace it in a VM.

### Limitations

- The source volume must be in `Bound` status.
- The source volume must not be attached to any running VM.
- The target volume name must not conflict with any existing PVC or DataVolume in the same namespace.
- The target StorageClass must exist.

## Troubleshooting

### Online Migration Failure

When an online storage migration fails (for example, due to insufficient space on the target storage, a network error, or a node failure):

1. KubeVirt automatically retries the VM live migration.
2. The retry loop continues until the migration succeeds or you explicitly cancel it.
3. Check the VM's status and conditions for the failure reason.

### ManualRecoveryRequired Condition

In some cases, a failed volume migration may set a `ManualRecoveryRequired` condition on the VirtualMachine CR. When this occurs:

1. Check the condition message for details about the failure.
2. Resolve the underlying issue (for example, free up storage space or fix network connectivity).
3. Follow the [KubeVirt volume migration recovery documentation](https://kubevirt.io/user-guide/storage/volume_migration/) to clear the condition.

### Offline Data Migration Failure

If an offline data migration fails:

1. Check the DataVolume status for error details: `kubectl get dv -n <namespace> <target-volume-name> -o yaml`.
2. Common causes include insufficient storage capacity and incompatible StorageClass configurations.
3. Delete the failed DataVolume and retry after resolving the issue.
