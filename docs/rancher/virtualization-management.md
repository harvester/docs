---
keywords:
  - Harvester
  - Rancher
---

## Virtualization Management

[Rancher](https://github.com/rancher/rancher) is an open source multi-cluster management platform. Users can manage multiple Harvester clusters with Rancher starting from [v2.6.1](https://github.com/rancher/rancher/releases/tag/v2.6.1). 

> Prerequisites
> - Set up Harvester clusters following the installation guide.
> - Install Rancher following the [Rancher docs](https://rancher.com/docs/rancher/v2.6/en/installation/)
> - Rancher server should be accessible from managed Harvester clusters.

### Importing Harvester clusters to Rancher

1. In Rancher UI, click **☰ > Virtualization Management**.
1. Click **Import Existing**.
1. Enter a name for the Harvester cluster, click **Create**.
1. Copy the registration command.
1. SSH to a Harvester node(using **rancher** as the username and the node password set on installation) and execute the registration command.
1. Go to Rancher Virtualization Management UI, wait until the Harvester cluster to be active.
1. Click the name of the Harvester cluster, you should be able to manage Harvester resources in Rancher UI.
1. To manage multiple Harvester clusters in Rancher, repeat the above steps to import those Harvester clusters.

