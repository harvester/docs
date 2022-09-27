---
sidebar_position: 5
sidebar_label: VM Backup & Restore
title: ""
keywords:
  - Harvester
  - harvester
  - Rancher
  - rancher
  - VM Backup & Restore
Description: VM backups are created from the Virtual Machines page. The VM backup volumes will be stored in the Backup Target(an NFS or S3 server) and they can be used to either restore a new VM or replace an existing VM.
---

# VM Backup & Restore

_Available as of v0.3.0_

VM backups are created from the **Virtual Machines** page. The VM backup volumes will be stored in the **Backup Target** (an NFS or S3 server), and they can be used to either restore a new VM or replace an existing VM.
![vm-backup.png](/img/v1.0/vm/vm-backup.png)

:::note

A backup target must be set up. For more information, see [Configure Backup Target](#configure-backup-target). If the backup target has not been set, you’ll be prompted with a message to do so.

:::

## Configure Backup Target

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

## Create a VM backup

1. Once the backup target is set, go to the `Virtual Machines` page.
1. Click `Take Backup` of the VM actions to create a new VM backup.
1. Set a custom backup name and click `Create` to create a new VM backup.
![create-backup.png](/img/v1.0/vm/create-backup.png)

**Result:** The backup is created. You will receive a notification message, and you can also go to the `Advanced > Backups` page to view all VM backups.

The `ReadyToUse` status will be set to `true` once the Backup is complete.

Users can either choose to restore a new VM or replace an existing VM using this backup.

## Restore a new VM using a backup

To restore a new VM from a backup, follow these steps:

1. Go to the `Backups` page.
1. Specify the new VM name and click `Create`.
1. A new VM will be restored using the backup volumes and metadata, and you can access it from the `Virtual Machines` page.
![restore-vm.png](/img/v1.0/vm/restore-vm.png)

## Replace an Existing VM using a backup

You can replace an existing VM using the backup with the same VM backup target.

You can choose to either delete or retain the previous volumes. By default, all previous volumes are deleted.

**Requirements:** The VM must exist and is required to be in the powered-off status.

1. Go to the `Backups` page.
1. Click `Create`.

The restore process can be viewed from the `Virtual Machines` page.

## Restore a new VM on another Harvester cluster

_Available as of v1.0.0_

Users can now restore a new VM on another cluster by leveraging the VM metadata & content backup feature.

:::info prerequisites

You must manually configure the virtual machine images with the same name on the new cluster first, otherwise the virtual machines will be failed to recover.

:::

### Upload the same VM images to a new cluster

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

### Restore a new VM in a new cluster

1. Setup the same backup target in a new cluster. And the backup controller will automatically sync the backup metadata to the new cluster.
2. Go to the `Backups` page.
3. Select the synced VM backup metadata and choose to restore a new VM with a specified VM name.
4. A new VM will be restored using the backup volumes and metadata. You can access it from the `Virtual Machines` page.
