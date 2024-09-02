---
sidebar_position: 10
sidebar_label: CloudInit CRD
title: "CloudInit CRD"
---

<head>
  <link rel="canonical" href="https://docs.harvesterhci.io/v1.1/advanced/cloudinitcrd"/>
</head>

_Available as of v1.3.0_

You can use the `CloudInit` CRD to configure Harvester operating system settings either manually or using GitOps solutions.

## Background

The Harvester operating system uses the [elemental-toolkit](https://github.com/rancher/elemental-toolkit), which has a unique form of [cloud-init support](https://rancher.github.io/elemental-toolkit/docs/reference/cloud_init/). 

Settings configured during the Harvester installation process are written to the `elemental` cloud-init file in the `/oem` directory. Because the Harvester operating system is immutable, the cloud-init file ensures that node-specific settings are applied on each reboot. 

The Harvester `CloudInit` CRD exposes the cloud-init file through a Kubernetes CRD. This allows you to modify node-specific settings after installation without needing to take steps to make the root filesystem writable.

In addition, the `CloudInit` CRD is persisted and synchronized with the underlying hosts so that changes made directly to the Harvester operating system are not lost whenever nodes are rebooted and upgraded.

:::note

The `CloudInit` CRD is a cluster-scoped resource. Ensure that your user account has the permissions required to access the resource (via Rancher role-based access control).

:::

## Getting Started

The following example adds SSH keys to all nodes in an existing Harvester cluster.

```yaml
apiVersion: node.harvesterhci.io/v1beta1
kind: CloudInit
metadata:
  name: my-ssh-keys
spec:
  matchSelector: 
    harvesterhci.io/managed: "true"
  filename: 99-my-ssh-keys
  contents: |
    stages:
      network:
        - name: "add my ssh keys"
          authorized_keys:
            rancher:
            - ssh-rsa key1
            - ssh-rsa key2
  paused: false
```

The `spec` field contains the following:

- `matchSelector (required)`: Label selector used to identify the nodes that the change must be applied to. `harvesterhci.io/managed: "true"` is a Harvester-specific label that you can use to select all nodes.
- `filename (required)`: Name of the file in `/oem`. cloud-init files in `/oem` are applied in alphabetical order. This can be used to ensure that file changes are applied during booting.
- `content (required)`: Inline content for the Elemental cloud-init resource that is written to target nodes.
- `paused (optional)`: Used to pause `CloudInit` CRD reconciliation. The Harvester controllers monitor Elemental cloud-init files that are managed by the `CloudInit` CRD. Direct changes made to these files are immediately reconciled back to the defined state unless the CRD is paused. 

Once the object is created, you can log in to the target nodes to verify the results.

In the following example, a file named `/oem/99-my-ssh-keys.yaml` is created and subsequently monitored by the Harvester controllers.

```
harvester-qhgd4:/oem # more 99-my-ssh-keys.yaml
stages:
  network:
    - name: "add my ssh keys"
      authorized_keys:
        rancher:
        - ssh-rsa key1
        - ssh-rsa key2
```

The `status` subresource can be used to track the rollout of a change to the underlying Harvester nodes.

In the following example, the `status` values indicate that the change was applied to all three nodes in the cluster.

```
status:
  rollouts:
    harvester-kfs2c:
      conditions:
      - lastTransitionTime: "2024-08-26T03:57:33Z"
        message: ""
        reason: CloudInitApplicable
        status: "True"
        type: Applicable
      - lastTransitionTime: "2024-08-26T03:57:33Z"
        message: Local file checksum is the same as the CloudInit checksum
        reason: CloudInitChecksumMatch
        status: "False"
        type: OutOfSync
      - lastTransitionTime: "2024-08-26T03:57:33Z"
        message: 99-my-ssh-keys.yaml is present under /oem
        reason: CloudInitPresentOnDisk
        status: "True"
        type: Present
    harvester-qhgd4:
      conditions:
      - lastTransitionTime: "2024-08-26T03:57:33Z"
        message: ""
        reason: CloudInitApplicable
        status: "True"
        type: Applicable
      - lastTransitionTime: "2024-08-26T04:00:00Z"
        message: Local file checksum is the same as the CloudInit checksum
        reason: CloudInitChecksumMatch
        status: "False"
        type: OutOfSync
      - lastTransitionTime: "2024-08-26T04:00:00Z"
        message: 99-my-ssh-keys.yaml is present under /oem
        reason: CloudInitPresentOnDisk
        status: "True"
        type: Present
    harvester-rmvzg:
      conditions:
      - lastTransitionTime: "2024-08-26T03:57:33Z"
        message: ""
        reason: CloudInitApplicable
        status: "True"
        type: Applicable
      - lastTransitionTime: "2024-08-26T03:57:33Z"
        message: Local file checksum is the same as the CloudInit checksum
        reason: CloudInitChecksumMatch
        status: "False"
        type: OutOfSync
      - lastTransitionTime: "2024-08-26T03:57:33Z"
        message: 99-my-ssh-keys.yaml is present under /oem
        reason: CloudInitPresentOnDisk
        status: "True"
        type: Present
```
:::note

Once the cloud-init changes are applied, you must reboot the nodes to ensure that the `elemental-toolkit` applies the requested changes to the operating system.

:::

Deleting the `CloudInit` CRD results in the removal of associated files from the underlying Harvester nodes. As with other cloud-init resources, the effects of this change are not exhibited until the impacted nodes are rebooted.

You are encouraged to leverage [Fleet](https://fleet.rancher.io) and the `CloudInit` CRD to manage changes to the Harvester operating system.