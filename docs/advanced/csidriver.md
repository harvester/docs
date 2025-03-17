---
sidebar_position: 3
sidebar_label: Third-Party Storage Support
title: "Third-Party Storage Support"
---

<head>
  <link rel="canonical" href="https://docs.harvesterhci.io/v1.4/advanced/csidriver"/>
</head>

_Available as of v1.5.0_

Harvester now supports provisioning of root volumes and data volumes using external [Container Storage Interface (CSI)](https://kubernetes-csi.github.io/docs/introduction.html) drivers. This enhancement allows you to select drivers that meet specific requirements, such as performance optimization or seamless integration with existing internal storage solutions.

:::important

The matrix below shows the supported capabilities of the validated CSI drivers.

| Storage Solution | VM Image | VM Rook Disk | VM Data Disk | Volume Export To VM Image | VM Template Generator | VM Live Migration | VM Snapshot | VM Backup |
| --- | --- | --- | --- | --- | --- | --- | --- | --- |
| Longhorn v2 Data Engine | &#10004; | &#10004; | &#10004; | &#10004; | &#10004; | &#10004; |&#10006; | &#10006; |
| Rook (RBD) | &#10004; | &#10004; | &#10004; | &#10004; | &#10004; | &#10004; | &#10004; | &#10006; |
| LVM | &#10004; | &#10004; | &#10004; | &#10004; | &#10004; | &#10006; | &#10004; | &#10006; |
| NFS | &#10004; | &#10004; | &#10004; | &#10004; | &#10004; | &#10004; | &#10006; | &#10006; |

For more information on SUSE certified 3rd-party storage. See [SUSE Certified Storage for Virtualization](https://www.suse.com/product-certification/suse-certified/virtualization-certification/).

:::

## Prerequisites

For the Harvester functions to work well, the third-party CSI driver should support the following capabilities:
- Volume expansion, for online resizing of the volume
- Volume snapshot, for taking snapshots of the volume/VM
- Volume clone, for cloning the volume/VM
- Support Read-Write-Many (RWX), for [Live Migration](../vm/live-migration.md)

## Create Harvester cluster

Harvester's operating system follows an immutable design, meaning that most OS files revert to their pre-configured state after a reboot. Therefore, you might need to perform additional configurations before installing the Harvester cluster for third-party CSI drivers.

Some CSI drivers require additional persistent paths on the host. You can add these paths to [`os.persistent_state_paths`](../install/harvester-configuration.md#ospersistent_state_paths).

Some CSI drivers require additional software packages on the host. You can install these packages with [`os.after_install_chroot_commands`](../install/harvester-configuration.md#osafter_install_chroot_commands).

:::note

Upgrading Harvester causes the changes to the OS in the `after-install-chroot` stage to be lost. You must also configure the `after-upgrade-chroot` to make your changes persistent across an upgrade. Refer to [Runtime persistent changes](https://rancher.github.io/elemental-toolkit/docs/customizing/runtime_persistent_changes/) before upgrading Harvester.

:::

## Install the CSI driver

After installing the Harvester cluster is complete, refer to [How can I access the kubeconfig file of the Harvester cluster?](../faq.md#how-can-i-access-the-kubeconfig-file-of-the-harvester-cluster) to get the kubeconfig of the cluster.

With the kubeconfig of the Harvester cluster, you can install the third-party CSI drivers into the cluster by following the installation instructions for each CSI driver. You must also refer to the CSI driver documentation to create the `StorageClass` and `VolumeSnapshotClass` in the Harvester cluster.

## Configure Harvester Cluster

Before you can make use of Harvester's **Backup & Snapshot** features, you need to set up some essential configurations through the Harvester [csi-driver-config](../advanced/settings.md#csi-driver-config) setting. Follow these steps to make these configurations:

:::note

Backup currently only works with the Longhorn v1 Data Engine. If you are using other storage providers, you can skip the **Backup VolumeSnapshot Class Name** configuration.

For more information, see [VM Backup Compatibility](../../versioned_docs/version-v1.4/advanced/csidriver.md#vm-backup-compatibility).

:::

1. Login to the Harvester UI, then navigate to **Advanced** > **Settings**.
1. Find and select **csi-driver-config**, and then select **⋮** > **Edit Setting** to access the configuration options.
1. Set the **Provisioner** to the third-party CSI driver in the settings.
1. Next, Configure the **Volume Snapshot Class Name**. This setting points to the name of the `VolumeSnapshotClass` used for creating volume snapshots or VM snapshots.

![csi-driver-config-external](/img/v1.5/advanced/csi-driver-config-external.png)

## Use the CSI Driver

Once the CSI driver is installed and the Harvester cluster is configured, an external storage solution can be used in tasks that involve storage management.

### Virtual Machine Image Creation

You can use an external storage solution to store and manage virtual machine images.

When [uploading a virtual machine image](../image/upload-image.md) using the Harvester UI (**Image > Create**), you must select the StorageClass for the external storage solution on the **Storage** tab. In the following example, the StorageClass is **nfs-csi**.

![create-image-with-nfs-csi](/img/v1.5/advanced/create-image-with-nfs-csi.png)

Harvester stores the created the image in the external storage solution.

![created-image-with-nfs-csi](/img/v1.5/advanced/created-image-with-nfs-csi.png) 

### Virtual Machine Creation

Your virtual machines can use root and data volumes in external storage.

When [creating a virtual machine](../vm/create-vm.md) using the Harvester UI (**Virtual Machine > Create**), you must perform the following actions on the **Volumes** tab:

- Select a virtual machine image stored in the external storage solution, and then configure the required settings.
- Add a data volume.

![various-volumes-for-vm-creating](/img/v1.5/advanced/various-volumes-for-vm-creating.png)

In the following example, the root volume is created using NFS, and the data volume is created using the Longhorn V2 Data Engine.

![various-volumes-for-vm-created](/img/v1.5/advanced/various-volumes-for-vm-created.png)

### Volume Creation

You can create volumes in your external storage solution.

When [creating a volume](../volume/create-volume.md) using the Harvester UI (**Volumes > Create**), you must perform the following actions:

- **Storage Class**: Select the target StorageClass, e.g. **nfs-csi**.
- **Volume Mode**: Select the corresponding volume mode, e.g. **Filesystem** for **nfs-csi**.

![create-fs-volume](/img/v1.5/advanced/create-fs-volume.png)

## Advanced Topics

### Storage Profiles

You can now use the CDI API to create custom [storage profiles](https://github.com/kubevirt/containerized-data-importer/blob/main/doc/storageprofile.md) that simplify definition of data volumes. Storage profiles allow multiple data volumes to share the same provisioner settings.

The following is an example of an LVM storage profile:

```yaml
apiVersion: cdi.kubevirt.io/v1beta1
kind: StorageProfile
metadata:
  name: lvm-node-1-striped
spec:
  claimPropertySets:
  - accessModes:
    - ReadWriteOnce
    volumeMode: Block
status:
  claimPropertySets:
  - accessModes:
    - ReadWriteOnce
    volumeMode: Block
  cloneStrategy: snapshot
  dataImportCronSourceFormat: pvc
  provisioner: lvm.driver.harvesterhci.io
  snapshotClass: lvm-snapshot
  storageClass: lvm-node-1-striped
```

For more information, see [Storage Profiles](https://github.com/kubevirt/containerized-data-importer/blob/main/doc/storageprofile.md) in the CDI documentation.

You can define the above fields to override the default configuration showing on the status.

### Limitations

- Backup support is currently limited to Longhorn V1 Data Engine volumes. Harvester is unable to create backups of volumes in external storage. 

- There is a limitation in the CDI prevents Harvester from converting attached PVCs to virtual machine images. Before exporting a volume in external storage, ensure that the PVC is not attached to workloads. This prevents the resulting image from getting stuck in the *Exporting* state.

![convert-pvc-to-image-stuck](/img/v1.5/advanced/convert-pvc-to-image-stuck.png)

## References

- [Use Rook Ceph External Storage with Harvester](https://harvesterhci.io/kb/use_rook_ceph_external_storage)
- [Using NetApp Storage on Harvester](https://harvesterhci.io/kb/install_netapp_trident_csi)
- [Third Party Storage Support](https://github.com/harvester/harvester/blob/master/enhancements/20250203-third-party-storage-support.md) 