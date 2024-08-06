---
sidebar_position: 6
sidebar_label: Host
title: "Host"
---

<head>
  <link rel="canonical" href="https://docs.harvesterhci.io/v1.3/troubleshooting/host"/>
</head>

## Node in Maintenance Mode Becomes Stuck in Cordoned State

When you enable `Maintenance Mode` on a node using the Harvester UI, the node becomes stuck in the `Cordoned` state and the menu shows the **Enable Maintenance Mode** option instead of **Disable Maintenance Mode**.

![node-stuck-cordoned.png](/img/v1.3/troubleshooting/node-stuck-cordoned.png)

The Harvester pod logs contain messages similar to the following:

```
time="2024-08-05T19:03:02Z" level=info msg="evicting pod longhorn-system/instance-manager-68cd2514dd3f6d59b95cbd865d5b08f7"
time="2024-08-05T19:03:02Z" level=info msg="error when evicting pods/\"instance-manager-68cd2514dd3f6d59b95cbd865d5b08f7\" -n \"longhorn-system\" (will retry after 5s): Cannot evict pod as it would violate the pod's disruption budget."

time="2024-08-05T19:03:07Z" level=info msg="evicting pod longhorn-system/instance-manager-68cd2514dd3f6d59b95cbd865d5b08f7"
time="2024-08-05T19:03:07Z" level=info msg="error when evicting pods/\"instance-manager-68cd2514dd3f6d59b95cbd865d5b08f7\" -n \"longhorn-system\" (will retry after 5s): Cannot evict pod as it would violate the pod's disruption budget."

time="2024-08-05T19:03:12Z" level=info msg="evicting pod longhorn-system/instance-manager-68cd2514dd3f6d59b95cbd865d5b08f7"
time="2024-08-05T19:03:12Z" level=info msg="error when evicting pods/\"instance-manager-68cd2514dd3f6d59b95cbd865d5b08f7\" -n \"longhorn-system\" (will retry after 5s): Cannot evict pod as it would violate the pod's disruption budget."
```

The Longhorn Instance Manager uses a PodDisruptionBudget (PDB) to protect itself from accidental eviction, which results in loss of volume data. When the above error occurs, it indicates that the `instance-manager` pod is still serving volumes or replicas.

The following sections describe the known causes and their corresponding workarounds.

### Manually Attached Volumes

A volume that is attached to a node using the [embedded Longhorn UI](./harvester.md#access-embedded-rancher-and-longhorn-dashboards) can cause the error. This is because the object is attached to a node name instead of the pod name.

You can check it from the [Embedded Longhorn UI](./harvester.md#access-embedded-rancher-and-longhorn-dashboards).

![attached-volume.png](/img/v1.3/troubleshooting/attached-volume.png)

The manually attached object is attached to a node name instead of the pod name.

You can also use the CLI to retrieve the details of the CRD object `VolumeAttachment`.

Example of a volume that was attached using the Longhorn UI:

```
- apiVersion: longhorn.io/v1beta2
  kind: VolumeAttachment
...
  spec:
    attachmentTickets:
      longhorn-ui:
        id: longhorn-ui
        nodeID: node-name
...
    volume: pvc-9b35136c-f59e-414b-aa55-b84b9b21ff89
```

Example of a volume that was attached using the Longhorn CSI driver:

```
- apiVersion: longhorn.io/v1beta2
  kind: VolumeAttachment
  spec:
    attachmentTickets:
      csi-b5097155cddde50b4683b0e659923e379cbfc3873b5b2ee776deb3874102e9bf:
        id: csi-b5097155cddde50b4683b0e659923e379cbfc3873b5b2ee776deb3874102e9bf
        nodeID: node-name
...
    volume: pvc-3c6403cd-f1cd-4b84-9b46-162f746b9667
```

:::note

Manually attaching a volume to the node is not recommended.

Harvester automatically attaches/detaches volumes based on operations like creating or migrating VM.

:::

#### Workaround 1: Set `Detach Manually Attached Volumes When Cordoned` to `True`

The Longhorn setting [Detach Manually Attached Volumes When Cordoned](https://longhorn.io/docs/1.6.0/references/settings/#detach-manually-attached-volumes-when-cordoned) blocks node draining when there are volumes manually attached to the node.

The default value of this setting depends on the embedded Longhorn version:

| Harvester version | Embedded Longhorn version | Default value |
| --- | --- | --- |
| v1.3.1 | v1.6.0 | `true` |
| v1.4.0 | v1.7.0 | `false` |

Set this option to `true` from the [embedded Longhorn UI](./harvester.md#access-embedded-rancher-and-longhorn-dashboards).

#### Workaround 2: Manually Detach the Volume

Detach the volume using the [embedded Longhorn UI](./harvester.md#access-embedded-rancher-and-longhorn-dashboards).

![detached-volume.png](/img/v1.3/troubleshooting/detached-volume.png)

Once the volume is detached, you can successfully enable `Maintenance Mode` on the node.

![node-enter-maintenance-mode.png](/img/v1.3/troubleshooting/node-enter-maintenance-mode.png)

### Single-Replica Volumes

Harvester allows you to create customized `StorageClasses` that describe how Longhorn must provision volumes. If necessary, you can create a `StorageClass` with the [Number of Replicas](../advanced/storageclass.md#number-of-replicas) parameter set to `1`.

When a volume is created using such a `StorageClass` and is attached to a node using the CSI driver or other methods, the single replica stays on that node even after the volume is detached.

You can check this using the CRD object `Volume`.

```
- apiVersion: longhorn.io/v1beta2
  kind: Volume
...
  spec:
...
    numberOfReplicas: 1  // the replica number
...
  status:
...
    ownerID: nodeName
...
    state: attached
```

#### Workaround: Set `Node Drain Policy`

The Longhorn [Node Drain Policy](https://longhorn.io/docs/1.6.0/references/settings/#node-drain-policy) is set to `block-if-contains-last-replica` by default. This option forces Longhorn to block node draining when the node contains the last healthy replica of a volume.

To address the issue, change the value to `allow-if-replica-is-stopped` using the [embedded Longhorn UI](./harvester.md#access-embedded-rancher-and-longhorn-dashboards).

:::info important

If you plan to remove the node after `Maintenance Mode` is enabled, backup those single-replica volumes or redeploy the related workloads to other nodes in advance so that the volumes are scheduled to other nodes.

:::

Starting with Harvester v1.4.0, the `Node Drain Policy` is set to `allow-if-replica-is-stopped` by default.
