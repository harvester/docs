---
sidebar_position: 3
sidebar_label: Third-Party Storage Support
title: "Third-Party Storage Support"
---

<head>
  <link rel="canonical" href="https://docs.harvesterhci.io/v1.4/advanced/csidriver"/>
</head>

_Available as of v1.5.0_

Harvester now offers the capability to use the external [Container Storage Interface (CSI)](https://kubernetes-csi.github.io/docs/introduction.html) driver for not just data volume but root volume, allowing you to use different drivers tailored for specific needs, whether for performance optimization or seamless integration with your existing in-house storage solutions.

:::important

The Support Matrix below shows the capabilities of the validated CSI drivers.

| Storage Solution | VM Image | VM Rook Disk | VM Data Disk | Volume Export To VM Image | VM Template Generator | VM Live Migration | VM Snapshot | VM Backup |
| --- | --- | --- | --- | --- | --- | --- | --- | --- |
| Longhorn v2 Data Engine | &#10004; | &#10004; | &#10004; | &#10004; | &#10004; | &#10004; |&#10006; | &#10006; |
| Rook (RBD) | &#10004; | &#10004; | &#10004; | &#10004; | &#10004; | &#10004; | &#10004; | &#10006; |
| LVM | &#10004; | &#10004; | &#10004; | &#10004; | &#10004; | &#10006; | &#10004; | &#10006; |
| NFS | &#10004; | &#10004; | &#10004; | &#10004; | &#10004; | &#10004; | &#10006; | &#10006; |

:::

## Prerequisites

For the Harvester functions to work well, the third-party CSI driver might better to have the following capabilities:
- Support expansion, for online resizing of the volume
- Support snapshot, for take snapshot of the volume/VM
- Support clone, for clone volume/VM
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

Backup currently only supports the Longhorn v1 Data Engine. If you are using other storage providers, you can skip the **Backup VolumeSnapshot Class Name** configuration.

:::

1. Login to the Harvester UI, then navigate to **Advanced** > **Settings**.
1. Find and select **csi-driver-config**, and then select **⋮** > **Edit Setting** to access the configuration options.
1. Set the **Provisioner** to the third-party CSI driver in the settings.
1. Next, Configure the **Volume Snapshot Class Name**. This setting points to the name of the `VolumeSnapshotClass` used for creating volume snapshots or VM snapshots.

![csi-driver-config-external](/img/v1.5/advanced/csi-driver-config-external.png)

## Use the CSI driver

After we have installed the CSI driver and configured the Harvester Cluster, we can now use the third-party storage solution in Harvester on serval scenarios.

### VM Image

Now, we can use the third-party storage solution as the VM image storage.

1. GoTo **Image** and Click **Create**
1. Config **URL** or **File** for the image
1. Config *StorageClass* on the **Storage** page. Select the StorageClass (e.g., *nfs-csi*) for your third-party storage solution.
1. Click **Create** to create the VM image.

![create-image-with-nfs-csi](/img/v1.5/advanced/create-image-with-nfs-csi.png)

After the image is created, you can see the image is created with the third-party storage solution.
![created-image-with-nfs-csi](/img/v1.5/advanced/created-image-with-nfs-csi.png) 

### VirtualMachine

Now, we can use the third-party storage solution as the VM root volume and data volume.

1. GoTo **Virtual Machine** and Click **Create**
1. GoTo **Volumes** and select the VM image created with the third-party storage solution.
1. Click **Add Volume** to add the data volume with the third-party storage solution.
1. Click **Create** to create the VM.

The VM root volume is created with NFS, and the data volume is created with Longhorn v2 DataEngine.

![various-volumes-for-vm-creating](/img/v1.5/advanced/various-volumes-for-vm-creating.png)


![various-volumes-for-vm-created](/img/v1.5/advanced/various-volumes-for-vm-created.png)

### Volume

Since we support third-party storage solutions, you can create the volume and select the corresponding volume mode.

1. GoTo **Volumes** and Click **Create**
1. Select the **StorageClass** for the third-party storage solution.
1. Select the *nfs-csi* StorageClass and you should also select the *Filesystem* for the volume mode.
1. Click **Create** to create the volume.

![create-fs-volume](/img/v1.5/advanced/create-fs-volume.png)

## Advanced/Internal Topics

### Top level architecture

By introducing the Containerized-Data Importer (CDI) into Harvester, Harvester can abstract the VM Image and VM Root Disk path for generic third-party storage solutions. The CDI will help to import the VM Image and VM Root Disk. So, the third-party storage solution can be used as the VM Image and VM Root Disk.

More detailed can be found in the HEP [Third Party Storage Support](https://github.com/harvester/harvester/blob/master/enhancements/20250203-third-party-storage-support.md).

### Notable Configuration Options

#### Storage Profile

The CRD **StorageProfile** is the import concept for the Containerized-Data Importer (CDI). The **StorageProfile** can be used to define individual configuration for different storage providers. The following is the example for the **StorageProfile** for the LVM storage provider. We can use it to know each fields' meaning.

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

- claimPropertySets: The claimPropertySets field is used to define the accessModes and volumeMode for the StorageProfile.
- snapshotClass: The snapshotClass field is used to define the VolumeSnapshotClass for the StorageProfile.
- cloneStrategy: The cloneStrategy field is used to define the clone strategy for the StorageProfile.

The cloneStrategy is associated with the [efficient clone](https://github.com/kubevirt/containerized-data-importer/blob/main/doc/efficient-cloning.md).

Efficient clone could be classified into three categories:
- *CSI volume cloning* - Leverage the clone capability of the storage provider. The corresponding cloneStrategy is **csi-clone**.
- *Smart Cloning* (snapshot-based cloning) - Leverage the snaphsot capability of the storage provider. The corresponding cloneStrategy is **snapshot**.
- *host-assisted cloning* - Depends on directly data copy from source pod (volume) to target pod (volume). The corresponding cloneStrategy is **copy**.

You can define the above fields to override the default configuration showing on the status.

### Limitatioin

We still have the following limitations for current third-party storage support.

#### Backup is not supported

Currently, the backup feature only supports the Longhorn v1 Data Engine. If the VM contains any volume from the third-party storage provider, the backup feature will be blocked.

#### Cannot convert the attached PVC to the VM Image

Currently, the attached PVC cannot be converted to the VM Image. It the known issue comes from the CDI. If you want to export the volume which store in third-party storage provider, please ensure the PVC is not attached to any workloads.

It will stuck like below if the PVC is attached to the VM.

![convert-pvc-to-image-stuck](/img/v1.5/advanced/convert-pvc-to-image-stuck.png)

## References

- [Use Rook Ceph External Storage with Harvester](https://harvesterhci.io/kb/use_rook_ceph_external_storage)
- [Using NetApp Storage on Harvester](https://harvesterhci.io/kb/install_netapp_trident_csi)
- [Third Party Storage Support](https://github.com/harvester/harvester/blob/master/enhancements/20250203-third-party-storage-support.md) 