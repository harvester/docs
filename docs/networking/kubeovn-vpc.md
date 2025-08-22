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
| security group** | Virtual firewall that controls inbound and outbound traffic per instance |
| VPC peering / VPN | Optional peering or hybrid connections between different VPCs or on-premises networks |


## Hierarchical Architecture
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
![](/img/harvester-vpc.png)

| Layer | Component | Description | Examples in Diagram |
| --- | --- | --- | --- |
| L3 | VPC | Logical network container managing multiple subnets and routing or NAT rules | `vpc-1` |
| L3 | Subnet | IP segment (CIDR block) that is bound to an overlay network | `vswitch1-subnet`, `vswitch2-subnet` |
| L2 | Overlay network | Virtual layer 2 switch that connects virtual machines and transmits subnet traffic | `vswitch1`, `vswitch2` |
| L2 or L3 | Virtual machine | Computing environment that is attached to an overlay network and receives its IP address from the associated subnet | `vm1-vswitch1`, `vm1-vswitch2` |

This architecture has the following key characteristics:

- Each subnet is mapped to only one overlay network, and each overlay network can be used by only one subnet. This one-to-one relationship ensures that routing behavior is clear and predictable, subnets are isolated, and routing conflicts and traffic leakage are avoided. 
- Virtual machines are attached to an overlay network and automatically receive their IP address from the associated subnet. The default gateway for these virtual machines must be configured manually.
- Subnets are grouped under a VPC, which manages broader traffic policies for private subnet isolation, NAT configuration, VPC peering, and others.

## Harvester + Kube-OVN Integration Architecture
The following diagram illustrates how multiple VPCs and subnets in Kube-OVN map to overlay networks and virtual machines in Harvester. This architecture enables scalable, isolated L3 and L2 network structures across the cluster.

| Component | Platform | Logical Responsibility | Examples in Diagram |
| --- | --- | --- | --- |
| VPC | Kube-OVN | Top-level L3 domain, manages subnet groupings | `vpc-1`, `vpc-2` |
| Subnet | Kube-OVN | CIDR assignment, routing, gateway, firewall rules | `vswitch1-subnet`, `vswitch3-subnet` |
| Overlay network | Harvester | L2 virtual switch (OVS bridge), mapped to subnet | `vswitch1`, `vswitch3` |
| Virtual machine | Harvester | Runs compute workloads, connected to overlay | `vm1-vswitch1`, `vm1-vswitch3` |

#### Here's the brief intruduction for VPC and Subnet

1. VPC:

A VPC (Virtual Private Cloud) provides an isolated virtual network where you can launch and manage resources. It defines an IP address range and network configurations for subnets and instances within it.
# VPC Setting Options Explained

| Setting           | Description                                                                                          |
|-------------------|----------------------------------------------------------------------------------------------------|
| **Name**          | The name of the VPC.                                                                                |
| **Description**   | A brief description or notes about the VPC.                                                        |
| **Static Routes** | Routes defined for directing traffic. Each route includes:                                        |
|                   | - **CIDR**: The destination IP address range for the route (e.g., `192.168.1.0/24`).               |
|                   | - **Next hop IP**: The IP address where the traffic for the CIDR should be sent next (gateway or router IP). |
| **VPC Peerings**  | Connections established between two VPCs to enable communication. Each peering includes:           |
|                   | - **Local Connect IP**: The IP address on the local VPC side used for the peering connection.      |
|                   | - **Remote VPC**: The target remote VPC that is peered with the local VPC.                         |


In Harvester, a VPC (Virtual Private Cloud) is a logical network container that helps manage and isolate subnets and traffic. It defines routing, NAT, and network segmentation.

In Harvester, without creating a custom VPC, the system provides a default VPC named : ovn-cluster

Default VPC: ovn-cluster
Harvester comes with a default VPC named ovn-cluster, so you don’t need to create a custom VPC for most use cases. And two subnets named `ovn-default` and `join` for KubeOVN internally.

![](/img/default_vpc_and_subnet.png)

If you need to create a custom VPC, you can add it by clicking the Create button at the top right of the webpage.

![](/img/create_vpc.png)

2. Subnet:

Subnet Settings Overview

Each Subnet defines a CIDR block, gateway, and is mapped to a Harvester overlay network (virtual switch). It also includes controls for NAT and access rules.

