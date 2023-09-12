---
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

[Rancher](https://github.com/rancher/rancher) is an open-source multi-cluster management platform. Starting with Rancher v2.6.1, Rancher has integrated Harvester by default to centrally manage VMs and containers.

Users can import and manage multiple Harvester clusters using the Rancher [Virtualization Management](virtualization-management.md) feature. Leveraging the Rancher's [authentication](https://ranchermanager.docs.rancher.com/v2.7/pages-for-subheaders/authentication-config) feature and [RBAC control](https://ranchermanager.docs.rancher.com/v2.7/pages-for-subheaders/manage-role-based-access-control-rbac) for [multi-tenancy](virtualization-management.md#multi-tenancy) support.

For a comprehensive overview of the support matrix, please refer to the [Harvester & Rancher Support Matrix](https://www.suse.com/suse-harvester/support-matrix/all-supported-versions/).

For the network requirements, please refer to the doc [here](../install/requirements.md#network-requirements).

<div class="text-center">
<iframe width="950" height="475" src="https://www.youtube.com/embed/fyxDm3HVwWI" title="YouTube video player" allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture" allowfullscreen></iframe>
</div>

![virtualization-management](/img/v1.2/rancher/virtualization-management.png)

## Deploying Rancher server

To use Rancher with Harvester, please install Rancher on a separate server. If you want to try out the integration features, you can create a VM in Harvester and install the Rancher server by following the [Helm CLI quick start](https://ranchermanager.docs.rancher.com/v2.7/getting-started/quick-start-guides/deploy-rancher-manager/helm-cli).

For production setup, please use one of the following guides to deploy and provision Rancher and a Kubernetes cluster with the provider of your choice:

- [AWS](https://ranchermanager.docs.rancher.com/v2.7/pages-for-subheaders/deploy-rancher-manager) (uses Terraform)
- [AWS Marketplace](https://ranchermanager.docs.rancher.com/v2.7/getting-started/quick-start-guides/deploy-rancher-manager/aws-marketplace) (uses Amazon EKS)
- [Azure](https://ranchermanager.docs.rancher.com/v2.7/getting-started/quick-start-guides/deploy-rancher-manager/azure) (uses Terraform)
- [DigitalOcean](https://ranchermanager.docs.rancher.com/v2.7/getting-started/quick-start-guides/deploy-rancher-manager/digitalocean) (uses Terraform)
- [GCP](https://ranchermanager.docs.rancher.com/v2.7/getting-started/quick-start-guides/deploy-rancher-manager/gcp) (uses Terraform)
- [Hetzner Cloud](https://ranchermanager.docs.rancher.com/v2.7/getting-started/quick-start-guides/deploy-rancher-manager/hetzner-cloud) (uses Terraform)
- [Vagrant](https://ranchermanager.docs.rancher.com/v2.7/getting-started/quick-start-guides/deploy-rancher-manager/vagrant)
- [Equinix Metal](https://ranchermanager.docs.rancher.com/v2.7/getting-started/quick-start-guides/deploy-rancher-manager/equinix-metal)
- [Outscale](https://ranchermanager.docs.rancher.com/v2.7/getting-started/quick-start-guides/deploy-rancher-manager/outscale-qs) (uses Terraform)

If you prefer, the following guide will take you through the same process in individual steps. Use this if you want to run Rancher in a different provider, on prem, or if you want to see how easy it is.

- [Manual Install](https://ranchermanager.docs.rancher.com/v2.7/getting-started/quick-start-guides/deploy-rancher-manager/helm-cli)

:::caution

**Do not install Rancher with Docker in production**. Otherwise, your environment may be damaged, and your cluster may not be abled to be recovered. Installing Rancher in Docker should only be used for quick evaluation and testing purposes.

:::

## Virtualization management

With Rancher's virtualization management feature, you can import and manage your Harvester cluster. By clicking one of the imported clusters, you can easily access and manage a range of Harvester cluster resources, including hosts, VMs, images, volumes, and more. 
Additionally, the virtualization management feature leverages Rancher's existing capabilities, such as authentication with various auth providers and multi-tenancy support.

For in-depth insights, please refer to the [virtualization management](./virtualization-management.md) page.

![import-cluster](/img/v1.2/rancher/import-harvester-cluster.png)

## Creating Kubernetes clusters using the Harvester node driver

You can launch a Kubernetes cluster from Rancher using the [Harvester node driver](./node/node-driver.md). When Rancher deploys Kubernetes onto these nodes, you can choose between Rancher Kubernetes Engine (RKE) or RKE2 distributions.

One benefit of installing Kubernetes on node pools hosted by the node driver is that if a node loses connectivity with the cluster, Rancher can automatically create another node to join the cluster to ensure that the count of the node pool is as expected.

Starting from Rancher version `v2.6.1`, the Harvester node driver is included by default. You can refer to the [node-driver](./node/node-driver.md) page for more details.

![harvester-node-driver](/img/v1.2/rancher/harvester-node-driver.png)

## Harvester baremetal container workload support (experimental)

_Available as of Harvester v1.2.0 + Rancher v2.7.6_


Starting with Rancher v2.7.6, Harvester introduces a new feature that enables you to deploy and manage container workloads directly to the underlying Harvester cluster. With this feature, you can seamlessly combine the power of virtual machines with the flexibility of containerization, allowing for a more versatile and efficient infrastructure setup.

![harvester-container-dashboard](/img/v1.2/rancher/harvester-container-dashboard.png)

This guide will walk you through enabling and using this experimental feature, highlighting its capabilities and best practices.

To enable this new feature flag, follow these steps:

1. Click the hamburger menu and choose the **Global Settings** tab.
1. Click **Feature Flags** and locate the new feature flag `harvester-baremetal-container-workload`.
1. Click the drop-down menu and select **Activate** to enable this feature.
1. If the feature state changes to **Active**, the feature is successfully enabled.

![harvester-baremetal-container-workload-feature](/img/v1.2/rancher/harvester-baremetal-container-workload-feature.png)

### Key Features

**Unified Dashboard View:**
Once you've enabled the feature, you can explore the dashboard view of the Harvester cluster, just like you would with other standard Kubernetes clusters. This unified experience simplifies the management and monitoring of both your virtual machines and container workloads from a single, user-friendly interface.

**Deploy Custom Workloads:**
This feature lets you deploy custom container workloads directly to the bare-metal Harvester cluster. While this functionality is experimental, it introduces exciting possibilities for optimizing your infrastructure. However, we recommend deploying container and VM workloads in separate namespaces to ensure clarity and separation.

:::note

- Critical system components such as monitoring, logging, Rancher, KubeVirt, and Longhorn are all managed by the Harvester cluster itself. You can't upgrade or modify these components. Therefore, exercise caution and avoid making changes to these critical system components.
- It is essential not to deploy any workloads to the system namespaces `cattle-system`, `harvester-system`, or `longhorn-system`. Keeping your workloads in separate namespaces is crucial to maintaining clarity and preserving the integrity of the system components.
- For best practices, we recommend deploying container and VM workloads in separate namespaces.

:::

:::note

With this feature enabled, your Harvester cluster does not appear on the **Continuous Delivery** page in the Rancher UI. Please check the issue [#4482](https://github.com/harvester/harvester/issues/4482) for further updates.

:::
