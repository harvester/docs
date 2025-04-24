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

_Available as of v1.2.0_

The minimum free system partition space requirement in Harvester v1.2.0 is 30 GiB, which will be revised in each release.

Harvester will check the amount of free system partition space on each node when you select **Upgrade**. If any node does not meet the requirement, the upgrade will be denied as follows

![](/img/v1.2/upgrade/upgrade_free_space_check.png)

If some nodes do not have enough free system partition space, but you still want to try upgrading, you can customize the upgrade by updating the `harvesterhci.io/minFreeDiskSpaceGB` annotation of `Version` object.

```
apiVersion: harvesterhci.io/v1beta1
kind: Version
metadata:
  annotations:
    harvesterhci.io/minFreeDiskSpaceGB: "30" # the value is pre-defined and may be customized
  name: 1.2.0
  namespace: harvester-system
spec:
  isoChecksum: <SHA-512 checksum of the ISO>
  isoURL: http://192.168.0.181:8000/harvester-master-amd64.iso
  minUpgradableVersion: 1.1.2
  releaseDate: "20230609"
```

:::caution

Setting a smaller value than the pre-defined value may cause the upgrade to fail and is not recommended in a production environment.

:::

There are some solutions for this case.

### Free System Partition Space Manually

Harvester tries to cleanup old images after upgrade by default.

However, the automatic image cleanup may not be performed due to various of reasons or operations. You can use [this script](https://github.com/harvester/upgrade-helpers/blob/main/bin/harv-purge-images.sh) to manually clean up container images after the upgrade is completed. For more information, see [issue #6620](https://github.com/harvester/harvester/issues/6620).

### Set a Private Container Repository and Do Not Preload the Images

In the worst case, the system partition still can't not meet the requirement after manually cleaning up the old images.

A feasible solution is to setup a private container registry, prepare all current and new images on the registry, then set the Harvester setting [upgrade-config](advanced/settings.md#upgrade-config) with following value.

```
{"imagePreloadOption":{"strategy":{"type":"skip"}}, "restoreVM": false}
```

Harvester will skip the upgrade image preloading process. When the deployments on the nodes are upgraded, kubelet/containerd will load the image the private container registry.

## Longhorn Manager Crashes Due to Backing Image Eviction

:::caution

When upgrading to Harvester **v1.4.x**, Longhorn Manager may crash if the `EvictionRequested` flag is set to `true` on any node or disk. This issue is caused by a [race condition](https://longhorn.io/kb/troubleshooting-longhorn-manager-crashes-due-to-backing-image-eviction/) between the deletion of a disk in the backing image spec and the updating of its status.

To prevent the issue from occurring, ensure that the `EvictionRequested` flag is set to `false` before you start the upgrade process.

:::

## CVE-2025-1974: Re-enable RKE2 ingress-nginx Admission Webhooks

If you have previously [disabled the RKE2 ingress-nginx admission webhook](https://harvesterhci.io/kb/2025/03/25/cve-2025-1974) due to [CVE-2025-1974](https://nvd.nist.gov/vuln/detail/CVE-2025-1974), you will need to re-enable it after upgrading to Harvester v1.4.3 or later with the following steps:

1. Confirm that Harvester is using nginx-ingress v1.12.1 or later.

  ```sh
  $ kubectl -n kube-system get po -l"app.kubernetes.io/name=rke2-ingress-nginx" -ojsonpath='{.items[].spec.containers[].image}'
  rancher/nginx-ingress-controller:v1.12.1-hardened1
  ```

1. Use `kubectl -n kube-system edit helmchartconfig rke2-ingress-nginx` to **remove** the following configurations from the resource.

   * `.spec.valuesContent.controller.admissionWebhooks.enabled: false`
   * `.spec.valuesContent.controller.extraArgs.enable-annotation-validation: true`

1. The following is an example of what the new `.spec.ValuesContent` configuration should look like.

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
