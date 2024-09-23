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

_Available as of v1.4.0_

Starting with v1.4.0 Harvester allows you to encrypt and decrypt virtual machine image. The encryption mechanism utilizes the Linux kernel module dm_crypt and the command-line utility cryptsetup.

## Prerequisite

Before encrypting or decrypting the virtual machine image, we need to prepare following resources:

- source virtual machine image
- secret
- storage class

### Source Virtual Machine Image

Please follow [Upload Images](./upload-image) to create an image.

:::info important 
Harvester doesn't support uploading an encrypted image
:::

### Secret

We use this secret as passphrase of dm_crypt. You need to customize the value of `CRYPTO_KEY_VALUE` field. Other fields are fixed.

![](/img/v1.4/image/create-encryption-used-secret.png)

Example Secret:

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

If you'd like to create secret in the system namespace, you can use Edit as YAML or kubectl to create the secret. On the Harvester Secrets page, Harvester does not display resources in the system namespace.

:::

### Storage Class

Since Harvesters uses Longhorn to encrypt image, we need to pass required fields to Longhorn CSI driver. You can select encryption used secret when creating storage class. If you're interested in this, please check [here](./upload-image#image-storageclass) for more details. 

![](/img/v1.4/image/create-storage-class.png)

Example Storage Class:

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

If you'd like to select secret in the system namespace. You can use Edit as YAML or kubectl to create the secret. On the Harvester Secrets page, Harvester does not display resources in the system namespace.

:::

## Encrypt Image

After getting a source image, please select `Encrypt` to encrypt the virtual machine image.

![](/img/v1.4/image/create-encrypted-image.png)

Select a previously created storage class. This storage class must include encryption-related fields. Harvester will pass this storage class to Longhorn.

![](/img/v1.4/image/select-encryption-storage-class.png)

## Decrypt Image

After getting an encrypted image, please select `Decrypt` to decrypt an encrypted virtual machine image.

![](/img/v1.4/image/create-decrypted-image.png)

Select the default or a commonly used storage class. Harvester will use the storage class from the source virtual machine image that you want to decrypt.

![](/img/v1.4/image/select-normal-storage-class.png)

## Use Image

Select the image when creating a virtual machine.

![](/img/v1.4/image/create.png)

There are two cases in which the dashboard shows different messages on the virtual machine page.

1. All volumes are encrypted.
  ![](/img/v1.4/image/case1.png)
2. Some volumes are encrypted.
  ![](/img/v1.4/image/case2.png)

If you'd like to know which specific volume is encrypted or not, please check `Enctyption` field on Volume tab.

![](/img/v1.4/image/volume-detail.png)

## Advanced Usage with Rancher Integration

### Prevent other users from reading the secret

Since the secret is a base64 encoded string, it's not really encrypted. So, admin might want keep this secret safe. With Rancher Integration, we can use project and namespace to isolate permission. Please check [Multi-Tenancy](../rancher/virtualization-management#multi-tenancy) for more detail.

## Limitations

- Don't support that export to image from encrypted image.
- Don't support that download encrypted image and upload it to reuse.
- Don't support that upload an encrypted image.