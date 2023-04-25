---
id: index
sidebar_position: 1
sidebar_label: Rancher Integration
title: "Rancher Integration"
keywords:
  - Harvester
  - harvester
  - Rancher
  - rancher
  - Rancher Integration
Description: Rancher is an open source multi-cluster management platform. Harvester has integrated Rancher by default starting with Rancher v2.6.1.
---

<head>
  <link rel="canonical" href="https://docs.harvesterhci.io/v1.1/rancher/rancher-integration"/>
</head>

_Available as of v0.3.0_

[Rancher](https://github.com/rancher/rancher) is an open-source multi-cluster management platform. Starting with Rancher v2.6.1, Rancher has integrated Harvester by default to centrally manage VMs and containers.


## Rancher & Harvester Support Matrix

For the support matrix, please see [Harvester & Rancher Support Matrix](https://www.suse.com/suse-harvester/support-matrix/all-supported-versions/harvester-v1-1-1/#anchor-h4-item2).

Users can now import and manage multiple Harvester clusters using the Rancher [Virtualization Management](virtualization-management.md) page and leverage the Rancher [authentication](https://ranchermanager.docs.rancher.com/v2.6/pages-for-subheaders/authentication-config) feature and RBAC control for [multi-tenancy](https://rancher.com/docs/rancher/v2.6/en/admin-settings/rbac/) support.

<div class="text-center">
<iframe width="950" height="475" src="https://www.youtube.com/embed/fyxDm3HVwWI" title="YouTube video player" frameborder="0" allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture" allowfullscreen></iframe>
</div>

![virtualization-management](/img/v1.2/rancher/virtualization-management.png)

## Deploying Rancher Server

To use Rancher with Harvester, please install the Rancher and Harvester in two separated servers. If you want to try out the integration features, you can create a VM in Harvester and install Rancher v2.6.3 or above (the latest stable version is recommended).

Use one of the following guides to deploy and provision Rancher and a Kubernetes cluster with the provider of your choice:

- [AWS](https://rancher.com/docs/rancher/v2.6/en/quick-start-guide/deployment/amazon-aws-qs/) (uses Terraform)
- [AWS Marketplace](https://rancher.com/docs/rancher/v2.6/en/quick-start-guide/deployment/amazon-aws-marketplace-qs/) (uses Amazon EKS)
- [Azure](https://rancher.com/docs/rancher/v2.6/en/quick-start-guide/deployment/microsoft-azure-qs/) (uses Terraform)
- [DigitalOcean](https://rancher.com/docs/rancher/v2.6/en/quick-start-guide/deployment/digital-ocean-qs/) (uses Terraform)
- [GCP](https://rancher.com/docs/rancher/v2.6/en/quick-start-guide/deployment/google-gcp-qs/) (uses Terraform)
- [Hetzner Cloud](https://rancher.com/docs/rancher/v2.6/en/quick-start-guide/deployment/hetzner-cloud-qs/) (uses Terraform)
- [Vagrant](https://rancher.com/docs/rancher/v2.6/en/quick-start-guide/deployment/quickstart-vagrant/)
- [Equinix Metal](https://rancher.com/docs/rancher/v2.6/en/quick-start-guide/deployment/equinix-metal-qs/)

:::caution

**Do not install Rancher with Docker in production**. Otherwise, your environment may be damaged and your cluster may not be recovered. Installing Rancher in Docker should only be used for quick evaluation and testing purposes.

To install Rancher with Docker:

1. Begin creation of a custom cluster by provisioning a Linux host. Your host can be any of the following:
    - A cloud-hosted virtual machine (VM)
    - An on-premises VM
    - A bare-metal server
1. Log into your Linux host using your preferred shell, such as PuTTy or a remote terminal connection.
1. From your shell, enter the following command:

```shell
# for a quick evaluation, you can run the Rancher server with the following command
$ sudo docker run -d --restart=unless-stopped -v /opt/rancher:/var/lib/rancher -p 80:80 -p 443:443 --privileged rancher/rancher:v2.6.9
```

:::

## Virtualization Management

With Rancher's Virtualization Management feature, you can now import and manage Harvester clusters.
By clicking on one of the clusters, you are able to view and manage the imported Harvester cluster resources like Hosts, VMs, images, volumes, etc. Additionally, the `Virtualization Management` leverages existing Rancher features such as authentication with various auth providers and multi-tenant support.

For more details, please check the [virtualization management](./virtualization-management.md) page.

![import-cluster](/img/v1.2/rancher/import-harvester-cluster.png)

## Creating Kubernetes Clusters using the Harvester Node Driver

[Harvester node driver](./node/node-driver.md) is used to provision VMs in the Harvester cluster, which Rancher uses to launch and manage guest Kubernetes clusters.

Starting with Rancher `v2.6.1`, the Harvester node driver has been added by default. Users can reference the [node-driver](./node/node-driver.md) page for more details.