# Subnet Setting Options Explained

| Setting         | Description                                                                 |
|----------------|-----------------------------------------------------------------------------|
| **Name**        | The name of the subnet.                                                    |
| **CIDR**        | The IP address range assigned to the subnet (e.g., `172.20.10.0/24`).      |
| **Gateway**     | The IP address that acts as the default gateway for VMs in this subnet.    |
| **Provider**    | The overlay network (virtual switch) to which the subnet is bound.         |
| **natOutgoing** | If enabled, traffic from this subnet going outside the VPC will be NAT’d.  |
| **Private Subnet** | Restricts access so that other subnets cannot communicate with this one. |
| **Allow Subnets** | (When private is enabled) Specifies which CIDRs are allowed to access it.  |

You only need to configure what’s necessary for your use case. In most cases, setting CIDR, Gateway, and Provider is sufficient to get started.

![](/img/create_subnet.png)

We can use `Private` setting in the subnet to ensure the network isolation.

Each created subnet comes with the `natOutgoing` as false by default and need to be changed manually. You need to edit its YAML configuration to set `natOutgoing: true` when required.

![](/img/customize_nat_outgoing.png)

In a custom VPC, the subnets created are basically not able to communicate directly with the subnets under the default VPC ovn-cluster.
Unless a VPC peering connection is properly set up between the two VPCs, enabling secure and controlled network communication between them, cross-VPC subnet communication is not possible.

In other words, without VPC peering configured, subnet traffic in different VPCs is isolated and cannot exchange data directly.

![](/img/vpcpeer.png)


This architecture has the following key characteristics:

- Kube-OVN creates the VPC and its subnets.

  Each subnet includes a CIDR and gateway IP, and binds to an overlay network (as provider). Kube-OVN enforces a one-to-one mapping between the subnet and the overlay network to avoid ambiguous routing, traffic collisions, and isolation issues.

- Harvester defines the overlay networks (type: `OverlayNetwork`).

  Each overlay network (for example, `vswitch1` and `vswitch3`) is considered a provider in Kube-OVN. When you create a subnet on the Harvester UI, you can select these overlay networks in the **Provider** list on the **Subnet:Create** screen.

- Harvester provisions virtual machines that are connected to an overlay network.

  Each virtual machine uses the Kube-OVN IPAM to request an IP address after booting. The virtual machine receives its IP address, gateway, and routing information from the associated subnet.

- Kube-OVN handles all L3 logic (routing, NAT, VPC peering, and isolation).

  Harvester focuses purely on compute and network attachment. Network policy enforcement, private subnets, and NAT egress are managed by Kube-OVN.

This architecture has the following benefits:

- Clear separation of concerns: Harvester handles virtualization; Kube-OVN handles SDN
- Scalability: New VPCs, subnets, and peering don’t require changes in Harvester core
- Kubernetes-native networking: Kube-OVN integrates tightly with Kubernetes, supporting CRDs, policies, etc.
- Isolation and observability: Centralized control over IPs, ACLs, and routing through Kube-OVN

## **VPC Components Overview**
We abstract the following elements as key components within a VPC:

|**Component**|**Description**|
| :-: | :-: |
|**VPC**|The top-level network space with a user-defined IP CIDR range|
|**Subnet**|A subdivision of the VPC IP space; can be public or private|
|**Route Table**|Defines traffic routing rules within and outside the VPC|
|**Internet Gateway**|Enables outbound internet access for public subnets|
|**NAT Gateway**|Allows private subnets to access the internet (outbound only)|
|**Security Group**|Virtual firewall that controls inbound/outbound traffic per instance|
|**VPC Peering / VPN**|Optional peering or hybrid connections between different VPCs or on-prem networks|


## Create a VPC

Perform the following steps to create and configure a VPC.

1. Enable [kubeovn-operator](../advanced/addons/kubeovn-operator.md).

    The kubeovn-operator add-on deploys Kube-OVN to the Harvester cluster.

![](/img/kubeovn-operator.png)

***Validate Cross-Subnet VM Communication via Kube-OVN VPC Configuration in Harvester***

 1. Create an overlay network.

    You must create a separate overlay network for each subnet that you plan to create.

    - Go to **Networks > Virtual Machine Networks**, and then click **Create**.

    - On the **Virtual Machine Network:Create** screen, configure the following settings:

      - **Name**: Specify a unique name for the network. In this example, the network names are `vswitch1` and `vswitch2`.
      - **Type**: Select `OverlayNetwork`.

   - Click **Create**.

