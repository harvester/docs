---
sidebar_position: 10
sidebar_label: HostNetwork Configuration and Underlay Selection
title: "HostNetwork Configuration and Underlay Selection"
keywords:
- Harvester
- networking
- KubeOVN
- hostnetworkconfig
- vlan sub-interface
- underlay
---

<head>
  <link rel="canonical" href="https://docs.harvesterhci.io/v1.7/networking/hostnetworkconfig.md"/>
</head>

## Host Network Configuration

### Harvester VLAN & Layer 3 Extension
Harvester supports VLAN sub-interfaces on cluster networks, enabling static IPv4 assignment directly to the node. This unlocks dedicated Layer 3 paths to external infrastructure, facilitating:

- Optimized Storage: High-speed, low-latency access to external storage arrays (e.g., iSCSI, NFS).

- Traffic Segregation: Hardware-level isolation for sensitive application or tenant data.

- Network Fabric Integration: Direct peering with existing physical routers and switches.

### KubeOVN Underlay Support
You can further designate a VLAN interface as the underlay for KubeOVN. By offloading VM inter-node traffic to a dedicated underlay, you eliminate contention with the Management Plane, significantly boosting both network throughput and cluster security.

### Overview
HostNetworkConfig: Beyond Default Management Networking

While Harvester can configure a management VLAN during installation if VID is provided, production environments often demand more granular control over the network stack. Relying solely on the management interface can create bottlenecks and security risks.

The HostNetworkConfig resource addresses these limitations by managing VLAN sub-interfaces and IP assignments across all cluster nodes.

Why override the defaults?
- L3 Routed Storage: High-performance storage networks often require dedicated routed subnets with
  static or DHCP addressing, separate from the management plane.

- Physical Traffic Isolation: Operators can offload VM and application traffic to secondary physical uplinks
  and gateways, ensuring management access remains responsive during high load.

- External Service Integration: Edge and cloud deployments may require non-management NICs to hold IPv4 addresses
  for peering with BGP, OSPF, or other external routing services.

- KubeOVN Underlay Optimization: By default, KubeOVN uses the management interface for VM overlay traffic.
  Hostnetworkconfig allows you to designate a dedicated VLAN as the underlay, eliminating traffic contention and enhancing isolation.

### Prerequisites
Before creating a HostNetworkConfig, ensure the following:

The target cluster network (for example, cn-1, mgmt) is created and in Ready state.
A VlanConfig / NetworkConfig exists for the cluster network and covers the intended nodes.
For static mode: valid CIDR addresses are prepared for each node.
For underlay selection: the HostNetworkConfig must span all nodes in the cluster.

### Configuring Host Network Config
Via kubectl
Create a HostNetworkConfig manifest and apply it with `kubectl apply -f <hostnetworkconfig>.yaml`.

#### Examples

##### DHCP Mode — All Nodes
Creates a VLAN sub-interface on cluster network cn-1 with VLAN ID 2012 and assigns an IP address via DHCP on every node covered by the cluster network's VlanConfig.

```
apiVersion: network.harvesterhci.io/v1beta1
kind: HostNetworkConfig
metadata:
  name: cn1-vlan2012-dhcp
spec:
  clusterNetwork: cn-1
  vlanID: 2012
  mode: dhcp
```

After applying, the following is configured on each node:

- VLAN 2012 is added to the bridge and uplink ports (cn-1-br, cn-1-bo).
- Sub-interface cn-1-br.2012 is created and brought up.
- An IP address is obtained via DHCP and applied to the sub-interface.

##### Static Mode — Per-Node IPs

Assigns specific IP addresses to each node's sub-interface.

```
apiVersion: network.harvesterhci.io/v1beta1
kind: HostNetworkConfig
metadata:
  name: cn1-vlan2012-static
spec:
  clusterNetwork: cn-1
  vlanID: 2012
  mode: static
  ips:
    node1: 192.168.1.10/24
    node2: 192.168.1.11/24
    node3: 192.168.1.12/24
```

:::note

Replace the node names "node1,node2,node3" with the actual node names from your cluster

In static mode, you must provide an IP entry for every node covered by the VlanConfig's node selector. If a node is added to the cluster later, update the HostNetworkConfig to include the new node's IP before the config will apply to it.

:::

##### Node Selector — Targeted Nodes Only

Applies the config only to nodes with the label network-role=l3.

```
apiVersion: network.harvesterhci.io/v1beta1
kind: HostNetworkConfig
metadata:
  name: cn1-vlan2014-selected
spec:
  nodeSelector:
    matchLabels:
      network-role: l3
  clusterNetwork: cn-1
  vlanID: 2014
  mode: dhcp
```
Label the desired nodes before or after creating the resource:

```
kubectl label node <node-name> network-role=l3
```

When a label is removed from a node,
```
kubectl label node <node-name> network-role=-
```
the VLAN interface and bridge VLAN entry are automatically removed from that node.

##### Management Cluster Network

The mgmt cluster network is also supported. This creates a VLAN sub-interface on the management bridge.

```
apiVersion: network.harvesterhci.io/v1beta1
kind: HostNetworkConfig
metadata:
  name: mgmt-vlan2014-dhcp
spec:
  clusterNetwork: mgmt
  vlanID: 2014
  mode: dhcp
```

:::note

Linux network interface names are limited to 15 characters. Ensure that the generated bridge name in the format `ClusterNetworkName>-br.<vlanID>` does not exceed this limit.

:::

### Configuring the Underlay of the Harvester Overlay Networking

By default, KubeOVN uses the management interface `(mgmt-br.<vlan>)` as the underlay tunnel interface for inter-node VM traffic. You can designate any HostNetworkConfig with a configured VLAN interface as the underlay instead.
Why Change the Underlay?

