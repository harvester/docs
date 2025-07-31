***Virtual Private Cloud (VPC) - Concepts & Architecture*** 

***Overview*** 

A **Virtual Private Cloud (VPC)** is a logically isolated network that provides full control over IP addressing, subnets, route tables, firewalls, and gateways within a cloud infrastructure. VPC allows the secure and scalable deployment of virtualized resources such as compute, storage, and container services.

The following diagram shows a typical VPC architecture with both public and private subnets to separate internet-facing traffic from internal resources.

*Note: VPC configurations may vary across platforms, but the logical design remains consistent.*

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

*Note:You must enable `kubeovn-operator` to deploy Kube-OVN to a Harvester cluster for advanced SDN capabilities such as virtual private cloud (VPC) and subnets for virtual machine workloads.

1. On the Harvester UI, go to **Advanced** > **Add-ons**.

2. Select **kubeovn-operator (Experimental)**, and then select **⋮** > **Enable**.* 

***VPC Creation*** 

***Test steps:***

**1.Creat Virtual Machine Networks**

Name: vswitch1 ,  vswitch2

Type: OverlayNetwork

**2.Creat VPC**

Name: vpc-1

After creation, you’ll have an isolated network space ready for subnet creation. 

**3.Create Subnets** 

Subnet Name		    CIDR			      Provider	    			Gateway IP

vswitch1-subnet		172.20.10.0/24	default/vswitch1		172.20.10.1

vswitch2-subnet		172.20.20.0/24	default/vswitch2		172.20.20.1

**4.Creat VM**

**Name: vm1-vswitch1**

**Basic**

CPU:1

Memory:2

SSH key:Enter your SSH Key, for example:\
ssh-ed25519 AAAAC3NzaC1lZDI1NTE5AAAAICxyz123456789abcdefgh... Tony Tseng

**Volumes**

Image:Enter your cloudimg, for example: noble-server-cloudimg-amd64

**Networks**

Network: default/vswitch1

**Advanced Options**
```
users:

`  `- name: ubuntu

`    `groups: [ sudo ]

`    `shell: /bin/bash

`    `sudo: ALL=(ALL) NOPASSWD:ALL

`    `lock\_passwd: false

`    `ssh\_authorized\_keys:

`      `- ssh-ed25519 AAAAC3NzaC1lZDI1NTE5AAAAICxyz123456789abcdefgh... Tony Tseng

chpasswd:

`  `list: |

`    `ubuntu:test1234

`  `expire: false

ssh\_pwauth: true
```
**Name: vm2-vswitch1**

**Basic**

CPU:1

Memory:2

SSH key:Enter your SSH Key, for example:\
ssh-ed25519 AAAAC3NzaC1lZDI1NTE5AAAAICxyz123456789abcdefgh... Tony Tseng

**Volumes**

Image:Enter your cloudimg, for example: noble-server-cloudimg-amd64

**Networks**

Network: default/vswitch1

**Advanced Options**
```
users:

`  `- name: ubuntu

`    `groups: [ sudo ]

`    `shell: /bin/bash

`    `sudo: ALL=(ALL) NOPASSWD:ALL

`    `lock\_passwd: false

`    `ssh\_authorized\_keys:

`      `- ssh-ed25519 AAAAC3NzaC1lZDI1NTE5AAAAICxyz123456789abcdefgh... Tony Tseng

chpasswd:

`  `list: |

`    `ubuntu:test1234

`  `expire: false

ssh\_pwauth: true
```
**Name: vm1-vswitch2**

**Basic**

CPU:1

Memory:2

SSH key:Enter your SSH Key, for example:\
ssh-ed25519 AAAAC3NzaC1lZDI1NTE5AAAAICxyz123456789abcdefgh... Tony Tseng

**Volumes**

Image:Enter your cloudimg, for example: noble-server-cloudimg-amd64

**Networks**

Network: default/vswitch1

**Advanced Options**
```
users:

`  `- name: ubuntu

`    `groups: [ sudo ]

`    `shell: /bin/bash

`    `sudo: ALL=(ALL) NOPASSWD:ALL

`    `lock\_passwd: false

`    `ssh\_authorized\_keys:

`      `- ssh-ed25519 AAAAC3NzaC1lZDI1NTE5AAAAICxyz123456789abcdefgh... Tony Tseng

chpasswd:

`  `list: |

`    `ubuntu:test1234

`  `expire: false

ssh\_pwauth: true
```
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
***Test steps:***

- **Open the **VPC** page, go to **vswitch1-subnet -> Edit Config**, and enable the **Private Subnet** setting.**

- **Open the **serial console** of **vm1-vswitch1 (172.20.10.6)** and ping **vm1-vswitch2 (172.20.20.3)**. At this point, the ping fails.**

