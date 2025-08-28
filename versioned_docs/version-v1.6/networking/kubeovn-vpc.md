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
The following diagram illustrates how VPCs, subnets, overlay networks, and virtual machines are logically connected in Harvester with Kube-OVN. This architecture includes public and private subnets, allowing separation of internet-facing traffic from internal resources.


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

Multiple VPCs and subnets in Kube-OVN can map to overlay networks and virtual machines in Harvester. This architecture enables scalable, isolated L3 and L2 network structures across the cluster.

| Component | Platform | Logical Responsibility |
| --- | --- | --- |
| VPC | Kube-OVN | Top-level L3 domain, manages subnet groupings |
| Subnet | Kube-OVN | CIDR assignment, routing, gateway, firewall rules |
| Overlay network | Harvester | L2 virtual switch (OVS bridge), mapped to subnet |
| Virtual machine | Harvester | Runs compute workloads, connected to overlay |

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

In Harvester, a VPC (Virtual Private Cloud) is a logical network container that helps manage and isolate subnets and traffic. It defines routing, NAT, and network segmentation.

Harvester provides a default VPC named `ovn-cluster`, and two associated subnets named `ovn-default` and `join` for internal Kube-OVN operations. You can create additional VPCs by clicking **Create** on the **Virtual Private Cloud** screen.

![](/img/default_vpc_and_subnet.png)

When creating custom VPCs, you must configure settings related to the routes defined for directing traffic and connections that enable communication between the local and remote VPCs. The following table outlines the settings on the **Virtual Private Cloud** details screen:

| Section | Setting | Description |
| --- | --- | --- |
| General information | **Name** | Name of the VPC |
| General information | **Description** | Description of the VPC |
| **Static Routes** tab | **CIDR** | Destination IP address range for the route (for example, `192.168.1.0/24`) |
| **Static Routes** tab | **Next Hop IP** | IP address to which traffic for the CIDR should be forwarded (for example, the gateway or router IP address) |
| **VPC Peerings** tab | **Local Connect IP** | IP address on the local VPC to be used for the peering connection. |
| **VPC Peerings** tab | **Remote VPC** | Target remote VPC that is peered with the local VPC. |

![](/img/create_vpc.png)

### Subnet Settings

Each subnet defines a CIDR block and gateway, and is mapped to a Harvester overlay network (virtual switch). It also includes controls for NAT and access rules.

When creating subnets, you must configure settings that are relevant to your use case. In most cases, you can get started by just configuring the **CIDR Block**, **Gateway**, and **Provider**. The following table outlines the settings on the **Subnet** details screen:

| Section | Setting | Description |
| --- | --- | --- |
| General information | **Name** | Name of the subnet |
| General information | **Description** | Description of the subnet |
| **Basic** | **CIDR Block** | IP address range assigned to the subnet (for example, `172.20.10.0/24`) |
| **Basic** tab | **Protocol** | The network protocol version used for this subnet (IPv4/IPv6) |
| **Basic** tab | **Provider** | Overlay network (virtual switch) to which the subnet is bound |
| **Basic** tab | **Virtual Private Cloud** | The virtual private cloud that the subnet belongs to |
| **Basic** tab | **Gateway** | IP address that acts as the default gateway for virtual machines in the subnet |
| **Basic** tab | **Private Subnet** | Setting that restricts access to the subnet and ensures network isolation |
| **Basic** tab | **Allow Subnets** | CIDRs that are allowed to access the subnet when **Private Subnet** is enabled |
| **Basic** tab | **Exclude IPs** | A list of IP addresses that should not be automatically assigned |

![](/img/create_subnet.png)

Each created subnet comes with the `natOutgoing` as false by default and need to be changed manually. You need to edit its YAML configuration to set `natOutgoing: true` when required.

![](/img/customize_nat_outgoing.png)

In a custom VPC, the subnets created are basically not able to communicate directly with the subnets under the default VPC ovn-cluster.
Unless a VPC peering connection is properly set up between the two VPCs, enabling secure and controlled network communication between them, cross-VPC subnet communication is not possible.

