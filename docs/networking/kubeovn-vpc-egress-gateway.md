---
sidebar_position: 14
sidebar_label: Kube-OVN VPC Egress Gateway
title: "VPC Egress Gateway"
keywords:
- Harvester
- networking
- Kube-OVN
- VPC Egress Gateway
- SNAT
- BFD
- overlay network
---

<head>
  <link rel="canonical" href="https://docs.harvesterhci.io/v1.10/networking/kubeovn-vpc-egress-gateway"/>
</head>

_Available as of v1.10.0_

:::note

**kubeovn-operator** is currently classified as *experimental*. While the add-on is undergoing further integration, many Kube-OVN networking features have reached general availability (GA) in Harvester v1.9.0. For more information, see [Feature Maturity](../advanced/addons/kubeovn-operator.md#feature-maturity).

:::

A VPC egress gateway provides virtual machines in the subnets of a custom VPC with outbound access to an external network. The gateway runs as a group of gateway instances. Each instance is attached to an internal subnet of the VPC and to the external network, and translates the source IP address of outgoing traffic to its own external IP address (source NAT, or SNAT).

A VPC egress gateway differs from a [VPC NAT gateway](./kubeovn-vpcnatgateway.md), which runs as a single instance, in the following ways:

- **Horizontal scaling**: The VPC router spreads traffic across all gateway instances using equal-cost multipath (ECMP) routing. To increase capacity, add replicas.

- **Fast failover**: With Bidirectional Forwarding Detection (BFD), the VPC router detects a failed gateway instance in less than one second and sends its traffic to the other instances.

- **Outbound traffic only**: A VPC egress gateway supports only SNAT. To allow inbound access to virtual machines using destination NAT (DNAT), use a [VPC NAT gateway](./kubeovn-vpcnatgateway.md#dnat-for-inbound-access-external-to-overlay-virtual-machines).

To set up a VPC egress gateway, perform the following tasks:

1. (Optional) [Enable the BFD port on the VPC](#enabling-the-bfd-port-on-a-vpc).

2. [Create the egress gateway](#creating-an-egress-gateway).

3. [Verify the egress gateway](#verifying-the-egress-gateway).

## Prerequisites

Ensure that the following requirements are met:

- The [kubeovn-operator](../advanced/addons/kubeovn-operator.md) add-on is enabled.

- The custom VPC has an internal subnet on an overlay network. The virtual machines that use the gateway are attached to this network. For more information, see [Create a Tenant Network](./kubeovn-vpcnatgateway.md#create-a-tenant-network).

- An external subnet on an underlay network connects the gateway instances to the external network. Each gateway instance requires an IP address in this subnet. For more information, see [Create an External Network](./kubeovn-vpcnatgateway.md#create-an-external-network).

    The external subnet is not required when the gateway instances use the pod network of the cluster (the **Primary CNI** option).

## Enabling the BFD Port on a VPC

BFD requires a dedicated BFD port on the VPC router. The VPC router uses this port to establish a BFD session with each gateway instance. If you do not plan to enable BFD on the egress gateway, skip this procedure.

To enable the BFD port, perform the following steps:

1. On the Harvester UI, go to **Overlay Networks** > **Virtual Private Cloud**.

2. Locate the VPC, and then select **⋮** > **Edit Config**.

3. On the **BFD Port** tab, select **Enabled**.

4. Specify the **IP Address** of the BFD port (for example, `10.255.255.255`).

    The address must not conflict with any other address in your environment, and must not be in a subnet of the VPC. For a dual-stack network, specify an IPv4 address and an IPv6 address, separated by a comma.

    ![BFD Port Tab of a VPC](/img/v1.10/networking/vpc-bfd-port.png)

5. Click **Save**.

If egress gateways of the VPC have BFD enabled, the **BFD Port** tab displays a warning when you select **Disabled**. These gateways stop working without the BFD port.

## Creating an Egress Gateway

<Tabs>
<TabItem value="ui" label="UI" default>

1. On the Harvester UI, go to **Overlay Networks** > **NAT & Internet** > **Egress Gateways**.

2. Click **Create**.

3. Select a **Namespace**, and then specify a **Name** for the egress gateway.

4. On the **Basic** tab, configure the following settings:

    - **VPC**: VPC whose virtual machines use the gateway (for example, `commonvpc`).

    - **Replicas**: Number of gateway instances, from 0 to 10. The default value is 1. Traffic is spread across all instances.

    - **External Network**: Method that the gateway instances use to reach the external network. You cannot change this setting after the gateway is created. The following options are available:
      - **External subnet**: The gateway instances connect to the external network through the subnet that you select in the **External Subnet** field.
      - **Primary CNI**: The gateway instances use the pod network of the cluster. This option does not require an external subnet, and does not support external IP addresses or bandwidth limits.

    - **Internal Subnet**: Subnet of the VPC that the gateway instances are attached to (for example, `subnetinternal`). The list includes only subnets on an overlay network.

    - **External Subnet**: Subnet that connects the gateway instances to the external network (for example, `subnetexternal`). The internal and external subnets must be different. This field is not available when you select **Primary CNI**.

    ![Basic Tab of an Egress Gateway](/img/v1.10/networking/egress-gateway-basic.png)

5. On the **Policies** tab, select the subnets whose outbound traffic uses the gateway. Select at least one subnet. Each subnet can be in only one list.

    - **Subnets with SNAT**: Traffic from these subnets leaves the gateway with the external IP address of the gateway instance as its source.

    - **Subnets without SNAT**: Traffic from these subnets keeps its source IP address, so the external network requires a route back to these subnets.

    The external subnet of the gateway cannot be in either list.

    ![Policies Tab of an Egress Gateway](/img/v1.10/networking/egress-gateway-policies.png)

6. (Optional) On the **IP Addresses** tab, specify fixed IP addresses for the gateway instances.

    - **Internal IPs**: Addresses in the internal subnet.

    - **External IPs**: Addresses in the external subnet. This field is not available when you select **Primary CNI**.

    When you specify addresses, specify at least one address for each replica. When you do not specify addresses, Kube-OVN allocates them dynamically.

7. (Optional) On the **BFD** tab, select **Enabled**, and then configure the following settings:

    - **Receive Interval**: Shortest interval, in milliseconds, at which the gateway accepts BFD packets. The default value is 1000.

    - **Transmit Interval**: Shortest interval, in milliseconds, at which the gateway sends BFD packets. The default value is 1000.

    - **Multiplier**: Number of missed packets after which a gateway instance is considered down. The default value is 3.

    BFD requires the BFD port of the VPC. If the port is not enabled, the tab displays a warning with a link to the VPC. For more information, see [Enabling the BFD Port on a VPC](#enabling-the-bfd-port-on-a-vpc).

8. (Optional) On the **Bandwidth** tab, specify the **Ingress** and **Egress** limits for each gateway instance. Specify a whole number in Mbps (for example, `10`) or a quantity in bits per second (for example, `100M` or `1Gi`).

    This tab is not available when you select **Primary CNI**.

9. Click **Create**.

The **Create** button remains disabled until all required fields are completed and all entered values are valid. A tab that contains an invalid field displays an error icon.

</TabItem>
<TabItem value="kubectl" label="kubectl">

1. Create a file named `gateway1.yaml` with the following content:

    ```yaml
    apiVersion: kubeovn.io/v1
    kind: VpcEgressGateway
    metadata:
      name: gateway1
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
      # Optional: BFD settings. BFD requires the BFD port of the VPC.
      bfd:
        enabled: true
        minRX: 1000
        minTX: 1000
        multiplier: 3
      # Optional: fixed IP addresses, at least one for each replica
      internalIPs:
        - 172.20.10.41
        - 172.20.10.51
      externalIPs:
        - 10.115.48.220
        - 10.115.48.221
      # Optional: bandwidth limit of each gateway instance, in Mbps
      bandwidth:
        ingress: 10
        egress: 10
    ```

    Replace the VPC and subnet names with the names in your environment. To use the pod network of the cluster instead of an external subnet, remove `externalSubnet`, `externalIPs`, and `bandwidth`, and add `externalNetworkMode: PrimaryCNI` under `spec`.

2. To create the egress gateway, run the following command:

    ```bash
    kubectl apply -f gateway1.yaml
    ```

</TabItem>
</Tabs>

## Verifying the Egress Gateway

On the Harvester UI, the **Egress Gateways** screen lists each gateway with its VPC, number of replicas, external subnet, and external IP addresses.

To verify that the egress gateway works, perform the following steps:

1. To check the status of the egress gateway, run the following command:

    ```bash
    kubectl get vpc-egress-gateways.kubeovn.io gateway1 -n default
    ```

    Example:

    ```text
    NAME       VPC         REPLICAS   BFD    EXTERNAL SUBNET   PHASE       READY   AGE
    gateway1   commonvpc   2          true   subnetexternal    Completed   true    2m
    ```

    The gateway is ready when `PHASE` is `Completed` and `READY` is `true`. To also display the IP addresses and nodes of the gateway instances, add the `-o wide` option.

2. To check the gateway instances, run the following command:

    ```bash
    kubectl get pods -n default -l ovn.kubernetes.io/vpc-egress-gateway=gateway1 -o wide
    ```

    Verify that one pod is running for each replica.

3. Log in to a virtual machine that is attached to the internal subnet, and then run the following command:

    ```bash
    ping 8.8.8.8
    ```

    Replace `8.8.8.8` with an address on the external network. Receiving replies confirms that outbound traffic is passing through the egress gateway. For subnets with SNAT, the external network receives the traffic from the external IP address of a gateway instance.
