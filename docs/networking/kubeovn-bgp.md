---
sidebar_position: 13
sidebar_label: Kube-OVN BGP Speaker
title: "BGP Speaker"
keywords:
- Harvester
- networking
- Kube-OVN
- BGP
- BGP speaker
- overlay network
- subnet
---

<head>
  <link rel="canonical" href="https://docs.harvesterhci.io/v1.10/networking/kubeovn-bgp"/>
</head>

_Available as of v1.10.0_

:::note

**kubeovn-operator** is currently classified as *experimental*. While the add-on is undergoing further integration, many Kube-OVN networking features have reached general availability (GA) in Harvester v1.9.0. For more information, see [Feature Maturity](../advanced/addons/kubeovn-operator.md#feature-maturity).

:::

The BGP speaker advertises overlay subnets to the routers of your physical network using the Border Gateway Protocol (BGP). The routers learn a route to each advertised subnet through the hosts that run the speaker. Virtual machines on those subnets are then reachable from the external network on their own IP addresses, without network address translation (NAT). To provide external connectivity using NAT instead, see [VPC NAT Gateway](./kubeovn-vpcnatgateway.md).

To advertise a subnet, perform the following tasks:

1. [Configure the BGP speaker](#configuring-the-bgp-speaker).

2. [Label the gateway hosts](#labeling-the-gateway-hosts).

3. [Enable BGP on the subnet](#enabling-bgp-on-a-subnet).

## Prerequisites

Ensure that the following requirements are met:

- The [kubeovn-operator](../advanced/addons/kubeovn-operator.md) add-on is enabled.

- The external routers are configured to establish BGP sessions with the hosts that run the speaker.

## Configuring the BGP Speaker

The BGP speaker settings apply to the entire cluster. The speaker runs on the hosts that you select, and each of these hosts connects to every neighbor.

<Tabs>
<TabItem value="ui" label="UI" default>

1. On the Harvester UI, go to **Overlay Networks** > **BGP Speaker**.

2. Select **Enabled**.

3. In the **Speaker Hosts** field, select the hosts that run the BGP speaker.

4. Specify the **Cluster AS**, which is the autonomous system (AS) number of the Harvester cluster.

    AS numbers range from 1 to 4294967294.

5. (Optional) Specify the **Router ID**.

    Leave the field empty so that each host uses its own IPv4 address as its router ID. Every speaker requires a unique router ID, so specify a value only when a single host runs the speaker.

6. In the **Neighbors** section, specify the IPv4 or IPv6 address of each external BGP router. To add more addresses, click **Add IPv4 Neighbor** or **Add IPv6 Neighbor**.

    You must add at least one neighbor. Add IPv4 and IPv6 addresses to their respective lists.

7. Specify the **Neighbor AS**, which is the AS number of the neighbors.

    All neighbors must belong to the same AS.

8. (Optional) In the **Advanced** section, specify **Next Hop (IPv4)** and **Next Hop (IPv6)**.

    The next hop is the address that the advertised routes point to. Leave the fields empty so that each host uses its own address.

9. Click **Save**.

    The **Save** button remains disabled until all required fields are completed and all entered values are valid.

    The following image shows a BGP speaker that runs on one host and connects to one IPv4 neighbor and one IPv6 neighbor:

    ![BGP Speaker Screen](/img/v1.10/networking/bgp-speaker.png)

After you save the settings, Harvester labels the selected hosts with `ovn.kubernetes.io/bgp=true` and starts the BGP speaker on those hosts.

To stop the BGP speaker, select **Disabled**, and then click **Save**. Harvester stops the speaker on all hosts and retains the other settings, so you can enable the speaker later without specifying them again.

</TabItem>
<TabItem value="kubectl" label="kubectl">

Harvester stores the BGP speaker settings in the `spec.bgp` field of the `kubeovn` Configuration resource in the `kube-system` namespace.

1. Run the following command:

    ```bash
    kubectl -n kube-system edit configurations.kubeovn.io kubeovn
    ```

2. Under `spec`, add or update the `bgp` field.

    Example:

    ```yaml
    spec:
      bgp:
        nodeNames: harvester-node-1,harvester-node-2
        clusterAS: 65000
        neighborV4Address: 0.0.0.0
        neighborV6Address: "::"
        neighborAS: 65030
    ```

3. Save the changes.

The `bgp` field contains the following settings:

- `nodeNames`: Comma-separated names of the hosts that run the BGP speaker. When this setting is empty, no host runs the speaker.
- `clusterAS`: AS number of the Harvester cluster. The valid range is 1 to 4294967294.
- `neighborV4Address`: Comma-separated IPv4 addresses of the neighbors.
- `neighborV6Address`: Comma-separated IPv6 addresses of the neighbors.
- `neighborAS`: AS number of the neighbors. The valid range is 1 to 4294967294. All neighbors must belong to the same AS.
- `routerID`: (Optional) IPv4 address that the speaker uses as its router ID. When this setting is empty, each host uses its own IPv4 address. Every speaker requires a unique router ID, so specify a value only when a single host runs the speaker.
- `nextHops`: (Optional) Next-hop addresses of the advertised routes, separated by a comma. You can specify one IPv4 address and one IPv6 address. When this setting is empty, each host uses its own address.

</TabItem>
</Tabs>

## Labeling the Gateway Hosts

Label the hosts that act as gateways for external traffic with the key `ovn.kubernetes.io/external-gw` and the value `true`.

<Tabs>
<TabItem value="ui" label="UI" default>

Perform the following steps for each gateway host:

1. On the Harvester UI, go to **Hosts**.

2. Locate the host, and then select **⋮** > **Edit Config**.

3. On the **Labels** tab, click **Add Label**, and then specify the key `ovn.kubernetes.io/external-gw` and the value `true`.

4. Click **Save**.

</TabItem>
<TabItem value="kubectl" label="kubectl">

Run the following command for each gateway host:

```bash
kubectl label node <node-name> ovn.kubernetes.io/external-gw=true
```

Replace `<node-name>` with the name of the host.

</TabItem>
</Tabs>

## Enabling BGP on a Subnet

The BGP speaker advertises only the subnets that have BGP enabled. Before you enable BGP on a subnet, disable NAT on that subnet so that virtual machines on the subnet reach the external network using their own IP addresses.

<Tabs>
<TabItem value="ui" label="UI" default>

1. On the Harvester UI, go to **Overlay Networks** > **Virtual Private Cloud**.

2. Locate the subnet, and then select **⋮** > **Edit Config**.

3. On the **Basic** tab, set **NAT Outgoing** to **Disabled**.

4. Set **BGP** to **Enabled**.

    The following image shows the **BGP** option and the reminder to label the gateway hosts:

    ![BGP Option on the Subnet Screen](/img/v1.10/networking/subnet-bgp.png)

    If no host runs the BGP speaker, a message indicates that the subnet is not advertised and links to the **BGP Speaker** screen.

5. Click **Save**.

Harvester adds the `ovn.kubernetes.io/bgp: "true"` annotation to the subnet, and the BGP speaker advertises the subnet to the neighbors.

To stop advertising the subnet, set **BGP** to **Disabled**, and then click **Save**.

</TabItem>
<TabItem value="kubectl" label="kubectl">

To enable BGP on a subnet, run the following command:

```bash
kubectl annotate subnet <subnet-name> ovn.kubernetes.io/bgp=true
```

To stop advertising the subnet, run the following command:

```bash
kubectl annotate subnet <subnet-name> ovn.kubernetes.io/bgp-
```

Replace `<subnet-name>` with the name of the subnet.

The value of the `ovn.kubernetes.io/bgp` annotation determines how the BGP speaker advertises the subnet:

- `true` or `cluster`: Every speaker advertises the subnet's IP address range. External traffic may enter the cluster through any host that runs the speaker. This is the default behavior.
- `local`: Each speaker advertises only the IP addresses of the virtual machines that run on its own host. To use this value, ensure that the speaker runs on every host that runs virtual machines on the subnet.

In the Harvester UI, **BGP** appears as **Enabled** for any subnet with one of these values, and the annotation value is retained when you save the subnet.

</TabItem>
</Tabs>
