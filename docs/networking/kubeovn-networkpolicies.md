---
sidebar_position: 9
sidebar_label: Kube-OVN Network Policies
title: "Kube-OVN Network Policies"
keywords:
- Harvester
- networking
- Kube-OVN
- network policy
---

If you want to isolate virtual machines within the same virtual switch network using network parameters and pod selectors, you could use network policies provided by Kubernetes which KubeOVN implements through ACLs.

For more information on using Kubernetes Network Policy, refer https://kubernetes.io/docs/concepts/services-networking/network-policies/ and for enabling Network Policy logging refer https://kubeovn.github.io/docs/v1.13.x/en/guide/networkpolicy-log/

:::caution

Network Policy rules are deny by default unless allowed traffic is specified in the rule.Make sure to add all required match conditions to the policy and isolate traffic using pod selectors and namespaces so traffic from other pods are not affected.

:::

## Examples

Create 5 VMs in namespace `default` and attach to overlay Network. Reference (TBD)
VM1 - 172.20.10.2,VM2 - 172.20.10.3,VM3 - 172.20.10.4,VM4 - 172.20.10.5,VM5 - 172.20.10.6,

- Example 1: Only VM1 and VM2 are allowed to communicate with each other since they have ip in the subnet range `172.20.10.0/30`.All other traffic from and towards VM3,VM4,VM5 and all other traffic in the namespace `default` is also blocked.

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

- Example 2: VM1 and VM2 are allowed to communicate with each other and with other VMs(VM3,VM5,VM5).But VM3,VM4,VM5 will not be able communicate with each other and with VM1,VM2.And all Other traffic in the namespace `default` is also blocked.

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

- Example 3: VM1 and VM2 are allowed to communicate with each other but not with VMs(VM3,VM4,VM5).VM3,VM4,VM5 will not be able communicate with each other but with VM1,VM2.And all Other traffic in the namespace `default` is also blocked.

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

- Example 4: The network policy is applied only to VM2.Only communication between VM2 and VM3,VM4,VM5 is blocked and all other communication is allowed.

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
    podSelector:
      matchLabels:
        vm.kubevirt.io/name: VM2
    ingress:
    - from:
      - ipBlock:
          cidr: 172.20.10.0/30
    podSelector:
      matchLabels:
        vm.kubevirt.io/name: VM2
  policyTypes:
  - Ingress
  - Egress
  ```
