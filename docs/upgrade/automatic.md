---
id: index
sidebar_position: 1
sidebar_label: Upgrading Harvester
title: "Upgrading Harvester"
keywords:
  - Harvester
  - harvester
  - Rancher
  - rancher
  - Harvester Upgrade
description: Harvester provides two ways to upgrade. Users can either upgrade using the ISO image or upgrade through the UI.
---

<head>
  <link rel="canonical" href="https://docs.harvesterhci.io/v1.4/upgrade/index"/>
</head>

## Upgrade support matrix

The following table shows the upgrade path of all supported versions.

| Upgrade from version | Supported new version(s) |
|----------------------|--------------------------|
| [v1.4.1](./v1-4-1-to-v1-4-2.md) | v1.4.2        |
| [v1.4.0](./v1-4-0-to-v1-4-1.md) | v1.4.1        |
| [v1.3.2](./v1-3-2-to-v1-4-0.md) | v1.4.0        |
| [v1.3.1](./v1-3-1-to-v1-3-2.md) | v1.3.2        |
| [v1.2.2/v1.3.0](./v1-2-2-to-v1-3-1.md) | v1.3.1        |
| [v1.2.1](./v1-2-1-to-v1-2-2.md) | v1.2.2        |
| [v1.1.2/v1.1.3/v1.2.0](./v1-2-0-to-v1-2-1.md) | v1.2.1              |

## Rancher upgrade

