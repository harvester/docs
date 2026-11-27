---
sidebar_position: 9.6
sidebar_label: Kube-OVN BGP
title: "Advertise Overlay Networks Using BGP"
keywords:
- Harvester
- networking
- Kube-OVN
- overlay VMs
- BGP
- BGP speaker
- route advertisement
- underlay networking
---

<head>
  <link rel="canonical" href="https://docs.harvesterhci.io/v1.10/networking/kubeovn-bgp"/>
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

The Kube-OVN BGP speaker advertises the routes of overlay subnets to external BGP routers. External networks can then reach VMs on an overlay network using the VM's own overlay IP address, without NAT.

The setup has the following parts:

| Part | Purpose |
|---|---|
| Provider network and VLAN | Physical (underlay) connection between the Harvester nodes and the external router |
| External subnet | Underlay subnet that connects the custom VPC to the external network |
| Custom VPC | Isolated routing domain for the overlay subnets. Its external logical router port (LRP) connects to the external subnet. |
| Overlay subnet | Network of the VMs. BGP is enabled on this subnet. |
| BGP speaker | Runs on selected Harvester nodes and uses GoBGP to advertise the overlay routes |
| External BGP router | Learns the advertised routes. The examples in this document use FRRouting (FRR). |

When BGP is configured, the following happens:

1. A VM on the overlay subnet gets an IP address (for example, `172.20.10.2`).
1. The custom VPC connects to the underlay through its external LRP (for example, `10.115.48.3`).
1. The BGP speaker sets up an eBGP session with the external router.
1. The BGP speaker advertises the overlay subnet (`172.20.10.0/24`) and the VM IP (`172.20.10.2/32`), with the external LRP as the next hop.
1. The external router installs the routes. Traffic to the VM goes to the external LRP, and OVN forwards it to the VM.

:::info important

The BGP speaker sets up the BGP session using the IP address of the host interface on the underlay (for example, `10.115.48.7`). The traffic to the VMs uses the advertised next hop, which is the external LRP of the VPC (for example, `10.115.48.3`). These are different addresses.

:::

### Traffic Flow

```text
+---------------------------------+
| External BGP router (FRR)       |
| 10.115.51.76, AS 65030          |
| Learns 172.20.10.0/24 and       |
| 172.20.10.2/32 via 10.115.48.3  |
+---------------------------------+
     |                      |
     | eBGP (TCP 179)       | Data traffic to 172.20.10.x
     | to the speakers      | to the next hop 10.115.48.3
     v                      v
+------------------------------------------------------------+
| Harvester cluster                                          |
|                                                            |
|  BGP speakers (host network, AS 65000)                     |
|    hp-46: 10.115.48.7      hp-65: 10.115.48.8              |
|                                                            |
|  Custom VPC: commonvpc                                     |
|    External LRP: 10.115.48.3 (subnetexternal, VLAN 2017)   |
|           |                                                |
|    OVN logical router                                      |
|           |                                                |
|    Overlay subnet: subnetinternal (172.20.10.0/24)         |
|           |                                                |
|    VM: 172.20.10.2 (gateway 172.20.10.1)                   |
+------------------------------------------------------------+
```

**Traffic from the external network to the VM**

1. An external host sends traffic to `172.20.10.2`.
1. The external router matches the route `172.20.10.2/32` or `172.20.10.0/24` and forwards the traffic to the next hop `10.115.48.3`.
1. The external LRP of the VPC receives the traffic, and OVN forwards it to the VM on the overlay network.

**Traffic from the VM to the external network**

1. The VM sends the reply to its default gateway (`172.20.10.1`).
1. The VPC router matches the default route and forwards the traffic through the external LRP to the external gateway.
1. The external network delivers the reply.

## Prerequisites

- The [kubeovn-operator](../advanced/addons/kubeovn-operator.md) add-on is enabled.
- An external router that supports BGP is connected to the same underlay network (VLAN) as the Harvester nodes. If you run more than one speaker, the router must support ECMP to use all advertised paths.

The examples in this document use the following settings. Replace them with values from your environment.

