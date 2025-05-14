---
sidebar_position: 6
sidebar_label: VM Backup, Snapshot & Restore
title: "VM Backup, Snapshot & Restore"
keywords:
  - Harvester
  - harvester
  - Rancher
  - rancher
  - VM Backup, Snapshot & Restore
description: VM backups are created from the Virtual Machines page. The VM backup volumes will be stored in the Backup Target(an NFS or S3 server) and they can be used to either restore a new VM or replace an existing VM. VM Snapshot can work without Backup Target.
---

<head>
  <link rel="canonical" href="https://docs.harvesterhci.io/v1.5/vm/backup-restore"/>
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

The `State` will be set to `Ready` once the backup is complete.

![vm-backup-results.png](/img/v1.2/vm/vm-backup-results.png)

Users can either restore a new VM or replace an existing VM using this backup.

### Restore a new VM using a backup

To restore a new VM from a backup, follow these steps:

1. Go to the `VM Backups` page.
1. Click the `Restore Backup` button at the top right.
1. Specify the new VM name and click `Create`.
1. A new VM will be restored using the backup volumes and metadata, and you can access it from the `Virtual Machines` page.
![restore-vm.png](/img/v1.2/vm/restore-vm.png)

### Replace an existing VM using a backup

You can replace an existing VM using the backup with the same VM backup target.

You can choose to either delete or retain the previous volumes. By default, all previous volumes are deleted.

**Requirements:** The VM must exist and is required to be in the powered-off status.

1. Go to the `VM Backups` page.
1. Click the `Restore Backup` button at the top right.
1. Click `Replace Existing`.
1. You can view the restore process from the `Virtual Machines` page.
![vm-restore-existing.png](/img/v1.2/vm/vm-restore-existing.png)

### Restore a new VM on another Harvester cluster

_Available as of v1.0.0_

Users can now restore a new VM on another cluster by leveraging the VM metadata & content backup feature.

#### Prerequisites

- v1.4.0 and later: The controller automatically syncs the virtual machine images with the new cluster, except when a virtual machine image with the same name or display name already exists on the new cluster.

