---
sidebar_position: 5
sidebar_label: VM Backup, Snapshot & Restore
title: "VM Backup, Snapshot & Restore"
keywords:
  - Harvester
  - harvester
  - Rancher
  - rancher
  - VM Backup, Snapshot & Restore
Description: VM backups are created from the Virtual Machines page. The VM backup volumes will be stored in the Backup Target(an NFS or S3 server) and they can be used to either restore a new VM or replace an existing VM. VM Snapshot can work without Backup Target.
---

<head>
  <link rel="canonical" href="https://docs.harvesterhci.io/v1.1/vm/backup-restore"/>
</head>

## VM Backup & Restore

_Available as of v0.3.0_

VM backups are created from the **Virtual Machines** page. The VM backup volumes will be stored in the **Backup Target** (an NFS or S3 server), and they can be used to either restore a new VM or replace an existing VM.
![vm-backup.png](/img/v1.2/vm/vm-backup.png)

:::note

A backup target must be set up. For more information, see [Configure Backup Target](#configure-backup-target). If the backup target has not been set, you’ll be prompted with a message to do so.

:::

### Configure Backup Target

A backup target is an endpoint used to access a backup store in Harvester. A backup store is an NFS server or S3 compatible server that stores the backups of VM volumes. The backup target can be set at `Settings > backup-target`.

| Parameter          | Type   | Description                                                                              |
| :----------------- | :----- | :--------------------------------------------------------------------------------------- |
| Type               | string | Choose S3 or NFS                                                                         |
| Endpoint           | string | A hostname or an IP address. It can be left empty for AWS S3.                |
| BucketName         | string | Name of the bucket                                                                       |
| BucketRegion       | string | Region of the bucket                                                                     |
| AccessKeyID        | string | A user-id that uniquely identifies your account                     |
| SecretAccessKey    | string | The password to your account                                         |
| Certificate        | string | Paste to use a self-signed SSL certificate of your S3 server |
| VirtualHostedStyle | bool   | Use `VirtualHostedStyle` access only; e.g., Alibaba Cloud (Aliyun) OSS                    |

### Create a VM backup

1. Once the backup target is set, go to the `Virtual Machines` page.
1. Click `Take Backup` of the VM actions to create a new VM backup.
1. Set a custom backup name and click `Create` to create a new VM backup.
![create-backup.png](/img/v1.2/vm/create-backup.png)

**Result:** The backup is created. You will receive a notification message, and you can also go to the `Backup & Snapshot > VM Backups` page to view all VM backups.

The `ReadyToUse` status will be set to `true` once the backup is complete.

Users can either restore a new VM or replace an existing VM using this backup.

### Restore a new VM using a backup

To restore a new VM from a backup, follow these steps:

1. Go to the `VM Backups` page.
1. Specify the new VM name and click `Create`.
1. A new VM will be restored using the backup volumes and metadata, and you can access it from the `Virtual Machines` page.
![restore-vm.png](/img/v1.2/vm/restore-vm.png)

### Replace an existing VM using a backup

You can replace an existing VM using the backup with the same VM backup target.

You can choose to either delete or retain the previous volumes. By default, all previous volumes are deleted.

**Requirements:** The VM must exist and is required to be in the powered-off status.

1. Go to the `VM Backups` page.
1. Click `Replace Existing`.

The restore process can be viewed from the `Virtual Machines` page.

### Restore a new VM on another Harvester cluster

_Available as of v1.0.0_

Users can now restore a new VM on another cluster by leveraging the VM metadata & content backup feature.

:::info prerequisites

You must manually configure the virtual machine images with the same name on the new cluster first, otherwise the virtual machines will be failed to recover.

:::

#### Upload the same VM images to a new cluster

1. Check the existing image name (normally starts with `image-`) and create the same one on the new cluster.
```
$ kubectl get vmimages -A
NAMESPACE   NAME                               DISPLAY-NAME                              SIZE         AGE
default     image-79hdq                        focal-server-cloudimg-amd64.img           566886400    5h36m
default     image-l7924                        harvester-v1.0.0-rc2-amd64.iso            3964551168   137m
default     image-lvqxn                        opensuse-leap-15.3.x86_64-nocloud.qcow2   568524800    5h35m
```
2. Apply a VM image YAML with the same name and content in the new cluster.
```
$ cat <<EOF | kubectl apply -f -
apiVersion: harvesterhci.io/v1beta1
kind: VirtualMachineImage
metadata:
  name: image-lvqxn
  namespace: default
spec:
  displayName: opensuse-leap-15.3.x86_64-nocloud.qcow2
  pvcName: ""
  pvcNamespace: ""
  sourceType: download
  url: http://download.opensuse.org/repositories/Cloud:/Images:/Leap_15.3/images/openSUSE-Leap-15.3.x86_64-NoCloud.qcow2
EOF
```

#### Restore a new VM in a new cluster

1. Setup the same backup target in a new cluster. And the backup controller will automatically sync the backup metadata to the new cluster.
2. Go to the `VM Backups` page.
3. Select the synced VM backup metadata and choose to restore a new VM with a specified VM name.
4. A new VM will be restored using the backup volumes and metadata. You can access it from the `Virtual Machines` page.

## VM Snapshot & Restore

_Available as of v1.1.0_

VM snapshots are created from the **Virtual Machines** page. The VM snapshot volumes will be stored in the cluster, and they can be used to either restore a new VM or replace an existing VM.
![vm-snapshot.png](/img/v1.2/vm/vm-snapshot.png)

### Create a VM snapshot

1. Go to the `Virtual Machines` page.
1. Click `Take VM Snapshot` of the VM actions to create a new VM snapshot.
1. Set a custom snapshot name and click `Create` to create a new VM snapshot.
![create-snapshot.png](/img/v1.2/vm/create-snapshot.png)

**Result:** The snapshot is created. You can also go to the `Backup & Snapshot > VM Snapshots` page to view all VM snapshots.

The `ReadyToUse` status will be set to `true` once the snapshot is complete.

Users can either restore a new VM or replace an existing VM using this snapshot.

### Restore a new VM using a snapshot

To restore a new VM from a snapshot, follow these steps:

1. Go to the `VM Snapshots` page.
1. Specify the new VM name and click `Create`.
1. A new VM will be restored using the snapshot volumes and metadata, and you can access it from the `Virtual Machines` page.
![restore-vm-snapshot.png](/img/v1.2/vm/restore-vm-snapshot.png)

### Replace an existing VM using a snapshot

You can replace an existing VM using the snapshot.

:::note

You can only choose to retain the previous volumes.

:::

1. Go to the `VM Snapshots` page.
1. Click `Replace Existing`.

The restore process can be viewed from the `Virtual Machines` page.
