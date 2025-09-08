---
sidebar_position: 7
sidebar_label: Virtual Private Cloud (VPC)
title: "Virtual Private Cloud (VPC)"
keywords:
- Harvester
- networking
- Kube-OVN
- overlay network
- subnet
- virtual private cloud
- VPC
---

<head>
  <link rel="canonical" href="https://docs.harvesterhci.io/v1.6/networking/kubeovn-vpc"/>
</head> 

A virtual private cloud (VPC) is a logically isolated network that provides full control over IP addresses, subnets, route tables, firewalls, and gateways within a cloud infrastructure. VPCs allow the secure and scalable deployment of virtualized resources such as compute, storage, and container services.

The following table outlines the key components of a VPC:

| Component | Description |
| --- | --- |
| VPC | Top-level network space with a user-defined IP CIDR range |
| subnet | Subdivision of the VPC IP space; can be public or private |
| route table | Defines traffic routing rules within and outside the VPC |
| internet gateway | Enables outbound internet access for public subnets |
| NAT gateway | Allows private subnets to access the internet (outbound only) |
| security group | Virtual firewall that controls inbound and outbound traffic per instance |
| VPC peering | Optional peering or hybrid connections between different VPCs or on-premises networks |

## Harvester + Kube-OVN Integration Architecture

The following diagram illustrates how VPCs, subnets, overlay networks, and virtual machines are logically connected in Harvester with Kube-OVN. This architecture includes public and private subnets, allowing separation of internet-facing traffic from internal resources. Moreover, this architecture enables scalable, isolated L3 and L2 network structures across the cluster.

```
                                 [ VPC: vpc-1 ]
                                        │
                  ┌─────────────────────┴─────────────────────┐
                  │                                           │
     [ Subnet: vswitch1-subnet ]                 [ Subnet: vswitch2-subnet ]
       CIDR: 172.20.10.0/24                          CIDR: 172.20.20.0/24
       Gateway: 172.20.10.1                          Gateway: 172.20.20.1
                  │                                           │
     [ Overlay Network: vswitch1 ]               [ Overlay Network: vswitch2 ]
                  │                                           │
         ┌────────┴────────┐                         ┌────────┴────────┐
         │                 │                         │                 │
[VM: vm1-vswitch1] [VM: vm2-vswitch1]                [VM: vm1-vswitch2]
IP: 172.20.10.X     IP: 172.20.10.Y                    IP: 172.20.20.Z

```