- Earlier than v1.4.0: You must upload and configure the virtual machine images on the new cluster. Ensure that the image names and configuration are identical so that the virtual machines can be restored. For more information, see [Upload the same VM images to a new cluster](#upload-the-same-vm-images-to-a-new-cluster).

#### Upload the same VM images to a new cluster

1. Download the virtual machine image from the existing cluster.

  ![vm-snapshot.png](/img/v1.5/vm/download-vm-image.png)

1. Decompress the downloaded image.
  ```
  $ gzip -d <image.gz>
  ```

1. Host the image on a server that is accessible to the new cluster.

  Example (simple HTTP server):
  ```
  $ python -m http.server
  ```

1. Check the existing image name (normally starts with `image-`) and create the same one on the new cluster.
  ```
  $ kubectl get vmimages -A
  NAMESPACE   NAME                               DISPLAY-NAME                              SIZE         AGE
  default     image-79hdq                        focal-server-cloudimg-amd64.img           566886400    5h36m
  default     image-l7924                        harvester-v1.0.0-rc2-amd64.iso            3964551168   137m
  default     image-lvqxn                        opensuse-leap-15.3.x86_64-nocloud.qcow2   568524800    5h35m
  ```

1. Apply a `VirtualMachineImage` YAML with the same name and configuration in the new cluster.

  Example:
  ```
  $ cat <<EOF | kubectl apply -f -
  apiVersion: harvesterhci.io/v1beta1
  kind: VirtualMachineImage
  metadata:
    name: image-79hdq
    namespace: default
  spec:
    displayName: focal-server-cloudimg-amd64.img
    pvcName: ""
    pvcNamespace: ""
    sourceType: download
    url: https://<server-ip-to-host-image>:8000/<image-name>
  EOF
  ```
  :::info important

  Harvester can restore virtual machines only if the image name and configuration on both old and new clusters are identical.

  :::

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

The `State` will be set to `Ready` once the snapshot is complete.

![vm-snapshot-results.png](/img/v1.2/vm/vm-snapshot-results.png)

Users can either restore a new VM or replace an existing VM using this snapshot.

### Restore a new VM using a snapshot

To restore a new VM from a snapshot, follow these steps:

1. Go to the `VM Snapshots` page.
1. Click the `Restore Snapshot` button at the top right.
1. Specify the new VM name and click `Create`.
1. A new VM will be restored using the snapshot volumes and metadata, and you can access it from the `Virtual Machines` page.
![restore-vm-snapshot.png](/img/v1.2/vm/restore-vm-snapshot.png)

### Replace an existing VM using a snapshot

You can replace an existing VM using the snapshot.

:::note

You can only choose to retain the previous volumes.

:::

1. Go to the `VM Snapshots` page.
1. Click the `Restore Snapshot` button at the top right.
1. Click `Replace Existing`.
1. You can view the restore process from the `Virtual Machines` page.
![restore-vm-snapshot-existing.png](/img/v1.2/vm/restore-vm-snapshot-existing.png)

## VM Snapshot Space Management

_Available as of v1.4.0_

Volumes consume extra disk space in the cluster whenever you create a new virtual machine backup or snapshot. To manage this, you can configure space usage limits at the namespace and virtual machine levels. The configured values represent the maximum amount of disk space that can be used by all backups and snapshots. No limits are set by default.

### Configure the Snapshot Space Usage Limit at the Namespace Level

1. Go to the **Namespaces** screen.

1. Locate the target namespace, and then select **⋮ > Edit Quota**.

    ![edit-quota-namespace.png](/img/v1.4/vm/edit-quota-namespace.png)

1. Specify the maximum amount of disk space that can be consumed by all snapshots in the namespace, and then and click **Save**.

    ![edit-quota-namespace-save.png](/img/v1.4/vm/edit-quota-namespace-save.png)

1. Verify that the configured value is displayed on the **Namespaces** screen.

    ![edit-quota-namespace-read.png](/img/v1.4/vm/edit-quota-namespace-read.png)

### Configure the Snapshot Space Usage Limit at the Virtual Machine Level

1. Go to the **Virtual Machines** screen.

1. Locate the target virtual machine, and then select **⋮ > Edit VM Quota**.

    ![edit-quota-vm.png](/img/v1.4/vm/edit-quota-vm.png)

1. Specify the maximum total amount of disk space that can be consumed by all snapshots for the virtual machine, and then and click **Save**.

    ![edit-quota-vm-save.png](/img/v1.4/vm/edit-quota-vm-save.png)

1. Verify that the configured value is displayed on the **Quotas** tab of the virtual machine details screen.

    ![edit-quota-vm-read.png](/img/v1.4/vm/edit-quota-vm-read.png)

## Scheduling Virtual Machine Backups and Snapshots

_Available as of v1.4.0_

Harvester supports the creation of virtual machine backups and snapshots on a scheduled basis, with the option to retain a specific number of backups and snapshots. You can suspend, resume, and update the schedule at runtime.

### Create the Virtual Machine Schedule

1. Go to the **Virtual Machine Schedules** screen, and then click **Create Schedule**.

  ![create-schedule.png](/img/v1.4/vm/create-schedule.png)

2. Configure the following settings:

  ![configure-schedule.png](/img/v1.4/vm/configure-schedule.png)

  - **Type**: Select either **Backup** or **Snapshot**.

  - **Namespace** and **Virtual Machine Name**: Specify the namespace and name of the source virtual machine.

  - **Cron Schedule**: Specify the cron expression (a string consisting of fields separated by whitespace characters) that defines the schedule properties.

    :::info important

    The backup or snapshot creation interval must be **at least one hour**. Frequent backup or snapshot deletion results in heavy I/O load.

    If two schedules have the same granularity level, each iteration's timing offset must be **at least 10 minutes**.

    :::

  - **Retain**: Specify the number of up-to-date backups or snapshots to be retained.

    When this value is exceeded, the Harvester controller deletes the oldest backups or snapshots, and Longhorn starts the snapshot purge.

  - **Max Failure**: Specify the maximum number of consecutive failed backup or snapshot creation attempts to be allowed.

    When this value is exceeded, the Harvester controller suspends the schedule.

3. Click **Create**.

### Check the Status of a Virtual Machine Schedule

1. Go to the **Virtual Machine Schedules** screen.

1. Locate the target schedule, and then click the name to open the details screen.

1. On the **Basics** tab, verify that the settings are correct.

  ![check-schedule-basic.png](/img/v1.4/vm/check-schedule-basic.png)

1. On the **Backups** tab, check the status of the backups or snapshots that were created according to the schedule.

  ![check-schedule-backups.png](/img/v1.4/vm/check-schedule-backups.png)

  Backups and snapshots that are marked **Ready** can be used to restore the source virtual machine. For more information, see [VM Backup & Restore](#vm-backup--restore) and [VM Snapshot & Restore](#vm-snapshot--restore).

  ![check-schedule-restore.png](/img/v1.4/vm/check-schedule-restore.png)

### Edit a Virtual Machine Schedule

1. Go to the **Virtual Machine Schedules** screen.

1. Locate the target schedule, and then select **⋮ > Edit Config**.

  ![edit-schedule-config.png](/img/v1.4/vm/edit-schedule-config.png)

1. Edit the **Cron Schedule**, **Retain**, or **Max Failure** values.

  ![edit-schedule-parameters.png](/img/v1.4/vm/edit-schedule-parameters.png)

1. Click **Save** to apply the changes.

### Suspend or Resume a Virtual Machine Schedule

You can suspend active schedules and resume suspended schedules.

1. Go to the **Virtual Machine Schedules** screen.

1. Locate the target schedule, and then select **⋮ > Suspend or Resume**.

  ![suspend-resume-schedule.png](/img/v1.4/vm/suspend-resume-schedule.png)

  The schedule is automatically suspended when the number of consecutive failed backup or snapshot creation attempts exceeds the **Max Failure** value.

  Harvester does not allow you to resume a suspended schedule for backup creation if the backup target is not reachable.

  :::note

  If a schedule was automatically suspended because the **Max Failure** value was exceeded, you must explicitly resume that schedule after verifying that the backup/snapshot can be created successfully. For example, when the backup target is back online from the previous disconnection, the user can manually create a backup and check the result first.

  :::

### Virtual Machine Operations and Harvester Upgrades

Before you upgrade Harvester, ensure that no virtual machine backups or snapshots are in use, and that all virtual machine schedules are suspended. The Harvester UI displays the following error messages when upgrade attempts are rejected:

- Virtual machine backups or snapshots are being created, deleted, or used during the upgrade attempt

  ![upgrade-vmbackup.png](/img/v1.4/vm/upgrade-vmbackup.png)

- Virtual machine schedules are active during the upgrade attempt

  ![upgrade-svmbackup.png](/img/v1.4/vm/upgrade-svmbackup.png)

To avoid such issues, the Harvester team plans to implement automatic suspension of all virtual machine schedules before the upgrade process is started. The suspended schedules will also be automatically resumed after the upgrade is completed. For more information, see [Issue #6759](https://github.com/harvester/harvester/issues/6759).

## Known issues

---

### 1. High CPU usage on the Harvester

High CPU usage may occur because of the `backup-target` setting's `refreshIntervalInSeconds` field, which was introduced in v1.4.2. If the field is left empty or is set to 0, Harvester constantly refreshes the backup target, resulting in high CPU usage.

![](/img/v1.4/image/high-cpu-load-issue.png)

To fix the issue, update the value of `refreshIntervalInSeconds` to a larger number (for example, 60) using the command `kubectl edit setting backup-target`.

Example:

```
value: '{"type":"nfs","endpoint":"nfs://longhorn-test-nfs-svc.default:/opt/backupstore", "refreshIntervalInSeconds": 60}'
```

![](/img/v1.4/image/high-cpu-load-fix.png)

Related issues:
  - [[BUG] High load and use of cpu time by harvester process](https://github.com/harvester/harvester/issues/7885)
