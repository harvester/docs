---
sidebar_position: 14
sidebar_label: RWX Network
title: "RWX Network"
---

<head>
  <link rel="canonical" href="https://docs.harvesterhci.io/v1.8/advanced/rwxnetwork"/>
</head>

_Available as of v1.8.0_

Harvester uses Longhorn to provide ReadWriteMany (RWX) volumes for workloads that require shared filesystem access. By default, RWX traffic uses the Kubernetes cluster network. You can configure the [`rwx-network`](./settings.md#rwx-network) setting to either share it with the existing [storage network](./storagenetwork.md), or isolate RWX traffic on a dedicated network for better network bandwidth, performance, and security.

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
  }
}
```

To configure a _shared_ RWX network, set `share-store-network` to `true`. Setting this field to `false` with a non-empty `network` field enables a _dedicated_ RWX network.

The `network` field is only required when `share-storage-network` is `false`. If `share-storage-network` is `false` and no `network` is specified, RWX traffic uses the Kubernetes default cluster network. This is the default behavior when the `rwx-network` setting is not configured.

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

## Best Practices

- **Plan IP allocation carefully**: When configuring an IP range for the RWX network in dedicated mode, ensure that the allocated IP addresses can service the future needs of the cluster. The CSI plugin pods are deployed as a DaemonSet (one per node), so you need to account for future node additions.

- **Choose the appropriate mode**:
  - Use **share mode** if you want to consolidate storage-related traffic and simplify network management.
  - Use **dedicated mode** if you need different network characteristics (bandwidth, QoS, security policies) for RWX volumes compared to storage replication traffic.

- **Avoid mgmt cluster network**: Configure the RWX network on a non-`mgmt` cluster network to ensure complete separation from the Kubernetes control plane traffic. Using `mgmt` is possible but not recommended because of the negative impact (resource and bandwidth contention) on the control plane network performance.

- **Monitor network utilization**: After configuring the RWX network, monitor the network utilization to ensure adequate bandwidth for your RWX workloads.

- **Test before production**: Test the RWX network configuration in a non-production environment before applying it to production workloads.

- **Plan maintenance windows**: Changing the RWX network configuration requires restarting CSI plugin pods, which will temporarily disrupt operations that depend on the CSI plugin, including VM disk provisioning, volume attachment and detachment. Plan for appropriate maintenance windows.
