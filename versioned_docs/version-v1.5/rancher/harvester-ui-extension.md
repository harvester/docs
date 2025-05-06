---
sidebar_position: 9
sidebar_label: Harvester UI Extension
title: Harvester UI Extension
keywords:
  - Harvester
  - harvester
  - Harvester UI Extension
  - Rancher Integration
---

<head>
  <link rel="canonical" href="https://docs.harvesterhci.io/v1.5/rancher/rancher-integration"/>
</head>


Rancher 2.10.0 and later versions integrate with Harvester using the [Harvester UI Extension](https://github.com/harvester/harvester-ui-extension), which is built on the[@rancher/shell](https://www.npmjs.com/package/@rancher/shell) library.

:::note
The current [Harvester UI](https://github.com/harvester/dashboard) will continue to support Harvester v1.3.x and v1.4.x releases. New features in later releases will be implemented in the Harvester UI Extension.
:::



## Support Matrix

Versions of the Harvester operating system and the Harvester UI Extension will align starting with v1.5.0.


| Harvester Cluster         | Harvester UI Extension          | Minimum supported Rancher  |
| --------------------------| ------------------------------- | ------------------------   |
| v1.3.0, v1.3.1, v1.3.2    | v1.0.2                          | Rancher 2.10.1             |
| v1.4.1                    | v1.0.3                          | Rancher 2.10.1             |
| v1.4.2                    | v1.0.4, v1.0.5                  | Rancher 2.10.1             |
| v1.4.3                    | v1.0.6                          | Rancher 2.10.1             |
| v1.5.0                    | v1.5.0                          | Rancher 2.11.0             |

Installing the extension over the network is not possible in air-gapped environments, so you must perform the workaround outlined in [Harvester UI Extension with Rancher Integration](/v1.5/airgap#harvester-ui-extension-with-rancher-integration).

## Installation on Rancher 2.10

### Automatic Installation

You can install the Harvester UI Extension with a single click.

1. On the Rancher UI, go to **Virtualization Management**.
    ![](/img/v1.5/rancher/auto-install-ui-extension.png)

1. On the **Harvester Clusters** tab, click **Install**.
  
    Allow some time for the extension to be installed. The screen is automatically refreshed once the installation is completed.

    :::info important
    Do not navigate away from the screen during the installation process.
    :::

    ![](/img/v1.5/rancher/auto-install-ui-extension.png)


### Manual Installation
If the automatic installation fails, you can specify the Harvester UI Extension repository URL and then install the extension.

![](/img/v1.5/rancher/ui-extension-install-failed.png)

1. On the Rancher UI, go to **local > Apps > Repositories**, and then click **Create**.

  ![](/img/v1.5/rancher/ui-extension-app-repository-setup.png)

1. Configure the following settings:
    - Name: Specify a name for the repository.
    - Target: Select **Git repository containing Helm chart or cluster template definitions**.
    - Git Repo URL: Specify **https://github.com/harvester/harvester-ui-extension**.
    - Git Branch: Specify **gh-pages**.

2. Click **Create**.

3. Go to **Extensions > Available**.
  ![](/img/v1.5/rancher/ui-extension-available-tab.png)

4. Locate the extension named **Harvester**, and then click **Install**.


## Upgrades

### Automatic Upgrade

The **Update** button appears whenever a new version of the extension is available.

1. On the Rancher UI, go to **Virtualization Management**.

    ![](/img/v1.5/rancher/ui-extension-update.png)

1. Click **Update**.
    Allow some time for the extension to be upgraded. The screen is automatically refreshed once the upgrade is completed.

### Manual Upgrades

1. On the Rancher UI, go to **local > Apps > Repositories**.

1. Locate the repository with the following settings, and then select **⋮ > Refresh**.

    - URL: **https://github.com/harvester/harvester-ui-extension**
    - Branch: **gh-pages**

    ![](/img/v1.4/upgrade/rancher-2.10.1-repository-page.png)

1. Go to **Extensions > Installed**.

1. Locate the extension named **Harvester**, and then click **Update**.

1. Select the new version, and then click **Update**.

    ![](/img/v1.4/upgrade/update-harvester-ui-extension-modal.png)

1. Allow some time for the extension to be upgraded, and then refresh the screen.

## Limitation
### Harvester v1.2.x and earlier are not supported

When you import a cluster that is running Harvester v1.2.x or earlier, an error message appears and the cluster link is disabled.

The **Manage** button is still available in Rancher 2.11.0, but it will be disabled in a future Rancher release. For more information, see issue [#8054](https://github.com/harvester/harvester/issues/8054).

  ![](/img/v1.5/rancher/ui-extension-import-121harvester.png)

:::caution
Please avoid clicking Manage button to operate Harvester cluster v1.2.x or earlier, as it is not supported.
:::