Separates VM inter-node (VXLAN) traffic from management traffic, reducing contention.
Allows use of a dedicated physical NIC and VLAN for VM traffic.
Enforces network best practices in environments where the management plane must be isolated from the data plane.

How to Set the Underlay:
Set underlay: true on the HostNetworkConfig that should carry overlay traffic:

```
apiVersion: network.harvesterhci.io/v1beta1
kind: HostNetworkConfig
metadata:
  name: cn1-vlan2012-underlay
spec:
  underlay: true
  clusterNetwork: cn-1
  vlanID: 2012
  mode: static
  ips:
    node1: 10.115.8.15/21
    node2: 10.115.8.16/21
    node3: 10.115.8.17/21
```

When underlay: true is set:

The hostnetworkconfig agent updates the ovn.kubernetes.io/tunnel_interface annotation on each node to point to the new sub-interface (e.g., cn-1-br.2012).
KubeOVN automatically updates the remote VXLAN tunnel endpoints in the OVS bridges on each node to use the new interface's IPs.

:::note

Wait for KubeOVN controller to update the remote endpoints on the default ovs bridge.

:::

For example output from node1,

```
kubectl exec -it ovs-ovn-pk57r -n kube-system -- /bin/bash

ovs-vsctl show
992c73d7-68cd-4422-8df4-84cd2bea12fb
    Bridge br-int
        fail_mode: secure
        datapath_type: system
        Port ovn0
            Interface ovn0
                type: internal
        Port ovn-a33a48-0
            Interface ovn-a33a48-0
                type: vxlan
                options: {csum="true", key=flow, local_ip="10.115.8.15", remote_ip="10.115.8.16","10.115.8.17"}
        Port br-int
            Interface br-int
                type: internal
        Port mirror0
            Interface mirror0
                type: internal
    ovs_version: "3.5.3"

```

Reverting to the Default Underlay
Set underlay: false on the resource. The agent restores the ovn.kubernetes.io/tunnel_interface annotation to the default management interface and KubeOVN reconfigures tunnel endpoints accordingly.

### Behavior Reference

#### Adding a New Node to the Cluster

DHCP mode: When a new node joins, the VLAN interface and DHCP lease are automatically provisioned on that node.
Static mode: The new node is not configured automatically. Add an entry for the new node in the HostNetworkConfig's ips map and reapply.

#### Reboots:
All VLAN interfaces and IP address assignments are automatically restored after a node reboot. DHCP renewals resume automatically; static addresses are reapplied as configured.

#### Changing IP Mode
Switching between dhcp and static (or changing static IPs) causes the existing IP addresses on the sub-interface to be removed and the new addresses applied.

#### Deleting a HostNetworkConfig
Removing the resource causes the following on all affected nodes:

The VLAN ID is removed from the bridge and uplink ports.
The VLAN sub-interface is deleted.

#### Deleting or Updating a VlanConfig
If the underlying VlanConfig for a cluster network is deleted or its node selector changes, all associated HostNetworkConfig VLAN interfaces are removed from nodes that no longer have an uplink configured.

### Verifying the Configuration

After applying a HostNetworkConfig, verify the interface and IP on a node:

```
# Check IP address assignment
ip addr show cn-1-br.2012

# Expected output (DHCP example):
# cn-1-br.2012@cn-1-br: <BROADCAST,MULTICAST,UP,LOWER_UP> mtu 1500 ...
#     inet 10.115.8.15/21 brd 10.115.15.255 scope global cn-1-br.2012

# Check bridge VLAN membership
bridge vlan show

# Expected output includes:
# cn-1-bo    1 PVID Egress Untagged
#            2012
# cn-1-br    1 PVID Egress Untagged
#            2012
```

Check per-node status in the resource:

`kubectl get hostnetworkconfig cn1-vlan2012-dhcp -o yaml`

The status.nodeStatus field reports per-node Ready state and any error conditions.Example output:

```
apiVersion: network.harvesterhci.io/v1beta1
kind: HostNetworkConfig
metadata:
  name: cn1-vlan2012-dhcp
spec:
  clusterNetwork: cn-1
  mode: dhcp
  vlanID: 2012
status:
  nodeStatus:
    hp-46:
      clusterNetwork: cn-1
      conditions:
      - message: ""
        status: "True"
        type: ready
      mode: dhcp
      vlanID: 2012
    hp-65:
      clusterNetwork: cn-1
      conditions:
      - message: ""
        status: "True"
        type: ready
      mode: dhcp
      vlanID: 2012

```

Update the config using the following command:

`kubectl edit hostnetworkconfig cn1-vlan2012-dhcp` and edit the contents and save the config.

Delete the config using the following command:

`kubectl delete hostnetworkconfig cn1-vlan2012-dhcp`.

### Limitations

- Only tagged VLANs with a VLAN ID of 1–4094 are supported.
- Only IPv4 addresses can be assigned to VLAN sub-interfaces.
- IP allocation must be performed via DHCP or manually specified static addresses and Integration with
  external IPAM systems is not supported.
- Only one HostNetworkConfig can be designated as the underlay at a time. The webhook rejects
  any attempt to set a second resource as underlay: true.
- A HostNetworkConfig used as the underlay must span all nodes in the cluster.
  The webhook rejects configurations where the cluster network or VlanConfig does not cover all nodes.
- Underlay selection is only supported for the default KubeOVN bridge. Custom OVS bridge
  setups are not supported.
- The vlanID and clusterNetwork fields are immutable once set. To change them, delete the resource and create a new one.
- The webhook rejects updates or deletions of a HostNetworkConfig that is in use as an underlay if
  VMs are running on overlay networks.
- Modifying  or deleting the VlanConfig used by an active underlay is rejected while VMIs are present.

