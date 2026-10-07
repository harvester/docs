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

Some clustered applications running inside virtual machines need a disk that several VMs use at the same time, and they protect that disk with **SCSI-3 Persistent Reservations (PR)**. The most common example is Windows Server Failover Clustering (WSFC), including SQL Server Failover Cluster Instances (FCI).

Harvester attaches such a shared volume to each cluster node VM as a **LUN** disk (SCSI passthrough) with **SCSI-3 Persistent Reservation** enabled. The guest sends its reservation commands directly to the storage array, so the guest cluster can fence a node exactly as it would on physical servers.

## Prerequisites

### SAN storage and CSI driver

The shared volumes must be **SCSI LUNs from SAN storage** (iSCSI or Fibre Channel), provisioned by a CSI driver, for example NetApp Trident with the `ontap-san` driver. The array must support SCSI-3 Persistent Reservations.

Longhorn, Ceph RBD and NFS volumes can't be used as LUN disks.

### Multipath configuration

SAN CSI drivers use Linux multipath (`multipathd`) on every node. Set this up when you install the CSI driver. For guest clustering, the multipath configuration also needs these settings:

| Setting | Purpose |
|---|---|
| `reservation_key file` | Lets multipath track the reservation key of each LUN and apply reservations on every path. Required for persistent reservations. |
| `skip_kpartx yes` | Stops the nodes from creating device mappings for the partitions that guests create on the shared LUNs. |
| `find_multipaths no` | Claims the SAN LUNs as soon as they appear, as most SAN CSI drivers expect. |

Restrict multipath to the SAN's LUNs, so it never claims the nodes' local disks or Longhorn devices.

The following example for NetApp ONTAP uses a [CloudInit resource](../advanced/cloudinitcrd.md), so the configuration is applied on every node and kept across reboots:

```yaml
apiVersion: node.harvesterhci.io/v1beta1
kind: CloudInit
metadata:
  name: netapp-multipath
spec:
  matchSelector: {}
  filename: 98_netapp_multipath.yaml
  contents: |
    name: "multipath for NetApp ONTAP LUNs"
    stages:
      initramfs:
        - files:
            - path: /etc/multipath/conf.d/98-netapp.conf
              permissions: 0644
              owner: 0
              group: 0
              content: |
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
      network:
        - name: "enable multipathd"
          systemctl:
            enable:
              - multipathd
            start:
              - multipathd
```

For other arrays, replace the `vendor` and `product` values with your array's values, as documented by your storage vendor.

After applying the resource and rebooting the nodes (or starting `multipathd`), check that `multipath -ll` lists only SAN LUNs.

### Unique iSCSI initiator names

Each node must have its own iSCSI initiator name, because the array uses it to tell the nodes apart. Compare the value on every node:

```bash
sudo grep -v '^#' /etc/iscsi/initiatorname.iscsi
```

Clusters that were first installed with Harvester v1.4.x or earlier may still have the same initiator name on every node. On those nodes, generate a new name before using SAN storage:

1. Stop or migrate the workloads on the node that use SAN volumes.
1. Generate a new name, and restart `iscsid`:

   ```bash
   sudo rm /etc/iscsi/initiatorname.iscsi
   sudo /sbin/iscsi-gen-initiatorname
   sudo systemctl restart iscsid
   ```

1. Log out of existing iSCSI sessions to the SAN, so the node reconnects with the new name: `sudo iscsiadm -m node -T <target-iqn> -p <portal>:3260 --logout`.
1. Restart the CSI driver's node pod on that node, and check on the array that the node's host or initiator group shows the new name.

Repeat on each node, one at a time.

## Plan the virtual machines

- Run the cluster node VMs on **different Harvester nodes**. Use node scheduling or VM anti-affinity rules.
- Use the **VirtIO** bus for the boot disk. LUN disks use the SCSI bus, and Windows doesn't accept cluster disks on the same bus as the boot disk.

## Create the shared volumes

1. Go to **Volumes** and click **Create**.
1. Select the SAN storage class, set **Access Mode** to **ReadWriteMany** and **Volume Mode** to **Block**, and set the size.
1. Create one volume for each cluster disk, for example a small quorum (witness) disk and the data and log disks.

## Attach the volumes to the cluster nodes

On each cluster node VM:

1. Go to **Virtual Machines**, and select **⋮** > **Edit Config** for the VM.
1. On the **Volumes** tab, click **Add Volume**, and select **Existing Volume**.
1. Select the shared volume, and set **Type** to **lun**. The bus is set to **scsi** and the disk is shared between VMs.
1. Select **SCSI-3 Persistent Reservation**.
1. Keep **I/O Error Policy** set to **report**.
1. Click **Save**, and restart the VM so that the new disks are attached.

The **report** error policy matters for clusters. When the guest cluster fences a node, that node's writes to the shared disk are rejected by the array, which is expected. With **report**, the guest operating system receives the error and the cluster software handles it. With **stop**, the whole VM is paused instead.

The resulting VM configuration looks like this:

```yaml
spec:
  template:
    spec:
      domain:
        devices:
          disks:
            - name: quorum
              shareable: true
              errorPolicy: report
              lun:
                bus: scsi
                reservation: true
      volumes:
        - name: quorum
          persistentVolumeClaim:
            claimName: quorum
```

## Windows Server Failover Clustering

1. Create the Windows VMs with a VirtIO boot disk, and install the [SUSE Virtual Machine Driver Pack (VMDP)](./create-windows-vm.md).
1. Join the VMs to your Active Directory domain, and install the **Failover Clustering** feature on each of them.
1. Attach the shared volumes as described above. In **Disk Management**, the LUNs appear with the array's identity (for example `NETAPP LUN C-Mode`) and bus type **SAS**.
1. Validate the configuration before you create the cluster:

   ```powershell
   Test-Cluster -Node <node1>,<node2>
   ```

   All storage tests must pass, including **Validate SCSI-3 Persistent Reservation**.

1. Create the cluster, and configure the quorum disk as the disk witness.
1. For SQL Server, run **New SQL Server failover cluster installation** on the first node and **Add node to a SQL Server failover cluster** on the others. SQL Server setup doesn't open the Windows firewall, so allow the instance's port (TCP 1433 by default) on every node.

## Operations and limitations

- **Live migration:** VMs with persistent reservation disks can't be live migrated. Before you put a Harvester node into maintenance mode, move the clustered roles to another cluster node, or add this label to the VM so that Harvester shuts it down and starts it again when maintenance ends:

  ```
  harvesterhci.io/maintain-mode-strategy: ShutdownAndRestartAfterDisable
  ```

- **Backup and snapshot:** Harvester can't back up or snapshot volumes that are attached as shared disks. Protect the data from inside the guest cluster, for example with SQL Server backups.
- **Adding disks:** LUN disks are attached when the VM restarts. Plan disk changes for a maintenance window of the guest cluster.