2. Create a VPC.

    - Go to **Networks > Virtual Private Cloud**, and then click **Create**.

    - On the **Virtual Machine Network:Create** screen, specify a unique name for the VPC.

      In this example, the VPC name is `vpc-1`.

    -1. Click **Create**.

3. Create a subnet and link it to an overlay network.

    - Go to **Networks > Virtual Private Cloud**.

    - Locate the VPC you created, and then click **Create Subnet**.

      In this example, the VPC name is `vpc-1`.

    - On the **Subnet:Create** screen, configure the following settings:

      - **Name**: Specify a unique name for the subnet.
      - **Provider**: Select the corresponding overlay network. The Harvester UI only shows overlay networks that are not linked to 
      other subnets, automatically enforcing the one-to-one mapping.
      - **CIDR Block**
      - **Gateway IP**

      In this example, the following values are used:

      | Subnet name | Provider | CIDR | Gateway IP |
      | --- | --- | --- | --- |
      | vswitch1-subnet | default/vswitch1 | 172.20.10.0/24 | 172.20.10.1 |
      | vswitch2-subnet | default/vswitch2 | 172.20.20.0/24 | 172.20.20.1 |

    - Click **Create**.


4. Create Virtual Machines (VMs)

5. Configure and Test Connectivity

  A. Checks if default route exists for sending all traffic (not in the local subnet) through the gateway configured for the connected Subnet using interface enp1s0.

  B. Ping Test Between VMs : This verifies successful cross-subnet communication between the VMs.

***Purpose of the Test:***

To verify that in Harvester, creating multiple Overlay Networks and Subnets and manually configuring default gateways allows virtual machines to communicate across different subnets successfully and correctly.

### Verify the VPC Configuration

Perform the following steps:

***Test steps:***

**1.Creat Virtual Machine Networks**

Name: vswitch1 ,  vswitch2

Type: OverlayNetwork

***Subnet and Overlay Network: 1:1 Mapping Explanation*** 

In Harvester, when working with Virtual Private Cloud (VPC) networking:

- **An Overlay Network represents a virtual Layer 2 switch that encapsulates and forwards traffic between virtual machines.**\

- **A Subnet defines an IP range (CIDR block) within the VPC — but it must be associated with exactly one Overlay Network to actually carry traffic.**\

Each Subnet must be mapped to only one Overlay Network, and each Overlay Network can be used by only one Subnet.

This 1:1 relationship ensures:

- **Clear and predictable routing behavior**\

- **Isolation between Subnets**\

- **Avoidance of routing conflicts or traffic leakage**\


**2.Creat VPC**

Name: vpc-1

After creation, you’ll have an isolated network space ready for subnet creation. 

**3.Create Subnets** 

| Subnet Name      | CIDR           | Provider          | Gateway IP   |
|------------------|----------------|-------------------|--------------|
| vswitch1-subnet  | 172.20.10.0/24 | default/vswitch1  | 172.20.10.1  |
| vswitch2-subnet  | 172.20.20.0/24 | default/vswitch2  | 172.20.20.1  |



4. Create three virtual machines (`vm1-vswitch1`, `vm2-vswitch1`, and `vm1-vswitch2`) with the following configuration:
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
    Once the virtual machines start running, the node displays the NTP server `0.suse.pool.ntp.org` and the IP address.** 
    :::



5. Open the serial consoles of `vm1-vswitch1` (`172.20.10.6`) and `vm1-vswitch2` (`172.20.20.3`), and then add a default route on each using the following command if no default route exists on the VMs:
vm1-vswitch1
    ```
    #sudo ip route add default via 172.20.10.1 dev enp1s0
    ```
vm1-vswitch2
    ```
    #sudo ip route add default via 172.20.20.1 dev enp1s0
    ```
    If a virtual machine wants to send traffic to an unknown network (not in the local subnet), the traffic must be forwarded to the specified gateway IP configured for the connected subnet using the specified network interface. In this example, `vm1-vswitch1` must forward traffic to the gateway `172.20.10.1` using the network interface `enp1s0` and `vm1-vswitch2` need to forward traffic via `172.20.20.1`.


