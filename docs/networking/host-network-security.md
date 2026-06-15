---
sidebar_position: 11
sidebar_label: Host Network Security
title: "Host Network Security"
keywords:
- Harvester
- networking
- host
- security
---

<head>
  <link rel="canonical" href="https://docs.harvesterhci.io/v1.9/networking/security"/>
</head>

By default, Harvester nodes do not filter inbound traffic, so any host which can reach the management network can connect to any open port. To reduce the attack surface, you can apply iptables rules to restrict inbound traffic to only the ports required for cluster operation.

For the full list of required ports per node role, see [Network Requirements](../install/requirements.md#network-requirements).

## Applying iptables Rules

The examples below use a custom iptables chain (`HARVESTER_INPUT`) attached to the `INPUT` hook on the management bridge ([mgmt-br](./clusternetwork.md#cluster-network-details)). The rule set follows this structure:

:::info

When using [HostNetwork Configuration](./hostnetworkconfig), need to create another rule for the new NIC. For eaxmple, `iptables -A INPUT -i {new secondary network interface name} -j HARVESTER_INPUT`.

:::

1. **Established connections** — Allow return traffic from connections already tracked by conntrack.
2. **Protocol rules** — Allow ICMP, DHCP, and other protocol-level traffic.
3. **Service-specific ACCEPT rules** — Allow traffic to ports required by the node role.
4. **LOG + DROP** — Log and drop everything else.

```sh
# Create the custom chain and attach it to the INPUT hook
iptables -N HARVESTER_INPUT
iptables -A INPUT -i mgmt-br -j HARVESTER_INPUT

iptables -A HARVESTER_INPUT -m conntrack --ctstate ESTABLISHED,RELATED \
  -m comment --comment "Accept return traffic from established connections" -j ACCEPT
iptables -A HARVESTER_INPUT -p icmp \
  -m comment --comment "ICMP" -j ACCEPT
iptables -A HARVESTER_INPUT -s 10.52.0.0/16 \
  -m comment --comment "Allow pod network return traffic" -j ACCEPT

# ... role-specific ACCEPT rules ...

iptables -A HARVESTER_INPUT -m limit --limit 10/min \
  -m comment --comment "Rate-limit logging of dropped packets" \
  -j LOG --log-prefix HARVESTER_DROP_ --log-level 4
iptables -A HARVESTER_INPUT -m comment --comment "Drop all other traffic" -j DROP
```

If you apply these commands manually, use `iptables -L INPUT -v -n --line-numbers` to verify that `HARVESTER_INPUT` appears as **the last entry** in the `INPUT` chain:

```
harvester1:/home/rancher # iptables -L INPUT -v -n --line-numbers
# Warning: iptables-legacy tables present, use iptables-legacy to see them
Chain INPUT (policy ACCEPT xxx packets, xxxx bytes)
num   pkts bytes target     prot opt in     out     source               destination
1     301K  140M cali-INPUT  all  --  *      *       0.0.0.0/0            0.0.0.0/0            /* cali:Cz_u1IQiXIMmKD4c */
2        0     0 ACCEPT     all  --  *      *       0.0.0.0/0            0.0.0.0/0            match-set ovn40services dst
3        0     0 ACCEPT     all  --  *      *       0.0.0.0/0            0.0.0.0/0            match-set ovn40services src
4        0     0 ACCEPT     all  --  *      *       0.0.0.0/0            0.0.0.0/0            match-set ovn40subnets dst
5        0     0 ACCEPT     all  --  *      *       0.0.0.0/0            0.0.0.0/0            match-set ovn40subnets src
6        0     0 ACCEPT     udp  --  *      *       0.0.0.0/0            0.0.0.0/0            udp dpt:6081
7     300K  535M KUBE-PROXY-FIREWALL  all  --  *      *       0.0.0.0/0            0.0.0.0/0            ctstate NEW /* kubernetes load balancer firewall */
8    2391K 1748M KUBE-NODEPORTS  all  --  *      *       0.0.0.0/0            0.0.0.0/0            /* kubernetes health check service ports */
9     300K  535M KUBE-EXTERNAL-SERVICES  all  --  *      *       0.0.0.0/0            0.0.0.0/0            ctstate NEW /* kubernetes externally-visible service portals */
10   2421K 1796M KUBE-FIREWALL  all  --  *      *       0.0.0.0/0            0.0.0.0/0
11   49274   19M HARVESTER_INPUT  all  --  mgmt-br *       0.0.0.0/0            0.0.0.0/0
```

:::warning

The pod CIDR `10.52.0.0/16` is the default for Harvester. Replace it with the actual CIDR of your cluster if it differs. This rule reduces false positives from pod-to-node return traffic and is safe to omit if not needed.

:::

## Debugging and Verification

### Monitoring INPUT Traffic

Run the following command to list all rules in `HARVESTER_INPUT` with packet and byte counters. This is useful for verifying which rules are being hit and understanding traffic patterns on the node.

```sh
iptables -L HARVESTER_INPUT -v -n --line-numbers
```

### Monitoring Dropped Packets

The LOG rule records packets that do not match any ACCEPT rule. To monitor in real time:

```sh
journalctl -k -f | grep HARVESTER_DROP

# from the last 5 minutes:
journalctl -k --since "5 minutes ago" | grep HARVESTER_DROP
```

Key fields in a log entry:

| Field | Description |
|:------|:------------|
| `IN=mgmt-br` | Packet arrived on the management bridge |
| `SRC` / `DST` | Source and destination IP addresses |
| `PROTO` | Protocol (TCP or UDP) |
| `SPT` / `DPT` | Source / destination port — use `DPT` to identify a missing rule |

### False Positives

After applying rules to a running node, some log entries may appear briefly and then stop. These are **false positives** caused by conntrack state loss — return traffic from connections established before the rules were applied no longer matches the `ESTABLISHED,RELATED` state and hits the DROP rule. They are harmless and self-heal as connections are re-established.

A false positive has these characteristics:
- TCP flags are `ACK`, `ACK PSH`, or `ACK FIN` (not `SYN`).
- `SPT` is a known service port (e.g., `6443`, `9345`, `10250`).
- `DPT` is a high ephemeral port (above 1024).
- Log entries stop within a few minutes.

**Example:**

```
Apr 22 10:00:01 harvester3 kernel: HARVESTER_DROP_IN=mgmt-br OUT= MAC=... SRC=192.168.122.61 DST=192.168.122.63 LEN=52 PROTO=TCP SPT=9345 DPT=46002 WINDOW=521 RES=0x00 ACK FIN URGP=0
```

`SPT=9345` (RKE2 supervisor API), `DPT=46002` (ephemeral), `ACK FIN` — connection teardown, not a new blocked connection. This is a false positive.

If log entries **persist** with `SYN` flags or an unrecognized `DPT`, a required port is likely missing — add the corresponding ACCEPT rule.

## Persisting Rules with CloudInit CRD

The iptables rules are lost on reboot. Use the [CloudInit CRD](../advanced/cloudinitcrd.md) to re-apply them at boot time. 

The `boot` stage runs before the node is fully operational, ensuring rules are in place from the start and avoiding conntrack state loss.

The cleanup commands at the beginning prevent duplicate chain entries on subsequent reboots.

```yaml
apiVersion: node.harvesterhci.io/v1beta1
kind: CloudInit
metadata:
  name: iptables-control-plane
spec:
  matchSelector:
    node-role.kubernetes.io/control-plane: "true"
    node-role.kubernetes.io/etcd: "true"
  filename: 91-iptables-control-plane
  contents: |
    stages:
      boot:
        - name: "Apply iptables rules for control-plane node"
          commands:
            # Clean up any existing chain from a previous boot
            - iptables -D INPUT -i mgmt-br -j HARVESTER_INPUT 2>/dev/null || true
            - iptables -F HARVESTER_INPUT 2>/dev/null || true
            - iptables -X HARVESTER_INPUT 2>/dev/null || true
            # Create the chain and attach it
            - iptables -N HARVESTER_INPUT
            - iptables -A INPUT -i mgmt-br -j HARVESTER_INPUT
            # Allow established connections and ICMP
            - iptables -A HARVESTER_INPUT -m conntrack --ctstate ESTABLISHED,RELATED -m comment --comment "Accept return traffic from established connections" -j ACCEPT
            - iptables -A HARVESTER_INPUT -p icmp -m comment --comment "ICMP" -j ACCEPT
            - iptables -A HARVESTER_INPUT -s 10.52.0.0/16 -m comment --comment "Allow pod network return traffic" -j ACCEPT
            # ... role-specific ACCEPT rules ...
            # Log and drop everything else
            - iptables -A HARVESTER_INPUT -m limit --limit 10/min -m comment --comment "Rate-limit logging of dropped packets" -j LOG --log-prefix HARVESTER_DROP_ --log-level 4
            - iptables -A HARVESTER_INPUT -m comment --comment "Drop all other traffic" -j DROP
  paused: false
```

:::warning

After creating or updating a `CloudInit` resource, nodes must be **rebooted** for the changes to take effect. To apply rules immediately without rebooting, run the commands manually via SSH.

:::

### Remove the iptables Rules

1. Delete the `CloudInit` resource.
2. Run the following commands to remove the chain from the running system:

```sh
iptables -D INPUT -i mgmt-br -j HARVESTER_INPUT 2>/dev/null || true
iptables -F HARVESTER_INPUT 2>/dev/null || true
iptables -X HARVESTER_INPUT 2>/dev/null || true
```

## Role-Specific CloudInit Resources

Create a separate `CloudInit` resource for each node role present in your cluster. If you have not explicitly assigned a role in the Harvester configuration, the node defaults to control-plane and you can apply the control-plane example below.

:::warning

Ensure that the `spec.matchSelector` of each `CloudInit` resource is **mutually exclusive**. A node that matches more than one iptables-related `CloudInit` will have the chain created multiple times, resulting in duplicate rules and unpredictable behavior. Verify that no other iptables `CloudInit` resources in your cluster have overlapping selectors before applying these examples.

:::

:::note

The following examples include ports for the **kubeovn-operator** and **rancher-monitoring** addons. Remove the corresponding rules if you don't want. See [Port Requirements for Addons](../install/requirements.md#port-requirements-for-addons) for details.

:::

### Control-Plane Node

```yaml
apiVersion: node.harvesterhci.io/v1beta1
kind: CloudInit
metadata:
  name: iptables-control-plane
spec:
  matchSelector:
    node-role.kubernetes.io/control-plane: "true"
    node-role.kubernetes.io/etcd: "true"
  filename: 91-iptables-control-plane
  contents: |
    stages:
      boot:
        - name: "Apply iptables rules for control-plane node"
          commands:
            - iptables -D INPUT -i mgmt-br -j HARVESTER_INPUT 2>/dev/null || true
            - iptables -F HARVESTER_INPUT 2>/dev/null || true
            - iptables -X HARVESTER_INPUT 2>/dev/null || true
            - iptables -N HARVESTER_INPUT
            - iptables -A INPUT -i mgmt-br -j HARVESTER_INPUT
            - iptables -A HARVESTER_INPUT -m conntrack --ctstate ESTABLISHED,RELATED -m comment --comment "Accept return traffic from established connections" -j ACCEPT
            - iptables -A HARVESTER_INPUT -p icmp -m comment --comment "ICMP (ping, MTU discovery, etc.)" -j ACCEPT
            - iptables -A HARVESTER_INPUT -s 10.52.0.0/16 -m comment --comment "Allow pod network return traffic" -j ACCEPT
            - iptables -A HARVESTER_INPUT -p udp --sport 67 --dport 68 -m comment --comment "DHCP server reply" -j ACCEPT
            - iptables -A HARVESTER_INPUT -p udp --sport 68 --dport 67 -m comment --comment "DHCP client request" -j ACCEPT
            - iptables -A HARVESTER_INPUT -p tcp --dport 22 -m comment --comment "SSH" -j ACCEPT
            - iptables -A HARVESTER_INPUT -p tcp --dport 80 -m comment --comment "Harvester UI HTTP" -j ACCEPT
            - iptables -A HARVESTER_INPUT -p tcp --dport 443 -m comment --comment "Harvester UI HTTPS" -j ACCEPT
            - iptables -A HARVESTER_INPUT -p tcp --dport 2112 -m comment --comment "kube-vip Prometheus metrics" -j ACCEPT
            - iptables -A HARVESTER_INPUT -p tcp --dport 2379:2380 -m comment --comment "etcd client/peer" -j ACCEPT
            - iptables -A HARVESTER_INPUT -p tcp --dport 6443 -m comment --comment "Kubernetes API server" -j ACCEPT
            - iptables -A HARVESTER_INPUT -p tcp --dport 9091 -m comment --comment "calico-node metrics (Prometheus)" -j ACCEPT
            - iptables -A HARVESTER_INPUT -p tcp --dport 9345 -m comment --comment "RKE2 supervisor API" -j ACCEPT
            - iptables -A HARVESTER_INPUT -p tcp --dport 9796 -m comment --comment "Prometheus node-exporter metrics (rancher-monitoring)" -j ACCEPT
            - iptables -A HARVESTER_INPUT -p tcp --dport 10250 -m comment --comment "kubelet API" -j ACCEPT
            - iptables -A HARVESTER_INPUT -p tcp --dport 30000:32767 -m comment --comment "NodePort TCP range" -j ACCEPT
            - iptables -A HARVESTER_INPUT -p udp --dport 30000:32767 -m comment --comment "NodePort UDP range" -j ACCEPT
            - iptables -A HARVESTER_INPUT -p udp --dport 8472 -m comment --comment "VXLAN (Flannel/Canal)" -j ACCEPT
            - iptables -A HARVESTER_INPUT -p tcp --dport 8080 -m comment --comment "kube-ovn-webhook HTTP (kubeovn-operator)" -j ACCEPT
            - iptables -A HARVESTER_INPUT -p tcp --dport 8443 -m comment --comment "kube-ovn-webhook HTTPS (kubeovn-operator)" -j ACCEPT
            - iptables -A HARVESTER_INPUT -p tcp --dport 6641:6644 -m comment --comment "OVN NB/SB DB, Northd, and Raft (kubeovn-operator)" -j ACCEPT
            - iptables -A HARVESTER_INPUT -p tcp --dport 10661 -m comment --comment "kube-ovn-monitor metrics (kubeovn-operator)" -j ACCEPT
            - iptables -A HARVESTER_INPUT -p tcp --dport 10665 -m comment --comment "kube-ovn-daemon (kubeovn-operator)" -j ACCEPT
            - iptables -A HARVESTER_INPUT -p udp --dport 4789 -m comment --comment "VXLAN (Kube-OVN, kubeovn-operator)" -j ACCEPT
            - iptables -A HARVESTER_INPUT -m limit --limit 10/min -m comment --comment "Rate-limit logging of dropped packets" -j LOG --log-prefix HARVESTER_DROP_ --log-level 4
            - iptables -A HARVESTER_INPUT -m comment --comment "Drop all other traffic" -j DROP
  paused: false
```

### Worker Node

```yaml
apiVersion: node.harvesterhci.io/v1beta1
kind: CloudInit
metadata:
  name: iptables-worker
spec:
  matchSelector:
    node-role.harvesterhci.io/worker: "true"
  filename: 91-iptables-worker
  contents: |
    stages:
      boot:
        - name: "Apply iptables rules for worker node"
          commands:
            - iptables -D INPUT -i mgmt-br -j HARVESTER_INPUT 2>/dev/null || true
            - iptables -F HARVESTER_INPUT 2>/dev/null || true
            - iptables -X HARVESTER_INPUT 2>/dev/null || true
            - iptables -N HARVESTER_INPUT
            - iptables -A INPUT -i mgmt-br -j HARVESTER_INPUT
            - iptables -A HARVESTER_INPUT -m conntrack --ctstate ESTABLISHED,RELATED -m comment --comment "Accept return traffic from established connections" -j ACCEPT
            - iptables -A HARVESTER_INPUT -p icmp -m comment --comment "ICMP (ping, MTU discovery, etc.)" -j ACCEPT
            - iptables -A HARVESTER_INPUT -s 10.52.0.0/16 -m comment --comment "Allow pod network return traffic" -j ACCEPT
            - iptables -A HARVESTER_INPUT -p udp --sport 67 --dport 68 -m comment --comment "DHCP server reply" -j ACCEPT
            - iptables -A HARVESTER_INPUT -p udp --sport 68 --dport 67 -m comment --comment "DHCP client request" -j ACCEPT
            - iptables -A HARVESTER_INPUT -p tcp --dport 22 -m comment --comment "SSH" -j ACCEPT
            - iptables -A HARVESTER_INPUT -p tcp --dport 80 -m comment --comment "Harvester UI HTTP" -j ACCEPT
            - iptables -A HARVESTER_INPUT -p tcp --dport 443 -m comment --comment "Harvester UI HTTPS" -j ACCEPT
            - iptables -A HARVESTER_INPUT -p tcp --dport 9091 -m comment --comment "calico-node metrics (Prometheus)" -j ACCEPT
            - iptables -A HARVESTER_INPUT -p tcp --dport 9796 -m comment --comment "Prometheus node-exporter metrics (rancher-monitoring)" -j ACCEPT
            - iptables -A HARVESTER_INPUT -p tcp --dport 10250 -m comment --comment "kubelet API" -j ACCEPT
            - iptables -A HARVESTER_INPUT -p tcp --dport 30000:32767 -m comment --comment "NodePort TCP range" -j ACCEPT
            - iptables -A HARVESTER_INPUT -p udp --dport 30000:32767 -m comment --comment "NodePort UDP range" -j ACCEPT
            - iptables -A HARVESTER_INPUT -p udp --dport 8472 -m comment --comment "VXLAN (Flannel/Canal)" -j ACCEPT
            - iptables -A HARVESTER_INPUT -p tcp --dport 8080 -m comment --comment "kube-ovn-webhook HTTP (kubeovn-operator)" -j ACCEPT
            - iptables -A HARVESTER_INPUT -p tcp --dport 8443 -m comment --comment "kube-ovn-webhook HTTPS (kubeovn-operator)" -j ACCEPT
            - iptables -A HARVESTER_INPUT -p tcp --dport 10660 -m comment --comment "kube-ovn-controller (kubeovn-operator)" -j ACCEPT
            - iptables -A HARVESTER_INPUT -p tcp --dport 10665 -m comment --comment "kube-ovn-daemon (kubeovn-operator)" -j ACCEPT
            - iptables -A HARVESTER_INPUT -p udp --dport 4789 -m comment --comment "VXLAN (Kube-OVN, kubeovn-operator)" -j ACCEPT
            - iptables -A HARVESTER_INPUT -m limit --limit 10/min -m comment --comment "Rate-limit logging of dropped packets" -j LOG --log-prefix HARVESTER_DROP_ --log-level 4
            - iptables -A HARVESTER_INPUT -m comment --comment "Drop all other traffic" -j DROP
  paused: false
```

### Witness Node

```yaml
apiVersion: node.harvesterhci.io/v1beta1
kind: CloudInit
metadata:
  name: iptables-witness
spec:
  matchSelector:
    node-role.harvesterhci.io/witness: "true"
  filename: 91-iptables-witness
  contents: |
    stages:
      boot:
        - name: "Apply iptables rules for witness node"
          commands:
            - iptables -D INPUT -i mgmt-br -j HARVESTER_INPUT 2>/dev/null || true
            - iptables -F HARVESTER_INPUT 2>/dev/null || true
            - iptables -X HARVESTER_INPUT 2>/dev/null || true
            - iptables -N HARVESTER_INPUT
            - iptables -A INPUT -i mgmt-br -j HARVESTER_INPUT
            - iptables -A HARVESTER_INPUT -m conntrack --ctstate ESTABLISHED,RELATED -m comment --comment "Accept return traffic from established connections" -j ACCEPT
            - iptables -A HARVESTER_INPUT -p icmp -m comment --comment "ICMP (ping, MTU discovery, etc.)" -j ACCEPT
            - iptables -A HARVESTER_INPUT -s 10.52.0.0/16 -m comment --comment "Allow pod network return traffic" -j ACCEPT
            - iptables -A HARVESTER_INPUT -p udp --sport 67 --dport 68 -m comment --comment "DHCP server reply" -j ACCEPT
            - iptables -A HARVESTER_INPUT -p udp --sport 68 --dport 67 -m comment --comment "DHCP client request" -j ACCEPT
            - iptables -A HARVESTER_INPUT -p tcp --dport 22 -m comment --comment "SSH" -j ACCEPT
            - iptables -A HARVESTER_INPUT -p tcp --dport 2379:2380 -m comment --comment "etcd client/peer" -j ACCEPT
            - iptables -A HARVESTER_INPUT -p tcp --dport 9091 -m comment --comment "calico-node metrics (Prometheus)" -j ACCEPT
            - iptables -A HARVESTER_INPUT -p tcp --dport 9345 -m comment --comment "RKE2 supervisor API" -j ACCEPT
            - iptables -A HARVESTER_INPUT -p tcp --dport 9796 -m comment --comment "Prometheus node-exporter metrics (rancher-monitoring)" -j ACCEPT
            - iptables -A HARVESTER_INPUT -p tcp --dport 10250 -m comment --comment "kubelet API" -j ACCEPT
            - iptables -A HARVESTER_INPUT -p udp --dport 8472 -m comment --comment "VXLAN (Flannel/Canal)" -j ACCEPT
            - iptables -A HARVESTER_INPUT -p tcp --dport 10665 -m comment --comment "kube-ovn-daemon (kubeovn-operator)" -j ACCEPT
            - iptables -A HARVESTER_INPUT -p udp --dport 4789 -m comment --comment "VXLAN (Kube-OVN, kubeovn-operator)" -j ACCEPT
            - iptables -A HARVESTER_INPUT -m limit --limit 10/min -m comment --comment "Rate-limit logging of dropped packets" -j LOG --log-prefix HARVESTER_DROP_ --log-level 4
            - iptables -A HARVESTER_INPUT -m comment --comment "Drop all other traffic" -j DROP
  paused: false
```

## Upgrade

### False Positives During Upgrade

During an upgrade, Harvester restarts multiple components. Each restart clears conntrack state for the affected connections, causing return traffic to hit the DROP rule temporarily — the same false positive mechanism described in [False Positives](#false-positives), but repeating throughout the upgrade.

You might see entries like these:

```
May 05 04:40:28 harvester1 kernel: HARVESTER_DROP_IN=mgmt-br ... SRC=192.168.122.62 DST=192.168.122.61 ... PROTO=TCP SPT=10250 DPT=56266 ... ACK RST URGP=0
May 05 04:43:35 harvester2 kernel: HARVESTER_DROP_IN=mgmt-br ... SRC=192.168.122.61 DST=192.168.122.62 ... PROTO=TCP SPT=6443 DPT=43707 ... ACK URGP=0
```

Both entries are false positives:
- `SPT=10250 ACK RST` — kubelet restarted and reset an existing connection; the RST packet no longer has a conntrack state.
- `SPT=6443 ACK` — the API server restarted; return traffic from pre-restart connections lost conntrack state.

These entries may persist for the duration of the upgrade and stop once all components have stabilized. This is expected behavior and does not indicate missing rules.

If entries with `SYN` flags or unrecognized `DPT` values **persist after the upgrade completes**, a rule may be missing.

### Network Issues During Upgrade

If you still encounter network issues during the upgrade, refer to [Remove the iptables Rules](#remove-the-iptables-rules) to remove the chain before upgrading, and re-apply it after the upgrade completes.