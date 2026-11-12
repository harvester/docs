---
id: enterprise-ecosystem
sidebar_position: 18
sidebar_label: Enterprise Ecosystem
title: "Enterprise Ecosystem"
description: An index of certified partner solutions for storage, backup, and disaster recovery that extend Harvester.
keywords:
  - Harvester
  - harvester
  - Enterprise
  - Ecosystem
  - Partners
  - Certified
---

<head>
  <link rel="canonical" href="https://docs.harvesterhci.io/v1.9/enterprise-ecosystem"/>
</head>

This page is an index of certified partner solutions that extend Harvester, grouped by category. For open source projects, community tools, and learning resources, see [Community Ecosystem](./community-ecosystem.md).

## Certified Partner Solutions

The [SUSE Partner Certified Solutions Catalog](https://www.suse.com/pcsc/home#search?productName=&sortOrder.sortOrder=1&partnerName=&platforms=1031&pagination.resultsPerPage=20&pagination.pageIndex=1) lists partner products that are certified for SUSE Virtualization, including hardware, storage, backup, and security solutions. These solutions are supported by their vendors. Check the catalog for the current certification status of each product.

### Partner Storage

The following partner storage solutions provide CSI drivers for virtual machine volumes. For the complete list, see the [SUSE Partner Certified Solutions Catalog](#certified-partner-solutions). For requirements, see [Third-Party Storage Support](./advanced/csidriver.md).

| Solution | Description | Resources |
| --- | --- | --- |
| NetApp Trident | CSI driver for NetApp ONTAP storage. | [GitHub](https://github.com/NetApp/trident), [SUSE guide](https://documentation.suse.com/trd/netapp/html/gs_suse-virtualization_netapp-trident_iscsi/index.html) |
| Portworx Enterprise | Software-defined storage, including on Everpure (Pure Storage) FlashArray. | [GitHub](https://github.com/portworx/helm), [SUSE guide](https://documentation.suse.com/trd/everpure/html/rc_suse-virtualization_everpure-portworx_bare-metal/index.html), [FlashArray guide](https://documentation.suse.com/trd/everpure/html/gs_virtualization_portworx_everpure-flasharray/index.html) |
| Dell Container Storage Modules | CSI drivers for Dell PowerStore, PowerMax, PowerFlex, PowerScale, and Unity. | [GitHub](https://github.com/dell/csm) |
| HPE CSI Driver | CSI driver for HPE Alletra and other HPE storage arrays. | [GitHub](https://github.com/hpe-storage/csi-driver) |
| Hitachi Storage Plug-in for Containers | CSI driver for Hitachi VSP storage. | [SUSE guide](https://documentation.suse.com/trd/hitachi/html/gs_virtualization_hitachi-storage/index.html) |

### Partner Backup and Disaster Recovery

The following partner solutions backup, restore, and replicate virtual machines. For the complete list, see the [SUSE Partner Certified Solutions Catalog](#certified-partner-solutions).

| Solution | Description | Resources |
| --- | --- | --- |
| Veeam Kasten | Backup, restore, and migration of virtual machines. | [Documentation](https://docs.kasten.io/latest/usage/harvester_support/), [SUSE guide](https://documentation.suse.com/trd/veeam/html/gs_virtualization_veeam-kasten/index.html) |
| CloudCasa | Backup and disaster recovery as a service, available in Rancher Apps. | [GitHub](https://github.com/catalogicsoftware/cloudcasa-helmchart), [Website](https://cloudcasa.io/partners/suse-rancher/) |
| NetApp Trident Protect | Snapshots, backups, and replication for Trident volumes. | [Documentation](https://docs.netapp.com/us-en/trident/trident-protect/learn-about-trident-protect.html) |
| Portworx Backup and Disaster Recovery | Backups and synchronous or asynchronous disaster recovery for Portworx volumes. | [GitHub](https://github.com/libopenstorage/stork), [Backup](https://docs.portworx.com/portworx-backup-on-prem), [Disaster recovery](https://docs.portworx.com/portworx-enterprise/operations/disaster-recovery) |
| Storware Backup and Recovery | Agentless virtual machine backup. | [Website](https://storware.eu/solutions/suse-virtualization-backup-and-recovery/) |