6. Verify connectivity using the `ping` command.
    - Use `vm1-vswitch1` (`172.20.10.6`) to ping `vm1-vswitch2` (`172.20.20.3`).
    - Use `vm1-vswitch2` (`172.20.20.3`) to ping `vm1-vswitch1` (`172.20.10.6`).
    
    If no default route exists on the VM before running the ping command, the console displays the message `ping: connect: Network is unreachable.`.



\------------------------------------------------------------------------------------------------------------------------
### ***Private Subnet***

- **Purpose**
The main goal of the Private Subnet feature is to provide stronger network isolation within the same VPC by restricting traffic between the private subnet and other subnets. This enhances security by preventing unauthorized access to sensitive or critical resources inside the VPC.

- **Behavior**
When Private Subnet is enabled, the subnet cannot communicate with other subnets in the same VPC by default, even though they belong to the same VPC.
Traffic between the private subnet and other subnets is only allowed if you explicitly add their CIDR blocks to the private subnet’s Allow Subnets list.

- **Practical Effect**

    - **Prevents access from other subnets in the same VPC to the private subnet, enabling fine-grained network segmentation (micro-segmentation).**

    - **Enhances internal security isolation and reduces potential attack surface.**

    - **Allows controlled, selective cross-subnet communication by configuring allowed subnets.**

***Testing Summary:***

1.Enable Private Subnet on vswitch1-subnet.

2.Ping from vm1-vswitch1 to vm1-vswitch2 (different subnet, not allowed) — ping fails.

3.Add 172.20.20.0/24 (vswitch2-subnet) to Allow Subnets of vswitch1-subnet.

4.Ping again — communication succeeds.

In essence, the Private Subnet acts as an internal firewall within the VPC, only permitting cross-subnet traffic when explicitly allowed, thus enforcing stricter security boundaries.

***Test examples:***

- **Open the **VPC** page, go to **vswitch1-subnet -> Edit Config**, and enable the **Private Subnet** setting.**

- **Open the **serial console** of **vm1-vswitch1 (172.20.10.6)** and ping **vm1-vswitch2 (172.20.20.3)**. At this point, the ping fails.**

- **Go back to **vswitch1-subnet -> Edit Config**, and add **172.20.20.0/24** to the **Allow Subnets** field.**

- **Open the **serial console** of **vm1-vswitch1 (172.20.10.6)** again and ping **vm1-vswitch2 (172.20.20.3)**. This time, the ping succeeds.**

- **This verifies that the **Private Subnet** feature is working as expected.**

\------------------------------------------------------------------------------------------------------------------------



***Verification of NAT Outgoing for External Network Access***

***NatOutgoing***

**Test examples:**

**1.Create Virtual Machine Networks**

Name: vswitch-external

Type: OverlayNetwork

**2.Create VPC**

Create a subnet named `external-subnet` within any VPC. 

| Subnet Name      | CIDR           | Provider               | Gateway IP   |
|------------------|----------------|------------------------|--------------|
| external-subnet  | 172.20.30.0/24 | default/vswitch-external | 172.20.30.1 |

**3.Create VM**

Name: vm-external


4\.Open the serial console of vm-external (172.20.30.2) and ping 8.8.8.8.

It shows: ping: connect: Network is unreachable.

Adds a default route if no default route exists:
```
#sudo ip route add default via 172.20.30.1 dev enp1s0
```
Still no response from 8.8.8.8 when pinged again. 

5\.Navigate to the Virtual Private Cloud Page\
Log in to the management interface and go to the Virtual Private Cloud page. Locate the subnet resource named external-subnet.

- **Edit the YAML Configuration**\
  Click on the options menu next to external-subnet and select **Edit YAML**.
- **Update the** natOutgoing **Parameter**\
  In the YAML editor, find the following line : natOutgoing: false\
  Change it to: natOutgoing: true
- **Save the Changes**\
  After reviewing to ensure all other settings are correct, click **Save** or **Update** to apply the changes.

**Verify the Configuration**

Go back to the serial console of the VM named vm-external (IP: 172.20.30.2), and run a ping to 8.8.8.8 to check if the connection is successful. 

\------------------------------------------------------------------------------------------------------------------------


### ***What is VPC Peering?***

VPC Peering is a networking connection that allows two Virtual Private Clouds (VPCs) to communicate with each other privately, as if they were on the same network.

