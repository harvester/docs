---
sidebar_position: 1
keywords:
  - Harvester
  - harvester
  - Rancher
  - rancher
  - Rancher Integration
Description: Rancher is an open source multi-cluster management platform. Harvester has integrated Rancher by default starting with Rancher v2.6.1.
---

## Rancher Integration

_Available as of v0.3.0_

[Rancher](https://github.com/rancher/rancher) is an open-source multi-cluster management platform. Harvester has integrated Rancher by default starting with Rancher v2.6.1.

!!!note
    Harvester v1.0.0 is compatible with Rancher v2.6.3 or above only.

Users can now import and manage multiple Harvester clusters using the Rancher [Virtualization Management](virtualization-management.md) page and leverage the Rancher [authentication](https://rancher.com/docs/rancher/v2.6/en/admin-settings/authentication/) feature and RBAC control for [multi-tenancy](https://rancher.com/docs/rancher/v2.6/en/admin-settings/rbac/) support.

![virtualization-management](assets/virtualization-management.png)

## Deploying Rancher

To use Rancher with Harvester, please install the Rancher server separately from the Harvester. As an option, You can spin up a VM in the Harvester and install the Rancher v2.6.3 or above to try out the integration features.

### Quick Start Guide
1. Begin creation of a custom cluster by provisioning a Linux host. Your host can be any of the following:
    - A cloud-hosted virtual machine (VM)
    - An on-premises VM
    - A bare-metal server
1. Log into your Linux host using your preferred shell, such as PuTTy or a remote terminal connection.
1. From your shell, enter the following command:

```shell
# for a quick evaluation, you can run the Rancher server with the following command
$ sudo docker run -d --restart=unless-stopped -p 80:80 -p 443:443 --privileged rancher/rancher:v2.6.3
```

!!! Note
    For more information about how to deploy the Rancher server, please refer to the Rancher [documentation](https://rancher.com/docs/rancher/v2.6/en/quick-start-guide/deployment/).

## Virtualization Management

With Rancher's Virtualization Management feature, users can now import and manage Harvester clusters. 
By clicking on one of the clusters, users are able to view and manage the imported Harvester cluster resources like Hosts, VMs, images, volumes, etc. Additionally, the `Virtualization Management` has leveraged existing Rancher features such as authentication with various auth providers and multi-tenant support.

For more details, please check the [virtualization management](virtualization-management.md) page.

![import-cluster](assets/import-harvester-cluster.png)

## Creating Kubernetes Clusters using the Harvester Node Driver

[Harvester node driver](node-driver.md) is used to provision VMs in the Harvester cluster, which Rancher uses to launch and manage guest Kubernetes clusters.

Starting with Rancher `v2.6.1`, the Harvester node driver has been added by default. Users can reference the [node-driver](node-driver.md) page for more details.

!!!note
    Harvester Node Driver with RKE2/k3s is in Tech Preview.
