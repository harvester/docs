---
sidebar_position: 16
sidebar_label: Guest Clustering with Shared SAN LUNs
title: "Guest Clustering with Shared SAN LUNs"
keywords:
  - Harvester
  - harvester
  - Windows Server Failover Clustering
  - WSFC
  - SQL Server Failover Cluster Instance
  - shared disk
  - SCSI-3 Persistent Reservation
  - LUN passthrough
description: Run guest clusters such as Windows Server Failover Clustering on shared SAN LUNs with SCSI-3 Persistent Reservations.
---

<head>
  <link rel="canonical" href="https://docs.harvesterhci.io/v1.10/vm/guest-clustering-shared-luns"/>
</head>

Some clustered applications running inside virtual machines need a disk that several VMs use at the same time, and they protect that disk with **SCSI-3 Persistent Reservations (PR)**. The most common example is Windows Server Failover Clustering (WSFC) with SQL Server Failover Cluster Instances.

Harvester supports this by attaching a shared volume to each cluster node VM as a **SCSI LUN passthrough** disk with **persistent reservations** enabled. The guest's reservation commands are forwarded to the storage array through `qemu-pr-helper`, which runs in each `virt-handler` pod.

## Requirements

### Storage

The shared volume must be a **real SCSI LUN**, which means a CSI driver for iSCSI or Fibre Channel SAN storage, for example NetApp Trident with the `ontap-san` driver. The array must support SCSI-3 Persistent Reservations.

| Storage | Can be used |
|---|---|
| SAN CSI drivers exposing iSCSI/FC LUNs | Yes |
| Longhorn | No |
| Ceph RBD | No (a `lun` disk doesn't start; a shared `disk` isn't accepted by WSFC) |
| NFS | No |

The volume must be created with **access mode ReadWriteMany** and **volume mode Block**.

### Nodes

- **Unique iSCSI initiator names.** Every node must have a different `InitiatorName` in `/etc/iscsi/initiatorname.iscsi`. Clusters first installed with v1.4.x or earlier may still share one; see [harvester/harvester#11842](https://github.com/harvester/harvester/issues/11842).
- **Multipath configured for the SAN LUNs**, with persistent reservation support. For example, a [CloudInit](../advanced/cloudinitcrd.md) resource that writes `/etc/multipath/conf.d/98-san.conf` and enables `multipathd`:

  ```
  defaults {
      user_friendly_names yes
      find_multipaths no
      reservation_key file
      skip_kpartx yes
  }
  blacklist {
      device {
          vendor ".*"
          product ".*"
      }
  }
  blacklist_exceptions {
      device {
          vendor "NETAPP"
          product "LUN.*"
      }
  }
  ```

  - `reservation_key file` is required for persistent reservations on multipath devices.
  - `skip_kpartx yes` stops the hosts from creating device-mapper entries for the partitions that the guests create on the shared LUNs.
  - Replace the vendor and product with your array's values, and keep the blacklist so that multipath doesn't claim local disks.

### Virtual machines

- Place the cluster node VMs on **different Harvester nodes**, using node scheduling or affinity rules.
- Use `virtio` (or `sata`) for the **boot disk**, not `scsi`. All `scsi` disks of a VM share one SCSI controller, and Windows doesn't accept cluster disks on the same bus as the boot disk.

## Create the shared volumes

1. Go to **Volumes** and click **Create**.
1. Select the SAN storage class, set **Volume Mode** to **Block**, and create one volume per cluster disk (for example, a quorum disk and the data disks).

## Attach the volumes to each cluster node

For every cluster node VM:

1. Edit the VM and go to **Volumes**. Click **Add Volume**, then select **Existing Volume** and the shared volume.
1. Set **Type** to **lun**. The bus is set to `scsi` and the disk becomes shareable.
1. Select **SCSI-3 Persistent Reservation**.
1. Save. The VM restarts with the new disks.

The resulting disk definition is:

```yaml
spec:
  template:
    spec:
      domain:
        devices:
          disks:
            - name: quorum
              shareable: true
              lun:
                bus: scsi
                reservation: true
      volumes:
        - name: quorum
          persistentVolumeClaim:
            claimName: quorum
```

You can also apply this with **Edit YAML**.

## Windows guests

- Install the [SUSE Virtual Machine Driver Pack (VMDP)](./create-windows-vm.md).
- The VMDP SCSI driver reports its bus type as parallel SCSI, which Windows Failover Clustering doesn't accept ("Disk bus type does not support clustering"). Until a VMDP release changes it, set the bus type to SAS on every cluster node and restart:

  ```powershell
  Set-ItemProperty HKLM:\SYSTEM\CurrentControlSet\Services\pvvxscsi\Parameters -Name BusType -Value 0xA -Type DWord
  Restart-Computer
  ```

- If Windows was installed with its boot disk on `scsi`, remove `HKLM\SYSTEM\CurrentControlSet\Services\pvvxblk\StartOverride` before changing the boot disk to `virtio`. Otherwise Windows doesn't boot (`INACCESSIBLE_BOOT_DEVICE`).
- Validate the configuration before you create the cluster: `Test-Cluster -Node <node1>,<node2>`. On an existing cluster, include the cluster disks with `-Disk`. The **Validate SCSI-3 Persistent Reservation** test must pass.
- SQL Server setup doesn't open the Windows firewall for the instance. Allow TCP 1433 on every cluster node.

:::caution

Windows guests using VMDP 2.5.5 don't report a reservation conflict correctly, so **Validate SCSI-3 Persistent Reservation** fails on two-node clusters. See [harvester/harvester#11838](https://github.com/harvester/harvester/issues/11838).

:::

## Operations and limitations

- **Live migration:** VMs with persistent reservation disks can't be live migrated (`PersistentReservationNotLiveMigratable`). Before you put a node in maintenance mode, fail the guest cluster over, or label the VM so that Harvester shuts it down and starts it again after maintenance:

  ```
  harvesterhci.io/maintain-mode-strategy: ShutdownAndRestartAfterDisable
  ```

- **Backup and snapshot:** volumes attached as shareable disks can't be backed up or snapshotted by Harvester. Protect the data from inside the guest cluster.
- **Force Stop:** after a **Force Stop**, a VM may not start again with **Start**. See [harvester/harvester#11835](https://github.com/harvester/harvester/issues/11835).
