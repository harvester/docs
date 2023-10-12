---
sidebar_position: 7
sidebar_label: Management Address
title: "Management Address"
keywords:
  - VIP
Description: The Harvester provides a virtual IP as the management address.
---

<head>
  <link rel="canonical" href="https://docs.harvesterhci.io/v1.1/install/management-address"/>
</head>

Harvester provides a fixed virtual IP (VIP) as the management address, VIP must be different from any Node IP.  You can find the management address on the console dashboard after the installation.

The VIP is configured while the **first Node** of the cluster is installed.

e.g. ![Configure the VIP mode and IP address in ISO Installation](/img/v1.2/install/config-virtual-ip.png)

:::note

If you selected the IP address to be configured via DHCP, you will need to configure static MAC-to-IP address mapping on your DHCP server in order to have a persistent Virtual IP

:::

After the Node starts successfully, both of the VIP and Node IP are shown on the console.

![](/img/v1.2/install/iso-installed.png)

## How to get the VIP MAC address

To get the VIP MAC address, you can run the following command on the management node:
```shell
$ kubectl get svc -n kube-system ingress-expose -ojsonpath='{.metadata.annotations}'
```

Example of output:
```json
{"kube-vip.io/hwaddr":"02:00:00:09:7f:3f","kube-vip.io/requestedIP":"10.84.102.31"}
```

## Usages

The management address:

- Allows the access to the Harvester API/UI via `HTTPS` protocol.
- Allows other nodes to join the cluster.
  ![](/img/v1.2/install/configure-management-address.png)

:::note

After the first Node of the Harvester cluster is installed, user may configure the [ssl-certificates](../advanced/settings.md#ssl-certificates), then the cluster can be accessed via VIP and FQDN.

The following installed Node can also join the cluster by both VIP and FQDN. When using FQDN, please note a known issue [Unable to join the new node](https://github.com/harvester/harvester/issues/4511) and workaround: https://github.com/harvester/harvester/issues/4511#issuecomment-1761047115

:::
