---
sidebar_position: 7
sidebar_label: Cluster Shutdown and Restart
title: "Cluster Shutdown and Restart"
---

## Shutdown a Harvester cluster

To gracefully shutdown a Harvester cluster, please run the following steps to keep the data safe.

1. Shutdown all VMs.
2. Take backups for all VMs.
3. Download all VM Images. (Since Harvester hasn't automatically backup VM Images in the backup target, you have to keep VM Images by yourself.)
4. Shutdown all agent nodes.
5. Shutdown all management nodes.

## Restart a Harvester cluster

1. Restart all management nodes.
2. Restart all agent nodes.
3. Restart all VMs.
