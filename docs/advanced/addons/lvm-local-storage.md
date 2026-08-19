---
sidebar_position: 8
sidebar_label: Local Storage Support
title: "Local Storage Support (Experimental)"
---

<head>
  <link rel="canonical" href="https://docs.harvesterhci.io/v1.8/advanced/addons/lvm-local-storage"/>
</head>

:::note

**harvester-csi-driver-lvm** is an *experimental* add-on. It is not included in the Harvester ISO, but you can download it from the [experimental-addons repository](https://github.com/harvester/experimental-addons). For more information about experimental features, see [Feature Labels](../../getting-started/document-conventions.md#feature-labels).

:::

Harvester allows you to use local storage on the host to create persistent volumes for your workloads with better performance and latency. This functionality is made possible by LVM, which provides logical volume management facilities on Linux.

The **harvester-csi-driver-lvm** add-on is a CSI driver that supports local path provisioning through LVM.

## Installing and Enabling the Add-on

If you are using the Harvester kubeconfig file, you can install the add-on by performing the following steps:

1. Install the add-on by running the following command:

    ```
    kubectl apply -f https://raw.githubusercontent.com/harvester/experimental-addons/v1.9/harvester-csi-driver-lvm/harvester-csi-driver-lvm.yaml
    ```

1. On the Harvester UI, go to **Advanced** > **Add-ons**.

1. Select **harvester-csi-driver-lvm (Experimental)**, and then select **⋮** > **Enable**.

## Creating a Volume Group for LVM

A volume group combines physical volumes to create a single storage structure that can be divided into logical volumes.

:::note

Harvester currently does not allow you to modify the volume group composition (add or remove disks) after you create a logical volume. This issue will be addressed in a future release.

:::

1. Verify that the **harvester-csi-driver-lvm** add-on is installed.

1. On the Harvester UI, go to the **Hosts** screen.

1. Select the target host, and then select **⋮** > **Edit Config**.

1. On the Storage tab, add disks for the volume group.

    ![](/img/v1.4/csi-driver-lvm/add-disk-to-vg-01.png)

    Configure the following settings for each selected disk:

    - **Provisioner**: Select **LVM**.

      ![](/img/v1.4/csi-driver-lvm/add-disk-to-vg-02.png)

    - **Volume Group**: Select an existing volume group or specify a name for a new volume group.

      ![](/img/v1.4/csi-driver-lvm/add-disk-to-vg-03.png)

    For more information about adding disks, see [Multi-Disk Management](../../host/#multi-disk-management).

1. Click **Save**.

1. On the host details screen, verify that the disks were added and the correct provisioner was set.

    ![](/img/v1.4/csi-driver-lvm/add-disk-to-vg-04.png)

## Creating a StorageClass for LVM

:::note

You can only use one type of local volume in each volume group. If necessary, create different volume groups for the volume types that you want to use.

:::

1. On the Harvester UI, go to the **Storage** screen.

1. Create a new StorageClass and select **LVM** in the **Provisioner** list.

    ![](/img/v1.4/csi-driver-lvm/create-lvm-sc-01.png)

1. On the **Parameters** tab, configure the following settings:

    - **Node**: Select the target node for the intended workloads. 
  
      ![](/img/v1.4/csi-driver-lvm/create-lvm-sc-02.png)

    - **Volume Group Name**: Select the volume group that you created.

      ![](/img/v1.4/csi-driver-lvm/create-lvm-sc-03.png)

    - **Volume Group Type**: Select the type of local volume that matches your requirements. Harvester currently supports **striped** and **dm-thin**.

      ![](/img/v1.4/csi-driver-lvm/create-lvm-sc-04.png)

1. Click **Save**.

1. On the **Storage** screen, verify that the StorageClass was created and the correct provisioner was set.

    ![](/img/v1.4/csi-driver-lvm/create-lvm-sc-05.png)

For more information, see [StorageClass](../storageclass.md).

## Encrypting an LVM Volume

`dm-thin` LVM volumes can be encrypted at rest using LUKS2 (dm-crypt). Encryption is configured on the StorageClass, and it uses the same encryption secret convention as [Longhorn volume encryption](../../rancher/csi-driver/longhorn.md), so any volume, VM image, or virtual machine that uses an encrypted StorageClass is encrypted automatically.

:::note

Encryption is an opt-in property of the StorageClass. Existing (unencrypted) StorageClasses are unaffected, and you cannot convert a volume between the encrypted and unencrypted states.

:::

### Creating an Encryption Secret

Create a `Secret` that holds the encryption passphrase in the `CRYPTO_KEY_VALUE` field. The remaining `CRYPTO_KEY_*` fields are optional and default to `aes-xts-plain64` / `sha256` / `256` / `argon2i` when omitted.

```yaml
apiVersion: v1
kind: Secret
metadata:
  name: lvm-encryption
  namespace: default
type: Opaque
stringData:
  CRYPTO_KEY_VALUE: "Your encryption passphrase"
  CRYPTO_KEY_PROVIDER: "secret"
  CRYPTO_KEY_CIPHER: "aes-xts-plain64"
  CRYPTO_KEY_HASH: "sha256"
  CRYPTO_KEY_SIZE: "256"
  CRYPTO_PBKDF: "argon2i"
```

:::caution

Store the passphrase securely and back it up. If the secret is lost, the encrypted data is **unrecoverable**.

:::

### Creating an Encrypted StorageClass

1. On the Harvester UI, go to the **Storage** screen.

1. Create a new StorageClass, select **LVM** in the **Provisioner** list, and configure the **Node**, **Volume Group Name**, and **Volume Group Type** (`dm-thin`) as described in [Creating a StorageClass for LVM](#creating-a-storageclass-for-lvm).

1. On the **Parameters** tab, set **Volume Encryption** to **Yes**, and then select the encryption secret that you created.

1. Click **Save**.

You can also create the encrypted StorageClass directly. The `encrypted: "true"` parameter and the `csi.storage.k8s.io/*-secret-*` parameters that reference the encryption secret are required.

```yaml
apiVersion: storage.k8s.io/v1
kind: StorageClass
metadata:
  name: lvm-dm-thin-encrypted
  annotations:
    # Use host-assisted copy so image clones are written through the encryption
    # layer. See the note below.
    cdi.harvesterhci.io/storageProfileCloneStrategy: copy
parameters:
  type: dm-thin
  vgName: <your-volume-group>
  encrypted: "true"
  csi.storage.k8s.io/provisioner-secret-name: lvm-encryption
  csi.storage.k8s.io/provisioner-secret-namespace: default
  csi.storage.k8s.io/node-publish-secret-name: lvm-encryption
  csi.storage.k8s.io/node-publish-secret-namespace: default
  csi.storage.k8s.io/node-stage-secret-name: lvm-encryption
  csi.storage.k8s.io/node-stage-secret-namespace: default
provisioner: lvm.driver.harvesterhci.io
reclaimPolicy: Delete
volumeBindingMode: WaitForFirstConsumer
allowedTopologies:
  - matchLabelExpressions:
      - key: topology.lvm.csi/node
        values:
          - <target-node-name>
```

To use a different passphrase per volume, replace the fixed secret name and namespace with the `${pvc.name}` and `${pvc.namespace}` templates.

:::note

When you create a VM image or clone an existing image into an encrypted StorageClass, set the clone strategy to **copy** (as shown in the annotation above, or on the **CDI Settings** tab of the StorageClass form). A host-assisted copy writes the data through the encryption layer; a block-level snapshot clone would bypass it.

:::

Any VM image, volume, or virtual machine that uses this StorageClass is encrypted at rest. VM snapshots, backups, and restores also preserve encryption because they reuse the encrypted StorageClass.

## Creating a Volume with LVM

1. On the Harvester UI, go to the **Volumes** screen.

1. Create a new volume using the LVM StorageClass that you created.

    ![](/img/v1.4/csi-driver-lvm/create-lvm-volume-01.png)

    :::note

    The status **Not Ready** is normal because Harvester creates the LVM volume only when the first workload is created.

    :::

1. On the **Virtual Machines** screen, select the target virtual machine, and then select **⋮** > **Add Volume**.

    :::note

    Because the LVM volume is a local volume, you must ensure that the target node of the LVM StorageClass is the node on which the virtual machine is scheduled.

    :::

1. Specify the volume that you want to attach.

    ![](/img/v1.4/csi-driver-lvm/attach-lvm-volume-01.png)

1. On the **Volumes** screen, verify that the state is **In-use**.

    ![](/img/v1.4/csi-driver-lvm/attach-lvm-volume-02.png)

You can also create a new virtual machine with the volume of the LVM StorageClass that you created. This virtual machine will be scheduled on the target node with local storage for the volume.

![](/img/v1.4/csi-driver-lvm/create-vm-with-lvm-volume-01.png)

![](/img/v1.4/csi-driver-lvm/create-vm-with-lvm-volume-02.png)

## Creating Snapshots for an LVM Volume

1. On the Harvester UI, go to the **Settings** screen.

1. In the **csi-driver-config** section, select **⋮** > **Edit Setting**.

    ![](/img/v1.4/csi-driver-lvm/update-csi-driver-config-01.png)

1. Add an entry with the following settings:

    - **Provisioner**: Select **lvm.driver.harvesterhci.io**.
    - **Volume Snapshot Class Name**: Select **lvm-snapshot**.

    ![](/img/v1.2/advanced/csi-driver-config-external.png)

1. On the **Virtual Machines** screen, select the target virtual machine, and then select **⋮** > **Take Virtual Machine Snapshot**.

    Example:

    ![](/img/v1.4/csi-driver-lvm/vm-take-snapshot-with-lvm-01.png)

1. On the **Virtual Machine Snapshots** screen, verify that snapshot is ready to use.

    ![](/img/v1.4/csi-driver-lvm/vm-take-snapshot-with-lvm-02.png)

## Supported LVM Volume Features

- Volume resizing
- Volume cloning
- Snapshot creation

:::note

Backup creation is currently not supported. This limitation will be addressed in a future release.

:::