In other words, without VPC peering configured, subnet traffic in different VPCs is isolated and cannot exchange data directly.

![](/img/vpcpeer.png)


### Sample VPC Configuration and Verification

1. Creat Virtual Machine Networks

    - **Name**: `vswitch1`, `vswitch2`
    - **Type**: `OverlayNetwork`

2. Creat VPC

    - **Name**: `vpc-1`

3. Create two subnets with the following settings in `vpc-1`:

    | Name | CIDR | Provider | Gateway IP |
    | --- | --- | --- | --- |
    | `vswitch1-subnet` | `172.20.10.0/24`| `default/vswitch1` | `172.20.10.1` |
    | `vswitch2-subnet` | `172.20.20.0/24`| `default/vswitch2` | `172.20.20.1` |


4. Create three virtual machines (`vm1-vswitch1`, `vm2-vswitch1`, and `vm1-vswitch2`) with the following settings:
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


5. Open the serial consoles of `vm1-vswitch1` (`172.20.10.6`) and `vm1-vswitch2` (`172.20.20.3`), and then add a default route on each (if none exists) using the following commands:

    - `vm1-vswitch1`:
      ```
      #sudo ip route add default via 172.20.10.1 dev enp1s0
      ```
    - `vm1-vswitch2`
      ```
      #sudo ip route add default via 172.20.20.1 dev enp1s0
      ```

    If a virtual machine wants to send traffic to an unknown network (not in the local subnet), the traffic must be forwarded to the specified gateway IP configured for the connected subnet using the specified network interface. In this example, `vm1-vswitch1` must forward traffic via `172.20.10.1`, while `vm1-vswitch2` must forward traffic via `172.20.20.1`. Both virtual machines use the network interface `enp1s0` and `vm1-vswitch2` need to forward traffic via `172.20.20.1`.


6. Verify connectivity using the `ping` command.
    - `vm1-vswitch1` and `vm1-vswitch2` connects to the same subnet should be reachable to each other.
    - Use `vm1-vswitch1` (`172.20.10.6`) to ping `vm1-vswitch2` (`172.20.20.3`).
    - Use `vm1-vswitch2` (`172.20.20.3`) to ping `vm1-vswitch1` (`172.20.10.6`).
    
    If no default route exists on the VM before running the ping command, the console displays the message `ping: connect: Network is unreachable.`.

### Private Subnet Setting

When the **Private Subnet** setting is enabled on a subnet, it cannot communicate with other subnets in the same VPC by default. Cross-subnet traffic is allowed only if you add the other subnets' CIDR blocks to the private subnet’s **Allowed Subnets** list.

The following are the benefits of enabling the **Private Subnet** setting:

- Fine-grained network segmentation (micro-segmentation)
- Stronger network isolation within the VPC and reduced potential attack surface
- Prevention of unauthorized access to sensitive or critical resources inside the VPC
- Controlled, selective cross-subnet communication via the **Allowed Subnets** list

#### Sample Private Subnet Verification

1. Go to **Networks > Virtual Private Cloud**.

2. Locate `vswitch1-subnet`, and then select **⋮ > Edit Config**.

3. Enable the **Private Subnet** setting.

4. Open the serial console of `vm1-vswitch1` (`172.20.10.6`), and then ping `vm1-vswitch2` (`172.20.20.3`).

    The ping attempt fails because the virtual machines are in different subnets.

5. Return to the **Virtual Private Cloud** screen, locate `vswitch1-subnet`, and then select **⋮ > Edit Config**.

6. Add `172.20.20.0/24` to the **Allow Subnets** field.

7. Open the serial console of `vm1-vswitch1` (`172.20.10.6`), and then ping `vm1-vswitch2` (`172.20.20.3`).

    The ping attempt is successful.



### `natOutgoing` Setting

