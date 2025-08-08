---
id: index
sidebar_position: 6
sidebar_label: Virtual Private Network
title: "Virtual Private Network"
keywords:
- Harvester
- Networking
- NetworkConfig
- Network
- Kube-OVN
---

##  **Virtual Private Cloud (VPC) - Concepts & Architecture** 

***Overview*** 

A **Virtual Private Cloud (VPC)** is a logically isolated network that provides full control over IP addressing, subnets, route tables, firewalls, and gateways within a cloud infrastructure. VPC allows the secure and scalable deployment of virtualized resources such as compute, storage, and container services.

The following diagram shows a typical VPC architecture with both public and private subnets to separate internet-facing traffic from internal resources.


###  VPC → Subnet → Overlay Network → VM: Hierarchical Diagram

#### Component Relationship Table

| Layer | Component         | Example in Harvester        | Description                                                                 |
|-------|-------------------|-----------------------------|-----------------------------------------------------------------------------|
| L3    | VPC               | `vpc-1`                     | Logical network container managing multiple subnets and routing/NAT rules. |
| L3    | Subnet            | `vswitch1-subnet`           | IP segment (CIDR); each subnet is bound to one unique Overlay Network.     |
| L2    | Overlay Network   | `vswitch1`                  | Virtual Layer 2 switch that connects VMs; carries subnet traffic.          |
| L2/L3 | Virtual Machine   | `vm1-vswitch1`              | Attached to an Overlay Network; receives IP/Gateway from its subnet.       |

#### ASCII Diagram

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

This diagram illustrates how VPCs, subnets, overlay networks, and VMs are logically connected in Harvester with Kube-OVN.

#### Notes
- **Each Subnet must be mapped to exactly one Overlay Network, and vice versa (1:1 relationship).**

- **VMs attach to an Overlay Network, and automatically receive IP from the associated Subnet.**

- **VMs attach to an Overlay Network needs to configure the default gateway manually.**

- **Subnets are grouped under a VPC, which manages broader traffic policies such as:**

  - **Private subnet isolation**

  - **NAT configuration**

  - **VPC Peering**



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

In the `ovn-cluster`, each created subnet comes with the `natOutgoing` as true by default and does not need to be changed manually. If you want to create subnet in custom VPC, you need to edit its YAML configuration to set `natOutgoing: true`.

![](/img/customize_nat_outgoing.png)

In a custom VPC, the subnets created are basically not able to communicate directly with the subnets under the default VPC ovn-cluster.
Unless a VPC peering connection is properly set up between the two VPCs, enabling secure and controlled network communication between them, cross-VPC subnet communication is not possible.

In other words, without VPC peering configured, subnet traffic in different VPCs is isolated and cannot exchange data directly.

![](/img/vpcpeer.png)


####  How VMs on Harvester communicate via Kube-OVN VPC/Subnets

1.Kube-OVN creates the VPC and its Subnets

- **Each Subnet includes a CIDR, Gateway IP, and binds to a Harvester Overlay Network (as provider).**

- **Enforces 1:1 mapping between Subnet ↔ Overlay Network.**

2.Harvester defines Overlay Networks (type: OverlayNetwork)

- **Each overlay (e.g., vswitch1, vswitch3) is listed as a selectable provider in the subnet creation UI in Kube-OVN.**

3.Harvester provisions VMs connected to an Overlay Network.

- **Once VM boots, it requests IP via Kube-OVN's IPAM.**

- **VM receives its IP, gateway, and routing from the associated Subnet.**

- **Access the console of the VM and create a default route w/ the gateway of the Subnet.**

4.Kube-OVN handles all L3 logic: routing, NAT, VPC peering, isolation

- **Harvester focuses purely on compute and network attachment.**

- **Network policy enforcement, private subnets, and NAT egress are managed by Kube-OVN.**

####  Design Benefits

| **Reason**                       | **Explanation**                                                              |
|----------------------------------|------------------------------------------------------------------------------|
| **Clear separation of concerns** | Harvester handles virtualization; Kube-OVN handles SDN                      |
| **Scalability**                  | New VPCs, subnets, and peering don’t require changes in Harvester core      |
| **Kubernetes-native networking** | Kube-OVN integrates tightly with Kubernetes, supporting CRDs, policies, etc.|
| **Isolation and observability**  | Centralized control over IPs, ACLs, and routing through Kube-OVN            |



*Note:You must enable `kubeovn-operator` to deploy Kube-OVN to a Harvester cluster for advanced SDN capabilities such as virtual private cloud (VPC) and subnets for virtual machine workloads.

1. On the Harvester UI, go to **Advanced** > **Add-ons**.

2. Select **kubeovn-operator (Experimental)**, and then select **⋮** > **Enable**.* 



***Validate Cross-Subnet VM Communication via Kube-OVN VPC Configuration in Harvester***

