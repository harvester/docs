---
sidebar_position: 14
sidebar_label: "Known Issue: VPC NAT Gateway SNAT"
title: "Known Issue: SNAT Through a VPC NAT Gateway Stops Working on Underlay External Networks"
keywords:
- Harvester
- networking
- Kube-OVN
- known issues
- workaround
- VPC NAT Gateway
- SNAT
- ARP
---

<head>
  <link rel="canonical" href="https://docs.harvesterhci.io/v1.10/networking/kubeovn-known-issue-gateway-snat"/>
</head>

_Applies to: Harvester v1.10.0 (Kube-OVN v1.17.0)_

In Harvester v1.10.0, SNAT through a VPC NAT gateway stops working a few minutes after the gateway starts when the external network is a Kube-OVN underlay VLAN subnet. You must apply the workaround on this page once per cluster before you use a VPC NAT gateway.

This issue affects:

- [VPC NAT Gateway](./kubeovn-vpcnatgateway.md)

:::note

The [VPC Egress Gateway](./kubeovn-vpcegressgateway.md) and [BGP](./kubeovn-bgp.md) are not affected. The external IP of an egress gateway is the primary IP of its external interface, and the BGP next hop is a router-owned IP. OVN knows both addresses, so it still forwards ARP requests for them.

:::

## Before You Begin

Run the commands on this page from a Harvester node that has `kubectl` access to the cluster.

Each command runs `ovn-nbctl` in the `ovn-central` pod that is the leader of the OVN NB database. Kube-OVN marks this pod with the label `ovn-nb-leader=true`. You do not need to open a shell in the pod.

To check that the command finds the leader pod, run the following command. It should return exactly one pod.

```bash
kubectl -n kube-system get pods -l app=ovn-central,ovn-nb-leader=true
```

## Issue Details

**GitHub issue**: [#12440](https://github.com/harvester/harvester/issues/12440)

**Symptom**: This issue affects the VPC NAT Gateway when the external network is an underlay VLAN subnet. VMs can reach external addresses (for example, `ping 8.8.8.8`) right after the gateway pod starts. When the ARP entry for the gateway's external IP expires on the upstream router, the traffic stops and does not recover. The upstream router sends ARP requests for the external IP, but the gateway pod never receives them.

**Cause**: Kube-OVN v1.17.0 adds the OVN NB option `bcast_arp_nd_req_flood`, which defaults to `false`. With this setting, OVN forwards broadcast ARP requests from a localnet port only for IP addresses that are listed on a logical switch port. The external IP of a gateway pod is not listed, so OVN drops the ARP requests for it. For more information, see the upstream issue [kubeovn/kube-ovn#8095](https://github.com/kubeovn/kube-ovn/issues/8095).

## Workaround

Turn on broadcast ARP flooding again. This restores the behavior of Kube-OVN v1.16.1.

```bash
kubectl -n kube-system exec $(kubectl -n kube-system get pods -l app=ovn-central,ovn-nb-leader=true -o name) -- ovn-nbctl set NB_Global . options:bcast_arp_nd_req_flood=true
```

To check the result, run the following command. It should return `"true"`.

```bash
kubectl -n kube-system exec $(kubectl -n kube-system get pods -l app=ovn-central,ovn-nb-leader=true -o name) -- ovn-nbctl get NB_Global . options:bcast_arp_nd_req_flood
```

You need to apply it only once per cluster. The option is global and is stored in the OVN NB database, so it persists when nodes reboot.
