---
id: community-ecosystem
sidebar_position: 17.5
sidebar_label: Community Ecosystem
title: "Community Ecosystem"
description: An index of certified partner solutions, Harvester projects, community tools, and learning resources that extend Harvester.
keywords:
  - Harvester
  - harvester
  - Community
  - Ecosystem
  - Tools
  - Integrations
---

<head>
  <link rel="canonical" href="https://docs.harvesterhci.io/v1.9/community-ecosystem"/>
</head>

This page is an index of solutions, tools, and resources that extend Harvester, grouped by category.

:::caution

Projects that are not maintained by the Harvester project are developed by their authors and provided as is. They are not supported by SUSE or the Harvester project. Review the license and maintenance status of each project, and test it before you use it in production.

:::

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

The following partner solutions back up, restore, and replicate virtual machines. For the complete list, see the [SUSE Partner Certified Solutions Catalog](#certified-partner-solutions).

| Solution | Description | Resources |
| --- | --- | --- |
| Veeam Kasten | Backup, restore, and migration of virtual machines. | [Documentation](https://docs.kasten.io/latest/usage/harvester_support/), [SUSE guide](https://documentation.suse.com/trd/veeam/html/gs_virtualization_veeam-kasten/index.html) |
| CloudCasa | Backup and disaster recovery as a service, available in Rancher Apps. | [GitHub](https://github.com/catalogicsoftware/cloudcasa-helmchart), [Website](https://cloudcasa.io/partners/suse-rancher/) |
| NetApp Trident Protect | Snapshots, backups, and replication for Trident volumes. | [Documentation](https://docs.netapp.com/us-en/trident/trident-protect/learn-about-trident-protect.html) |
| Portworx Backup and Disaster Recovery | Backups and synchronous or asynchronous disaster recovery for Portworx volumes. | [GitHub](https://github.com/libopenstorage/stork), [Backup](https://docs.portworx.com/portworx-backup-on-prem), [Disaster recovery](https://docs.portworx.com/portworx-enterprise/operations/disaster-recovery) |
| Storware Backup and Recovery | Agentless virtual machine backup. | [Website](https://storware.eu/solutions/suse-virtualization-backup-and-recovery/) |

## Harvester Projects

The following projects are maintained by the Harvester project and released separately from Harvester.

| Project | Description |
| --- | --- |
| [Terraform Provider](https://github.com/harvester/terraform-provider-harvester) | Manage Harvester resources with Terraform or OpenTofu. |
| [Cluster API Provider](https://github.com/harvester/cluster-api-provider-harvester) | Create Kubernetes clusters on Harvester with Cluster API. |
| [Node Driver](https://github.com/harvester/docker-machine-driver-harvester) | Provision guest cluster nodes from Rancher. |
| [Experimental Add-ons](https://github.com/harvester/experimental-addons) | Add-ons that are not packaged with Harvester. Not for production use. |
| [MCP Server](https://github.com/harvester/harvester-mcp-server) | Access to Harvester resources for the Rancher AI agent. |
| [Storage Validator](https://github.com/harvester/storage-validator) | Validate a storage backend before you use it with Harvester. |
| [Harvester Perf](https://github.com/harvester/harvester-perf) | Performance testing and benchmarking tools. |

## Backup and Disaster Recovery

The following open source projects protect virtual machines beyond the built-in [backup and snapshot](./vm/backup-restore.md) features.

| Project | Description | Maintainer |
| --- | --- | --- |
| [Velero](https://github.com/velero-io/velero) | Back up and restore Kubernetes resources and volumes. See the [Harvester knowledge base](https://harvesterhci.io/kb/2025/05/26/velero-backup-restore/). | Velero project |
| [KubeVirt Velero Plugin](https://github.com/kubevirt/kubevirt-velero-plugin) | Velero plugin for virtual machines. | KubeVirt project |
| [Kanister](https://github.com/kanisterio/kanister) | Application-level data management framework. | Kanister project |
| [harvey](https://github.com/abonillabeeche/harvey) | Disaster recovery orchestration (failover and failback) between clusters. | abonillabeeche |

## Migration

The following projects move virtual machines from other platforms to Harvester.

| Project | Description | Maintainer |
| --- | --- | --- |
| [VM Import Controller](https://github.com/harvester/vm-import-controller) | Import virtual machines from VMware vSphere and OpenStack. See [VM Import](./advanced/addons/vmimport.md). | Harvester project |
| [Forklift](https://github.com/kubev2v/forklift) | Upstream of the SUSE VM Migration Toolkit. | Forklift project |
| [VM Import UI](https://github.com/doccaz/vm-import-ui) | User interface for the VM Import Controller. | doccaz |
| [harvester-windows-cloudbase](https://github.com/abonillabeeche/harvester-windows-cloudbase) | Windows worker image for Coriolis migrations (`coriolis` flavor). | abonillabeeche |
| [Coriolis Windows Worker](https://github.com/doccaz/coriolis-windows-worker) | Windows worker image builder for Coriolis migrations. | doccaz |

## Operator and CLI Tools

The following tools help you inspect and operate Harvester clusters.

| Project | Description | Maintainer |
| --- | --- | --- |
| [harvester-cli](https://github.com/abonillabeeche/harvester-cli) | Manage virtual machines from the command line. Continues the unmaintained [original project](https://github.com/belgaied2/harvester-cli). | abonillabeeche |
| [harvester-ops](https://github.com/jniedergang/harvester-ops) | Web console for multiple clusters, including ordered shutdown and startup. | jniedergang |
| [KVTools](https://github.com/coulof/kvtools) | Virtual machine inventory and health report, similar to RVTools. See [kvtools.lafabrique.ai](https://kvtools.lafabrique.ai/). | coulof |
| [KVTop](https://github.com/coulof/kvtop) | Live virtual machine load in the terminal, similar to esxtop. | coulof |
| [KVOvn-topo](https://github.com/coulof/kvovn-topo) | Kube-OVN network topology explorer. | coulof |
| [Harvester VM Memory Dumper](https://github.com/doccaz/harvester-vm-memdump) | Dump and analyze the memory of a running virtual machine. | doccaz |
| [rancher-mcp-server](https://github.com/mrostamii/rancher-mcp-server) | MCP server for Rancher, Harvester, and Fleet. | mrostamii |

## Installation and Configuration

The following projects help you prepare and automate installations.

| Project | Description | Maintainer |
| --- | --- | --- |
| [Harvester Configurator](https://doccaz.github.io/harvester-configurator) | Generate [Harvester configuration](./install/harvester-configuration.md) files. | doccaz |
| [Harvester Cloud-Init Editor](https://doccaz.github.io/harvester-cloud-init) | Edit cloud-init configuration for Harvester nodes. | doccaz |
| [iPXE Examples](https://github.com/harvester/ipxe-examples) | PXE and Vagrant installation examples. | Harvester project |
| [Seeder](https://github.com/harvester/seeder) | Install Harvester on bare-metal servers with Tinkerbell. | Harvester project |
| [Harvester Cloud](https://github.com/rancher/harvester-cloud) | Deploy Harvester on public clouds for testing. | Rancher project |
| [Upgrade Helpers](https://github.com/harvester/upgrade-helpers) | Files for manual upgrades. | Harvester project |
| [Lab in a Box](https://github.com/SUSE-Technical-Marketing/lab-in-a-box) | Build lab environments from a single file. | SUSE Technical Marketing |
| [Harvester Ansible PoC Setup](https://github.com/open-is-all/SUSE-Virtualization-Harvester-Ansible-Playbook-PoC-Setup) | Ansible playbook for a three-node proof of concept. | open-is-all |

## Virtual Machine Images and Guest Operating Systems

The following projects help you build images and configure guests.

| Project | Description | Maintainer |
| --- | --- | --- |
| [Cloud-Init Editor](https://doccaz.github.io/cloud-init) | Generate cloud-init files for virtual machines. | doccaz |
| [harvester-windows-cloudbase](https://github.com/abonillabeeche/harvester-windows-cloudbase) | Windows golden images with VMDP, Cloudbase-Init, and sysprep. | abonillabeeche |
| [HarvesterAutoMS](https://github.com/jniedergang/HarvesterAutoMS) | Unattended Windows Server 2025 installation. | jniedergang |
| [Packer Plugin](https://github.com/hulto/packer-plugin-harvester-packer) | Build virtual machine images with Packer. | hulto |

## Infrastructure as Code and Automation

The following projects complement the [Harvester Terraform Provider](./terraform/terraform-provider.md).

| Project | Description | Maintainer |
| --- | --- | --- |
| [Terraform VM Module](https://github.com/beholdenkey/terraform-harvester-vm) | Terraform module for virtual machines. | beholdenkey |
| [Harvester Terraform Examples](https://github.com/SUSE-Technical-Marketing/harvester-terraform) | Example Terraform configurations. | SUSE Technical Marketing |
| [Terraformer](https://github.com/harvester/terraformer) | Generate Terraform files from existing resources. | Harvester project |
| [python-rancher-harvester](https://github.com/bvankampen/python-rancher-harvester) | Python modules for virtual machine and RKE2 provisioning. | bvankampen |

## Monitoring and Alerting

The following projects extend [Harvester monitoring](./monitoring/harvester-monitoring.md).

| Project | Description | Maintainer |
| --- | --- | --- |
| [Harvester Extra Dashboards](https://github.com/doccaz/harvester-extra-dashboards) | Grafana dashboards for virtual machine contention, backups, and capacity. | doccaz |
| [Harvester Alert Email](https://github.com/doccaz/harvester-alert-email) | Send alerts by email, webhook, or Slack. | doccaz |
| [Checkmk Harvester](https://github.com/ghatak-x/checkmk-harvester) | Checkmk agent for Harvester and Longhorn. | ghatak-x |

## Security and Access Control

The following project controls access to virtual machines.

| Project | Description | Maintainer |
| --- | --- | --- |
| [Harvester Single-VM RBAC](https://github.com/doccaz/harvester-single-vm-rbac) | Limit a user or group to a single virtual machine. | doccaz |

## Storage

The following open source projects provide storage for Harvester.

| Project | Description | Maintainer |
| --- | --- | --- |
| [Rook](https://github.com/rook/rook) | Ceph storage orchestrator. Rook RBD is validated with Harvester. | Rook project |
| [Piraeus Operator](https://github.com/piraeusdatastore/piraeus-operator) | LINSTOR replicated block storage. | Piraeus project |
| [NFS Server BCI](https://github.com/doccaz/nfs-server-bci) | Containerized NFS server based on SUSE BCI. | doccaz |

## Sizing and Planning

The following tool helps you size clusters.

| Project | Description | Maintainer |
| --- | --- | --- |
| [SUSE AI Sizing Tool](https://doccaz.github.io/suse-ai-sizing-tool/) | Capacity planning, including the virtualization layer. | doccaz |

## Blogs and Learning

The following resources include tutorials and demos.

| Resource | Description | Maintainer |
| --- | --- | --- |
| [Harvester Knowledge Base](https://harvesterhci.io/kb/) | How-to articles. | Harvester project |
| [Harvester YouTube Channel](https://www.youtube.com/@HarvesterHCI) | Demos and release videos. | Harvester project |
| [5glinux Blog](https://blog.5glinux.com) | Disaster recovery, storage, migration, and Windows guests. | abonillabeeche |
| [LAFABRIQUE.AI Blog](https://lafabrique.ai/blog/) | Kube-OVN networking. | coulof |
| [Installing Rancher onto Harvester](https://github.com/bcdurden/harvester-rancher-install-blog) | Three ways to install Rancher on Harvester. | bcdurden |

## Community Channels

You can ask questions and share your work in the following channels:

- [Rancher Users Slack](https://slack.rancher.io/) (`#harvester` channel)
- [SUSE Forums](https://forums.suse.com/c/harvester/21)
- [GitHub Discussions](https://github.com/harvester/harvester/discussions)

## Add Your Project

To add a project, open a pull request in the [Harvester documentation repository](https://github.com/harvester/docs). Projects must be public, licensed, documented, and maintained. Projects that are archived or inactive for more than 12 months may be removed.
