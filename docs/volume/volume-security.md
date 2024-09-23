---
sidebar_position: 6
sidebar_label: Volume Security
title: "Volume Security"
keywords:
- Volume Security
- Image Security
---

_Available as of v1.4.0_

Starting with v1.4.0 Harvester allows you to encrypt and decrypt volume. The encryption mechanism utilizes the Linux kernel module dm_crypt and the command-line utility cryptsetup.

## Prerequisite

Before encrypting volumes, we need to prepare following resources:

- secret
- storage class

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

Since Harvesters uses Longhorn to encrypt volume, we need to pass required fields to Longhorn CSI driver.

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

## Encrypt Volume

There are two ways to create an encrypted volume. In either case, be sure to select an encrypted storage class.

### Volumes Page

![create-empty-volume](/img/v1.4/volume/create-empty-volume.png)

### Volumes tab when creating a virtual machine

When creating a virtual machine image, you can add a volume by clicking the `Add Volume button` in the Volumes tab on the virtual machine image page.

![create-empty-volume](/img/v1.4/volume/create-empty-volume-in-vm.png)

## Advanced usage with Rancher Integration

### Prevent other users from reading the secret

Since the secret is a base64 encoded string, it's not really encrypted. So, admin might want keep this secret safe. With Rancher Integration, we can use project and namespace to isolate permission. Please check [Multi-Tenancy](../rancher/virtualization-management#multi-tenancy) for more detail.

## Limitations

- Don't support that export to image from encrypted volumes.
- Don't support that data volume restoring from encrypted to unencrypted or unencrypted to encrypted one.