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
  <link rel="canonical" href="https://docs.harvesterhci.io/v1.4/rancher/rancher-integration"/>
</head>

Starting from Rancher 2.10.0, Harvester integration is provided by [Harvester UI Extension](https://github.com/harvester/harvester-ui-extension). The Harvester UI Extension is a standard Rancher extension that built on the[@rancher/shell](https://www.npmjs.com/package/@rancher/shell) library.


The original [Harvester dashboard](https://github.com/harvester/dashboard) will continue to support Harvester v1.3.x and v1.4.x releases. New features in future releases will be implemented in the Harvester UI Extension.




## Support Matrix

Starting from v1.5.0, the Harvester UI Extension version will align with the Harvester release version.

:::caution
Harvester UI Extension only supports Harvester cluster versions greater or equal to 1.3.0.
:::


| Harvester Cluster         | Harvester UI Extension          | Minimum supported Rancher  |
| --------------------------| ------------------------------- | ------------------------   |
| v1.3.0 / v1.3.1 / v1.3.2  | v1.0.2                          | Rancher 2.10.1             |
| v1.4.1                    | v1.0.3                          | Rancher 2.10.1             |
| v1.4.2                    | v1.0.4                          | Rancher 2.10.1             |
| v1.5.0                    | v1.5.0                          | Rancher 2.11.0             |


## Installation on Rancher 2.10

:::caution
Rancher 2.8 and 2.9 do not support to install Harvester UI Extension, only Rancher 2.10.0 and later version support
:::


### Automatic Installation

We provide `auto install` process to install Harvester UI Extension with a single click.

1. In the Rancher UI, navigate to the **Virtualization Management** screen.

1. Click the `Install` button and allow some time for the extension to install. The page will automatically refresh once the installation is complete.

Note: Do not navigate away during the installation process, as this may cause it to fail.

 ![](/img/v1.5/rancher/auto-install-ui-extension.png)


### Manual Installation
If the automatic installation fails, you can manually set up the Harvester UI Extension repository URL and install it.

  ![](/img/v1.5/rancher/ui-extension-install-failed.png)

 
1. In the Rancher UI, go to **local > Apps > Repositories**.

1. Click the **Create** button, give a repository name and select `Git repository containing Helm chart or cluster template definitions`.

  Enter the following properties:
    - Git Repo URL: **https://github.com/harvester/harvester-ui-extension**
    - Git Branch: **gh-pages**
  
  ![](/img/v1.5/rancher/ui-extension-app-repository-setup.png)

1. Navigate to the **Extensions** screen and click **Install** under the Available tab.

  ![](/img/v1.5/rancher/ui-extension-available-tab.png)


## Upgrading Harvester UI Extension

### Automatic Upgrade
1. In the Rancher UI, go to **Virtualization Management**.

1. The **Update** button will be visible when a new extension version is available.

1. Click the **Update** button and allow some time for the extension to upgrade. The page will automatically refresh once the upgrade is complete.

 ![](/img/v1.5/rancher/ui-extension-update.png)


### Manual Upgrade

1. In the Rancher UI, navigate to **local > Apps > Repositories**.

1. Locate the repository with the following properties:, and then select **⋮ > Refresh**.
    
    - URL: **https://github.com/harvester/harvester-ui-extension**
    - Branch: **gh-pages**

  ![](/img/v1.4/upgrade/rancher-2.10.1-repository-page.png)

1. Go to the **Extensions** screen.

1. Select the new version, and then click **Update**.
  
  ![](/img/v1.4/upgrade/update-harvester-ui-extension-modal.png)

1. Allow some time for the extension to update, then refresh the screen.