| Component | Platform | Logical Responsibility |
| --- | --- | --- |
| [VPC](#vpc-settings) | Kube-OVN | Top-level L3 domain, manages subnet groupings |
| [subnet](#subnet-settings) | Kube-OVN | CIDR assignment, routing, gateway, firewall rules |
| [overlay network](./harvester-network.md#overlay-network-experimental) | Harvester | L2 virtual switch (OVS bridge), mapped to subnet |
| virtual machine | Harvester | Runs compute workloads, connected to overlay network |

This architecture has the following key characteristics:

- Kube-OVN creates the VPC and its subnets.

  Each subnet includes a CIDR and gateway IP, and binds to an overlay network (as provider). Kube-OVN enforces a one-to-one mapping between the subnet and the overlay network to avoid ambiguous routing, traffic collisions, and isolation issues.

- Harvester defines the overlay networks (type: `OverlayNetwork`).

  Each overlay network is considered a provider in Kube-OVN. When you create a subnet on the Harvester UI, you can select these overlay networks in the **Provider** list on the **Subnet:Create** screen.

- Harvester provisions virtual machines that are connected to an overlay network.

  Each virtual machine uses the Kube-OVN IPAM to request an IP address after booting. The virtual machine receives its IP address, gateway, and routing information from the associated subnet.

- Kube-OVN handles all L3 logic (routing, NAT, VPC peering, and isolation).

  Harvester focuses purely on compute and network attachment. Network policy enforcement, private subnets, and NAT egress are managed by Kube-OVN.

This architecture has the following benefits:

- Clear separation of concerns: Harvester handles virtualization; Kube-OVN handles SDN
- Scalability: New VPCs, subnets, and peering don’t require changes in Harvester core
- Kubernetes-native networking: Kube-OVN integrates tightly with Kubernetes, supporting CRDs, policies, etc.
- Isolation and observability: Centralized control over IPs, ACLs, and routing through Kube-OVN

## VPC and Subnet Configuration

### VPC Settings

In Harvester, a virtual private cloud (VPC) is a logical network container that helps manage and isolate subnets and traffic. It defines routing, NAT, and network segmentation.

Harvester provides a default VPC named `ovn-cluster`, and two associated subnets named `ovn-default` and `join` for internal Kube-OVN operations. You can create additional VPCs by clicking **Create** on the **Virtual Private Cloud** screen.

![](/img/default_vpc_and_subnet.png)

When creating custom VPCs, you must configure settings related to the routes defined for directing traffic and connections that enable communication between the local and remote VPCs. The following table outlines the settings on the **Virtual Private Cloud** details screen:

| Section | Setting | Description |
| --- | --- | --- |
| General information | **Name** | Name of the VPC |
| General information | **Description** | Description of the VPC |
| **Static Routes** tab | **CIDR** | Destination IP address range for the route (for example, `192.168.1.0/24`) |
| **Static Routes** tab | **Next Hop IP** | IP address to which traffic for the CIDR should be forwarded (for example, the gateway or router IP address) |
| **VPC Peerings** tab | **Local Connect IP** | IP address on the local VPC to be used for the peering connection |
| **VPC Peerings** tab | **Remote VPC** | Target remote VPC that is peered with the local VPC |

![](/img/create_vpc.png)

### Subnet Settings

Each subnet defines a CIDR block and gateway, and is mapped to a Harvester [overlay network](./harvester-network.md#overlay-network-experimental) (virtual switch). It also includes controls for NAT and [access rules](./kubeovn-vm-isolation.md#subnet-acls).

When creating subnets, you must configure settings that are relevant to your use case. In most cases, you can get started by just configuring the **CIDR Block**, **Gateway**, and **Provider**. The following table outlines the settings on the **Subnet** details screen:

| Section | Setting | Description |
| --- | --- | --- |
| General information | **Name** | Name of the subnet |
| General information | **Description** | Description of the subnet |
| **Basic** | **CIDR Block** | IP address range assigned to the subnet (for example, `172.20.10.0/24`) |
| **Basic** tab | **Protocol** | Network protocol version used for this subnet (IPv4 or IPv6) |
| **Basic** tab | **Provider** | Overlay network (virtual switch) to which the subnet is bound |
| **Basic** tab | **Virtual Private Cloud** | Virtual private cloud that the subnet belongs to |
| **Basic** tab | **Gateway** | IP address that acts as the default gateway for virtual machines in the subnet |
| **Basic** tab | **Private Subnet** | Setting that restricts access to the subnet and ensures network isolation |
| **Basic** tab | **Allow Subnets** | CIDRs that are allowed to access the subnet when **Private Subnet** is enabled |
| **Basic** tab | **Exclude IPs** | List of IP addresses that should not be automatically assigned to virtual machines |

![](/img/create_subnet.png)

Each created subnet has a setting called [`natOutgoing`](#natoutgoing-setting), which enables network address translation (NAT) for traffic leaving the subnet and going to destinations outside the VPC. This setting is disabled by default. To enable it, you must edit the subnet's YAML configuration and set the value to `natOutgoing: true`.

![](/img/customize_nat_outgoing.png)

By default, subnets in different VPCs are unable to communicate directly. To enable secure and controlled communication between them, you must establish a [VPC peering](#vpc-peering) connection. Without it, subnet traffic in each VPC remains completely isolated.

:::note

VPC peering connections can only be established between custom VPCs.

:::

![](/img/vpcpeer.png)

### Create a VPC

Perform the following steps to create and configure a VPC.

1. Enable [kubeovn-operator](../advanced/addons/kubeovn-operator.md).

    The kubeovn-operator add-on deploys Kube-OVN to the Harvester cluster.

    ![](/img/kubeovn-operator.png)

1. [Create overlay networks](./harvester-network.md#create-an-overlay-network).

    You must create a separate overlay network for each subnet that you plan to create.

1. Create a VPC.

    1. Go to **Networks > Virtual Private Cloud**, and then click **Create**.

    1. On the **Virtual Private Cloud:Create** screen, specify a unique name for the VPC.

    1. Click **Create**.

1. Create subnets.

    1. Go to **Networks > Virtual Private Cloud**.

    1. Locate the VPC you created, and then click **Create Subnet**.

    1. On the **Subnet:Create** screen, configure the [settings](#subnet-settings) that are relevant to your environment. 

        :::note

        You must link each subnet to a dedicated overlay network. In the **Provider** field, the Harvester UI only shows overlay networks that are not linked to other subnets, automatically enforcing the one-to-one mapping.

        :::

    1. Click **Edit as YAML**.

    1. Under `spec`, add `enableDHCP: true`. 
    
        This ensures that virtual machines connected to the subnet can obtain the correct default route options.

    1. Click **Create**.

1. Create virtual machines.

    1. Configure the settings that are relevant to each virtual machine.

        :::info important
      
        On the **Networks** tab, you must select the correct overlay network in the **Network** field.

        :::

    1. Click **Create**.

        The virtual machine obtains its IP address from the subnet that it is connected to.
    
    1. Select **⋮ > Edit YAML**.

    1. Change the value of `spec.domain.devices.interface.binding.name` to `managedtap`.

        This ensures that the virtual machine obtains the correct DHCP options from the subnet instead of using the default DHCP server from KubeVirt.

        :::caution

        If you do not perform this step, the virtual machine will not have a default route. Until the default route is properly configured on the guest operating system, attempts to access external destinations and virtual machines on different subnets will fail.

        For more information, see [Overlay Network Limitations](./harvester-network.md#overlay-network-experimental).

        :::

    1. Restart each virtual machine.

### Sample VPC Configuration and Verification

1. [Create overlay networks](./harvester-network.md#create-an-overlay-network) with the following settings:

    - **Name**: `vswitch1` and `vswitch2`
    - **Type**: `OverlayNetwork`

1. Create a VPC named `vpc-1`.

1. Create two subnets in `vpc-1` with the following settings:

    | Name | CIDR | Provider | Gateway IP |
    | --- | --- | --- | --- |
    | `vswitch1-subnet` | `172.20.10.0/24`| `default/vswitch1` | `172.20.10.1` |
    | `vswitch2-subnet` | `172.20.20.0/24`| `default/vswitch2` | `172.20.20.1` |

1. Create three virtual machines (`vm1-vswitch1`, `vm2-vswitch1`, and `vm1-vswitch2`) with the following settings:

    - **Basics** tab
      - **CPU**: `1`
      - **Memory**: `2`
    - **Volumes** tab
      - **Image Volume**: A cloud image (for example, `noble-server-cloudimg-amd64`)
    - **Networks** tab
      - **Network**: `default/vswitch1`
    - **Advanced Options** tab
      ```
      users:
      `  `- name: ubuntu
      `    `groups: [ sudo ]
      `    `shell: /bin/bash
      `    `sudo: ALL=(ALL) NOPASSWD:ALL
      `    `lock\_passwd: false
      ```

    :::note

    Once the virtual machines start running, the node displays the NTP server `0.suse.pool.ntp.org` and the IP address.

    :::

1. Open the serial consoles of `vm1-vswitch1` and `vm1-vswitch2`, and then add a default route on each (if none exists) using the following commands:

    - `vm1-vswitch1` (`172.20.10.6`):
    
      ```
      #sudo ip route add default via 172.20.10.1 dev enp1s0
      ```
    
    - `vm1-vswitch2` (`172.20.20.3`)
    
      ```
      #sudo ip route add default via 172.20.20.1 dev enp1s0
      ```

    If a virtual machine wants to send traffic to an unknown network (not in the local subnet), the traffic must be forwarded to the specified gateway IP configured for the connected subnet using the specified network interface. In this example, `vm1-vswitch1` must forward traffic via `172.20.10.1`, while `vm1-vswitch2` must forward traffic via `172.20.20.1`. Both virtual machines use the network interface `enp1s0`.

1. Verify connectivity using the `ping` command.

    - Use `vm1-vswitch1` (`172.20.10.6`) to ping `vm1-vswitch2` (`172.20.20.3`).
    - Use `vm1-vswitch2` (`172.20.20.3`) to ping `vm1-vswitch1` (`172.20.10.6`).

    Since `vm1-vswitch1` and `vm1-vswitch2` are on the same subnet, they can communicate with each other without any default route settings.

    If no default route exists on the virtual machine before you run the ping command, the console displays the message `ping: connect: Network is unreachable.`.

### Private Subnet Setting

When the **Private Subnet** setting is enabled on a subnet, it cannot communicate with other subnets in the same VPC by default. Cross-subnet traffic is allowed only if you add the other subnets' CIDR blocks to the private subnet’s **Allowed Subnets** list.

The following are the benefits of enabling the **Private Subnet** setting:

- Fine-grained network segmentation (micro-segmentation)
- Stronger network isolation within the VPC and reduced potential attack surface
- Prevention of unauthorized access to sensitive or critical resources inside the VPC
- Controlled, selective cross-subnet communication via the **Allowed Subnets** list

#### Sample Private Subnet Verification

1. Go to **Networks > Virtual Private Cloud**.

1. Locate `vswitch1-subnet`, and then select **⋮ > Edit Config**.

1. Enable the **Private Subnet** setting.

1. Open the serial console of `vm1-vswitch1` (`172.20.10.6`), and then ping `vm1-vswitch2` (`172.20.20.3`).

    The ping attempt fails because `vm1-vswitch1` is isolated. Enabling the **Private Subnet** setting on `vswitch1-subnet` prohibits `vm1-vswitch1` from communicating with virtual machines in other subnets.

1. Return to the **Virtual Private Cloud** screen, locate `vswitch1-subnet`, and then select **⋮ > Edit Config**.

1. Add `172.20.20.0/24` to the **Allow Subnets** field.

1. Open the serial console of `vm1-vswitch1` (`172.20.10.6`), and then ping `vm1-vswitch2` (`172.20.20.3`).

    The ping attempt is successful.

### `natOutgoing` Setting

The `natOutgoing` setting enables network address translation (NAT) for traffic leaving the subnet and going to destinations outside the VPC. This setting is disabled by default. To enable it, you must edit the subnet's YAML configuration and set the value to `natOutgoing: true`.

#### Sample `natOutgoing` Configuration and Verification

1. [Create an overlay network](./harvester-network.md#create-an-overlay-network) with the following settings:

    - **Name**: `vswitch-external`
    - **Type**: `OverlayNetwork`

1. In the `ovn-cluster` VPC, create a subnet with the following settings:

    - **Name**: `external-subnet`
    - **CIDR Block**: `172.20.30.0/24`
    - **Provider**: `default/vswitch-external`
    - **Gateway IP**: `172.20.30.1`

1. Create a virtual machine with the following settings:

    - **Name**: `vm-external`

    - **Basics** tab
      - **CPU**: `1`
      - **Memory**: `2`

    - **Volumes** tab
      - **Image Volume**: A cloud image (for example, `noble-server-cloudimg-amd64`)

    - **Networks** tab
      - **Network**: `default/vswitch-external`

    - **Advanced Options** tab
      ```
      users:
      `  `- name: ubuntu
      `    `groups: [ sudo ]
      `    `shell: /bin/bash
      `    `sudo: ALL=(ALL) NOPASSWD:ALL
      `    `lock\_passwd: false
      ```

1. Open the serial console of `vm-external` (`172.20.30.2`), and then ping `8.8.8.8`.

    The console displays the message `ping: connect: Network is unreachable.`.

1. Add a default route using the following command:

    ```
    #sudo ip route add default via 172.20.30.1 dev enp1s0
    ```

    Again, the ping attempt fails.

1. Go to the **Virtual Private Cloud** screen.

1. Locate `external-subnet`, and then select **⋮ > Edit Config**.

1. Click **Edit as YAML**.

1. Locate the `natOutgoing` field, and then change the value to `true`.

1. Click **Save**.

1. Open the serial console of `vm-external` (`172.20.30.2`), and then ping `8.8.8.8`.

    The ping attempt is successful.

### VPC Peering

VPC peering is a networking connection that enables virtual machines in different VPCs to communicate using *private IP addresses*.

Each VPC is a separate network namespace with its own CIDR block, routing table, and isolation boundary. Without VPC peering, virtual machines are isolated even when they are hosted within the same Harvester cluster. Once a peering connection is established, routing rules are automatically updated to allow virtual machines to communicate privately.

VPC peering offers the following key benefits:

- The VPCs remain logically and administratively isolated. This is ideal for multi-tenant setups that require strong network isolation with optional connectivity. You can organize workloads by team, function, or environment (for example, development vs. production).

- Traffic between VPCs does not traverse the public internet, reducing exposure. You can also use route tables and firewall rules to tightly control network access.

- Keeping traffic within the internal cloud network not only improves performance but also lowers costs, providing a significant advantage over using the public internet or VPNs.

The following diagram shows how VPCs and subnets in Kube-OVN map to overlay networks and virtual machines in Harvester. This architecture enables you to create scalable and isolated L3 and L2 network structures across the cluster.

```

                                          ┌───────────────────────────────────────────┐
                                          │                 Kube-OVN                  │
                                          │          (SDN Controller / IPAM)          │
                                          └───────────────────────────────────────────┘
                                                                │
         ┌──────────────────────────────────────────────────────┴──────────────────────────────────────────────────────────┐
         │                                                      │                                                          │
 ┌──────────────┐                                       ┌──────────────┐                                           ┌──────────────┐
 │  VPC: vpc-1  │                                       │VPC: vpcpeer-1│      ◀────────── peering ──────────▶      │VPC: vpcpeer-2│
 └──────────────┘                                       └──────────────┘                                           └──────────────┘
        │                                                       │                                                         │
        ▼                                                       ▼                                                         ▼
┌──────────────────────────────┐                 ┌──────────────────────────────┐                    ┌──────────────────────────────┐
│ Subnet: vswitch1-subnet      │                 │ Subnet: vswitch3-subnet      │                    │ Subnet: vswitch4-subnet      │
│ CIDR: 172.20.10.0/24         │                 │ CIDR: 10.0.0.0/24            │                    │ CIDR: 20.0.0.0/24            │
│ Gateway: 172.20.10.1         │                 │ Gateway: 10.0.0.1            │                    │ Gateway: 20.0.0.1            │
└──────────────────────────────┘                 └──────────────────────────────┘                    └──────────────────────────────┘
            │  (1:1 mapping - Provider binding)                 │                                                    │
            ▼                                                   ▼                                                    ▼
┌──────────────────────────────┐                 ┌──────────────────────────────┐                    ┌──────────────────────────────┐
│ Harvester Overlay: vswitch1  │                 │ Harvester Overlay: vswitch3  │                    │ Harvester Overlay: vswitch4  │
│ Type: OverlayNetwork         │                 │ Type: OverlayNetwork         │                    │ Type: OverlayNetwork         │
└──────────────────────────────┘                 └──────────────────────────────┘                    └──────────────────────────────┘
            │                                                   │                                                    │
            ▼                                                   ▼                                                    ▼
┌──────────────────────┐                            ┌──────────────────────┐                              ┌──────────────────────┐
│   VM: vm1-vswitch1   │                            │   VM: vm1-vswitch3   │                              │   VM: vm1-vswitch4   │
│   IP: 172.20.10.5    │   ◀ ──────── X ──────── ▶  │   IP: 10.0.0.2       │     ◀── Connected via ──▶    │   IP: 20.0.0.2       │
└──────────────────────┘                            └──────────────────────┘       vswitch (overlay)      └──────────────────────┘
            ▲
            │
VM launched and managed by Harvester

```

#### VPC Peering Configuration Examples

- Example 1: Successful cross-VPC communication

    | VPC Name | VPC CIDR | Subnet | Static Route |
    | --- | --- | --- | --- |
    | `vpcpeer-1` | `10.0.0.0/16` | `10.0.0.0/24` | `20.0.0.0/16 → 169.254.0.2` |
    | `vpcpeer-2` | `20.0.0.0/16` | `20.0.0.0/24` | `10.0.0.0/16 → 169.254.0.1` |

    Since both subnets fall within their respective VPC CIDRs, the routing works correctly and cross-VPC communication is successful.

- Example 2: Unsuccessful cross-VPC communication due to routing configuration issue

    | VPC Name | VPC CIDR | Subnet | Static Route |
    | --- | --- | --- | --- |
    | `vpcpeer-1` | `10.0.0.0/16` | `10.1.0.0/24` | `20.0.0.0/16 → 169.254.0.2` |
    | `vpcpeer-2` | `20.0.0.0/16` | `20.1.0.0/24` | `10.0.0.0/16 → 169.254.0.1` |

    The target subnet IP addresses (for example, `10.1.0.2` and `20.1.0.2`) are *not covered* by the routing configuration, causing cross-VPC communication to fail.

:::info important

Ensure the following:

- The VPC's CIDR includes all subnets within the VPC.
- Static routes point to the *remote VPC’s main CIDR block*.

If a subnet uses a specific range that is not covered by the VPC CIDR, the associated static route cannot reach that subnet.

:::

For more information about VPC peering prerequisites and configuration, see [VPC Peering](https://kubeovn.github.io/docs/v1.13.x/en/vpc/vpc-peering) in the Kube-OVN documentation.

#### Sample VPC Peering Configuration and Verification

1. [Create two overlay networks](./harvester-network.md#create-an-overlay-network) with the following settings:

    - **Name**: `vswitch3` and `vswitch4`
    - **Type**: `OverlayNetwork`

1. Create two VPCs named `vpcpeer-1` and `vpcpeer-2`.

    Harvester creates two isolated network spaces that are ready for subnet creation.

1. Create one subnet in each VPC with the following settings:

    | VPC Name | Subnet Name | CIDR Block | Provider | Gateway IP |
    | --- | --- | --- | --- | --- |
    | `vpcpeer-1` | `subnet1` | `10.0.0.0/24` | `default/vswitch3` | `10.0.0.1` |
    | `vpcpeer-2` | `subnet2` | `20.0.0.0/24` | `default/vswitch4` | `20.0.0.1` |

1. Edit the configuration of both VPCs.

    - `vpcpeer-1`

      | Section | Setting | Value |
      | --- | --- | --- |
      | **VPC Peering** tab | **Local Connect IP** | 169.254.0.1/30 |
      | **VPC Peering** tab | **Remote VPC** | vpcpeer-2 |
      | **Static Routes** tab | **CIDR** | 20.0.0.0/16 |
      | **Static Routes** tab | **Next Hop IP** | 169.254.0.2 |

    - `vpcpeer-2`
    
      | Section | Setting | Value |
      | --- | --- | --- |
      | **VPC Peering** tab | **Local Connect IP** | 169.254.0.2/30 |
      | **VPC Peering** tab | **Remote VPC** | vpcpeer-1 |
      | **Static Routes** tab | **CIDR** | 10.0.0.0/16 |
      | **Static Routes** tab | **Next Hop IP** | 169.254.0.1 |

1. Create virtual machines.

    An `Unschedulable` error typically indicates insufficient memory. Stop other virtual machines before attempting to create new ones.

1. Open the serial consoles of `vm1-vpcpeer1` and `vm1-vpcpeer2`, and then add a default route on each (if none exists) using the following commands:

    - `vm1-vpcpeer1` (`10.0.0.2`)
      
      ```
      #sudo ip route add default via 10.0.0.1 dev enp1s0
      ```
    
    - `vm1-vpcpeer2` (`20.0.0.2`)
      
      ```
      #sudo ip route add default via 20.0.0.1 dev enp1s0
      ```

1. Test cross-VPC communication using the `ping` command.

    - Use `vm1-vpcpeer1` (`10.0.0.2`) to ping `vm1-vpcpeer2` (`20.0.0.2`).
    - Use `vm1-vpcpeer2` (`20.0.0.2`) to ping `vm1-vpcpeer1` (`10.0.0.2`).

    :::info important

    Communication between virtual machines in different VPCs relies on static routes that define how traffic is forwarded to the remote VPC. For these routes to work correctly, the static route destination CIDR must fall within the remote VPC’s main CIDR range.

    :::

#### Local Connect IP and CIDR Configuration

| Question | Answer |
| --- | --- |
| Is the **Local Connect IP** value a CIDR block? | Yes (for example, `169.254.0.1/30`) |
| What is the recommended subnet size? | `/30` (two usable IPs) |
| Can private addresses (RFC 1918) be used for peering links? | Not recommended |
| Why use `169.254.x.x`? | Link-local, safe, not internet-routable, widely used |

- Is the **Local Connect IP** value a CIDR block?

    Yes. You must specify a CIDR block (for example, `169.254.0.1/30`) instead of a single IP address.

    The CIDR defines a *point-to-point network* where one IP address is used by the local VPC and the other is used by the remote VPC.

    Example: `/30` block (`169.254.0.0/30`)

    | IP Address | Purpose |
    | --- | --- |
    | 169.254.0.0 | Network address |
    | 169.254.0.1 | Used by VPC A |
    | 169.254.0.2 | Used by VPC B |
    | 169.254.0.3 | Broadcast (optional) |

- What is the recommended subnet size?

    `/30` provides *exactly two usable IP addresses*, which fulfills the requirement of point-to-point VPC peering.
    Using larger blocks (for example, `/28` and `/29`) is not necessary and can even be considered wasteful.

    | CIDR | Usable IPs | Recommended? |
    | --- | --- | --- |
    | `/30` | 2 | Yes |
    | `/29` | 6 | No |
    | `/28` | 14 | No |

- Why use `169.254.x.x/30` instead of private addresses?

    `169.254.0.0/16` is *not part* of the RFC 1918 private address space (`10.0.0.0/8`, `172.16.0.0/12`, and `192.168.0.0/16`).

    RFC 3927 defines `169.254.0.0/16` as the *link-local address space*, which is intended for internal communication, auto IP configuration, and point-to-point routing.

    `169.254.x.x/30` has the following advantages:
    - Not routable to the public internet
    - Secure for internal use
    - Commonly used by cloud platforms (including AWS and Alibaba Cloud) for internal networking purposes such as VPC peering and metadata access

#### VPC Peering Limitation

Peering only works between custom VPCs. Any attempt to establish a peering connection between the default VPC (`ovn-cluster`) and a custom VPC will fail.