The `natOutgoing` setting enables network address translation (NAT) for traffic leaving the subnet and going to destinations outside the VPC. This setting is disabled by default. To enable it, you must edit the subnet's YAML configuration and set the value to `natOutgoing: true`.


#### Sample `natOutgoing` Verification

1. Create a virtual machine network with the following settings:

    - **Name**: `vswitch-external`
    - **Type**: `OverlayNetwork`

2. In the `ovn-cluster` VPC, create a subnet with the following settings:

    - **Name**: `external-subnet`
    - **CIDR Block**: `172.20.30.0/24`
    - **Provider**: `default/vswitch-external`
    - **Gateway IP**: `172.20.30.1`

3. Create a virtual machine with the following settings:

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

4. Open the serial console of `vm-external` (`172.20.30.2`), and then ping `8.8.8.8`.

    The console displays the message `ping: connect: Network is unreachable.`.

5. Add a default route using the following command:

    ```
    #sudo ip route add default via 172.20.30.1 dev enp1s0
    ```

    Again, the ping attempt fails.

6. Go to the **Virtual Private Cloud** screen.

7. Locate `external-subnet`, and then select **⋮ > Edit Config**.

8. Click **Edit as YAML**.

9. Locate the `natOutgoing` field, and then change the value to `true`.

10. Click **Save**.

11. Open the serial console of `vm-external` (`172.20.30.2`), and then ping `8.8.8.8`.

    The ping attempt is successful.


### ***What is VPC Peering?***

VPC Peering is a networking connection that allows two Virtual Private Clouds (VPCs) to communicate with each other privately, as if they were on the same network.

By default, each VPC is an isolated network environment. Virtual machines (VMs) or services in different VPCs cannot communicate with each other.

When you configure VPC Peering, a private route is established between the two VPCs, allowing instances to communicate using their private IP addresses.

This communication happens without using public IPs or VPNs, ensuring both security and efficiency.

Within the Harvester network architecture, Multi-VPC support is designed to offer flexible and isolated networking environments. 


Here's how it works:

1. Each VPC is a separate network namespace:

    - **By default, VMs in different VPCs cannot reach each other.**

    - **Each VPC has its own CIDR block, routing table, and isolation boundary.**


2. Communication via VPC Peering:

    - **To enable communication between VMs across different VPCs, you need to configure a VPC Peering connection.**

    - **Once Peering is established, routing rules are automatically updated to allow private IP communication between the two VPCs.**

    - **Without Peering, even if VMs are hosted within the same Harvester cluster, they remain isolated.**

3. Use cases:

    - **Different departments or teams using separate VPCs.**

    - **Isolated environments (e.g., dev/test vs. production) that occasionally need controlled access.**

    - **Multi-tenant setups that require strong network isolation with optional connectivity.**

    - **This structure ensures clear routing, secure segmentation, and flexible multi-subnet design.**


The diagram illustrates how multiple VPCs and subnets in Kube-OVN map to Harvester’s overlay networks and virtual machines, enabling scalable, isolated L3 and L2 network structures across the cluster.

```

                                          ┌───────────────────────────────────────────┐
                                          │                 Kube-OVN                  │
                                          │          (SDN Controller / IPAM)          │
                                          └───────────────────────────────────────────┘
                                                                │
         ┌──────────────────────────────────────────────────────┴──────────────────────────────────────────────────────────┐
         │                                                      │                                                          │
 ┌──────────────┐                                       ┌──────────────┐                                           ┌──────────────┐
 │  VPC: vpc-1  │                                       │VPC: vpcpeer-1│     ◀────────── peering ──────────▶      │VPC: vpcpeer-2│
 └──────────────┘                                       └──────────────┘                                           └──────────────┘
        │                                                       │                                                         │
        ▼                                                       ▼                                                         ▼
┌──────────────────────────────                  ┌──────────────────────────────┐                    ┌──────────────────────────────┐
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
│   IP: 172.20.10.5    │  ◀ ──────── X ──────── ▶  │   IP: 10.0.0.2       │     ◀── Connected via ──▶   │   IP: 20.0.0.2       │
└──────────────────────┘                            └──────────────────────┘       vswitch(Overley)       └──────────────────────┘
            ▲
            │
  VM launched and managed by Harvester

```

