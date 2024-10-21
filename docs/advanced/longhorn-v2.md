---
id: longhorn-v2
sidebar_position: 11
sidebar_label: Longhorn V2 Data Engine
title: "Longhorn V2 Data Engine"
Description: How to enable and use the Longhorn V2 Data Engine
---

<head>
  <link rel="canonical" href="https://docs.harvesterhci.io/v1.4/advanced/longhorn-v2"/>
</head>

Longhorn's V2 Data Engine harnesses the power of the Storage Performance Development Kit (SPDK) to elevate its overall performance. The integration significantly reduces I/O latency while simultaneously boosting IOPS and throughput. The enhancement provides a high-performance storage solution capable of meeting diverse workload demands.

:::note

- The Longhorn V2 Data engine is a **Technical Preview** in Harvester v1.4.0.

:::

## Prerequisities

Every node on which the Longhorn V2 Data Engine is active requires the following dedicated resources:

- 1 CPU core for use by the Longhorn instance-manager pod
- 2 GiB RAM (this will be allocated as 1024 × 2GiB hugepages)
- At least one NVMe disk for data storage

## Limitations

The Longhorn V2 Data Engine does not yet support the following functionality:

- Backing Images
- Live Migration
- Volume Clone
- Volume Encryption
- Volume Expansion

Within the context of Harvester, this means that volumes backed by the Longhorn V2 data engine must be added to virutal machines as additional disks. The boot disk of each VM still needs to come from a VM image backed by the Longhorn V1 Data Engine.

VMs with Longhorn V2 volumes attached cannot be live migrated, nor is snapshot functionality available, as snapshot restore within Harvester relies on volume clone functionality.

## Using the Longhorn V2 Data Engine

1. To enable the Longhorn V2 Data Engine, go to the **Advanced** > **Settings** screen and set `longhorn-v2-data-engine-enabled` to `true`. This will automatically load the kernel modules necessary for the Longhorn V2 data engine, and will attempt to allocate 1024 × 2MiB-sized huge pages (i.e. 2GiB of RAM) on all nodes. If you see "not enough hugepages-2Mi capacity" errors when applying this setting, wait a minute for the error to clear. If the error remains, reboot the affected node(s).

   Changing this setting will restart RKE2 on all nodes. This will not affect running VM workloads.

   If you wish to selectively disable the Longhorn V2 data engine on some nodes (for example on nodes with less CPU and/or RAM), go to the **Hosts** screen and add the label `node.longhorn.io/disable-v2-data-engine` with value `true` to those nodes.

2. Go to the **Hosts** screen and add extra disks to each node as described in [Multi-disk Management](../host/host.md#multi-disk-management). Set the additional disk's `Provisioner` to `Longhorn V2 (CSI)`.

3. Go to the **Advanced** > **Storage Classes** screen a new storage classs as described in [Creating a Storage Class](storageclass.md#creating-a-storageclass). As with adding disks, set the `Provisioner` to `Longhorn V2 (CSI)`.

4. When creating new volumes (either on the **Volumes** screen or during VM creation), set the Storage Class to the one created in step 3 above, and your new volume will be backed by the Longhorn V2 Data Engine.