1. Create Virtual Machine Networks (vswitch)

2. Create a VPC

3. Create Subnets

4. Create Virtual Machines (VMs)

5. Configure and Test Connectivity

  A. Adds default route to send all traffic (not in the local subnet) through the gateway configured for the connected Subnet using interface enp1s0.

  B. Ping Test Between VMs : This verifies successful cross-subnet communication between the VMs.

***Purpose of the Test:***

To verify that in Harvester, creating multiple Overlay Networks and Subnets and manually configuring default gateways allows virtual machines to communicate across different subnets successfully and correctly.

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



**4.Creat VM**

**Note: Once the VM is running, you will see the Node displaying the NTP server -> 0.suse.pool.ntp.org and the IP address.** 

**5.**

Open the **serial console** of **vm1-vswitch1 (172.20.10.6)** and ping **vm1-vswitch2 (172.20.20.3)**.

It shows: **ping: connect: Network is unreachable.**

**Adds a default route :**
```
#sudo ip route add default via 172.20.10.1 dev enp1s0
```
**note: For any network traffic that doesn't match a more specific route, send it to the gateway 172.20.10.1 using the network interface enp1s0.** 

Open the **serial console** of **vm1-vswitch2 (172.20.20.3)** and ping **vm1-vswitch1 (172.20.10.6)**.

It shows: **ping: connect: Network is unreachable.**

**Adds a default route :**
```
#sudo ip route add default via 172.20.10.1 dev enp1s0
```
**note: For any network traffic that doesn't match a more specific route, send it to the gateway** 172.20.20.1 **using the network interface** enp1s0**.** 

Use vm1-vswitch2 (172.20.20.3) to ping vm1-vswitch1 (172.20.10.6) to verify connectivity. 

Use vm1-vswitch1 (172.20.10.6) to ping vm1-vswitch2 (172.20.20.3) to verify connectivity. 

**If the VM wants to send traffic to an unknown network (not in its local subnet), it will forward that traffic to the specified gateway IP using the specified network interface.** 

vm1-vswitch1 will send traffic via 172.20.10.1 through enp1s0.

vm1-vswitch2 will send traffic via 172.20.20.1 through enp1s0.

**This setup allows traffic to be forwarded properly through their gateways, enabling end-to-end connectivity.** 



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

***Test steps:***

- **Open the **VPC** page, go to **vswitch1-subnet -> Edit Config**, and enable the **Private Subnet** setting.**

- **Open the **serial console** of **vm1-vswitch1 (172.20.10.6)** and ping **vm1-vswitch2 (172.20.20.3)**. At this point, the ping fails.**

- **Go back to **vswitch1-subnet -> Edit Config**, and add **172.20.20.0/24** to the **Allow Subnets** field.**

- **Open the **serial console** of **vm1-vswitch1 (172.20.10.6)** again and ping **vm1-vswitch2 (172.20.20.3)**. This time, the ping succeeds.**

- **This verifies that the **Private Subnet** feature is working as expected.**

\------------------------------------------------------------------------------------------------------------------------



***Verification of NAT Outgoing for External Network Access***

***NatOutgoing***

**Test steps:**

**1.Creat Virtual Machine Networks**

Name: vswitch-external

Type: OverlayNetwork

**2.Creat VPC**

Create a subnet named `external-subnet` within any VPC. 

| Subnet Name      | CIDR           | Provider               | Gateway IP   |
|------------------|----------------|------------------------|--------------|
| external-subnet  | 172.20.30.0/24 | default/vswitch-external | 172.20.30.1 |

**3.Creat VM**

Name: vm-external


4\.Open the serial console of vm-external (172.20.30.2) and ping 8.8.8.8.

It shows: ping: connect: Network is unreachable.

Adds a default route :
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
└──────────────────────┘                            └──────────────────────┘       vswitch(Overley)      └──────────────────────┘
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

**Test steps:**

**1.Creat Virtual Machine Networks**

Name: vswitch3 ,  vswitch4

Type: OverlayNetwork

**2.Creat VPC**

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


**4.Edit Confic**

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

**5.Creat VM**

note: An 'Unschedulable' error typically indicates insufficient memory. Please stop other virtual machines before attempting to start this one again. 

**6.**

- Open the serial console of vm1-vpcpeer1 (10.0.0.2) and adds a default route :
```
  #sudo ip route add default via 172.20.10.1 dev enp1s0
```
- Check if 20.0.0.2 can be pinged successfully. 
- Open the serial console of vm1-vpcpeer1 (20.0.0.2) and adds a default route :
```
  #sudo ip route add default via 20.0.0.1 dev enp1s0
```
- Check if 10.0.0.2 can be pinged successfully. 

**VPC Peering allows secure, private, and efficient communication between two separate VPCs without exposing them to the public internet.** 
