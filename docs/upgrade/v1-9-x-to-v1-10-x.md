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

### Volume Size Validation for VM Images

Starting with v1.10.0, Harvester validates that a volume created from a VM image is at least as large as the virtual size of that image, rounded up to whole GiB, and rejects any volume request that violates this constraint. Earlier versions did not perform this validation, so a volume could end up smaller than its source image. This most commonly happened when a golden image was replaced by a larger one after volumes had already been created from it. Because the guest operating system sizes its filesystem according to the image, writing past the end of an undersized volume can corrupt the guest filesystem.

The validation applies to volume requests only. Volumes that already exist when you upgrade are not modified, so any volume that is currently undersized remains undersized until you expand it.

To identify such volumes before you start the upgrade, run the [pre-check script](https://github.com/harvester/upgrade-helpers/tree/main/pre-check) on a Harvester control-plane node. The script is maintained independently of Harvester releases, so always download the current version:

```
# Download the script
$ curl -o /tmp/check.sh https://raw.githubusercontent.com/harvester/upgrade-helpers/refs/heads/main/pre-check/v1.x/check.sh && chmod +x /tmp/check.sh

# Run the checks
$ /tmp/check.sh
```

Its **Image Volume Size** check compares the requested size of every PersistentVolumeClaim (PVC) that was created from a VM image against the virtual size of that image and reports each affected volume:

```
Starting Image Volume Size check...
Found volumes that are smaller than the virtual size of the VM image they were created from:
  default/test-pvc: 5Gi is smaller than the required minimum of 10Gi (source image default/test-image)
Once the guest writes past the end of such a volume, the guest filesystem can be corrupted.
Expand each of the volumes listed above to at least the required minimum size. If the storage class does not support online expansion, shut down the virtual machine using the volume first.
Image-Volume-Size Test: Failed
```

The check is read-only. It only reports the affected volumes and never resizes anything. A finding is counted as a failed check, so the script also lists it in the summary at the end of the run and exits with a non-zero status:

```
WARN: There are 1 failing checks: Image-Volume-Size
```

For each volume reported as undersized, increase `spec.resources.requests.storage` to at least the required minimum size before you start the upgrade. If the storage class does not support online expansion, shut down the virtual machine using the volume first.