- **Go back to **vswitch1-subnet -> Edit Config**, and add **172.20.20.0/24** to the **Allow Subnets** field.**

- **Open the **serial console** of **vm1-vswitch1 (172.20.10.6)** again and ping **vm1-vswitch2 (172.20.20.3)**. This time, the ping succeeds.**

- **This verifies that the **Private Subnet** feature is working as expected.**

\------------------------------------------------------------------------------------------------------------------------

***NatOutgoing***

**Test steps:**

**1.Creat Virtual Machine Networks**

Name: vswitch-external

Type: OverlayNetwork

**2.Creat VPC**

Create a subnet within the Virtual Private Cloud named 'ovn-cluster'. 

**Subnet Name		   CIDR			      Provider						          Gateway IP**

external-subnet		172.20.30.0/24	default/vswitch-external			172.20.30.1

**3.Creat VM**

Name: vm-external

**Basic**

CPU:1

Memory:2

SSH key:Enter your SSH Key, for example:\
ssh-ed25519 AAAAC3NzaC1lZDI1NTE5AAAAICxyz123456789abcdefgh... Tony Tseng

**Volumes**

Image:Enter your cloudimg, for example: noble-server-cloudimg-amd64

**Networks**

Network: default/vswitch-external

**Advanced Options**
```
users:

`  `- name: ubuntu

`    `groups: [ sudo ]

`    `shell: /bin/bash

`    `sudo: ALL=(ALL) NOPASSWD:ALL

`    `lock\_passwd: false

`    `ssh\_authorized\_keys:

`      `- ssh-ed25519 AAAAC3NzaC1lZDI1NTE5AAAAICxyz123456789abcdefgh... Tony Tseng

chpasswd:

`  `list: |

`    `ubuntu:test1234

`  `expire: false

ssh\_pwauth: true
```
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

**Subnet Name		CIDR			    Provider		      	Gateway IP**

subnet1			  	10.0.0.0/24		default/vswitch3		10.0.0.1

**vpcpeer-2**

**Subnet Name		CIDR			    Provider			      Gateway IP**

subnet2			  	20.0.0.0/24		default/vswitch4		20.0.0.1

**4.Edit Confic**

**vpcpeer-1**

VPC peering \
**Local Connect IP 	Remote VPC** 

169\.254.0.1/30 		vpcpeer-2

Static Routes

**CIDR 			    Next Hop IP**

20\.0.0.0/16		169.254.0.2

**vpcpeer-2**

VPC peering \
**Local Connect IP 	Remote VPC** 

169\.254.0.2/30 		vpcpeer-1

Static Routes

**CIDR 			    Next Hop IP**

10\.0.0.0/16		169.254.0.1

**5.Creat VM**

**Name: vm1-vpcpeer1**

**Basic**

CPU:1

Memory:2

SSH key:Enter your SSH Key, for example:\
ssh-ed25519 AAAAC3NzaC1lZDI1NTE5AAAAICxyz123456789abcdefgh... Tony Tseng

**Volumes**

Image:Enter your cloudimg, for example: noble-server-cloudimg-amd64

**Networks**

Network: default/vswitch3

**Advanced Options**
```
users:

`  `- name: ubuntu

`    `groups: [ sudo ]

`    `shell: /bin/bash

`    `sudo: ALL=(ALL) NOPASSWD:ALL

`    `lock\_passwd: false

`    `ssh\_authorized\_keys:

`      `- ssh-ed25519 AAAAC3NzaC1lZDI1NTE5AAAAICxyz123456789abcdefgh... Tony Tseng

chpasswd:

`  `list: |

`    `ubuntu:test1234

`  `expire: false

ssh\_pwauth: true
```
**Name: vm2-vpcpeer2**

**Basic**

CPU:1

Memory:2

SSH key:Enter your SSH Key, for example:\
ssh-ed25519 AAAAC3NzaC1lZDI1NTE5AAAAICxyz123456789abcdefgh... Tony Tseng

**Volumes**

Image:Enter your cloudimg, for example: noble-server-cloudimg-amd64

**Networks**

Network: default/vswitch4

**Advanced Options**
```
users:

`  `- name: ubuntu

`    `groups: [ sudo ]

`    `shell: /bin/bash

`    `sudo: ALL=(ALL) NOPASSWD:ALL

`    `lock\_passwd: false

`    `ssh\_authorized\_keys:

`      `- ssh-ed25519 AAAAC3NzaC1lZDI1NTE5AAAAICxyz123456789abcdefgh... Tony Tseng

chpasswd:

`  `list: |

`    `ubuntu:test1234

`  `expire: false

ssh\_pwauth: true
```
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
