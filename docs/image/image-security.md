---
id: image-security
sidebar_position: 2
sidebar_label: Image Security
title: "Image Security"
keywords:
  - Harvester
  - harvester
  - Rancher
  - rancher
  - Image Security
---

<head>
  <link rel="canonical" href="https://docs.harvesterhci.io/v1.4/image/image-security"/>
</head>

_Available as of v1.4.0_

Harvester v1.4.0 and later versions allow you to encrypt and decrypt virtual machine images. The encryption mechanism utilizes the Linux kernel module dm_crypt and the command-line utility cryptsetup.

## Prerequisites

Prepare the following resources:

- Source virtual machine image: You can [upload or create an image](./upload-image) using any of the supported methods.

  :::caution

  Do not upload an encrypted image.

  :::

- Secret: A Kubernetes secret is used as the passphrase of dm_crypt. You must specify the value of the `CRYPTO_KEY_VALUE` field. All other fields are fixed.

  ![](/img/v1.4/image/create-encryption-used-secret.png)

  Example of a secret:

  ```yaml
  apiVersion: v1
  kind: Secret
  metadata:
    name: encryption
    namespace: default
  data:
    CRYPTO_KEY_CIPHER: aes-xts-plain64
    CRYPTO_KEY_HASH: sha256
    CRYPTO_KEY_PROVIDER: secret
    CRYPTO_KEY_SIZE: 256
    CRYPTO_KEY_VALUE: "Your encryption passphrase"
    CRYPTO_PBKDF: argon2i
  ```

  :::info important

  You can create a secret in the system namespace using kubectl or the Harvester UI (**Edit as YAML** feature). Resources in the system namespace are not displayed on the Harvester UI **Secrets** screen.

  The example of secret is default yaml. From Harvester v1.4.1, we also support to accept these parameters from [cryptsetup](https://wiki.archlinux.org/title/Dm-crypt/Device_encryption#Encryption_options_for_LUKS_mode), but it eventually depends on whether your node supports them or not. 

  - CRYPTO_KEY_CIPHER: aes-xts-plain, aes-xts-plain64, aes-cbc-plain, aes-cbc-plain64, aes-cbc-essiv:sha256  
  - PBKDF: argon2i, argon2id, pbkdf2  
  - Hash: sha256, sha384, sha512  
  - Key Size: 256, 384, 512  
  :::

- StorageClass: Images are encrypted using Longhorn, so required fields must be passed to the Longhorn CSI Driver. You can specify the encryption secret when creating a StorageClass. For more information, see [Image StorageClass](./upload-image#image-storageclass). 

  ![](/img/v1.4/image/create-storage-class.png)

  Example of a StorageClass:

  ```yaml
  allowVolumeExpansion: true
  apiVersion: storage.k8s.io/v1
  kind: StorageClass
  metadata:
    name: encryption
  parameters:
    csi.storage.k8s.io/node-publish-secret-name: encryption
    csi.storage.k8s.io/node-publish-secret-namespace: default
    csi.storage.k8s.io/node-stage-secret-name: encryption
    csi.storage.k8s.io/node-stage-secret-namespace: default
    csi.storage.k8s.io/provisioner-secret-name: encryption
    csi.storage.k8s.io/provisioner-secret-namespace: default
    encrypted: "true"
    migratable: "true"
    numberOfReplicas: "3"
    staleReplicaTimeout: "2880"
  provisioner: driver.longhorn.io
  reclaimPolicy: Delete
  volumeBindingMode: Immediate
  ```

  :::info important

  You can create a secret in the system namespace using the Harvester UI (**Edit as YAML** feature) and kubectl. Resources in the system namespace are not displayed on the Harvester UI **Secrets** screen.

  :::

## Encrypt a Virtual Machine Image

1. On the Harvester UI, go to **Images**.

1. Click **Create**.

1. Specify a namespace and a name.

1. On the **Basics** tab, select **Encrypt** and then select a source image.

  ![](/img/v1.4/image/create-encrypted-image.png)

1. On the **Storage** tab, select a StorageClass that includes encryption-related fields. 

  Harvester passes the required fields to Longhorn.

  ![](/img/v1.4/image/select-encryption-storage-class.png)

1. Click **Create**.

## Decrypt a Virtual Machine Image

1. On the Harvester UI, go to **Images**.

1. Click **Create**.

1. Specify a namespace and a name.

1. On the **Basics** tab, select **Decrypt** and then select a source image.

  ![](/img/v1.4/image/create-decrypted-image.png)

1. On the **Storage** tab, select **harvester-longhorn (Default)** or another commonly used StorageClass.

  Harvester uses the StorageClass of the source image that you want to decrypt.

  ![](/img/v1.4/image/select-normal-storage-class.png)

1. Click **Create**.

## Use an Image with Encrypted Volumes

You must select the image that you want to use when creating a virtual machine.

![](/img/v1.4/image/create.png)

The **Virtual Machines** screen displays the following icons and messages when volumes used by virtual machines are encrypted.

![](/img/v1.4/image/case1.png)

![](/img/v1.4/image/case2.png)

To determine which volumes are encrypted, check the **Volumes** tab on the **Virtual Machine** details screen.

![](/img/v1.4/image/volume-detail.png)

## Advanced Usage with Rancher Integration

The secret is an unencrypted Base64-encoded string. To keep the secret safe, you can use projects and namespaces to isolate permissions. For more information, see [Multi-Tenancy](../rancher/virtualization-management#multi-tenancy).

## Limitations

You cannot perform the following actions:

- Export a new image from an encrypted image
- Download an encrypted image
- Upload an encrypted image