| Component | Example value |
|---|---|
| Provider network | `pn1` (physical NIC `eno50`) |
| VLAN | `2017` |
| External network / subnet | `vswitchexternal` / `subnetexternal` |
| External CIDR / gateway | `10.115.48.0/21` / `10.115.55.254` |
| External LRP of the VPC (next hop) | `10.115.48.3` |
| Speaker hosts and host IPs | `hp-46`: `10.115.48.7`, `hp-65`: `10.115.48.8` |
| External BGP router (FRR VM) | `bg-peer`, `10.115.51.76` |
| Harvester (cluster) AS | `65000` |
| External router (neighbor) AS | `65030` |
| Custom VPC | `commonvpc` |
| Overlay network / subnet | `vswitchinternal` / `subnetinternal` |
| Overlay CIDR / gateway | `172.20.10.0/24` / `172.20.10.1` |
| VM IP | `172.20.10.2` |

## Configuration

### Create a Tenant Network

Create the internal (tenant) network, which includes the custom VPC (`commonvpc`), the overlay network (`vswitchinternal`), and the overlay subnet (`subnetinternal`). For more information, see [Create a Tenant Network](./kubeovn-vpcnatgateway.md#create-a-tenant-network).

:::info important

For BGP, set **NAT Outgoing** on the overlay subnet to **Disabled** (`natOutgoing: false`). BGP advertises the original overlay IP addresses, so the traffic must not be translated to another IP address.

:::

### Create an External Network

Create the external network on the underlay. For more information, see [Underlay Configuration](./kubeovn-pureunderlay.md#underlay-configuration).

The examples in this document use the provider network `pn1`, the VLAN `2017`, the network `vswitchexternal`, and the subnet `subnetexternal` (`10.115.48.0/21`, gateway `10.115.55.254`). Set **NAT Outgoing** on the external subnet to **Disabled**.

:::info important

In v1.10.0, after you create the external subnet, apply the workaround in [Known Issue: Traffic on Kube-OVN VLAN (Underlay) Subnets Is Sent Untagged](./kubeovn-known-issue-underlay-vlan-tag.md#workaround) to the subnet (for example, `subnetexternal` on VLAN `2017`).

:::

### Connect the VPC to the External Network

Connect the custom VPC to the external subnet, and add a default route through the external gateway.

1. Go to **Networks > Virtual Private Cloud**.

1. Select the VPC (for example, `commonvpc`), and then select **⋮ > Edit YAML**.

1. Add the following settings under `spec`:

    ```yaml
    spec:
      enableExternal: true
      extraExternalSubnets:
        - subnetexternal
      staticRoutes:
        - cidr: 0.0.0.0/0
          nextHopIP: 10.115.55.254
          policy: policyDst
    ```

    | Field | Description |
    |---|---|
    | `enableExternal` | Connects the VPC to the external network |
    | `extraExternalSubnets` | External subnet that the VPC connects to. Kube-OVN creates an external LRP on the VPC router with an IP address from this subnet. |
    | `staticRoutes` | Default route through the gateway of the external network |

1. Click **Save**.

1. Check the IP address of the external LRP. This address is the next hop that you specify for the BGP speaker.

    ```
    $ kubectl get ovn-eip
    NAME                      V4IP          V6IP   MAC                 TYPE   NAT   READY   EXTERNALSUBNET
    commonvpc-subnetexternal  10.115.48.3          de:f7:11:f6:4f:d9   lrp          true    subnetexternal
    ```

    :::note

    By default, Kube-OVN allocates the IP address (`V4IP`) and the MAC address of the external LRP dynamically from the external subnet. To use a static IP address and MAC address, create an `OvnEip` of type `lrp` before you connect the VPC to the external network. The name of the `OvnEip` must be in the format `<vpc-name>-<external-subnet-name>` (for example, `commonvpc-subnetexternal`).

    ```yaml
    apiVersion: kubeovn.io/v1
    kind: OvnEip
    metadata:
      name: commonvpc-subnetexternal
    spec:
      externalSubnet: subnetexternal
      type: lrp
      v4Ip: 10.115.48.5
      macAddress: "02:56:00:10:24:17"
    ```

    When the VPC connects to the external subnet, Kube-OVN uses the IP address and MAC address of this `OvnEip` for the external LRP. Use this IP address (for example, `10.115.48.5`) as the next hop of the BGP speaker.

    :::

### Label the Gateway Nodes

Label the nodes that act as gateways for the external traffic of the VPC.

1. Go to **Hosts**.

1. On each gateway node (for example, `hp-46` and `hp-65`), select **⋮ > Edit Config**.

1. On the **Labels** tab, click **Add Label**, and then add the following label:

    - **Key**: `ovn.kubernetes.io/external-gw`
    - **Value**: `true`

    ![](/img/v1.10/networking/bgp-speaker/bgp1.png)

1. Click **Save**.

You can also add the label using `kubectl`:

```bash
kubectl label nodes hp-46 hp-65 ovn.kubernetes.io/external-gw=true
```

### Configure the Host Interfaces of the Speaker Hosts

The BGP speaker uses host networking. Each speaker host needs an IP address on the underlay network so it can reach the external router.

1. Go to **Networks > Host Networks**, and then click **Create**.

1. Specify a unique name for the host network (for example, `hnc-bgp-static`).

1. On the **Mode** tab, configure the following settings:

    - **Mode**: **Static**
    - **Cluster Network**: Cluster network that is connected to the external network (for example, `mgmt`)
    - **VLAN ID**: VLAN of the external network (for example, `2017`)
    - **Underlay**: Clear this check box.
    - **IP**: Static IP address and prefix for each node (for example, `hp-46`: `10.115.48.7/21` and `hp-65`: `10.115.48.8/21`)

    ![](/img/v1.10/networking/bgp-speaker/bgp6.png)

1. Click **Create**.

For more information, see [Host Network Configuration](./hostnetworkconfig.md#configuring-the-host-networks).

Each speaker host now has a VLAN interface with the IP address (for example, `mgmt-br.2017` with `10.115.48.7/21`).

### Configure the BGP Speaker

1. On the Harvester UI, go to the **Overlay Networks > **BGP Speaker** settings.

1. Select **Enabled**.

1. Configure the following settings:

    - **Speaker Hosts**: Nodes that run the BGP speaker (for example, `hp-46` and `hp-65`). Each node must have a host interface on the underlay network.
    - **Cluster AS**: AS number of the Harvester cluster (for example, `65000`)
    - **Router ID**: (Optional) BGP router ID. If you leave it empty, each host uses its own IPv4 address.

1. In the **Neighbors** section, configure the following settings:

    - **IPv4 Address**: Addresses of the external BGP routers (for example, `10.115.51.76`). Add at least one. Click **Add IPv4 Neighbor** to add more.
    - **Neighbor AS**: AS number of the external BGP routers (for example, `65030`)

1. In the **Advanced** section, configure the following settings:

    - **Next Hop (IPv4)**: Next hop of the advertised routes. Specify the IP address of the external LRP of the VPC (for example, `10.115.48.3`). If you leave it empty, each host advertises its own address.

    :::note

    IPv6 is not supported. Leave **IPv6 Address** (in the **Neighbors** section) and **Next Hop (IPv6)** empty.

    :::

    ![](/img/v1.10/networking/bgp-speaker/bgp7.png)

1. Click **Save**.

When the speaker is enabled, a `kube-ovn-speaker` pod runs on each selected host. When you disable the speaker, no host runs it, and the settings are kept until you enable it again.

The UI stores the settings under `spec.bgp` of the `Configuration` object of kubeovn-operator. You can also edit them using `kubectl -n kube-system edit configurations.kubeovn.io`:

```yaml
spec:
  bgp:
    nodeNames: hp-46,hp-65
    clusterAS: 65000
    neighborV4Address: 10.115.51.76
    neighborAS: 65030
    nextHops: 10.115.48.3
```

| Field | Description |
|---|---|
| `nodeNames` | Comma-separated names of the nodes that run the BGP speaker |
| `clusterAS` | AS number of the Harvester cluster |
| `routerID` | (Optional) BGP router ID |
| `neighborV4Address` | Comma-separated IPv4 addresses of the external BGP routers |
| `neighborAS` | AS number of the external BGP routers |
| `nextHops` | (Optional) IPv4 next hop of the advertised routes |

### Enable BGP on the Overlay Subnet

The BGP speaker advertises only subnets that have BGP enabled.

1. Go to **Networks > Virtual Private Cloud**.

1. Select the subnet (for example, `subnetinternal`), and then select **⋮ > Edit Config**.

1. On the **Basic** tab, set **BGP** to **Enabled**. Make sure that **NAT Outgoing** is **Disabled**.

    ![](/img/v1.10/networking/bgp-speaker/bgp8.png)

1. Click **Save**.

You can also enable BGP using `kubectl`:

```bash
kubectl annotate subnet subnetinternal ovn.kubernetes.io/bgp=true
```

By default, every running speaker advertises the routes of the subnet, whether or not the VM runs on that speaker's node. If you run more than one speaker, the external router receives one path from each speaker and must support ECMP to use all of them.

### Create a Virtual Machine

Create a VM and attach it to the overlay network (for example, `vswitchinternal`). The VM gets an IP address from the overlay subnet, for example:

```
IP address: 172.20.10.2/24
Gateway:    172.20.10.1
```

From the VM, check that the gateway is reachable:

```bash
ping 172.20.10.1
```

### Configure the External BGP Router

The external router must peer with each speaker host. The following example uses FRR on an Ubuntu VM (`bg-peer`, `10.115.51.76`) that is attached to the external VLAN network.

1. Install FRR.

    ```bash
    sudo apt update
    sudo apt install -y frr frr-pythontools
    ```

1. In `/etc/frr/daemons`, enable the BGP daemon.

    ```
    bgpd=yes
    ```

1. In `/etc/frr/frr.conf`, add a BGP configuration with one neighbor for each speaker host.

    ```
    router bgp 65030
     bgp router-id 10.115.51.76
     neighbor 10.115.48.7 remote-as 65000
     !
     address-family ipv4 unicast
      neighbor 10.115.48.7 route-map ACCEPT-ALL in
      neighbor 10.115.48.7 route-map ACCEPT-ALL out
     exit-address-family
    !
    route-map ACCEPT-ALL permit 10
    ```

    | Setting | Example value | Description |
    |---|---|---|
    | `router bgp` | `65030` | AS number of the FRR router |
    | `bgp router-id` | `10.115.51.76` | BGP router ID of the FRR router |
    | `neighbor` | `10.115.48.7`| Host interface IPs of the speaker hosts |
    | `remote-as` | `65000` | AS number of the Harvester cluster |

1. Restart FRR.

    ```bash
    sudo systemctl restart frr
    ```

1. Check the configuration.

    ```
    $ sudo vtysh
    bg-peer# show running-config
    Building configuration...

    Current configuration:
    !
    frr version 7.2.1
    frr defaults traditional
    hostname bg-peer
    log syslog informational
    no ip forwarding
    no ipv6 forwarding
    service integrated-vtysh-config
    !
    router bgp 65030
     bgp router-id 10.115.51.76
     neighbor 10.115.48.7 remote-as 65000
     !
     address-family ipv4 unicast
      neighbor 10.115.48.7 route-map ACCEPT-ALL in
      neighbor 10.115.48.7 route-map ACCEPT-ALL out
     exit-address-family
    !
    route-map ACCEPT-ALL permit 10
    !
    line vty
    !
    end
    ```

## Verification

### Verify the BGP Speaker

1. Check that a speaker pod runs on each speaker host.

    ```
    $ kubectl -n kube-system get pods -o wide | grep kube-ovn-speaker
    ```

1. Check the BGP session from a speaker pod. The **State** should be `Establ` (established).

    ```
    $ kubectl -n kube-system exec -it <speaker-pod> -- gobgp neighbor
    Peer            AS     Up/Down    State
    10.115.51.76    65030  02:04:29   Establ
    ```

1. Check that BGP is enabled on the subnet.

    ```
    $ kubectl get subnet subnetinternal -o jsonpath='{.metadata.annotations.ovn\.kubernetes\.io/bgp}'
    true
    ```

### Verify the VPC Routing

Run the following commands from a Harvester node. Each command runs `ovn-nbctl` in the `ovn-central` pod that is the OVN NB leader (label `ovn-nb-leader=true`).

1. Check that the VPC router has an external port and a port for the overlay subnet.

    ```
    $ kubectl -n kube-system exec $(kubectl -n kube-system get pods -l app=ovn-central,ovn-nb-leader=true -o name) -- ovn-nbctl show commonvpc
    router ... (commonvpc)
        port commonvpc-subnetexternal
            networks: ["10.115.48.3/21"]
        port commonvpc-subnetinternal
            networks: ["172.20.10.1/24"]
    ```

1. Check that the VPC router has a default route through the external gateway.

    ```
    $ kubectl -n kube-system exec $(kubectl -n kube-system get pods -l app=ovn-central,ovn-nb-leader=true -o name) -- ovn-nbctl lr-route-list commonvpc
    IPv4 Routes
    Route Table <main>:
                    0.0.0.0/0             10.115.55.254 dst-ip
    ```

### Verify the Routes on the External Router

Run the following commands in `vtysh` on the FRR router.

1. Check the BGP sessions. Each speaker host should be listed with a number of received prefixes, not a state such as `Active` or `Idle`.

    ```
    bg-peer# show ip bgp summary
    ```

1. Check the BGP routing table. The router should learn the overlay subnet and the VM IP, with the external LRP as the next hop.

    ```
    bg-peer# show ip bgp
       Network          Next Hop            Metric LocPrf Weight Path
    *> 172.20.10.0/24   10.115.48.3                            0 65000 i
    *> 172.20.10.2/32   10.115.48.3                            0 65000 i
    ```

    | Route | Description |
    |---|---|
    | `172.20.10.0/24` | Overlay subnet |
    | `172.20.10.2/32` | IP address of the VM |

    The AS path `65000` shows that the routes come from the Harvester cluster.

1. Check that the routes are installed in the routing table.

    ```
    bg-peer# show ip route bgp
    B>* 172.20.10.0/24 [20/0] via 10.115.48.3, enp1s0
    B>* 172.20.10.2/32 [20/0] via 10.115.48.3, enp1s0
    ```

### Verify End-to-End Connectivity

1. From the FRR router (or a host that uses it as a gateway), ping the VM using its overlay IP address.

    ```bash
    ping 172.20.10.2
    ```

1. From the VM, ping the FRR router.

    ```bash
    ping 10.115.51.76
    ```

## Troubleshooting

| Problem | What to check |
|---|---|
| BGP session is not established | Neighbor IP, AS numbers, IP of the host interface, routing between the host and the router, and TCP port 179 |
| Speaker pod is not running | **Speaker Hosts** in the BGP speaker settings, and the pod events and logs |
| BGP session is established but no routes are received | BGP is enabled on the subnet, and the speaker logs |
| Next hop is the host IP instead of the external LRP | **Next Hop (IPv4)** in the BGP speaker settings, and the IP from `kubectl get ovn-eip` |
| Router has the routes but the VM is unreachable | Gateway node labels, VPC external settings and default route, the [known issue workarounds](#known-issue-in-v1100), and firewalls on the return path |
| Routes disappear after a node fails | Speaker placement, ECMP on the external router, and BGP convergence |

Useful commands:

```bash
# Harvester
kubectl -n kube-system get pods -o wide | grep kube-ovn-speaker
kubectl -n kube-system logs <speaker-pod>
kubectl get subnet subnetinternal -o yaml
kubectl get ovn-eip
```

```
# FRR (vtysh)
show ip bgp summary
show ip bgp
show ip bgp neighbors 10.115.48.7
show ip route bgp
show ip fib
```

## Remove the BGP Configuration

1. Disable BGP on the overlay subnet. Set **BGP** to **Disabled** on the subnet, or run the following command:

    ```bash
    kubectl annotate subnet subnetinternal ovn.kubernetes.io/bgp-
    ```

1. Disable the BGP speaker. Select **Disabled** in the **BGP Speaker** settings. The settings are kept for when you enable the speaker again.

1. (Optional) Remove the gateway node labels if no other VPC uses them.

    ```bash
    kubectl label nodes hp-46 hp-65 ovn.kubernetes.io/external-gw-
    ```

1. Delete the VPC, subnets, VLAN, provider network, and networks only after you make sure that no VMs or other workloads use them.
