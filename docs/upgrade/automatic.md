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
Description: Harvester provides two ways to upgrade. Users can either upgrade using the ISO image or upgrade through the UI.
---

<head>
  <link rel="canonical" href="https://docs.harvesterhci.io/v1.1/upgrade/automatic"/>
</head>

## Upgrade support matrix

The following table shows the upgrade path of all supported versions.

| Upgrade from version | Supported new version(s) |
|----------------------|--------------------------|
| [v1.1.0, v1.1.1](./v1-1-to-v1-1-2.md) | v1.1.2        |
| [v1.0.3](./v1-0-3-to-v1-1-1.md) | v1.1.0, v1.1.1 (v1.1.1 is recommended)        |
| [v1.0.2](./previous-releases/v1-0-2-to-v1-0-3.md) | v1.0.3        |
| [v1.0.1](./previous-releases/v1-0-1-to-v1-0-2.md) | v1.0.2        |
| [v1.0.0](./previous-releases/v1-0-0-to-v1-0-1.md) | v1.0.1        |

## Start an upgrade

Note we are still working towards zero-downtime upgrade, due to some known issues please follow the steps below before you upgrade your Harvester cluster:

:::caution

- Before you upgrade your Harvester cluster, we highly recommend:
    - For upgrading from v1.0.3 to v1.1.0/v1.1.1, please shut down all your VMs first (Harvester GUI -> Virtual Machines -> Select VMs -> Actions -> Stop). Check the [link](./v1-0-3-to-v1-1-1.md#general-information) for more information.
    - Back up your VMs if needed.
- Do not operate the cluster during an upgrade. For example, creating new VMs, uploading new images, etc.
- Make sure your hardware meets the **preferred** [hardware requirements](../install/requirements.md#hardware-requirements). This is due to there will be intermediate resources consumed by an upgrade.
- Make sure each node has at least 30 GiB of free system partition space (`df -h /usr/local/`). If any node in the cluster has less than 30 GiB of free system partition space, the upgrade will be denied. Check [free system partition space requirement](#free-system-partition-space-requirement) for more information.

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
