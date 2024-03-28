---
sidebar_position: 7
sidebar_label: Management Address
title: "Management Address"
keywords:
  - VIP
description: The Harvester provides a virtual IP as the management address.
---

<head>
  <link rel="canonical" href="https://docs.harvesterhci.io/v1.1/install/management-address"/>
</head>

Harvester provides a fixed virtual IP (VIP) as the management address, VIP must be different from any Node IP.  You can find the management address on the console dashboard after the installation.

:::note

If you selected the IP address to be configured via DHCP, you will need to configure static MAC-to-IP address mapping on your DHCP server in order to have a persistent Virtual IP

:::

![](/img/v1.1/install/iso-installed.png)

## Requirements

1. The VIP must belong to the same subnet as the node management interfaces.
1. All of the Harvester node management interfaces must be on the same layer-2 network segment.

Both of these requirements are because the VIP relies on the Address Resolution Protocol (ARP), which is a layer-2 protocol.
The VIP can be assigned to any one of the Harvester management interfaces, and it can change at any time, not just when there is a node failure.

When the VIP changes hosts, it sends out "gratuitous ARPs" so that the rest of the hosts on the network know where to direct traffic that is meant for the Harvester cluster's management IP address (the VIP.)

:::warning

If you are planning to host a Harvester cluster in a bare metal provider's data center, it is possible that your provider will give you a "floating" or "reserved" IP address to act as the VIP that can be assigned to one of your servers at your discretion. Updating this assignment causes traffic to instantly start flowing to the new node it is assigned to.

In these situations, Harvester is unable to update that floating/reserved IP assignment in your bare metal provider's systems when the VIP changes hosts.

Furthermore, the VIP's "gratuitous ARPs" may also be ineffective depending on your provider's networking setup between your Harvester nodes (e.g., if your Harvester hosts are not on the same layer-2 network.)

You will have to update the floating/reserved IP assignment manually when the VIP changes hosts, otherwise the cluster may not function properly. (For more info, see ["Finding which node the VIP is on."](#finding-which-node-the-vip-is-on))

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

## Finding which node the VIP is on

Using `kubectl` (either on your own machine with the Harvester kubeconfig, or SSH'd into any Harvester management node as root):

```console
kubectl get pod -n harvester-system -o custom-columns='NAME:.metadata.name,NODE:.spec.nodeName' | grep -E '^kube-vip|^NAME'
```

Example output:
```console
NAME                                                    NODE
kube-vip-hxzfk                                          harvester-xzj76
```

Alternatively, you can SSH into each Harvester management node and run:

```console
harvester-xzj76:~ # ip address show mgmt-br
4: mgmt-br: <BROADCAST,MULTICAST,UP,LOWER_UP> mtu 1500 qdisc noqueue state UP group default qlen 1000
    link/ether 8c:dc:d4:b5:f0:fd brd ff:ff:ff:ff:ff:ff
    inet 172.19.108.45/21 brd 172.19.111.255 scope global mgmt-br
       valid_lft forever preferred_lft forever
    inet 172.19.108.34/32 scope global mgmt-br
       valid_lft forever preferred_lft forever
```

When you see both the VIP and the node address in the output of that command, then that means that the node you are running on is the one with the VIP attached to it.

## Usages
The management address has two usages.

- Allows the access to the Harvester API/UI via `HTTPS` protocol.
- Is the address the other nodes use to join the cluster.
  ![](/img/v1.1/install/configure-management-address.png)
