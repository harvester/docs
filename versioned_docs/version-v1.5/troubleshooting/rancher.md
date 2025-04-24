---
sidebar_position: 2
sidebar_label: Rancher
title: "Rancher"
---

<head>
  <link rel="canonical" href="https://docs.harvesterhci.io/v1.4/troubleshooting/rancher"/>
</head>


## Guest Cluster Log Collection

You can collect guest cluster logs and configuration files. Perform the following steps on each guest cluster node:

1. Log in to the node.
1. Download the Rancher v2.x Linux log collector script and generate a log bundle using the following commands:

    ```
    curl -OLs https://raw.githubusercontent.com/rancherlabs/support-tools/master/collection/rancher/v2.x/logs-collector/rancher2_logs_collector.sh
    sudo bash rancher2_logs_collector.sh
    ```

    The output of the script indicates the location of the generated tarball.

For more information, see [The Rancher v2.x Linux log collector script](https://www.suse.com/support/kb/doc/?id=000020191).


## Harvester is Pending Importing to Rancher Manager

After setting the `cluster-registration-url` on Harvester, a deployment `cattle-system/cattle-cluster-agent` is created to import the Harvester cluster to `Rancher Manager`.

There are some known issues.

### Pending Due to `unable to read CA file`

When following logs are observed from the pod `cattle-cluster-agent-*`, Harvester can't be imported to `Rancher Manager`.

```
2025-02-13T17:25:22.520593546Z time="2025-02-13T17:25:22Z" level=info msg="Rancher agent version v2.10.2 is starting"
2025-02-13T17:25:22.529886868Z time="2025-02-13T17:25:22Z" level=error msg="unable to read CA file from /etc/kubernetes/ssl/certs/serverca: open /etc/kubernetes/ssl/certs/serverca: no such file or directory"
2025-02-13T17:25:22.529924542Z time="2025-02-13T17:25:22Z" level=error msg="Strict CA verification is enabled but encountered error finding root CA"
```

### Root Cause

`Rancher Manager` added a new setting, `agent-tls-mode`, which allows users to specify if agents will use strict certificate verification when connecting to Rancher. Can be set to strict (which requires the agent to verify the cert using only the Certificate Authority in the cacerts setting) or system-store (which allows the agent to verify the cert using any Certificate Authority in the operating system's trust store).

This setting will default to strict on new installs of 2.9.0+, but will be system-store on new installs of 2.8 or upgrades to 2.9 from 2.8.

Refer [Release Node](https://github.com/rancher/rancher/issues/45628#issuecomment-2246152604)

### Solution

1. Login to the `Rancher-Manager` UI, then navigate to **Global Setttings** > **Setttings**.
1. Find and select **agent-tls-mode**, and then select **⋮** > **Edit Setting** to access the configuration options.
1. Set the **Value** to `System Store`.

![](/img/v1.4/troubleshooting/rancher-global-setting-agent-tls-mode.png)

Related issues:
  - [[BUG] Rancher integration w/ Harv v1.4.0 and Rancher v2.9.2 failing](https://github.com/harvester/harvester/issues/7105)
  - [[QUESTION] Upgrading rancher-vcluster addon?]https://github.com/harvester/harvester/issues/7284
  - [(Rancher Manager) add new agent-tls-mode setting](https://github.com/rancher/rancher/issues/45628)
