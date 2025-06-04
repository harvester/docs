---
sidebar_position: 7
sidebar_label: Management Address
title: "Management Address"
keywords:
  - VIP
description: The Harvester provides a virtual IP as the management address.
---

<head>
  <link rel="canonical" href="https://docs.harvesterhci.io/v1.5/install/management-address"/>
</head>

Harvester provides a fixed virtual IP (VIP) as the management address, VIP must be different from any Node IP.  You can find the management address on the console dashboard after the installation.

:::note

If you selected the IP address to be configured via DHCP, you will need to configure static MAC-to-IP address mapping on your DHCP server in order to have a persistent Virtual IP

:::

![](/img/v1.2/install/iso-installed.png)

## Requirements

- The VIP and the node management interfaces must belong to the same subnet.
- All Harvester node management interfaces must be on the same layer-2 network segment.

Both are required because the VIP relies on the Address Resolution Protocol (ARP), which is a layer-2 protocol.

The VIP can be assigned to any Harvester node management interface and can change at any time (not only when node failure occurs). When the VIP changes hosts, *gratuitous ARPs* are sent so that other hosts on the network know where to direct traffic intended for the Harvester cluster's management IP address (the VIP).

:::warning

If you plan to host a Harvester cluster in a bare metal data center, the service provider will likely designate a "floating" or "reserved" IP address as the VIP that you can assign to one of your servers. Updating this assignment causes traffic to instantly start flowing to the new node it is assigned to. In these situations, Harvester is unable to update the floating/reserved IP assignment in your provider's systems when the VIP changes hosts.

Furthermore, the VIP's "gratuitous ARPs" may also be ineffective depending on your provider's networking setup between your Harvester nodes (for example, if your Harvester hosts are not on the same layer-2 network). You must update the floating/reserved IP assignment manually when the VIP changes hosts to ensure that the cluster functions properly. For more information, see [Finding which node the VIP is on](#identifying-the-node-the-vip-is-assigned-to).

:::

## How to get the VIP MAC address

To get the VIP MAC address, you can run the following command on the management node:
```shell
$ kubectl get svc -n kube-system ingress-expose -ojsonpath='{.metadata.annotations}'
```

Example of output:
```json
{"kube-vip.io/hwaddr":"02:00:00:09:7f:3f","kube-vip.io/requestedIP":"10.84.102.31"}
```

## Identifying the Node the VIP Is Assigned To

You can use kubectl (either on your local machine with the Harvester kubeconfig file, or when using SSH to connect to any Harvester management node as a root user).

```console
kubectl -n kube-system get svc ingress-expose -o jsonpath='{.metadata.annotations.kube-vip\.io/vipHost}'
```

Example output:
```console
harvester-xzj76
```

Alternatively, you can use SSH to connect to each Harvester management node and then run the command `ip address show mgmt-br`.

Example:

```console
harvester-xzj76:~ # ip address show mgmt-br
4: mgmt-br: <BROADCAST,MULTICAST,UP,LOWER_UP> mtu 1500 qdisc noqueue state UP group default qlen 1000
    link/ether 8c:dc:d4:b5:f0:fd brd ff:ff:ff:ff:ff:ff
    inet 172.19.108.45/21 brd 172.19.111.255 scope global mgmt-br
       valid_lft forever preferred_lft forever
    inet 172.19.108.34/32 scope global mgmt-br
       valid_lft forever preferred_lft forever
```

When the output includes both the VIP and the node address, the VIP is assigned to the node that you are connected to.

## Usages
The management address:

- Allows the access to the Harvester API/UI via `HTTPS` protocol.
- Allows other nodes to join the cluster.
  ![](/img/v1.2/install/configure-management-address.png)
