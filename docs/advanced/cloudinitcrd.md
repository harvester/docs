---
sidebar_position: 10
sidebar_label: CloudInit CRD
title: "CloudInit CRD"
---

<head>
  <link rel="canonical" href="https://docs.harvesterhci.io/v1.1/advanced/cloudinitcrd"/>
</head>

_Available as of v1.3.0_

Harvester now offers the capability to configure Harvester OS specific settings via the `CloudInit` CRD.

This can be used to configure underlying Harvester OS specific options manually or via Gitops

## Background
Harvester OS uses the [elemental-toolkit](https://rancher.github.io/elemental-toolkit/docs/reference/cloud_init/) which ships with its unique cloud-init support. 

As part of the Harvester installation, settings defined by users are written to an elemental cloud-init file in /oem directory. As Harvester OS itself is immutable, the cloud-init file ensures node specific settings are applied on each reboot. 

The Harvester `CloudInit` CRD exposes the `elemental cloud-init` via a Kubernetes CRD. This allows users to perform additional node specific changes post Harvester install without having to follow the process of making the rootfs writable.

The `CloudInit` CRD is persisted and sync across to the underlying hosts via Harvester, which ensures changes made directly to OS are not lost across reboots or upgrades.

:::note

`CloudInit CRD` is a cluster scoped resource. Please ensure you have appropriate access via Rancher rbac to access the resource.

:::

## Getting started

The following example adds additional ssh keys to all nodes in an existing Harvester cluster.

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

Details of the CRD spec are as follows:

* `matchSelector (required)`: defines label selector to filter nodes the change needs to be applied to. `harvesterhci.io/managed: "true"` is a harvester specific label, akin to select all nodes
* `filename (required)`: defines the name of file in /oem. cloud-init files in /oem are applied in alphabetical order, and this can be used to ensure how file changes are applied during boot
* `content (required)`: defines the inline content for the elemental cloud-init resource which will be written to target nodes
* `paused (optional)`: optional field to pause the reconcile of `CloudInit` CRD. A elemental cloud-init file being managed by the `CloudInit` CRD is watched by the Harvester controllers. Any direct changes made to these files are immediately reconcilled back to the defined state, unless the CRD is paused. 


Once the object is created, the user can login to the target nodes to verify the results.

In our case, a file named `/oem/99-my-ssh-keys.yaml` is created and subsequently monitored by the Harvester controllers.

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

The `status` subresource can be used to track the rollout of a change to the underlying Harvester nodes

For example, in a 3 node cluster, the `status` indicates that the change has been rolled out to all nodes.

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
Once the cloud-init changes are applied, the nodes need to be rebooted to ensure `elemental-toolkit` applies the requested changes to the OS.
:::

Deleting the `CloudInit` CRD will result in the associated files being removed from the underlying Harvester nodes. The effect of this change like other cloud-init resources will not be applicable until the impacted nodes are rebooted.

Users are encouraged to leverage [fleet](https://fleet.rancher.io) and `CloudInit` CRD to manage changes to underlying Harvester OS.