---
sidebar_position: 6
sidebar_label: Host
title: "Host"
---

<head>
  <link rel="canonical" href="https://docs.harvesterhci.io/v1.3/troubleshooting/host"/>
</head>

## An enable-maintenance-mode Node Stucks on Cordoned State

After you click the **Enable Maintenance Mode** menu upon one Harvester host, the target host stucks on `Cordoned` state, and the **Enable Maintenance Mode** menu is available again, the expected menu **Disable Maintenance Mode** is not available.

![node-stuck-cordoned.png](/img/v1.3/troubleshooting/node-stuck-cordoned.png)

When you check the Harvester pod log, there are repeated messages like:

```
time="2024-08-05T19:03:02Z" level=info msg="evicting pod longhorn-system/instance-manager-68cd2514dd3f6d59b95cbd865d5b08f7"
time="2024-08-05T19:03:02Z" level=info msg="error when evicting pods/\"instance-manager-68cd2514dd3f6d59b95cbd865d5b08f7\" -n \"longhorn-system\" (will retry after 5s): Cannot evict pod as it would violate the pod's disruption budget."

time="2024-08-05T19:03:07Z" level=info msg="evicting pod longhorn-system/instance-manager-68cd2514dd3f6d59b95cbd865d5b08f7"
time="2024-08-05T19:03:07Z" level=info msg="error when evicting pods/\"instance-manager-68cd2514dd3f6d59b95cbd865d5b08f7\" -n \"longhorn-system\" (will retry after 5s): Cannot evict pod as it would violate the pod's disruption budget."

time="2024-08-05T19:03:12Z" level=info msg="evicting pod longhorn-system/instance-manager-68cd2514dd3f6d59b95cbd865d5b08f7"
time="2024-08-05T19:03:12Z" level=info msg="error when evicting pods/\"instance-manager-68cd2514dd3f6d59b95cbd865d5b08f7\" -n \"longhorn-system\" (will retry after 5s): Cannot evict pod as it would violate the pod's disruption budget."
```

The Longhorn `instance-manager` uses pdb to protect itself from being evicted accidentally to avoid the data loss of volumes. When this error happens, it means the `instance-manager` pod is still serving some volumes/replicas.

There are some known causes and related workarounds.

### The Manually Attached Volume

When a Longhorn volume is attached to a host from the [Embedded Longhorn UI](./harvester.md#access-embedded-rancher-and-longhorn-dashboards), this volume will cause above the error.

You can check it from the [Embedded Longhorn UI](./harvester.md#access-embedded-rancher-and-longhorn-dashboards).

![attached-volume.png](/img/v1.3/troubleshooting/attached-volume.png)

The manually attached object is attached to a node name instead of the pod name.

You can also check it from CLI to get the CRD object `VolumeAttachment`.

The volume attached by Longhorn UI:

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

The volume attached by CSI driver:

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

It is not recommended to attach a volume to the host manually.

:::

#### Workaround 1: Set Longhorn option `Detach Manually Attached Volumes When Cordoned` to True

The Longhorn option [Detach Manually Attached Volumes When Cordoned](https://longhorn.io/docs/1.6.0/references/settings/#detach-manually-attached-volumes-when-cordoned) defaults to `true`, it will block the node drain when there is any manually attached volume.

This options is available from Harvester v1.3.1 with the embedded Longhorn v1.6.0.

From Harvester v1.4.0, this option is set to `false` by default.

#### Workaround 2: Manually Detach the Volume

Detach the volume from the [Embedded Longhorn UI](./harvester.md#access-embedded-rancher-and-longhorn-dashboards).

![detached-volume.png](/img/v1.3/troubleshooting/detached-volume.png)

After that, the node will enter maintenance mode successfully.

![node-enter-maintenance-mode.png](/img/v1.3/troubleshooting/node-enter-maintenance-mode.png)

### The Single-replica Volume

Harvester supports to define the customized `StorageClass`, the [Number of Replicas](../advanced/storageclass.md#number-of-replicas) can even be 1 in some scenarios.

When such a volume was ever attached to a certain host by CSI driver or other ways, the last and only replica stays on this node even after the volume is detached from the node.

This can be checked from the CRD object `Volume`.

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

#### Workaround: Set Longhorn option `Node Drain Policy`

The Longhorn [Node Drain Policy](https://longhorn.io/docs/1.6.0/references/settings/#node-drain-policy) defaults to `block-if-contains-last-replica`. Longhorn will block the drain when the node contains the last healthy replica of a volume.

Set this option to `allow-if-replica-is-stopped` from the [Embedded Longhorn UI](./harvester.md#access-embedded-rancher-and-longhorn-dashboards) will solve this issue.

:::note important

If you plan to remove this node after it enters the maintenance mode, it is recommended to backup those single-replica volumes or redeploy the related workloads to other node in advance to get the volume scheduled to other node. Otherwise, those volumes can't be rebuilt or restored from other nodes after this node is removed.

:::

From Harvester v1.4.0, this option is set to `allow-if-replica-is-stopped` by default.
