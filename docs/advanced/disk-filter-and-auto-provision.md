---
sidebar_position: 13
sidebar_label: Filter out and auto provision disks
title: "Filter out and auto provision disks"
---

<head>
  <link rel="canonical" href="https://docs.harvesterhci.io/v1.8/advanced/disk-filter-and-auto-provision"/>
</head>

Starting from v1.8.0, Harvester provides a more flexible way to manage disk filtering and auto-provisioning through the `harvester-node-disk-manager` ConfigMap. This approach offers more granular control compared to the legacy `auto-disk-provision-paths` setting.

## ConfigMap Location

The ConfigMap is located in the `harvester-system` namespace with the name `harvester-node-disk-manager`.

## Configuration Structure

The ConfigMap contains two main configuration sections:

- **`filters.yaml`**: Defines rules to filter out (exclude) disks from being managed by Harvester
- **`autoprovision.yaml`**: Defines rules to automatically provision disks for VM storage

## Complete Example

```yaml
apiVersion: v1
kind: ConfigMap
metadata:
  name: harvester-node-disk-manager
  namespace: harvester-system
data:
  autoprovision.yaml: |
    - hostname: "*"
      devices:
        - "/dev/sdc"
        - "/dev/sdd"
  filters.yaml: |
    - hostname: "*"
      excludeLabels: ["COS_*", "HARV_*"]
      excludeVendors: ["longhorn", "thisisaexample"]
      excludeDevices: ["/dev/sdd"]
      excludePaths: ["/", "/home"]
    - hostname: "harvester1"
      excludeVendors: ["harvester1"]
    - hostname: "harvester2"
      excludeVendors: ["harvester2"]
```

## Hostname Pattern

The `hostname` field is **required** for each rule and supports regex patterns for flexible node matching:

- Use `"*"` to apply the rule to **all nodes** in the cluster
- Use specific hostnames like `"harvester1"` to target individual nodes
- Use regex patterns like `"harvester.*"` to match multiple nodes

:::caution

When using the `hostname: "*"` pattern, the configuration will be applied to **all nodes** in the cluster.

:::

## Filters Configuration

The `filters.yaml` section allows you to exclude disks based on various criteria:

### Supported Filter Options

- **`excludeLabels`**: Exclude disks with specific filesystem labels (supports wildcards like `COS_*`)
- **`excludeVendors`**: Exclude disks from specific vendors
- **`excludeDevices`**: Exclude disks by device path (e.g., `/dev/sda`, `/dev/nvme0n1`). Supports wildcard patterns like `/dev/sd*` to match multiple devices
- **`excludePaths`**: Exclude disks by mount point path (e.g., `/`, `/home`, `/mnt/data`). Uses case-insensitive exact matching

:::note

**Difference between `excludeDevices` and `excludePaths`**:

- **`excludeDevices`**: Filters by the device file path itself (e.g., `/dev/sda`). Supports wildcard patterns (`*`, `?`) for flexible matching, such as `/dev/sd*` to exclude all SCSI disks.
  
- **`excludePaths`**: Filters by where the disk is mounted (e.g., `/`, `/home`). Uses case-insensitive exact matching to exclude disks mounted at specific locations, such as the system disk mounted at `/`.

:::

### Example

```yaml
filters.yaml: |
  - hostname: "*"
    excludeLabels: ["COS_*", "HARV_*"]
    excludeVendors: ["longhorn", "thisisaexample"]
    excludeDevices: ["/dev/sdd", "/dev/sd*"]
    excludePaths: ["/home"]
  - hostname: "harvester1"
    excludeVendors: ["harvester1"]
    excludeDevices: ["/dev/vd*"]
```

## Auto-Provisioning Configuration

The `autoprovision.yaml` section allows you to automatically add disks as VM storage.

### Supported Options

- **`devices`**: List of device paths to automatically provision

:::caution

All data in the devices specified for auto-provisioning **will be destroyed**.

:::

### Example

```yaml
autoprovision.yaml: |
  - hostname: "*"
    devices:
      - "/dev/sdc"
      - "/dev/sdd"
  - hostname: "harvester1"
    devices:
      - "/dev/sde"
```

## Migration from Legacy Setting

If you are currently using the `auto-disk-provision-paths` setting, consider migrating to this ConfigMap approach for better flexibility and control. For more information about the legacy setting, see the [`auto-disk-provision-paths`](./settings.md#auto-disk-provision-paths-experimental) setting documentation.