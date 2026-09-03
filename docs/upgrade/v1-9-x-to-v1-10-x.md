---
sidebar_position: 100
sidebar_label: Upgrade from v1.9.x to v1.10.x
title: "Upgrade from v1.9.x to v1.10.x"
---

<head>
  <link rel="canonical" href="https://docs.harvesterhci.io/v1.10/upgrade/v1-9-x-to-v1-10-x"/>
</head>

## General Information

The **Upgrade** button on the **Dashboard** screen becomes selectable whenever a new Harvester version that you can upgrade to becomes available. For more information, see [Start an upgrade](./automatic.md#start-an-upgrade).

### Image Volume Size Check

Prior to v1.10.0, Harvester did not validate that a volume created from a VM image was at least as large as the image's virtual size. A volume smaller than its source image can lead to data integrity issues once the guest OS writes past the shrunk backing store. Starting with v1.10.0, Harvester rejects any new volume request that violates this constraint, but volumes created before the upgrade may still be affected.

To identify these pre-existing cases, the upgrade process scans every PersistentVolumeClaim (PVC) that was created from a VM image and compares its requested size against the image's virtual size. The scan result is recorded as an event on the `Upgrade` custom resource. This check is read-only. It never resizes a volume or blocks the upgrade, since volumes cannot be shrunk and expanding an in-use volume is a decision left to the cluster operator.

Review the results in two places:

- A summary event is recorded on the `Upgrade` object, showing how many volumes were scanned and how many violations were found:

    ```
    kubectl describe upgrade <name> -n harvester-system
    ```

- Details for each affected volume are logged as warnings by the upgrade-helper. Each entry lists the PVC's namespace/name, its current size and the required minimum, and whether the volume can currently be expanded:

    ```
    WARN[0000] "default/test-pvc": current size is smaller than the required minimum of 10Gi; can be expanded
    ```

    See [Download Upgrade Logs](./troubleshooting.md#download-upgrade-logs) if you need to retrieve these logs after the upgrade completes.

For each volume reported as undersized, you have the following options:

- If it is reported as expandable, increase its `spec.resources.requests.storage` to at least the required minimum size.
- If it is reported as not expandable (for example, because the owning virtual machine is running and the storage class does not support online expansion), resolve the blocking condition first, such as shutting down the virtual machine, and then expand the volume.

Since Harvester now enforces the minimum size for new volumes, this check is only expected to report findings on clusters that still have volumes predating v1.10.0.