By default, each VPC is an isolated network environment. Virtual machines (VMs) or services in different VPCs cannot communicate with each other.

When you configure VPC Peering, a private route is established between the two VPCs, allowing instances to communicate using their private IP addresses.

This communication happens without using public IPs or VPNs, ensuring both security and efficiency.

Multi-VPC in Harvester Network

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

**Test examples:**

**1.Create Virtual Machine Networks**

Name: vswitch3 ,  vswitch4

Type: OverlayNetwork

**2.Create VPC**

Name: vpcpeer-1 ,vpcpeer-2

After creation, you’ll have an isolated network space ready for subnet creation. 

**3.Create Subnets** 

**vpcpeer-1**

| Subnet Name | CIDR        | Provider         | Gateway IP |
|-------------|-------------|------------------|------------|
| subnet1     | 10.0.0.0/24 | default/vswitch3 | 10.0.0.1   |



**vpcpeer-2**

| Subnet Name | CIDR        | Provider         | Gateway IP |
|-------------|-------------|------------------|------------|
| subnet2     | 20.0.0.0/24 | default/vswitch4 | 20.0.0.1   |


**4.Edit Config**

**vpcpeer-1**

VPC peering \
| Local Connect IP  | Remote VPC  |
|-------------------|-------------|
| 169.254.0.1/30    | vpcpeer-2   |



Static Routes

| CIDR         | Next Hop IP   |
|--------------|--------------|
| 20.0.0.0/16  | 169.254.0.2  |



**vpcpeer-2**

VPC peering \
| Local Connect IP | Remote VPC    |
|------------------|--------------|
| 169.254.0.2/30   | vpcpeer-1    |



Static Routes

| CIDR         | Next Hop IP   |
|--------------|--------------|
| 10.0.0.0/16  | 169.254.0.1  |

#  Important: Static Route CIDRs Must Match VPC CIDR Range

In VPC Peering, communication between VMs in different VPCs relies on static routes that define how traffic is forwarded to the remote VPC. For these routes to work correctly, the static route destination CIDR must fall within the remote VPC’s main CIDR range.

---

##  Working Example

In the current setup:

- **vpcpeer-1**
  - VPC CIDR: `10.0.0.0/16`
  - Subnet: `10.0.0.0/24`

- **vpcpeer-2**
  - VPC CIDR: `20.0.0.0/16`
  - Subnet: `20.0.0.0/24`

Static routes are configured as:

- On **vpcpeer-1**: `20.0.0.0/16 → 169.254.0.2`
- On **vpcpeer-2**: `10.0.0.0/16 → 169.254.0.1`

 Since both subnets fall within their respective VPC CIDRs, the routing works correctly and cross-VPC communication is successful.

---

##  Non-working Example

Consider the following configuration:

- **vpcpeer-1**
  - VPC CIDR: `10.0.0.0/16`
  - Subnet: `10.1.0.0/24`

- **vpcpeer-2**
  - VPC CIDR: `20.0.0.0/16`
  - Subnet: `20.1.0.0/24`

If static routes are still configured as:

- On **vpcpeer-1**: `20.0.0.0/16 → 169.254.0.2`
- On **vpcpeer-2**: `10.0.0.0/16 → 169.254.0.1`

 Then the target subnet IPs (e.g., `10.1.0.2`, `20.1.0.2`) will **not** be covered by the routing configuration — causing communication to fail.

---

##  Recommendation

- Always ensure that the subnet CIDRs used within the VPC fall under the VPC's main CIDR block.
- Static routes should point to the **remote VPC’s main CIDR**, large enough to cover all internal subnets.

---

##  Tip

If your subnet uses a custom range like `10.1.0.0/24`, but your VPC CIDR is not large enough to include it (e.g., `10.0.0.0/24`), the static route won’t be able to reach that subnet.

 Ensure that your **VPC CIDR** (e.g., `10.0.0.0/16`) includes all subnets.

---

##  Static Routes Table

| CIDR         | Next Hop IP   |
|--------------|---------------|
| 20.0.0.0/16  | 169.254.0.2   |  ← Must cover the remote subnet range

#### The configuration can refer to (https://kubeovn.github.io/docs/v1.13.x/en/vpc/vpc-peering/#prerequisites).

##  Appendix: Understanding Local Connect IP and CIDR in VPC Peering

