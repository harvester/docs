---
sidebar_position: 14
sidebar_label: RWX Network
title: "RWX Network"
---

<head>
  <link rel="canonical" href="https://docs.harvesterhci.io/v1.9/advanced/rwxnetwork"/>
</head>

_Available as of v1.8.0_

Harvester uses Longhorn to provide ReadWriteMany (RWX) volumes for workloads that require shared filesystem access. By default, RWX traffic uses the default Kubernetes pod network. You can configure the [`rwx-network`](./settings.md#rwx-network) setting to either share it with the existing [storage network](./storagenetwork.md), or isolate RWX traffic on a dedicated network for better network bandwidth, performance, and security. You can also reserve IP ranges on the RWX network to provide [stable NFS endpoints](#stable-nfs-endpoints-for-rwx-volumes) for RWX volumes.

:::note

- Avoid configuring Longhorn settings directly, as this can result in unexpected or unwanted system behavior.

:::

## Prerequisites

Before you begin configuring the RWX network, ensure that the following requirements are met:

- The [cluster network](../networking/clusternetwork.md) and [VLAN network](../networking/harvester-network.md#vlan-network) are configured correctly. Ensure that both networks cover all nodes and are accessible.

- If using **share mode** (`share-storage-network: true`), the [storage network](./storagenetwork.md) must be configured first.

  When share mode is enabled, the `longhorn-csi-plugin` and `share-manager` pods also use the storage network and consume IPs from its range. Ensure the storage network IP range accounts for these additional pods. For details, see the [storage network prerequisites](./storagenetwork.md#prerequisites).

- If using **dedicated mode** (`share-storage-network: false` and `network` set), the IP range of the RWX network has the following characteristics:

  - Uses the IPv4 CIDR format

  - Does not conflict or overlap with Kubernetes cluster networks, storage network, or VM migration network

    The following addresses are reserved: `10.42.0.0/16`, `10.43.0.0/16`, `10.52.0.0/16`, and `10.53.0.0/16`.

  - Covers the requirements of the cluster

    The following pods use the RWX network and each require one IP address:

    - `longhorn-csi-plugin` pods: One pod per node (DaemonSet), always present.
    - `share-manager` pods: One pod per active RWX volume, created on demand.

    The required number of IP addresses is calculated using the following formula: `Required number of IPs = Number of nodes + 32`, where 32 is an arbitrary buffer to accommodate current and future `share-manager` pods.

    Example: If a cluster has five nodes, the IP range should be greater than or equal to `/26` (calculation: 5 + 32 = 37).

  - Excludes IP addresses that RWX network components must not use, such as addresses reserved for the gateway and other components.

  :::caution

  During a cluster upgrade, ensure the RWX network IP range has sufficient headroom. Mounted RWX volumes hold their allocated IPs throughout the upgrade, and the upgrade repository deployment uses a Longhorn RWX volume, occupying one additional IP. IP exhaustion during an upgrade can cause it to stall.

  :::

- All non-migratable RWX volumes are detached.

  You can check the status of RWX volumes using the command:
  
  ```bash
  kubectl get volumes.longhorn.io -n longhorn-system -o json | jq '.items[] | select(.spec.accessMode == "rwx" and .spec.migratable == false) | {name: .metadata.name, state: .status.state}'
  ```

## `rwx-network` Setting

The [`rwx-network`](./settings.md#rwx-network) setting allows you to configure the network used to isolate RWX volume traffic when segregation is required.

You can [enable](#enable-the-rwx-network) and [disable](#disable-the-rwx-network) the RWX network using either the UI or the CLI. The setting value is represented by a JSON object with the following structure:

```json
{
  "share-storage-network": true|false,
  "network": {
    "vlan": <vlan-id>,
    "clusterNetwork": "<cluster-network-name>",
    "range": "<cidr-range>",
    "exclude": ["<excluded-ip-or-range>"]
  },
  "hostIPRange": "<cidr-range>",
  "vipRange": "<cidr-range>"
}
```

The `hostIPRange` and `vipRange` fields are optional. For more information, see [Stable NFS Endpoints for RWX Volumes](#stable-nfs-endpoints-for-rwx-volumes).

To configure a _shared_ RWX network, set `share-storage-network` to `true`. Setting this field to `false` with a non-empty `network` field enables a _dedicated_ RWX network.

The `network` field is only required when `share-storage-network` is `false`. If `share-storage-network` is `false` and no `network` is specified, RWX traffic uses the Kubernetes default pod network. This is the default behavior when the `rwx-network` setting is not configured.

The following occur once the `rwx-network` setting is applied:

- Harvester creates or updates the NetworkAttachmentDefinition for RWX traffic.
- Harvester updates the Longhorn `endpoint-network-for-rwx-volume` setting.
- Longhorn restarts all `longhorn-csi-plugin` pods to apply the new network configuration.

### Configuration Steps

<Tabs>
<TabItem value="ui" label="UI" default>

:::tip

Using the Harvester UI to configure the `rwx-network` setting is strongly recommended.

:::

#### Enable the RWX Network

1. Go to **Advanced > Settings > rwx-network**.

1. Select the desired mode:
   - **Share Storage Network**: Select this option to reuse the storage network configuration. No additional fields are required.
   - **Dedicated Network**: Select this option to configure a separate network for RWX traffic.

1. If using **Dedicated Network** mode, configure the following fields to construct a Multus `NetworkAttachmentDefinition` CRD:
   - **VLAN ID**: (Optional) The VLAN ID for RWX network traffic
   - **Cluster Network**: The cluster network to use (must be pre-configured)
   - **IP Range**: The IPv4 CIDR range for RWX network IPs
   - **Exclude**: (Optional) IP addresses or ranges to exclude from allocation

1. Click **Save**.

#### Disable the RWX Network

1. Go to **Advanced > Settings > rwx-network**.

1. Select **Disabled** or reset to the default value.

1. Click **Save**.

Once the RWX network is disabled, Longhorn starts using the Kubernetes cluster network for RWX volume operations.

</TabItem>
<TabItem value="cli" label="CLI">

You can use the following command to configure the [`rwx-network`](./settings.md#rwx-network) setting.

```bash
kubectl edit settings.harvesterhci.io rwx-network
```

#### Enable Share Storage Network Mode

```yaml
apiVersion: harvesterhci.io/v1beta1
default: '{"share-storage-network":false}'
kind: Setting
metadata:
  name: rwx-network
value: '{"share-storage-network":true}'
```

#### Enable Dedicated Network Mode

```yaml
apiVersion: harvesterhci.io/v1beta1
default: '{"share-storage-network":false}'
kind: Setting
metadata:
  name: rwx-network
value: '{"share-storage-network":false,"network":{"vlan":200,"clusterNetwork":"rwx","range":"192.168.1.0/24","exclude":["192.168.1.1/32","192.168.1.254/32"]}}'
```

#### Disable the RWX Network

Remove the `value` field or set it to the default:

```yaml
apiVersion: harvesterhci.io/v1beta1
default: '{"share-storage-network":false}'
kind: Setting
metadata:
  name: rwx-network
value: '{"share-storage-network":false}'
```

</TabItem>
</Tabs>

### Post-Configuration Steps

:::info important

After configuring the RWX network, verify that the configuration is correct and applied successfully before resuming RWX workloads.

:::

1. Verify that the `rwx-network` setting's status is `True` and the type is `configured` using the following command:

    ```bash
    kubectl get settings.harvesterhci.io rwx-network -o yaml
    ```

    Example:

    ```yaml
    apiVersion: harvesterhci.io/v1beta1
    default: '{"share-storage-network":false}'
    kind: Setting
    metadata:
    annotations:
        rwx-network.settings.harvesterhci.io/hash: cc5102f8a0442e4e6d7e13923482f6594333b498
        rwx-network.settings.harvesterhci.io/initialized: "true"
        rwx-network.settings.harvesterhci.io/net-attach-def: harvester-system/rwx-network-976r9
        rwx-network.settings.harvesterhci.io/old-net-attach-def: ""
    creationTimestamp: "2026-03-20T01:48:26Z"
    generation: 6
    name: rwx-network
    resourceVersion: "1280504"
    uid: 5f934df5-b483-403c-af43-c1f1ec146db4
    status:
    conditions:
    - lastUpdateTime: "2026-03-20T01:58:25Z"
        reason: Completed
        status: "True"
        type: configured
    value: '{"share-storage-network":false,"network":{"clusterNetwork":"rwx","range":"192.168.201.0/24","exclude":["192.168.201.1/32"]}}'
    ```

2. Verify that the Longhorn CSI plugin pods are ready and that their networks are correctly configured.

    You can list the Longhorn CSI plugin pods using the following command:

    ```bash
    kubectl get pods -n longhorn-system -l app=longhorn-csi-plugin
    ```

    Inspect each pod to verify the network configuration:

    ```bash
    kubectl -n longhorn-system describe pod <pod-name>
    ```

    Errors similar to the following indicate that the RWX network has exhausted its available IP addresses. You must reconfigure the RWX network with a sufficient IP range.

    ```bash
    Events:
      Type     Reason                  Age                    From     Message
      ----     ------                  ----                   ----     -------
      Warning  FailedCreatePodSandBox  2m58s                  kubelet  Failed to create pod sandbox: rpc error: code = Unknown desc = failed to setup network for sandbox "xyz123": plugin type="multus" name="multus-cni-network" failed (add): error adding container to network "rwx-network-abc123": error at storage engine: Could not allocate IP in range
    ```

3. Verify that an interface named `lhnet2` exists in the `k8s.v1.cni.cncf.io/network-status` annotations. The IP address of this interface must be within the designated IP range.

    You can retrieve a list of Longhorn CSI plugin pods with network details using the following command:

    ```bash
    kubectl get pods -n longhorn-system -l app=longhorn-csi-plugin -o jsonpath='{range .items[*]}{.metadata.name}{"\t"}{.metadata.annotations.k8s\.v1\.cni\.cncf\.io/network-status}{"\n"}{end}'
    ```

    Verify that each pod has an interface with the expected IP address from your RWX network range.

    Example:
    ```
    longhorn-csi-plugin-x8pxs	[{
        "name": "k8s-pod-network",
        "interface": "eth0",
        "ips": [
            "10.52.0.59"
        ],
        "mac": "b2:7d:99:bc:d5:dd",
        "default": true,
        "dns": {}
    },{
        "name": "harvester-system/rwx-network-qb6zp",
        "interface": "lhnet2",
        "ips": [
            "192.168.201.2"
        ],
        "mac": "ea:9f:a0:48:62:b6",
        "dns": {}
    }]
    ```

4. Create a test RWX workload to verify end-to-end functionality.

    If you do not already have an RWX StorageClass, create one first:

    ```yaml
    kind: StorageClass
    apiVersion: storage.k8s.io/v1
    metadata:
      name: longhorn-rwx
    provisioner: driver.longhorn.io
    allowVolumeExpansion: true
    reclaimPolicy: Delete
    volumeBindingMode: Immediate
    parameters:
      numberOfReplicas: "3"
      staleReplicaTimeout: "2880"
      fromBackup: ""
      fsType: "ext4"
      nfsOptions: "vers=4.2,noresvport,softerr,timeo=600,retrans=5"
    ```

    Then apply the following manifest to create a temporary PVC and pod:

    ```yaml
    apiVersion: v1
    kind: PersistentVolumeClaim
    metadata:
      name: rwx-test-pvc
    spec:
      accessModes:
        - ReadWriteMany
      resources:
        requests:
          storage: 1Gi
      storageClassName: longhorn-rwx
    ---
    apiVersion: v1
    kind: Pod
    metadata:
      name: rwx-test-pod
    spec:
      containers:
        - name: test
          image: busybox
          command: ["sh", "-c", "echo RWX OK > /data/test.txt && cat /data/test.txt && sleep 3600"]
          volumeMounts:
            - name: data
              mountPath: /data
      volumes:
        - name: data
          persistentVolumeClaim:
            claimName: rwx-test-pvc
    ```

    Verify the pod reaches `Running` state and the volume is mounted successfully:

    ```bash
    kubectl get pod rwx-test-pod
    kubectl logs rwx-test-pod
    ```

    A log output of `RWX OK` confirms that the RWX network is functioning correctly. Clean up the test resources when done:

    ```bash
    kubectl delete pod rwx-test-pod
    kubectl delete pvc rwx-test-pvc
    ```

Once the configuration is verified, RWX volumes can be used by workloads.

## Stable NFS Endpoints for RWX Volumes

_Available as of v1.10.0_

Each non-migratable RWX volume is served over NFS by a Longhorn `share-manager` pod. When that pod is recreated (for example, after a node failure or a volume reattachment), it can get a different IP address on the RWX network. NFS clients inside guest VMs that mount the volume by the pod's address then lose access to the share.

You can avoid this by setting two optional fields of the `rwx-network` setting:

- `hostIPRange`: Harvester gives each non-witness node a stable IP address from this range on the RWX network. The addresses are configured on the `<clusterNetwork>-br.<vlan>` interface of each node through a Harvester-managed [HostNetworkConfig](../networking/hostnetworkconfig.md) named `rwx-network`.
- `vipRange`: Harvester gives each non-migratable RWX volume a stable virtual IP (VIP) from this range. For each volume, Harvester creates a selectorless `LoadBalancer` Service named `rwx-vip-<volume>` in the `longhorn-system` namespace, and kube-vip announces the VIP on the `<clusterNetwork>-br.<vlan>` interface. An EndpointSlice follows the address of the volume's `share-manager` pod, so the VIP keeps pointing to the current pod after it is recreated. When a new `share-manager` pod starts, Harvester also sends gratuitous ARP for the pod's address so that hosts and pods on the RWX network update their neighbor entries.

Guest VMs that mount an RWX volume through its VIP keep their NFS mounts when the `share-manager` pod is recreated.

Both fields work with share mode and dedicated mode. Harvester adds both ranges to the exclude list of the NetworkAttachmentDefinition that carries RWX traffic (the storage network NAD in share mode), so Whereabouts does not assign addresses from these ranges to pods. These Harvester-managed exclude entries are kept separate from the `exclude` entries that you configure.

### Requirements

Before you configure `hostIPRange` and `vipRange`, ensure that the following requirements are met:

- The RWX network is configured in [share mode](#enable-share-storage-network-mode) or [dedicated mode](#enable-dedicated-network-mode).
- The network that carries RWX traffic (the storage network in share mode) uses a VLAN ID from `1` to `4094`. Untagged networks (VLAN ID `0`) are not supported.
- The host interface name `<clusterNetwork>-br.<vlan>` does not exceed the Linux limit of 15 characters. Use a short cluster network name.
- No other HostNetworkConfig configures the same cluster network and VLAN, and no HostNetworkConfig named `rwx-network` exists.
- `hostIPRange` and `vipRange` are both set. Setting both enables stable NFS endpoints. If neither `hostIPRange` nor `vipRange` is set, the `rwx-network` setting behaves as in earlier releases. Setting only one of them is rejected.

### Sizing the Ranges

Both fields use the IPv4 CIDR format (for example, `192.168.100.240/29`). Every address in the CIDR, including the first and the last, can be assigned.

#### `hostIPRange`

`hostIPRange` must contain at least one address per non-witness node. Witness nodes do not get a host address.

The webhook checks this only when you update the setting. It does not run again when nodes join the cluster, so reserve enough addresses for the nodes that you plan to add later. Changing the range later requires the [remove-and-reapply procedure](#change-the-ranges), which interrupts RWX connectivity.

Example: A cluster with five nodes that might grow to eight nodes requires at least eight addresses, so a `/29` range is sufficient.

#### `vipRange`

Each non-migratable RWX volume consumes one VIP for as long as the volume exists. Migratable RWX volumes (used for VM live migration) do not consume VIPs.

`vipRange` has no fixed upper limit, but it is subject to the following constraints:

- It must be within the network `range`.
- It must not overlap `hostIPRange` or your `exclude` entries.
- After `hostIPRange` and `vipRange` are excluded, the remaining addresses must still cover the `longhorn-csi-plugin` pods (one per node) and the `share-manager` pods. The webhook rejects ranges that leave too few addresses, using the same formula as in the [prerequisites](#prerequisites). In share mode, the remaining storage network addresses must also cover the [storage network requirements](./storagenetwork.md#prerequisites).

If `vipRange` is exhausted, new RWX volumes do not get a VIP, and Harvester records a `VIPRangeExhausted` Warning event on the Longhorn volume.

### Validation Rules

When you set `hostIPRange` and `vipRange`, the webhook checks that the ranges meet the following requirements:

- Both fields are set together.
- Both are IPv4 subnet CIDRs. A CIDR with host bits set (for example, `192.168.100.241/29`) is rejected.
- Both are within the network `range`.
- Neither includes the network address or the broadcast address of the network `range`.
- They do not overlap each other or any `exclude` entry.
- They do not contain addresses that Whereabouts has already allocated to pods. For more information, see [Addresses already in use](#addresses-already-in-use).
- `hostIPRange` contains at least as many addresses as there are non-witness nodes.
- The network uses a VLAN ID from `1` to `4094`, and the host interface name `<clusterNetwork>-br.<vlan>` does not exceed 15 characters.
- No user-managed HostNetworkConfig configures the same cluster network and VLAN, and no HostNetworkConfig named `rwx-network` exists that is not managed by Harvester.

### Enable Stable NFS Endpoints

1. Ensure that the [requirements](#requirements) are met.

1. Add `hostIPRange` and `vipRange` to the existing value of the `rwx-network` setting using the following command:

    ```bash
    kubectl edit settings.harvesterhci.io rwx-network
    ```

    Example (dedicated mode):

    ```yaml
    apiVersion: harvesterhci.io/v1beta1
    default: '{"share-storage-network":false}'
    kind: Setting
    metadata:
      name: rwx-network
    value: '{"share-storage-network":false,"network":{"clusterNetwork":"rwx","vlan":100,"range":"192.168.100.0/24","exclude":["192.168.100.1/32","192.168.100.16/28"]},"hostIPRange":"192.168.100.240/29","vipRange":"192.168.100.224/28"}'
    ```

    In this example, the nodes get addresses from `192.168.100.240` to `192.168.100.247`, the RWX volumes get VIPs from `192.168.100.224` to `192.168.100.239`, and Whereabouts assigns pod addresses from the rest of `192.168.100.0/24`.

1. [Verify the configuration](#verify-the-configuration).

Harvester assigns VIPs only after every node in the managed HostNetworkConfig has its host address configured.

### Verify the Configuration

:::info important

After setting `hostIPRange` and `vipRange`, verify that the configuration is correct and applied successfully before mounting RWX volumes through their VIPs.

:::

1. Verify that the `rwx-network` setting's `hostIPsAssigned` condition is `True` using the following command:

    ```bash
    kubectl get settings.harvesterhci.io rwx-network -o yaml
    ```

    Example:

    ```yaml
    status:
      conditions:
      - lastUpdateTime: "2026-11-10T03:12:45Z"
        status: "True"
        type: hostIPsAssigned
    ```

    If the status is `False`, see [Troubleshooting](#troubleshooting).

2. Verify that the managed HostNetworkConfig exists and assigns an address to each non-witness node using the following command:

    ```bash
    kubectl get hostnetworkconfigs rwx-network -o yaml
    ```

    The `spec.hostIPs` field lists the address of each node.

3. Verify that the host interface on each node has its address using the following command:

    ```bash
    ip addr show <clusterNetwork>-br.<vlan>
    ```

    Example: `ip addr show rwx-br.100`. The interface also shows the VIPs that kube-vip announces when the node is the kube-vip leader.

4. Retrieve the VIP of an RWX volume using the following commands. The VIP is the value of `spec.loadBalancerIP`.

    ```bash
    VOL=$(kubectl get pvc <pvc-name> -n <namespace> -o jsonpath='{.spec.volumeName}')
    kubectl -n longhorn-system get svc -l harvesterhci.io/rwx-vol-service="$VOL" -o yaml
    ```

5. Mount the volume through its VIP from a guest VM on the RWX network using the following command:

    ```bash
    mount -t nfs4 -o vers=4.1 <VIP>:/<VOL> /mnt
    ```

    `<VOL>` is the Longhorn volume name from the previous step.

### Node Addition and Removal

- **Joining nodes**: When a non-witness node joins the cluster and the cluster network spans it, Harvester assigns it the lowest free address in `hostIPRange`. Nodes that already have an address keep it.

  If `hostIPRange` has no free address, the joining node does not get a host address. The `hostIPsAssigned` condition of the setting changes to `False` with the reason `HostIPRangeExhausted`, and Harvester records a Warning event on the setting. Because the webhook does not run when nodes join, this is the only indication of exhaustion. To resolve the issue, [change the ranges](#change-the-ranges) to a larger `hostIPRange`.

- **Removed nodes**: When a node is removed, its host address is released and can be assigned to a node that joins later.

- **VIPs**: VIPs are not tied to a node. kube-vip runs with Service election disabled, so a single leader among the control plane nodes announces all RWX VIPs on its `<clusterNetwork>-br.<vlan>` interface. If the leader node fails or is removed, another control plane node becomes the leader and announces the VIPs.

### Change the Ranges

While `hostIPRange` and `vipRange` are set, the following restrictions apply:

- The only allowed change to the `rwx-network` setting is removing both `hostIPRange` and `vipRange`. Other changes, including changes to the ranges themselves, are rejected.
- In share mode, the `storage-network` setting cannot be changed.

Harvester never rebuilds the managed HostNetworkConfig in place. Removing the host interface also removes every VIP that kube-vip announces on it, and kube-vip does not recover those VIPs when the interface is recreated. Therefore, the HostNetworkConfig is only created or deleted.

To change the ranges, the RWX network configuration, or (in share mode) the storage network, perform the following steps:

1. Edit the `rwx-network` setting and remove `hostIPRange` and `vipRange` from the value.

1. Wait for the teardown to complete. Harvester performs the following actions:

    - Deletes every `rwx-vip-<volume>` Service and its EndpointSlice.
    - Deletes the managed `rwx-network` HostNetworkConfig, which removes the host addresses from the nodes.
    - Releases the Harvester-managed exclude entries from the NetworkAttachmentDefinition, but only after the HostNetworkConfig is deleted.

    The teardown is complete when the HostNetworkConfig no longer exists and the `hostIPsAssigned` condition is removed from the setting. You can check both using the following commands:

    ```bash
    kubectl get hostnetworkconfigs rwx-network
    kubectl get settings.harvesterhci.io rwx-network -o yaml
    ```

    :::caution

    Do not set new `hostIPRange` and `vipRange` values until the teardown is complete. If you set them earlier, the old HostNetworkConfig can remain in place and the `hostIPsAssigned` condition can change to `False` with the reason `HostNetworkConfigMismatch`. To recover, remove both ranges again and wait for the teardown to complete.

    :::

1. (Optional) Change the RWX network or the storage network.

1. Edit the `rwx-network` setting and add the new `hostIPRange` and `vipRange` values.

:::caution

Between removing and setting the ranges again, guest NFS mounts that use a VIP lose connectivity. After the ranges are set again, a volume may get a different VIP, so guests might need to unmount and mount the volume again using the new VIP. Plan a maintenance window and verify the VIP of each volume before you remount.

:::

### Troubleshooting

The `hostIPsAssigned` condition of the `rwx-network` setting reports problems with the host network. Whenever the condition changes to `False` with a new message, Harvester also records a Warning event on the setting.

You can view the condition and the events using the following commands:

```bash
kubectl get settings.harvesterhci.io rwx-network -o yaml
kubectl get events -A --field-selector involvedObject.kind=Setting,involvedObject.name=rwx-network
```

#### Addresses Already in Use

Reason: `AddressInUse`

The webhook rejects ranges that contain addresses already allocated by Whereabouts, but this check is best effort. The webhook reads a cached snapshot of the Whereabouts IP pool, and a pod can get an address from the ranges after that check and before Harvester adds the ranges to the NetworkAttachmentDefinition exclude list. A successful setting update therefore does not guarantee that the ranges are free.

When Harvester detects such addresses, it does not configure the host network. The condition message lists each address and the pod that holds it, in the format `address (namespace/pod)`.

Example:

```yaml
status:
  conditions:
  - lastUpdateTime: "2026-11-10T03:12:45Z"
    message: 'address(es) in hostIPRange or vipRange still allocated: 192.168.100.230 (longhorn-system/<pod-name>)'
    reason: AddressInUse
    status: "False"
    type: hostIPsAssigned
```

To resolve the issue, perform the following steps:

1. Identify the pods listed in the condition message or in the Warning events.

1. Recreate those pods. For example, delete a `longhorn-csi-plugin` pod so that its DaemonSet recreates it. Because the exclude entries are already applied, the recreated pods get addresses outside the reserved ranges.

Once Whereabouts releases the addresses, Harvester continues the configuration automatically.

#### HostNetworkConfig Conflict

Reason: `HostNetworkConfigConflict`

A HostNetworkConfig named `rwx-network` exists, but it was not created by Harvester. Remove that HostNetworkConfig to continue. Harvester then creates its own.

#### HostNetworkConfig Mismatch

Reason: `HostNetworkConfigMismatch`

The managed HostNetworkConfig can no longer be updated in place to match the setting. Remove `hostIPRange` and `vipRange`, wait for the teardown, and then set them again. For more information, see [Change the Ranges](#change-the-ranges).

#### Host IP Range Exhausted

Reason: `HostIPRangeExhausted`

One or more nodes did not get an address because `hostIPRange` is full. The message lists the affected nodes. For more information, see [Node Addition and Removal](#node-addition-and-removal).

### Limitations

- The managed HostNetworkConfig is only created or deleted, never rebuilt in place, because kube-vip does not recover VIPs after the host interface is removed. Changing the ranges or the underlying network requires the [remove-and-reapply procedure](#change-the-ranges).
- `hostIPRange` and `vipRange` support IPv4 only.
- A VLAN ID from `1` to `4094` is required. An untagged storage network or RWX network cannot use these fields.

## Best Practices

- **Plan IP allocation carefully**: When configuring an IP range for the RWX network in dedicated mode, ensure that the allocated IP addresses can service the future needs of the cluster. The CSI plugin pods are deployed as a DaemonSet (one per node), so you need to account for future node additions.

- **Choose the appropriate mode**:
  - Use **share mode** if you want to consolidate storage-related traffic and simplify network management.
  - Use **dedicated mode** if you need different network characteristics (bandwidth, QoS, security policies) for RWX volumes compared to storage replication traffic.

- **Avoid mgmt cluster network**: Configure the RWX network on a non-`mgmt` cluster network to ensure complete separation from the Kubernetes control plane traffic. Using `mgmt` is possible but not recommended because of the negative impact (resource and bandwidth contention) on the control plane network performance.

- **Monitor network utilization**: After configuring the RWX network, monitor the network utilization to ensure adequate bandwidth for your RWX workloads.

- **Test before production**: Test the RWX network configuration in a non-production environment before applying it to production workloads.

- **Mount RWX volumes through their VIPs**: When `hostIPRange` and `vipRange` are set, configure guest VMs to mount RWX volumes using the VIP instead of the `share-manager` pod address, so that the mounts survive `share-manager` pod recreation.

- **Size `hostIPRange` for growth**: The webhook does not revalidate `hostIPRange` when nodes join the cluster, and changing the range later interrupts RWX connectivity. Reserve enough addresses for future node additions.

- **Plan maintenance windows**: Changing the RWX network configuration requires restarting CSI plugin pods, which will temporarily disrupt operations that depend on the CSI plugin, including VM disk provisioning, volume attachment and detachment. Plan for appropriate maintenance windows.