If you are using Rancher to manage your Harvester cluster, we recommend upgrading your Rancher server first. For more information, please refer to the [Rancher upgrade guide](https://ranchermanager.docs.rancher.com/getting-started/installation-and-upgrade/install-upgrade-on-a-kubernetes-cluster/upgrades).

For the Harvester & Rancher support matrix, please visit our website [here](https://www.suse.com/suse-harvester/support-matrix/all-supported-versions/).

:::note

  - Upgrading Rancher will not automatically upgrade your Harvester cluster. You still need to upgrade your Harvester cluster after upgrading Rancher.
  - Upgrading Rancher will not bring your Harvester cluster down. You can still access your Harvester cluster using its virtual IP.

:::

## Before starting an upgrade

Check out the available [`upgrade-config` setting](../advanced/settings.md#upgrade-config) to tweak the upgrade strategies and behaviors that best suit your cluster environment.

## Start an upgrade

:::caution

- Before you upgrade your Harvester cluster, we highly recommend:
    - Back up your VMs if needed.
- Do not operate the cluster during an upgrade. For example, creating new VMs, uploading new images, etc.
- Make sure your hardware meets the **preferred** [hardware requirements](../install/requirements.md#hardware-requirements). This is due to there will be intermediate resources consumed by an upgrade.
- Make sure each node has at least 30 GiB of free system partition space (`df -h /usr/local/`). If any node in the cluster has less than 30 GiB of free system partition space, the upgrade will be denied. Check [free system partition space requirement](#free-system-partition-space-requirement) for more information.
- Run the pre-check script on a Harvester control-plane node. Please pick a script according to your cluster's version: https://github.com/harvester/upgrade-helpers/tree/main/pre-check.
- A number of one-off privileged pods will be created in the `harvester-system` and `cattle-system` namespaces to perform host-level upgrade operations. If [pod security admission](https://kubernetes.io/docs/concepts/security/pod-security-admission/) is enabled, adjust these policies to allow these pods to run.

:::

:::caution

- Make sure all nodes' times are in sync. Using an NTP server to synchronize time is recommended. If an NTP server is not configured during the installation, you can manually add an NTP server **on each node**:

    ```
    $ sudo -i

    # Add time servers
    $ vim /etc/systemd/timesyncd.conf
    [ntp]
    NTP=0.pool.ntp.org

    # Enable and start the systemd-timesyncd
    $ timedatectl set-ntp true

    # Check status
    $ sudo timedatectl status
    ```

:::

:::caution

- NICs that connect to a PCI bridge might be renamed after an upgrade. Please check the [knowledge base article](https://harvesterhci.io/kb/nic-naming-scheme) for further information.

:::

- Make sure to read the Warning paragraph at the top of this document first.
- Harvester checks if there are new upgradable versions periodically. If there are new versions, an upgrade button shows up on the Dashboard page.
    - If the cluster is in an air-gapped environment, please see [Prepare an air-gapped upgrade](#prepare-an-air-gapped-upgrade) section first. You can also speed up the ISO download by using the approach in that section.
- Navigate to Harvester GUI and click the upgrade button on the Dashboard page.

    ![](/img/v1.2/upgrade/upgrade_button.png)

- Select a version to start upgrading.

    ![](/img/v1.2/upgrade/upgrade_select_version.png)

- Click the circle on the top to display the upgrade progress.
    ![](/img/v1.2/upgrade/upgrade_progress.png)


## Prepare an air-gapped upgrade

:::caution

Make sure to check [Upgrade support matrix](#upgrade-support-matrix) section first about upgradable versions.

:::

- Download a Harvester ISO file from [release pages](https://github.com/harvester/harvester/releases).
- Save the ISO to a local HTTP server. Assume the file is hosted at `http://10.10.0.1/harvester.iso`.
- Download the version file from release pages, for example, `https://releases.rancher.com/harvester/{version}/version.yaml`

    - Replace `isoURL` value in the `version.yaml` file:

        ```
        apiVersion: harvesterhci.io/v1beta1
        kind: Version
        metadata:
          name: v1.0.2
          namespace: harvester-system
        spec:
          isoChecksum: <SHA-512 checksum of the ISO>
          isoURL: http://10.10.0.1/harvester.iso  # change to local ISO URL
          releaseDate: '20220512'
        ```

    - Assume the file is hosted at `http://10.10.0.1/version.yaml`.

- Log in to one of your control plane nodes.
- Become root and create a version:

    ```
    rancher@node1:~> sudo -i
    rancher@node1:~> kubectl create -f http://10.10.0.1/version.yaml
    ```

- An upgrade button should show up on the Harvester GUI Dashboard page.

## Free system partition space requirement

_Available as of v1.5.0_

Harvester loads images on each node during upgrades. When disk usage exceeds the kubelet's garbage collection threshold, the kubelet deletes unused images to free up space. This may cause issues in airgapped environments because the images are not available on the node.

Harvester v1.5.0 includes checks that ensure nodes do not trigger garbage collection after loading new images.

![](/img/v1.5/upgrade/upgrade_free_space_check.png)

If you want to try upgrading even if the free system partition space is insufficient on some nodes, you can update the `harvesterhci.io/skipGarbageCollectionThresholdCheck: true` annotation of the `Version` object.

```
apiVersion: harvesterhci.io/v1beta1
kind: Version
metadata:
  annotations:
    harvesterhci.io/skipGarbageCollectionThresholdCheck: true
  name: 1.5.0
  namespace: harvester-system
spec:
  isoChecksum: <SHA-512 checksum of the ISO>
  isoURL: http://192.168.0.181:8000/harvester-master-amd64.iso
  minUpgradableVersion: 1.4.1
  releaseDate: "20250630"
```

:::caution

Setting a smaller value than the pre-defined value may cause the upgrade to fail and is not recommended in a production environment.

:::

## VM Backup Compatibility

In Harvester v1.4.2 and later versions, you may encounter certain limitations when creating and restoring [backups that involve external storage](../../versioned_docs/version-v1.4/advanced/csidriver.md#vm-backup-compatibility)

## Longhorn Manager Crashes Due to Backing Image Eviction

:::caution

When upgrading to Harvester **v1.4.x**, Longhorn Manager may crash if the `EvictionRequested` flag is set to `true` on any node or disk. This issue is caused by a [race condition](https://longhorn.io/kb/troubleshooting-longhorn-manager-crashes-due-to-backing-image-eviction/) between the deletion of a disk in the backing image spec and the updating of its status.

To prevent the issue from occurring, ensure that the `EvictionRequested` flag is set to `false` before you start the upgrade process.

:::

## Re-enable RKE2 ingress-nginx Admission Webhooks (CVE-2025-1974)

If you [disabled the RKE2 ingress-nginx admission webhooks](https://harvesterhci.io/kb/2025/03/25/cve-2025-1974) to mitigate [CVE-2025-1974](https://nvd.nist.gov/vuln/detail/CVE-2025-1974), you must re-enable the webhook after upgrading to Harvester v1.5.0 or later.

1. Confirm that Harvester is using nginx-ingress v1.12.1 or later.

  ```sh
  $ kubectl -n kube-system get po -l"app.kubernetes.io/name=rke2-ingress-nginx" -ojsonpath='{.items[].spec.containers[].image}'
  rancher/nginx-ingress-controller:v1.12.1-hardened1
  ```

1. Run `kubectl -n kube-system edit helmchartconfig rke2-ingress-nginx` to **remove** the following configurations from the `HelmChartConfig` resource.

   * `.spec.valuesContent.controller.admissionWebhooks.enabled: false`
   * `.spec.valuesContent.controller.extraArgs.enable-annotation-validation: true`

1. Verify that the new `.spec.ValuesContent` configuration is similar to the following example.

  ```yaml
  apiVersion: helm.cattle.io/v1
  kind: HelmChartConfig
  metadata:
    name: rke2-ingress-nginx
    namespace: kube-system
  spec:
    valuesContent: |-
      controller:
        admissionWebhooks:
          port: 8444
        extraArgs:
          default-ssl-certificate: cattle-system/tls-rancher-internal
        config:
          proxy-body-size: "0"
          proxy-request-buffering: "off"
        publishService:
          pathOverride: kube-system/ingress-expose
  ```

  :::info important
  If the `HelmChartConfig` resource contains other custom ingress-nginx configuration, you must retain them when editing the resource.
  :::

1. Exit the `kubectl edit` command execution to save the configuration.

  Harvester automatically applies the change once the content is saved.

1. Verify that the `rke2-ingress-nginx-admission` webhook configuration is re-enabled.

  ```sh
  $ kubectl get validatingwebhookconfiguration rke2-ingress-nginx-admission
  NAME                           WEBHOOKS   AGE
  rke2-ingress-nginx-admission   1          6s
  ```

1. Verify that the ingress-nginx pods are restarted successfully.

  ```sh
  kubectl -n kube-system get po -lapp.kubernetes.io/instance=rke2-ingress-nginx
  NAME                                  READY   STATUS    RESTARTS   AGE
  rke2-ingress-nginx-controller-l2cxz   1/1     Running   0          94s
  ```
