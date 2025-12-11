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

<head>
  <link rel="canonical" href="https://docs.harvesterhci.io/v1.6/networking/kubeovn-vm-isolation"/>
</head>

:::note

Kube-OVN is in Tech Preview. 

:::

Isolation between virtual machines is typically achieved using either VLANs (in traditional networks) or virtual switches (in Kube-OVN). If you want to isolate virtual machines within the same virtual switch network, you can use either of the following to achieve the required micro-segmentation:

- Subnet access control lists (ACLs): Apply rules to a subnet used by virtual machines.
- Kubernetes network policies: Apply rules within network namespaces and using pod selectors.

## Subnet ACLs

For more information about the schema and usage guidelines, see [Subnet ACL](https://kubeovn.github.io/docs/v1.13.x/en/guide/subnet/#subnet-acl) and [ACL API Reference](https://kubeovn.github.io/docs/v1.13.x/en/reference/kube-ovn-api/#acl) in the Kube-OVN documentation.

### Examples

- Example 1: All virtual machines within the `172.20.10.0/24` subnet, except those with the addresses `172.20.10.2` and `172.20.10.3` in the subnet range `172.20.10.0/30`, are allowed to communicate with each other.

  Kube-OVN automatically adds the gateway address `172.20.10.1` to the `excludeIps` list, preventing it from being assigned to any virtual machines. However, communication to and from the gateway address is also affected.


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

For more information, see [Network Policies](https://kubernetes.io/docs/concepts/services-networking/network-policies/) in the Kubernetes documentation and [NetworkPolicy Logging](https://kubeovn.github.io/docs/v1.13.x/en/guide/networkpolicy-log/) in the Kube-OVN documentation.

:::caution

NetworkPolicy rules deny traffic by default. To avoid affecting other pods, ensure the following:

- All required match conditions are added to the policy.
- Traffic is isolated using pod selectors and namespaces.

:::

The examples in this document focus on achieving isolation between VMs within the same subnet.

### Examples

The following virtual machines are created in the `default` namespace and are attached to the overlay network created for the subnet range `172.20.10.0/24`.

| Virtual Machine | IP Address |
| --- | --- |
| VM1 | `172.20.10.2` |
| VM2 | `172.20.10.3` |
| VM3 | `172.20.10.4` |
| VM4 | `172.20.10.5` |
| VM5 | `172.20.10.6` |

- Example 1: VM1 and VM2 are allowed to communicate with each other because their addresses are within the subnet `172.20.10.0/30`. All other traffic in the `default` namespace, including traffic to and from VM3, VM4, and VM5, is blocked.

  ```yaml
  apiVersion: networking.k8s.io/v1
  kind: NetworkPolicy
  metadata:
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

- Example 2: VM1 and VM2 are allowed to communicate with each other and with other virtual machines in the subnet `172.20.10.0/24`. However, other virtual machines in that subnet cannot communicate with VM1, VM2, and each other. This is because the ingress policy only allows traffic originating from `172.20.10.0/30`.

  ```yaml
  apiVersion: networking.k8s.io/v1
  kind: NetworkPolicy
  metadata:
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

- Example 3: VM1 and VM2 are allowed to communicate with each other, but not with other virtual machines in the subnet `172.20.10.0/24`. The other virtual machines in the same subnet can communicate with VM1 and VM2. This is because the egress policy allows traffic to be sent to `172.20.10.0/30`.

  ```yaml
  apiVersion: networking.k8s.io/v1
  kind: NetworkPolicy
  metadata:
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

- Example 4: VM2 is allowed to communicate with VM1, but not with other virtual machines in the subnet `172.20.10.0/24`. This is because a pod selector label is applied to VM2. All other virtual machines in the same subnet can communicate with VM1 and each other.

 ```yaml
  apiVersion: networking.k8s.io/v1
  kind: NetworkPolicy
  metadata:
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
