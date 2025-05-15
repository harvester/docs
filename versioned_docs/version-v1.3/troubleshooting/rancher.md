---
sidebar_position: 2
sidebar_label: Rancher
title: "Rancher"
---

<head>
  <link rel="canonical" href="https://docs.harvesterhci.io/v1.5/troubleshooting/rancher"/>
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
