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

Start from Rancher 2.10.0, Harvester integration is provided by [Harvester UI Extension](https://github.com/harvester/harvester-ui-extension). Harvester UI Extension is a standard Rancher extension that built on [@rancher/shell](https://www.npmjs.com/package/@rancher/shell) library.


Original [Harvester dashboard](https://github.com/harvester/dashboard) only keeps to maintain Harvester v1.3.x and v1.4.x releases. New features in future release will be implemented in Harvester UI Extension.




## Support Matrix

Start from v1.5.0, Harvester UI Extension version will aligns with Harvester release version.

:::caution
Harvester UI Extension only supports Harvester cluster versions greater or equal to 1.3.0.
:::


| Harvester Cluster         | Harvester UI Extension          | Minimum supported Rancher  |
| --------------------------| ------------------------------- | ------------------------   |
| v1.3.0 / v1.3.1 / v1.3.2  | v1.0.2                          | Rancher 2.10.1             |
| v1.4.1                    | v1.0.3                          | Rancher 2.10.1             |
| v1.4.2                    | v1.0.4                          | Rancher 2.10.1             |
| v1.5.0                    | v1.5.0                          | Rancher 2.11.0             |


## Install on Rancher 2.10

:::caution
Rancher 2.8 and 2.9 do not support to install Harvester UI Extension, only Rancher 2.10.0 and later version support
:::


### Automatic Install

We provide `auto install` process to install Harvester UI Extension with one button click since Rancher 2.10.1,

1. On the Rancher UI, go to **Virtualization Management** screen.

1. Click `Install` button and allow some time for the extension to be installed, and the page will auto refresh once the installation process is done. Don't navigate to other pages while in installation process, otherwise the auto installation process will fail. 

 ![](/img/v1.5/rancher/auto-install-ui-extension.png)


### Manually Install
If auto install process is failed, you can also setup Harvester UI Extension repository URL and install it manually.
 
1. On the Rancher UI, go to **local > Apps > Repositories**.

1. Click **Create** button, give a repository name and choose the second option `Git repository containing Helm chart or cluster template definitions`.

  Fill in the following properties:
    - Git Repo URL: **https://github.com/harvester/harvester-ui-extension**
    - Git Branch: **gh-pages**
  
  ![](/img/v1.5/rancher/ui-extension-app-repository-setup.png)

1. Go to the **Extensions** screen, click **install** in Available tab.

  ![](/img/v1.5/rancher/ui-extension-available-tab.png)


## Upgrade Harvester UI Extension

### Automatic Upgrade
1. On the Rancher UI, go to the **Virtualization Management**.

1. Click `Update` button and allow some time for the extension to be upgraded, and the page will auto refresh once the upgrade process is done.

 ![](/img/v1.5/rancher/ui-extension-update.png)


### Manually Upgrade

1. On the Rancher UI, go to **local > Apps > Repositories**.

1. Locate the repository with the following properties:, and then select **⋮ > Refresh**.
    
    - URL: **https://github.com/harvester/harvester-ui-extension**
    - Branch: **gh-pages**

  ![](/img/v1.4/upgrade/rancher-2.10.1-repository-page.png)

1. Go to the **Extensions** screen.

1. Select the new version, and then click **Update**.
  
  ![](/img/v1.4/upgrade/update-harvester-ui-extension-modal.png)

1. Allow some time for the extension to be updated, and then refresh the screen.