---
sidebar_position: 8
sidebar_label: Kube-OVN Subnet ACLs
title: "Kube-OVN Subnet ACLs"
keywords:
- Harvester
- networking
- Kube-OVN
- access control list
- subnet ACL
---

Isolation between virtual machines is typically achieved using either VLANs (in traditional networks) or virtual switches (in Kube-OVN). If you want to isolate virtual machines within the same virtual switch network, you can enable access control lists (ACLs) on subnets to achieve the required micro-segmentation.

For more information on using Kube-OVN Subnet ACL and its schema, refer https://kubeovn.github.io/docs/v1.13.x/en/guide/subnet/#subnet-acl https://kubeovn.github.io/docs/v1.13.x/en/reference/kube-ovn-api/#acl

## Examples

- Example 1: All virtual machines within the `172.20.10.0/24` subnet, except those with the addresses `172.20.10.2` and `172.20.10.3` in the subnet range `172.20.10.0/30`, are allowed to communicate with each other.
             GW IP `172.20.10.1` is automatically added to the excludeIps list by kubeovn so it is not assigned to any of the VMs,but communication from and towards the GW IP is also affected.

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
             GW IP `172.20.10.1` is automatically added to the excludeIps list by kubeovn so it is not assigned to any of the VMs,but communication from and towards the GW IP is also affected.

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
      match: ip4.src == 172.20.10.2
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

- Example 3: Virtual machines with the address `172.20.10.2` are allowed to communicate with other virtual machines. However, traffic in the opposite direction is blocked. No virtual machines are allowed to communicate with `172.20.10.2`.

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

- Example 4: TCP traffic originating from port `9501` and ip address `172.20.10.6` is blocked on the `vswitch1` subnet.

  ```yaml
  apiVersion: kubeovn.io/v1
  kind: Subnet
  metadata:
    name: vswitch1
  spec:
    acls:
    - action: drop
      direction: from-lport
      match: ip4.src == 172.20.10.6 && tcp.src == 9501
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
