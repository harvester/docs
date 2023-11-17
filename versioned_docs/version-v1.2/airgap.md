---
id: airgap
sidebar_position: 3
sidebar_label: Air Gapped Environment
title: "Air Gapped Environment"
keywords:
- Harvester
- offline
- Air-gap
- HTTP proxy
---

This section describes how to use Harvester in an air gapped environment. Some use cases could be where Harvester will be installed offline, behind a firewall, or behind a proxy.

The Harvester ISO image contains all the packages to make it work in an air gapped environment.

## Working Behind an HTTP Proxy

In some environments, the connection to external services, from the servers or VMs, requires an HTTP(S) proxy.

### Configure an HTTP Proxy During Installation

You can configure the HTTP(S) proxy during the [ISO installation](./install/iso-install.md) as shown in picture below:

![iso-proxy](/img/v1.2/iso-proxy.png)

### Configure an HTTP Proxy in Harvester Settings

You can configure the HTTP(S) proxy in the settings page of the Harvester dashboard:

1. Go to the settings page of the Harvester UI.
1. Find the `http-proxy` setting, click **⋮ > Edit setting**
1. Enter the value(s) for `http-proxy`, `https-proxy` and `no-proxy`.

![proxy-setting](/img/v1.2/proxy-setting.png)

:::note

Harvester appends necessary addresses to user configured `no-proxy` to ensure the internal traffic works.
i.e., `localhost,127.0.0.1,0.0.0.0,10.0.0.0/8,longhorn-system,cattle-system,cattle-system.svc,harvester-system,.svc,.cluster.local`. `harvester-system` was added into the list since v1.1.2.

When the nodes in the cluster do not use a proxy to communicate with each other, the CIDR needs to be added to `http-proxy.noProxy` after the first node is installed successfully. Please refer to [fail to deploy a multi-node cluster](./troubleshooting/harvester.md#fail-to-deploy-a-multi-node-cluster-due-to-incorrect-http-proxy-setting).

:::

## Guest Cluster Images

All necessary images to install and run Harvester are conveniently packaged into the ISO, eliminating the need to pre-load images on bare-metal nodes. A Harvester cluster manages them independently and effectively behind the scenes. 

However, it's essential to understand a guest K8s cluster (e.g., RKE2 cluster) created by the [Harvester node driver](./rancher/node/node-driver.md) is a distinct entity from a Harvester cluster. A guest cluster operates within VMs and requires pulling images either from the internet or a [private registry](https://ranchermanager.docs.rancher.com/how-to-guides/new-user-guides/authentication-permissions-and-global-configuration/global-default-private-registry#configure-a-private-registry-with-credentials-when-creating-a-cluster). 

If the **Cloud Provider** option is configured to **Harvester** in a guest K8s cluster, it deploys the Harvester cloud provider and Container Storage Interface (CSI) driver.

![cluster-registry](/img/v1.2/cluster-registry.png)

As a result, we recommend monitoring each [RKE2 release](https://github.com/rancher/rke2/releases) in your air gapped environment and pulling the required images into your private registry. Please refer to the **Harvester CCM & CSI Driver** with RKE2 Releases section on the [Harvester support matrix page](https://www.suse.com/suse-harvester/support-matrix/all-supported-versions/harvester-v1-1-2/) for the best Harvester cloud provider and CSI driver capability support.