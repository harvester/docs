---
sidebar_position: 13
sidebar_label: "Known Issue: Underlay VLAN Tag"
title: "Known Issue: Traffic on Kube-OVN VLAN (Underlay) Subnets Is Sent Untagged"
keywords:
- Harvester
- networking
- Kube-OVN
- known issues
- workaround
- underlay networking
- VLAN
- tag_request
---

<head>
  <link rel="canonical" href="https://docs.harvesterhci.io/v1.10/networking/kubeovn-known-issue-underlay-vlan-tag"/>
</head>

_Applies to: Harvester v1.10.0 (Kube-OVN v1.17.0)_

In Harvester v1.10.0, traffic on Kube-OVN subnets that use a VLAN of a provider network leaves the node without a VLAN tag. You must apply the workaround on this page after you create each VLAN (underlay) subnet.

This issue affects:

- [Pure Underlay Networking](./kubeovn-pureunderlay.md#underlay-configuration)
- External networks of the [VPC NAT Gateway](./kubeovn-vpcnatgateway.md#create-an-external-network), the [VPC Egress Gateway](./kubeovn-vpcegressgateway.md#create-an-external-network), and [BGP](./kubeovn-bgp.md#create-an-external-network)

## Before You Begin

Run the commands on this page from a Harvester node that has `kubectl` access to the cluster.

Each command runs `ovn-nbctl` in the `ovn-central` pod that is the leader of the OVN NB database. Kube-OVN marks this pod with the label `ovn-nb-leader=true`. You do not need to open a shell in the pod.

To check that the command finds the leader pod, run the following command. It should return exactly one pod.

```bash
kubectl -n kube-system get pods -l app=ovn-central,ovn-nb-leader=true
```

## Issue Details

**GitHub issue**: [#12438](https://github.com/harvester/harvester/issues/12438)

**Symptom**: VMs and gateway pods attached to a Kube-OVN subnet on a VLAN of a provider network do not start, or they have no connectivity. The virt-launcher or gateway pod events show an error similar to the following:

```
CNI execution failed; ... network <ip>/<mask> with gateway <gw> is not ready for interface <iface>
after 200 checks: resolve MAC address of <gw> timeout: read packet <mac>: i/o timeout
```

If you capture packets on the uplink NIC, the ARP requests leave the node without an 802.1Q VLAN tag.

**Cause**: Kube-OVN v1.17.0 uses OVN 26.03, which reads the VLAN tag of a localnet port from the `tag_request` field. Kube-OVN v1.17.0 writes only the `tag` field, so the localnet port has no VLAN tag. This is fixed upstream in [kubeovn/kube-ovn#7903](https://github.com/kubeovn/kube-ovn/pull/7903).

## Workaround

Set `tag_request` on the localnet port of each VLAN subnet. Replace `<subnet-name>` with the name of the Kube-OVN subnet and `<vlan-id>` with its VLAN ID.

```bash
kubectl -n kube-system exec $(kubectl -n kube-system get pods -l app=ovn-central,ovn-nb-leader=true -o name) -- ovn-nbctl set logical_switch_port localnet.<subnet-name> tag_request=<vlan-id>
```

Example for the subnet `subnetexternal` on VLAN `2017`:

```bash
kubectl -n kube-system exec $(kubectl -n kube-system get pods -l app=ovn-central,ovn-nb-leader=true -o name) -- ovn-nbctl set logical_switch_port localnet.subnetexternal tag_request=2017
```

To check the result, run the following command. The `tag_request` field of each localnet port should show its VLAN ID.

```bash
kubectl -n kube-system exec $(kubectl -n kube-system get pods -l app=ovn-central,ovn-nb-leader=true -o name) -- ovn-nbctl --columns=name,tag,tag_request find logical_switch_port type=localnet
```

After you set the tag, restart the affected VMs and gateway pods.

You need to apply it only once for each VLAN subnet. The value is stored in the OVN NB database, so it persists when nodes reboot.

:::caution

- You must repeat this workaround for every VLAN subnet that you create or re-create.
- If you change the `id` of a VLAN, you must update `tag_request` manually. If you do not, the traffic stays on the old VLAN.
- You do not need to clean up anything after you upgrade to a Kube-OVN version that includes the fix. The fixed version writes the same value.

:::
