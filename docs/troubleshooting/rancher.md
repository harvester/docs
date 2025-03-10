---
sidebar_position: 2
sidebar_label: Rancher
title: "Rancher"
---

<head>
  <link rel="canonical" href="https://docs.harvesterhci.io/v1.4/troubleshooting/rancher"/>
</head>


## Collect Guest Cluster Logs

You can collect logs and configuration files of guest cluster nodes with the following steps (note these steps need to be repeated on each node inside a guest cluster):

- Log in to a guest cluster node.
- Run the command to download the script and generate a log bundle:

    ```
    curl -OLs https://raw.githubusercontent.com/rancherlabs/support-tools/master/collection/rancher/v2.x/logs-collector/rancher2_logs_collector.sh
    sudo bash rancher2_logs_collector.sh
    ```

The output of the script will suggest where the resulted tarball is stored.

For more information, please check the [KB document](https://www.suse.com/support/kb/doc/?id=000020191).
