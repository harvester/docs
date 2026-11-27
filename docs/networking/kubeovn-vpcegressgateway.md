---
sidebar_position: 9.5
sidebar_label: Kube-OVN VPC Egress Gateway
title: "VPC Egress Gateway"
keywords:
- Harvester
- networking
- Kube-OVN
- overlay VMs
- external access
- VPC Egress Gateway
- BFD
- ECMP
---

<head>
  <link rel="canonical" href="https://docs.harvesterhci.io/v1.10/networking/kubeovn-vpcegressgateway"/>
</head>

_Available as of v1.10.0_

:::note

**kubeovn-operator** is currently classified as *experimental*. For more information, see [Feature Maturity](../advanced/addons/kubeovn-operator.md#feature-maturity).

:::

## Known Issue in v1.10.0

:::caution

In Harvester v1.10.0, traffic on Kube-OVN VLAN (underlay) subnets leaves the node without a VLAN tag. After you [create the external network](#create-an-external-network), apply the workaround in [Known Issue: Traffic on Kube-OVN VLAN (Underlay) Subnets Is Sent Untagged](./kubeovn-known-issue-underlay-vlan-tag.md#workaround) to the external subnet (for example, `subnetexternal`).

:::

## Overview

The Kube-OVN VPC Egress Gateway gives VMs in a custom VPC access to external networks, such as the internet or an enterprise underlay network. Traffic from the selected VPC subnets leaves the cluster through dedicated gateway instances.

The gateway uses Source Network Address Translation (SNAT). It replaces the source IP address of outgoing traffic from a VM with the external IP address of the gateway.

Compared with the [VPC NAT Gateway](./kubeovn-vpcnatgateway.md), which runs as a single instance, the VPC Egress Gateway has the following features:

- **Multiple instances**: You can run several gateway replicas for each VPC.
- **ECMP traffic distribution**: Traffic is shared across all healthy gateway instances (active-active).
- **BFD failure detection**: OVN detects a failed gateway instance in less than a second and sends the traffic to the healthy instances.
- **Horizontal scaling**: You can add replicas to increase the outbound capacity.

Use the VPC Egress Gateway when tenant VMs need isolated VPC networks and also need outbound access to external networks that is highly available.

:::info important

The VPC Egress Gateway supports **egress SNAT only**. It does not support DNAT or inbound access. If you need inbound access to VMs, use the [VPC NAT Gateway](./kubeovn-vpcnatgateway.md#dnat-for-inbound-access-external-to-overlay-virtual-machines).

:::

## How It Works

A VPC Egress Gateway runs as a Deployment of gateway pods. Each gateway pod has two network interfaces:

| Interface | Network | Purpose |
|---|---|---|
| `eth0` | Internal subnet of the custom VPC | Receives traffic from the VMs in the VPC |
| `net1` | External subnet (underlay) | Sends the translated traffic to the external network |

When a VM sends traffic to an external destination, the following happens:

1. The VM sends the traffic to its default gateway in the VPC.
1. The OVN logical router of the VPC matches the source subnet against the routing policies, and then selects one of the healthy gateway instances as the next hop.
1. The gateway instance receives the traffic on `eth0`, translates the source IP to its external IP, and sends the traffic out on `net1`.
1. The external network routes the traffic to the destination.
1. The reply returns to the same gateway instance. The gateway translates the destination IP back to the VM IP and sends the reply to the VM.

```
                         Harvester Cluster
 +-------------------------------------------------------------------------+
 |  Custom VPC: commonvpc                                                  |
 |                                                                         |
 |  +----------------+      +----------------------+                       |
 |  | VM             |----->| OVN Logical Router   |                       |
 |  | 172.20.10.x    |      | commonvpc            |                       |
 |  +----------------+      | (BFD port            |                       |
 |                          |  10.255.255.255)     |                       |
 |                          +----------+-----------+                       |
 |                                     | ECMP + BFD                        |
 |                      +--------------+--------------+                    |
 |                      v                             v                    |
 |        +---------------------------+ +---------------------------+      |
 |        | Gateway pod 1             | | Gateway pod 2             |      |
 |        | eth0: 172.20.10.41        | | eth0: 172.20.10.51        |      |
 |        | net1: 10.115.48.220       | | net1: 10.115.48.221       |      |
 |        +-------------+-------------+ +-------------+-------------+      |
 |                      |  SNAT                       |  SNAT              |
 |                      +--------------+--------------+                    |
 |                                     v                                   |
 |          External subnet: subnetexternal (VLAN 2017, provider pn1)      |
 +-------------------------------------+-----------------------------------+
                                       v
                      Physical underlay network / Internet
```

### Traffic Distribution Using ECMP

Kube-OVN adds the internal IP addresses of all gateway instances to a routing policy on the VPC router. OVN hashes the source address of each flow to select one of the next hops. For example:

```
ip4.src == 172.20.10.0/24    reroute 172.20.10.41, 172.20.10.51
```

### High Availability Using BFD

Kube-OVN uses Bidirectional Forwarding Detection (BFD) to check whether each gateway instance is reachable. A BFD session runs between the BFD port of the VPC router and each gateway instance.

When a gateway instance becomes unreachable, the following happens:

1. The BFD session of that instance changes to `down`.
1. OVN stops using that instance as a next hop.
1. Traffic goes through the remaining healthy instances.

When the instance becomes reachable again, its BFD session changes to `up` and OVN uses it as a next hop again.

The failure detection time is approximately the receive interval multiplied by the multiplier. For example, an interval of 150 ms and a multiplier of 3 detect a failure in approximately 450 ms.

## Prerequisites

- The [kubeovn-operator](../advanced/addons/kubeovn-operator.md) add-on is enabled.

The examples in this document use the following settings:

| Component | Example value |
|---|---|
| Custom VPC | `commonvpc` |
| BFD port IP of the VPC | `10.255.255.255` |
| Internal (tenant) overlay network | `vswitchinternal` |
| Internal subnet | `subnetinternal` |
| Internal CIDR / gateway | `172.20.10.0/24` / `172.20.10.1` |
| Provider network | `pn1` |
| External VLAN | `2017` |
| External network (NAD) | `vswitchexternal` |
| External subnet | `subnetexternal` |
| External CIDR / gateway | `10.115.48.0/21` / `10.115.55.254` |
| Egress gateway | `gw1` |
| Gateway replicas | `2` |

## Configuration

### Create a Tenant Network

Create the internal (tenant) network, which includes the custom VPC (`commonvpc`) and the internal subnet (`subnetinternal`). For more information, see [Create a Tenant Network](./kubeovn-vpcnatgateway.md#create-a-tenant-network).

### Create an External Network

Create the external network on the underlay. For more information, see [Underlay Configuration](./kubeovn-pureunderlay.md#underlay-configuration).

The examples in this document use the provider network `pn1`, the VLAN `2017`, the network `vswitchexternal`, and the subnet `subnetexternal` (`10.115.48.0/21`, gateway `10.115.55.254`).

:::info important

In v1.10.0, after you create the external subnet, apply the workaround in [Known Issue: Traffic on Kube-OVN VLAN (Underlay) Subnets Is Sent Untagged](./kubeovn-known-issue-underlay-vlan-tag.md#workaround) to the subnet (for example, `subnetexternal` on VLAN `2017`).

:::

### Enable the BFD Port on the VPC

BFD needs a dedicated BFD port on the VPC router. The BFD port is the peer address for the BFD sessions with the gateway instances. Kube-OVN creates the port when you enable it.

1. Go to **Networks > Virtual Private Cloud**.

1. Select the VPC (for example, `commonvpc`), and then select **⋮ > Edit Config**.

1. On the **BFD Port** tab, select **Enabled**.

1. Specify an **IP Address** for the BFD port (for example, `10.255.255.255`).

    The IP address must not conflict with any other address in your environment, including the CIDRs of the VPC subnets.

    ![](/img/v1.10/networking/vpc-egr-gw/egr-gw6.png)

1. Click **Save**.

:::note

If you enable BFD on an egress gateway and the BFD port of the VPC is disabled, the **BFD** tab of the egress gateway screen shows a warning with a link to edit the VPC.

:::

### Create a VPC Egress Gateway

1. On the Harvester UI, go to **Overlay Networks > NAT & Internet > Egress Gateways**.

1. Click **Create**.

1. Select a **Namespace** (for example, `default`), and then specify a unique **Name** for the egress gateway (for example, `gw1`).

1. On the **Basic** tab, configure the following settings:

    - **VPC**: Custom VPC where the gateway runs (for example, `commonvpc`)
    - **Replicas**: Number of gateway instances (for example, `2`)
    - **External Network**: Select **External subnet**.
    - **Internal Subnet**: Subnet of the VPC that connects the gateway instances to the VPC (for example, `subnetinternal`)
    - **External Subnet**: Underlay subnet that connects the gateway instances to the external network (for example, `subnetexternal`)

    ![](/img/v1.10/networking/vpc-egr-gw/egr-gw1.png)

1. On the **Policies** tab, select the subnets of the VPC whose traffic goes out through the gateway. Each subnet can be in only one list.

    - **Subnets with SNAT**: The gateway translates the source IP of the traffic to the gateway's external IP (for example, `subnetinternal`).
    - **Subnets without SNAT**: The gateway forwards the traffic without changing the source IP. The external network must have a route back to these subnets.

    ![](/img/v1.10/networking/vpc-egr-gw/egr-gw2.png)

1. (Optional) On the **IP Addresses** tab, specify fixed IP addresses for the gateway instances. If you do not specify IP addresses, Kube-OVN assigns them automatically from the subnets.

    - **Internal IPs**: IP addresses from the internal subnet (for example, `172.20.10.41` and `172.20.10.51`)
    - **External IPs**: IP addresses from the external subnet (for example, `10.115.48.220` and `10.115.48.221`)

    If you specify IP addresses, you must specify at least one for each replica. The UI shows a warning icon next to an IP address that is not in the selected subnet.

    ![](/img/v1.10/networking/vpc-egr-gw/egr-gw3.png)

1. On the **BFD** tab, configure the following settings:

    - **Bidirectional Forwarding Detection (BFD)**: Select **Enabled**.
    - **Receive Interval**: Minimum interval for receiving BFD packets, in milliseconds (for example, `150`)
    - **Transmit Interval**: Minimum interval for sending BFD packets, in milliseconds (for example, `150`)
    - **Multiplier**: Number of missed BFD packets before OVN marks the instance as down (for example, `3`)

    ![](/img/v1.10/networking/vpc-egr-gw/egr-gw4.png)

1. (Optional) On the **Bandwidth** tab, limit the bandwidth of each gateway instance. Specify a whole number in Mbps (for example, `10`), or a quantity in bits per second (for example, `100M` or `1Gi`).

    - **Ingress**: Limit for incoming traffic
    - **Egress**: Limit for outgoing traffic

    ![](/img/v1.10/networking/vpc-egr-gw/egr-gw5.png)

1. Click **Create**.

The following is a sample YAML configuration that matches the settings above:

```yaml
apiVersion: kubeovn.io/v1
kind: VpcEgressGateway
metadata:
  name: gw1
  namespace: default
spec:
  vpc: commonvpc
  replicas: 2
  internalSubnet: subnetinternal
  externalSubnet: subnetexternal
  policies:
    - snat: true
      subnets:
        - subnetinternal
  # Optional: fixed IP addresses (at least one for each replica)
  internalIPs:
    - 172.20.10.41
    - 172.20.10.51
  externalIPs:
    - 10.115.48.220
    - 10.115.48.221
  bfd:
    enabled: true
    minRX: 150
    minTX: 150
    multiplier: 3
  # Optional: bandwidth limit for each gateway instance
  bandwidth:
    ingress: 10
    egress: 10
```

| Field | Description |
|---|---|
| `vpc` | Custom VPC where the gateway runs |
| `replicas` | Number of gateway instances |
| `internalSubnet` | Subnet that connects the gateway instances to the VPC |
| `externalSubnet` | Subnet that connects the gateway instances to the external network |
| `policies[].snat` | Turns SNAT on or off for the listed subnets |
| `policies[].subnets` | VPC subnets whose traffic goes through the gateway |
| `internalIPs` / `externalIPs` | (Optional) Fixed IP addresses for the gateway instances |
| `bfd.enabled` | Turns BFD health checks on or off |
| `bfd.minRX` / `bfd.minTX` | Minimum BFD receive and transmit intervals, in milliseconds |
| `bfd.multiplier` | Number of missed BFD packets before an instance is marked as down |
| `bandwidth.ingress` / `bandwidth.egress` | (Optional) Bandwidth limit for each gateway instance |

### Create a Virtual Machine

Create a VM and attach it to the internal network (for example, `vswitchinternal`). The VM gets an IP address from the internal subnet (for example, `172.20.10.x` with gateway `172.20.10.1`).

## Verification

### Verify the Egress Gateway

1. Check the status of the egress gateway. The **PHASE** should be `Completed` and **READY** should be `true`.

    ```
    $ kubectl get veg -o wide
    NAME   VPC         REPLICAS   BFD ENABLED   EXTERNAL SUBNET   PHASE       READY
    gw1    commonvpc   2          true          subnetexternal    Completed   true
    ```

1. Check that the gateway pods are running and ready.

    ```
    $ kubectl get pods -l ovn.kubernetes.io/vpc-egress-gateway=gw1 -o wide
    ```

    ```
    $ kubectl get deployment gw1
    NAME   READY   UP-TO-DATE   AVAILABLE
    gw1    2/2     2            2
    ```

1. (Optional) Describe a gateway pod to check its IP addresses. Each gateway pod has an internal IP on `eth0` and an external IP on `net1`.

    ```
    $ kubectl describe pod <gateway-pod-name>
    ```

### Verify the BFD Port and Routing Policies

Run the following commands from a Harvester node. Each command runs `ovn-nbctl` in the `ovn-central` pod that is the OVN NB leader (label `ovn-nb-leader=true`).

1. Check that the BFD port exists on the VPC router.

    ```
    $ kubectl -n kube-system exec $(kubectl -n kube-system get pods -l app=ovn-central,ovn-nb-leader=true -o name) -- ovn-nbctl show commonvpc
    router ... (commonvpc)
        port bfd@commonvpc
            networks: ["10.255.255.255"]
    ```

1. Check the routing policies. The internal IPs of all gateway instances should be next hops, with BFD turned on.

    ```
    $ kubectl -n kube-system exec $(kubectl -n kube-system get pods -l app=ovn-central,ovn-nb-leader=true -o name) -- ovn-nbctl lr-policy-list commonvpc
    Routing Policies
         31000                            ip4.dst == 172.20.10.0/24           allow
         29100   ip4.src == ...              reroute    172.20.10.41, 172.20.10.51    bfd
    ```

1. Check the BFD sessions. There should be one session for each gateway instance, and each session should have the status `up`.

    ```
    $ kubectl -n kube-system exec $(kubectl -n kube-system get pods -l app=ovn-central,ovn-nb-leader=true -o name) -- ovn-nbctl list bfd
    _uuid               : ...
    detect_mult         : 3
    dst_ip              : "172.20.10.41"
    logical_port        : "bfd@commonvpc"
    min_rx              : 150
    min_tx              : 150
    status              : up
    ...
    ```

1. (Optional) Check the BFD session from each gateway pod. The `state` should be `Up`.

    ```
    $ kubectl exec -it <gateway-pod-name> -c bfdd -- bfdd-control status
    There are 1 sessions:
    Session 1
     id=1
     local=172.20.10.41
     remote=10.255.255.255
     state=Up
    ```

### Verify External Connectivity from the VM

1. Log in to the VM, and then check its IP address and default route.

    ```
    $ ip addr
    $ ip route
    ```

1. Ping an external address.

    ```
    $ ping 8.8.8.8
    ```
## Test Gateway Failover

You can test high availability by making one gateway instance unreachable while traffic is flowing.

### Test BFD Failure Detection

1. Start a continuous ping from the VM. The following command sends a packet every 100 ms and prints a timestamp for each reply.

    ```
    $ sudo apt install -y fping
    $ fping -D -p 100 -l 8.8.8.8
    ```

1. Find the nodes that run the gateway pods.

    ```
    $ kubectl get pods -l ovn.kubernetes.io/vpc-egress-gateway=gw1 -o wide
    ```

1. On each of these nodes, capture the traffic on the uplink NIC of the external network. Find the gateway instance that forwards the ping traffic.

    ```
    $ tcpdump -i <uplink-nic> -nn icmp
    ```

1. Make the active gateway instance unreachable. Add temporary firewall rules that block its internal interface.

    ```
    $ kubectl exec -it <active-gateway-pod> -- bash
    iptables -I INPUT -i eth0 -j DROP
    iptables -I OUTPUT -o eth0 -j DROP
    iptables -I FORWARD -i eth0 -j DROP
    ```

1. Check the result:

    - The traffic moves to the other node. Compare the timestamps of the last packet on the old node and the first packet on the new node. The gap should be close to the BFD detection time (for example, 150 ms × 3 = 450 ms).
    - The following command shows `status: down` for the blocked instance and `status: up` for the other instance:

        ```
        $ kubectl -n kube-system exec $(kubectl -n kube-system get pods -l app=ovn-central,ovn-nb-leader=true -o name) -- ovn-nbctl list bfd
        ```

1. Remove the firewall rules from the gateway pod.

    ```
    iptables -D INPUT -i eth0 -j DROP
    iptables -D OUTPUT -o eth0 -j DROP
    iptables -D FORWARD -i eth0 -j DROP
    ```

    The BFD session of the instance changes back to `status: up`, and OVN uses the instance as a next hop again.

:::note

The firewall rules are for testing only. If the pod restarts, the rules are removed.

:::

### Test Gateway Pod Recovery

1. Delete one of the gateway pods.

    ```
    $ kubectl delete pod <gateway-pod-name>
    ```

1. Check the routing policy. The internal IP of the deleted instance is removed from the next hops.

    ```
    $ kubectl -n kube-system exec $(kubectl -n kube-system get pods -l app=ovn-central,ovn-nb-leader=true -o name) -- ovn-nbctl lr-policy-list commonvpc
    ```

1. Check that the Deployment creates a new pod to keep the configured number of replicas.

    ```
    $ kubectl get pods -l ovn.kubernetes.io/vpc-egress-gateway=gw1 -o wide
    ```

1. When the new pod is running and its BFD session is `up`, check the routing policy again. The internal IP of the new instance is added back to the next hops.

## Limitations

- The VPC Egress Gateway supports egress SNAT only. It does not support DNAT or inbound access.
- In v1.10.0, you must apply the workaround for the [underlay VLAN tag](./kubeovn-known-issue-underlay-vlan-tag.md) known issue.
