---
sidebar_position: 3
sidebar_label: Third-Party Storage Support
title: "Third-Party Storage Support"
---

<head>
  <link rel="canonical" href="https://docs.harvesterhci.io/v1.6/advanced/csidriver"/>
</head>

_Available as of v1.2.0_

Harvester now offers the capability to install a [Container Storage Interface (CSI)](https://kubernetes-csi.github.io/docs/introduction.html) in your Harvester cluster. This allows you to leverage external storage for the Virtual Machine's non-system data disk, allowing you to use different drivers tailored for specific needs, whether for performance optimization or seamless integration with your existing in-house storage solutions.

:::note

The Virtual Machine (VM) image provisioner in Harvester still relies on Longhorn. Before version 1.2.0, Harvester exclusively supported Longhorn for storing VM data and did not offer support for external storage as a destination for VM data.

:::

## Prerequisites

For the Harvester functions to work well, the third-party CSI driver needs to have the following capabilities:
- Support expansion
- Support snapshot
- Support clone
- Support block device
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

1. Login to the Harvester UI, then navigate to **Advanced** > **Settings**.
1. Find and select **csi-driver-config**, and then select **⋮** > **Edit Setting** to access the configuration options.
1. Set the **Provisioner** to the third-party CSI driver in the settings.
1. Next, Configure the **Volume Snapshot Class Name**. This setting points to the name of the `VolumeSnapshotClass` used for creating volume snapshots or VM snapshots.

![csi-driver-config-external](/img/v1.2/advanced/csi-driver-config-external.png)

### VM Backup Compatibility

- In Harvester **v1.4.2 and later versions**, the setting **Backup Volume Snapshot Class Name** cannot be used with external storage. Harvester is unable to create backups of volumes in external storage because the backup function is not included in the CSI standard and 
there is no way to create a remote backup for differing storage providers. Backup support in Harvester is limited to Longhorn V1 Data Engine volumes.  
- Harvester is unable to restore virtual machine backups with external storage because the data does not have a remote copy.

For more information, see issues [7316](https://github.com/harvester/harvester/issues/7316), [7737](https://github.com/harvester/harvester/issues/7737), and [7755](https://github.com/harvester/harvester/issues/7755).

## Use the CSI driver

After successfully configuring these settings, you can utilize the third-party StorageClass. You can apply the third-party StorageClass when creating an empty volume or adding a new block volume to a VM, enhancing your Harvester cluster's storage capabilities.

With these configurations in place, your Harvester cluster is ready to make the most of the third-party storage integration.

![rook-ceph-volume-external](/img/v1.2/advanced/rook-ceph-volume-external.png)

![rook-ceph-vm-external](/img/v1.2/advanced/rook-ceph-vm-external.png)

## References

- [Use Rook Ceph External Storage with Harvester](https://harvesterhci.io/kb/use_rook_ceph_external_storage)
- [Using NetApp Storage on Harvester](https://harvesterhci.io/kb/install_netapp_trident_csi)

## Known Issues

### 1. Multipath support
_Available as of v1.4.3_

Certain 3rd party CSI may need multipath to be enabled.

By default `multipathd` is disabled in Harvester. Users can enable this post installation by simply logging into the individual nodes and running the following commands:

```
systemctl enable multipathd
systemctl start multipathd
```

This can also be executed by dropping an elemental cloud-init file such as `/oem/99-start-multipathd.yaml` with the following contents

```
stages:
   default:
   - name: "start multipathd"
     systemctl:
       enable:
         - multipathd
       start:
         - multipathd
```

Users wishing to automate this further can leverage the `CloudInit CRD` to apply the same instructions to a set of hosts

```
apiVersion: node.harvesterhci.io/v1beta1
kind: CloudInit
metadata:
  name: start-mutlitpathd
spec:
  matchSelector:
    harvesterhci.io/managed: "true"
  filename: 99-start-mutlitpathd
  contents: |
    stages:
      default:
        - name: "start multipathd"
          systemctl:
            enable:
              - multipathd
            start:
              - multipathd
  paused: false
```