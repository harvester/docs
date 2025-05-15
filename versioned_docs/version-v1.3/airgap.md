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

<head>
  <link rel="canonical" href="https://docs.harvesterhci.io/v1.5/airgap"/>
</head>

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

## Integrate with External Rancher

Rancher determines the `rancher-agent` image to be used whenever a Harvester cluster is imported. If the image is not included in the Harvester ISO, it must be pulled from the internet and loaded on each node, or pushed to the Harvester cluster's registry.

```bash
# Run the following commands on a computer that can access both the internet and the Harvester cluster.
docker pull rancher/rancher-agent:<version>
docker save rancher/rancher-agent:<version> -o rancher-agent-<version>.tar

# Copy the image TAR file to the air-gapped environment.
scp rancher-agent-<version>.tar rancher@<harvester-node-ip>:/tmp

# Use SSH to connect to the Harvester node, and then load the image.
ssh rancher@<harvester-node-ip>
sudo -i
docker load -i /tmp/rancher-agent-<version>.tar
```

## Harvester UI extension with Rancher Integration

The Harvester UI Extension is required to access the Harvester UI in Rancher v2.10.x and later versions. However, installing the extension over the network is not possible in air-gapped environments, so you must perform the following workaround:



1. Pull the image [rancher/ui-plugin-catalog](https://hub.docker.com/r/rancher/ui-plugin-catalog/tags) with the newest tag.

1. On the Rancher UI, go to **Extensions**, and then select **⋮ > Manage Extension Catalogs**.

  ![](/img/v1.5/air-gapped/air-gappted-harvester-ui-extension-01.png)

1. Specify the required information.

  ![](/img/v1.5/air-gapped/air-gappted-harvester-ui-extension-02.png)

    - **Catalog Image Reference**: Specify the private registry URL and image repository.
    - **Image Pull Secrets**: Specify the secret used to access the registry when a username and password are required. You must create that secret in the `cattle-ui-plugin-system` namespace. Use either `kubernetes.io/dockercfg` or `kubernetes.io/dockerconfigjson` as the value of `type`.
      Example:

      ```yaml
      apiVersion: v1
      kind: Secret
      metadata:
        name: my-registry-secret-rancher
        namespace: cattle-ui-plugin-system
      type: kubernetes.io/dockerconfigjson
      data:
        .dockerconfigjson: {base64 encoded data}
      ```

1. Click **Load**, and then allow some time for the extension to be loaded.

  ![](/img/v1.5/air-gapped/air-gappted-harvester-ui-extension-03.png)

1. On the **Available** tab, locate the extension named **Harvester**, and then click **Install**.

  ![](/img/v1.5/air-gapped/air-gappted-harvester-ui-extension-04.png)

1. Select the version that matches the Harvester cluster, and then click **Install**.

  For more information, see the [Harvester UI Extension Support Matrix](/v1.3/rancher/harvester-ui-extension/#support-matrix).

  ![](/img/v1.5/air-gapped/air-gappted-harvester-ui-extension-05.png)

  ![](/img/v1.5/air-gapped/air-gappted-harvester-ui-extension-06.png) 

1. Go to **Virtualization Management > Harvester Clusters**.

  You can now import Harvester clusters and access the Harvester UI.

  ![](/img/v1.5/air-gapped/air-gappted-harvester-ui-extension-07.png)


## Troubleshooting

### UI Extensions Do Not Appear

If the **Extensions** screen is empty, go to **Repositories** (**⋮ > Manage Repositories**) and then click **Refresh**.

![](/img/v1.5/air-gapped/air-gappted-harvester-ui-extension-04-01.png)

![](/img/v1.5/air-gapped/air-gappted-harvester-ui-extension-04-02.png)

![](/img/v1.5/air-gapped/air-gappted-harvester-ui-extension-04-03.png)

![](/img/v1.5/air-gapped/air-gappted-harvester-ui-extension-04-04.png)

### Installation Failed

If you encounter an error during installation, check the `uiplugins` resource.

![](/img/v1.5/air-gapped/air-gappted-harvester-ui-extension-05-01.png)

Example:

```
bash-4.4# k get uiplugins -A
NAMESPACE                 NAME        PLUGIN NAME   VERSION   STATE
cattle-ui-plugin-system   harvester   harvester     1.0.3     pending
bash-4.4# k get uiplugins harvester --namespace cattle-ui-plugin-system -o yaml
apiVersion: catalog.cattle.io/v1
kind: UIPlugin
metadata:
  # skip
  name: harvester
  namespace: cattle-ui-plugin-system
spec:
  plugin:
    endpoint: http://ui-plugin-catalog-svc.cattle-ui-plugin-system:8080/plugin/harvester-1.0.3
```

Ensure that `svc.namespace` is accessible from Rancher. If that endpoint is not accessible, you can directly use a cluster IP such as `10.43.33.58:8080/plugin/harvester-1.0.3`.
