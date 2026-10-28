---
sidebar_position: 95
sidebar_label: Upgrade from v1.9.x to v1.10.x
title: "Upgrade from v1.9.x to v1.10.x"
---

<head>
  <link rel="canonical" href="https://docs.harvesterhci.io/v1.9/upgrade/v1-9-x-to-v1-10-x"/>
</head>

## General Information

The **Upgrade** button on the **Dashboard** screen becomes selectable whenever a new Harvester version that you can upgrade to becomes available. For more information, see [Start an upgrade](./automatic.md#start-an-upgrade).

### Volume Size Validation for VM Images

Starting with v1.10.0, Harvester validates that any new volume created from a virtual machine image is at least as large as the virtual size of that image (rounded up to the nearest whole GiB). Harvester rejects volume requests that violate this constraint.
This validation applies exclusively to new volume requests. Existing volumes are not modified during an upgrade, which means that any previously undersized volume remains undersized until expanded manually.

#### Root Cause and Risk

Earlier Harvester versions did not enforce volume size validation, allowing volumes to be created smaller than their source images. This issue typically occurred when a golden image was replaced by a larger version after volumes had already been created from it.
Because the guest operating system provisions its filesystem based on the virtual image size, writing data past the physical end of an undersized volume can cause guest filesystem corruption.

#### Identifying Undersized Volumes

Before starting the upgrade, run the [pre-check script](https://github.com/harvester/upgrade-helpers/tree/main/pre-check) on a Harvester management node to identify affected volumes.
Because the script is updated independently of Harvester releases, ensure that you download the latest version:

```
# Download the script
$ curl -o /tmp/check.sh https://raw.githubusercontent.com/harvester/upgrade-helpers/refs/heads/main/pre-check/v1.x/check.sh && chmod +x /tmp/check.sh

# Run the checks
$ /tmp/check.sh
```

The **Image Volume Size** check compares the requested size of every PersistentVolumeClaim (PVC) created from an image against that image's virtual size. If undersized volumes are identified, the script displays output similar to the following:

```
Starting Image Volume Size check...
Found volumes that are smaller than the virtual size of the VM image they were created from:
  default/test-pvc: 5Gi is smaller than the required minimum of 10Gi (source image default/test-image)
Once the guest writes past the end of such a volume, the guest filesystem can be corrupted.
Expand each of the volumes listed above to at least the required minimum size. If the storage class does not support online expansion, shut down the virtual machine using the volume first.
Image-Volume-Size Test: Failed
```

This check is strictly read-only and does not modify any resources. Any identified undersized volume causes the check to fail, resulting in a non-zero exit code and a summary alert:

```
WARN: There are 1 failing checks: Image-Volume-Size
```

#### Remediation

To resolve this issue before upgrading, perform the following steps for each identified undersized volume:
1. Check if the underlying StorageClass supports online volume expansion. If online expansion is not supported, shut down the virtual machine that is using the volume.
1. Edit the PVC manifest and increase the value of `spec.resources.requests.storage` to at least the required minimum size reported by the script.
1. Re-run `/tmp/check.sh` to confirm that all volume size checks pass.
