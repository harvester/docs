---
sidebar_position: 3
sidebar_label: Kube-OVN Subnet ACLs
title: "Kube-OVN Subnet ACLs"
keywords:
- Harvester
- networking
- Kube-OVN
- access control list
- subnet ACL
---

## Micro segmentation between VMs:

Isolation between VMs could be achieved using VLANs traditionally or using virtual switches in KubeOVN.
Enabling  Access Control Lists on subnets further allow micro segmentation of VMs by isolating VMs within the same Virtual Switch Network.

### KubeOVN Subnet ACLs

Edit the subnet spec with acls to apply ingress/egress allow/drop rules per subnet

- match 
  - type: string
    values: source mac address ,destination mac address,source ip address,destination ip address,ip protocol,application port numbers
- action
  - type: string
    value: allow-stateless,allow-related,allow,drop,reject
- direction
  - type: string
    value: from-lport,to-lport
- priority
  - type: integer
     value: 0 to 32767

### Features 

- Subnet ACLs is an array of rules within the subnet

- The match condition in subnet acl is derived using the following logic

  The most important components of match expression are comparisons between symbols and constants, e.g.ip4.dst = 192.168.0.1,  
  ip.proto = 6, arp.op = 1, eth.type = 0x800, eth.src = 0a:8f:0a:ec:01:7c,tcp.dst = 9501. The logical AND operator && and logical OR operator ||  can  combine
  comparisons into a larger expression.Reference: https://www.ovn.org/support/dist-docs/ovn-sb.5.html      

- Higher the priority, higher the precedence for order of evaluation of rules.

- ACLs can be updated on subnets used by running VMs

- To delete ACLs, remove acls hierarchy under the subnet spec

#### Examples
- **Example 1:** Block traffic from VMs with `172.20.10.0/30` for the `vswitch1` subnet. All VMs within subnet `172.20.10.0/24` except `172.20.10.2`, `172.20.10.3` will be able to communicate with each other.

  ```yaml
  apiVersion: kubeovn.io/v1
  kind: Subnet
  metadata:
    name: vswitch1
  spec:
    acls:
    - action: drop
      direction: to-lport
      match: ip4.dst == 172.20.10.0/30
      priority: 1005
    - action: drop
      direction: from-lport
      match: ip4.src == 172.20.10.0/30
      priority: 1005
    cidrBlock: 172.20.10.0/24
    excludeIps:
    - 172.20.10.1
    gateway: 172.20.10.1
    gatewayNode: ""
    natOutgoing: false
    private: false
    protocol: IPv4
    provider: vswitch1.default.ovn
    vpc: vpc1
  ```

- **Example 2:** Order of execution of acl rules based on priority. All VMs within subnet `172.20.10.0/24` except `172.20.10.3` will be able to communicate with each other.
                 Since priority of 1006 is executed first, `172.20.10.2` still allowed not blocked by rule with priority 1005.

```yaml
  apiVersion: kubeovn.io/v1
  kind: Subnet
  metadata:
    name: vswitch1
  spec:
    acls:
    - action: allow
      direction: to-lport
      match: ip4.dst == 172.20.10.2
      priority: 1006
    - action: allow
      direction: from-lport
      match: ip4.dst == 172.20.10.2
      priority: 1006
    - action: drop
      direction: to-lport
      match: ip4.dst == 172.20.10.0/30
      priority: 1005
    - action: drop
      direction: from-lport
      match: ip4.src == 172.20.10.0/30
      priority: 1005
    cidrBlock: 172.20.10.0/24
    excludeIps:
    - 172.20.10.1
    gateway: 172.20.10.1
    gatewayNode: ""
    natOutgoing: false
    private: false
    protocol: IPv4
    provider: vswitch1.default.ovn
    vpc: vpc1
  ```

- **Example 3:** Block traffic only at one direction. VM with `172.20.10.2` will be able to communicate with other VMs, but other VMs will not be able to communicate with `172.20.10.2`

  ```yaml
  apiVersion: kubeovn.io/v1
  kind: Subnet
  metadata:
    name: vswitch1
  spec:
    acls:
    - action: drop
      direction: to-lport
      match: ip4.dst == 172.20.10.2
      priority: 1005
    cidrBlock: 172.20.10.0/24
    excludeIps:
    - 172.20.10.1
    gateway: 172.20.10.1
    gatewayNode: ""
    natOutgoing: false
    private: false
    protocol: IPv4
    provider: vswitch1.default.ovn
    vpc: vpc1
  ```

- **Example 4:** Block or allow traffic by combining rules.VMs carrying tcp traffic with source port 9501 will be blocked within the `vswitch1` subnet.

  ```yaml
  apiVersion: kubeovn.io/v1
  kind: Subnet
  metadata:
    name: vswitch1
  spec:
    acls:
    - action: drop
      direction: to-lport
      match: ip4.dst == 172.20.10.2 && tcp.src = 9501
      priority: 1005
    - action: drop
      direction: from-lport
      match: ip4.src == 172.20.10.2 && tcp.src = 9501
      priority: 1005
    cidrBlock: 172.20.10.0/24
    excludeIps:
    - 172.20.10.1
    gateway: 172.20.10.1
    gatewayNode: ""
    natOutgoing: false
    private: false
    protocol: IPv4
    provider: vswitch1.default.ovn
    vpc: vpc1
  ```