Connected via vswitch1 (Overlay)

***VPC peering***

- **Enable Private Communication Between VPCs**\
  VPC Peering allows virtual machines in different VPCs to communicate with each other **using private IP addresses**, as if they were on the same internal network.
- **Maintain Network Isolation with Controlled Access**\
  Even though the VPCs can communicate, they are still logically and administratively **isolated**, which is useful for organizing workloads by team, function, or environment (e.g., dev, prod).
- **Improve Performance and Reduce Costs**\
  Since traffic stays within the internal cloud network, it's **faster**, **more secure**, and typically **cheaper** than going over public internet or VPNs.
- **Enhanced Security**\
  Traffic between VPCs via peering doesn't traverse the public internet, reducing exposure and risk. Access can also be tightly controlled with route tables and firewall rules.

#### Sample VPC Peering Verification
1. Create two virtual machine networks with the following settings:

    - **Name**: `vswitch3` and `vswitch4`
    - **Type**: `OverlayNetwork`

2. Create two VPCs named `vpcpeer-1` and `vpcpeer-2`.

    Harvester creates two isolated network spaces that are ready for subnet creation.

3. Create one subnet in each VPC with the following settings:

    | VPC Name | Subnet Name | CIDR Block | Provider | Gateway IP |
    | --- | --- | --- | --- | --- |
    | `vpcpeer-1` | `subnet1` | `10.0.0.0/24` | `default/vswitch3` | `10.0.0.1` |
    | `vpcpeer-2` | `subnet2` | `20.0.0.0/24` | `default/vswitch4` | `20.0.0.1` |

4. Edit the configuration of both VPCs.

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

5. Create virtual machines.

    An `Unschedulable` error typically indicates insufficient memory. Stop other virtual machines before attempting to create new ones.

6. Open the serial consoles of `vm1-vpcpeer1` (`10.0.0.2`) and `vm1-vpcpeer2` (`20.0.0.2`), and then add a default route on each (if none exists) using the following commands:

    - `vm1-vpcpeer1`:
      ```
      #sudo ip route add default via 10.0.0.1 dev enp1s0
      ```
    - `vm1-vpcpeer2`
      ```
      #sudo ip route add default via 20.0.0.1 dev enp1s0
      ```

7. Test cross-VPC communication using the `ping` command.

    - Use `vm1-vpcpeer1` (`10.0.0.2`) to ping `vm1-vpcpeer2` (`20.0.0.2`).
    - Use `vm1-vpcpeer2` (`20.0.0.2`) to ping `vm1-vpcpeer1` (`10.0.0.2`).

    :::info important

    Communication between virtual machines in different VPCs relies on static routes that define how traffic is forwarded to the remote VPC. For these routes to work correctly, the static route destination CIDR must fall within the remote VPC’s main CIDR range.

    :::

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


#### The configuration can refer to (https://kubeovn.github.io/docs/v1.13.x/en/vpc/vpc-peering/#prerequisites).

### Guidelines for Local Connect IP and CIDR Configuration

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


###  Summary Table

| Question                            | Answer                                                 |
|-------------------------------------|--------------------------------------------------------|
| Is Local Connect IP a CIDR block?   |  Yes, e.g., `169.254.0.1/30`                           |
| Recommended subnet size?            |  `/30` (2 usable IPs)                                  |
| Can I use private IPs (RFC1918)?    |  Not recommended for peering links                     |
| Why use `169.254.x.x`?              |  Link-local, safe, not internet-routable, widely used  |


### VPC Peering Limitations

Peering only works between custom VPCs. When static routes and peering addresses are correctly configured, the peering connection is established and the VPCs can communicate as expected.

:::caution

Attempts to establish a peering connection between the default VPC (`ovn-cluster`) and a custom VPC will fail.

:::
