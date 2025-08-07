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

## Features 

- Subnet ACLs consist of an array of rules within the subnet.

- The most important components of the `match` expression are comparisons between symbols and constants (for example, `ip4.dst = 192.168.0.1`, `ip.proto = 6`, `arp.op = 1`, `eth.type = 0x800`, `eth.src = 0a:8f:0a:ec:01:7c`, and `tcp.dst = 9501`).
  
  You can use the logical AND operator `&&` and the logical OR operator `||` to combine comparisons into a larger expression. For more information, see the [Open vSwitch Manual](https://www.ovn.org/support/dist-docs/ovn-sb.5.html).

- ACL rules are evaluated and enforced based on their priority. The higher the priority number, the more precedence the rule takes.

- You can update ACLs on subnets that are used by running virtual machines.

- Deleting ACLs involves removing the contents of the `.spec.acls` field.

## Examples

- Example 1: Traffic from virtual machines with the IP address `172.20.10.0/30` is blocked for the `vswitch1` subnet. All virtual machines within the `172.20.10.0/24` subnet, except those with the addresses `172.20.10.2` and `172.20.10.3`, are allowed to communicate with each other.

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

- Example 2: All virtual machines within the `172.20.10.0/24` subnet, except those with the address `172.20.10.3`, are allowed to communicate with each other. Virtual machines with the address `172.20.10.2` are allowed to communicate because ACL rule execution is based on priority. For this subnet, rules with a priority value of `1006` are executed before `1005`.

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