###  Is "Local Connect IP" a CIDR or a single IP?
- **Yes, it must be a CIDR block**, such as `169.254.0.1/30`, not just a single IP address.
- The CIDR defines a **point-to-point network**, where:
  - One IP is used by the local VPC,
  - The other is used by the remote VPC.

#### Example `/30` block (`169.254.0.0/30`):

| IP Address     | Purpose            |
|----------------|--------------------|
| 169.254.0.0    | Network address     |
| 169.254.0.1    | Used by VPC A       |
| 169.254.0.2    | Used by VPC B       |
| 169.254.0.3    | Broadcast (optional) |

---

###  Is there a restriction on the subnet mask?
-  **Recommended: `/30`**
- It provides **exactly 2 usable IPs**, which is perfect for point-to-point VPC peering.
- Larger blocks like `/28` or `/29` waste IPs and are not necessary.

| CIDR  | Usable IPs | Recommended for Peering? |
|-------|------------|--------------------------|
| `/30` | 2          |  Yes                    |
| `/29` | 6          |  No                     |
| `/28` | 14         |  No                     |

---

###  Why use `169.254.x.x/30` instead of private IPs?
- `169.254.0.0/16` is **not** part of the RFC1918 private address space.
  - RFC1918 defines: `10.0.0.0/8`, `172.16.0.0/12`, and `192.168.0.0/16`.
- However, `169.254.0.0/16` is defined by **RFC 3927** as **Link-local address space**, intended for:
  - Internal communication
  - Auto IP configuration
  - Point-to-point routing
- It is:
  - **Non-routable to the public internet**
  - **Secure for internal use**
  - **Commonly used by cloud platforms (e.g., AWS, AliCloud)** for internal networking like VPC peering or metadata access

---

###  Summary Table

| Question                            | Answer                                                 |
|-------------------------------------|--------------------------------------------------------|
| Is Local Connect IP a CIDR block?   |  Yes, e.g., `169.254.0.1/30`                           |
| Recommended subnet size?            |  `/30` (2 usable IPs)                                  |
| Can I use private IPs (RFC1918)?    |  Not recommended for peering links                     |
| Why use `169.254.x.x`?              |  Link-local, safe, not internet-routable, widely used  |



**5.Create VM**

note: An 'Unschedulable' error typically indicates insufficient memory. Please stop other virtual machines before attempting to start this one again. 

**6.Test Cross-VPC Communication**

- Open the serial console of vm1-vpcpeer1 (10.0.0.2) and adds a default route when necessary:
```
  #sudo ip route add default via 10.0.0.1 dev enp1s0
```
- Check if 20.0.0.2 can be pinged successfully. 
- Open the serial console of vm1-vpcpeer1 (20.0.0.2) and adds a default route when necessary:
```
  #sudo ip route add default via 20.0.0.1 dev enp1s0
```
- Check if 10.0.0.2 can be pinged successfully. 

**VPC Peering allows secure, private, and efficient communication between two separate VPCs without exposing them to the public internet.** 

### Limitations

## Observations

-  Peering works between **custom VPCs**
-  Peering does **not** work between a **default VPC** and a **custom VPC**

## Recommendation

This is important to keep in mind when planning your network architecture:

> **Always use custom VPCs on both sides if VPC peering is required.**

## Example Scenarios

### Scenario 1: Custom VPC to Custom VPC Peering (Success)

| VPC Name  | VPC Type   | Notes             |
|-----------|------------|-------------------|
| vpcpeer-1 | Custom VPC | User-created VPC  |
| vpcpeer-2 | Custom VPC | User-created VPC  |

- Both VPCs are custom-created.
- Peering is established successfully.
- Static routes and peering IPs configured correctly.
- Network communication between VPCs works as expected.

---

### Scenario 2: Default VPC to Custom VPC Peering (Failure)

| VPC Name    | VPC Type    | Notes                  |
|-------------|-------------|------------------------|
| default-vpc | Default VPC | System default VPC      |
| vpcpeer-1   | Custom VPC  | User-created VPC        |

- One side is a default VPC, the other is a custom VPC.
- Peering connection fails.
- No network communication between the two VPCs.

---

## Important Recommendation

- When planning your network architecture **and VPC peering is required, always use custom VPCs on both sides.**
- Avoid attempting peering between a default VPC and a custom VPC, as it will not function.
