---
sidebar_position: 8
sidebar_label: Kube-OVN Virtual Machine Isolation
title: "Kube-OVN Virtual Machine Isolation"
keywords:
- Harvester
- networking
- Kube-OVN
- access control list
- subnet ACL
- network policy
---

Isolation between virtual machines is typically achieved using either VLANs (in traditional networks) or virtual switches (in Kube-OVN). If you want to isolate virtual machines within the same virtual switch network, you can use either of the following to achieve the required micro-segmentation:

- Subnet access control lists (ACLs): Apply rules to a subnet used by virtual machines.
- Kubernetes network policies: Apply rules within network namespaces and using pod selectors.

## Subnet ACLs

For more information about the schema and usage guidelines, see [Subnet ACL](https://kubeovn.github.io/docs/v1.13.x/en/guide/subnet/#subnet-acl) and [ACL API Reference](https://kubeovn.github.io/docs/v1.13.x/en/reference/kube-ovn-api/#acl) in the Kube-OVN documentation.

### Examples

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

  Kube-OVN automatically adds the gateway address `172.20.10.1` to the `excludeIps` list, preventing it from being assigned to any virtual machines. However, communication to and from the gateway address is also affected.

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

## Network Policies

For more information on using Kubernetes Network Policy, refer https://kubernetes.io/docs/concepts/services-networking/network-policies/ and for enabling Network Policy logging refer https://kubeovn.github.io/docs/v1.13.x/en/guide/networkpolicy-log/

:::caution

Network Policy rules are deny by default unless allowed traffic is specified in the rule.Make sure to add all required match conditions to the policy and isolate traffic using pod selectors and namespaces so traffic from other pods are not affected.

:::

The examples in this document focus on achieving isolation between VMs within the same subnet.

### Examples

Create 5 VMs in namespace `default` and attach to Overlay Network created for subnet range `172.20.10.0/24`
VM1 - 172.20.10.2,VM2 - 172.20.10.3,VM3 - 172.20.10.4,VM4 - 172.20.10.5,VM5 - 172.20.10.6,

- Example 1: Only VM1 and VM2 are allowed to communicate with each other since they have ip within the subnet range `172.20.10.0/30`.All other traffic from and towards VM3,VM4,VM5 and other VMs within the namespace `default` is blocked.

  ```yaml
  apiVersion: networking.k8s.io/v1
  kind: NetworkPolicy
  metadata:
    annotations:
    name: ip-block
    namespace: default
  spec:
    egress:
    - to:
      - ipBlock:
          cidr: 172.20.10.0/30
    ingress:
    - from:
      - ipBlock:
          cidr: 172.20.10.0/30
  policyTypes:
  - Ingress
  - Egress
  ```

- Example 2: VM1 and VM2 are allowed to communicate with each other and with other VMs in the subnet `172.20.10.0/24` as only traffic originating from `172.20.10.0/30` is allowed due to the policy applied at the ingress direction.But other VMs in the subnet `172.20.10.0/24` will not be able communicate with each other and with VM1,VM2.

  ```yaml
  apiVersion: networking.k8s.io/v1
  kind: NetworkPolicy
  metadata:
    annotations:
    name: ip-block
    namespace: default
  spec:
    ingress:
    - from:
      - ipBlock:
          cidr: 172.20.10.0/30
  policyTypes:
  - Ingress
  ```

- Example 3: VM1 and VM2 are allowed to communicate with each other but not with other VMs in the subnet `172.20.10.0/24`.But other VMs in the subnet `172.20.10.0/24` can communicate with VM1,VM2 as traffic towards `172.20.10.0/30` is allowed due to the policy applied at the egress direction.

  ```yaml
  apiVersion: networking.k8s.io/v1
  kind: NetworkPolicy
  metadata:
    annotations:
    name: ip-block
    namespace: default
  spec:
    egress:
    - to:
      - ipBlock:
          cidr: 172.20.10.0/30
  policyTypes:
  - egress
  ```

- Example 4: With podSelector applied for VM2,only VM2 is blocked for communication with other VMs except for VM1 in the subnet `172.20.10.0/24` in both ingress and egress direction.All other VMs in the subnet `172.20.10.0/24` can communicate with each other and with VM1.

 ```yaml
  apiVersion: networking.k8s.io/v1
  kind: NetworkPolicy
  metadata:
    annotations:
    name: ip-block
    namespace: default
  spec:
    podSelector:
      matchLabels:
        vm.kubevirt.io/name: VM2
    egress:
    - to:
      - ipBlock:
          cidr: 172.20.10.0/30
    ingress:
    - from:
      - ipBlock:
          cidr: 172.20.10.0/30
  policyTypes:
  - Ingress
  - Egress
  ```
