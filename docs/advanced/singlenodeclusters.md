# Single-Node Clusters

Beginning with v1.2.0, Harvester is supporting single-node clusters for implementations that require minimal initial deployment resources and/or that can tolerate lower resiliency. You can create single-node clusters using the standard installation methods ([ISO](https://docs.harvesterhci.io/v1.3/install/index), [USB](https://docs.harvesterhci.io/v1.3/install/usb-install), and [PXE boot](https://docs.harvesterhci.io/v1.3/install/pxe-boot-install)).

Single-node clusters support most Harvester features, including the creation of RKE2 clusters and node upgrades (with some limitations). However, this deployment type has the following key disadvantages:

- No high availability: Errors and updates that require rebooting of the node cause downtime to running VMs.
- No multi-replica support: Only one replica is created for each volume in Longhorn.
- No live migration and zero-downtime support during upgrades

## Prerequisites/Requirements

Before you begin deploying your single-node cluster, ensure that the following requirements are fulfilled/addressed.

- Hardware: [Use server-class hardware](https://docs.harvesterhci.io/v1.3/install/requirements#hardware-requirements) with sufficient resources to run Harvester and a production workload. Laptops and nested virtualization are not supported.
- Network: [Configure ports](https://docs.harvesterhci.io/v1.3/install/requirements#port-requirements-for-harvester-nodes) based on the type of traffic to be transmitted among VMs.
- StorageClass: [Create a new default StorageClass](https://docs.harvesterhci.io/v1.3/advanced/storageclass#creating-a-storageclass) with the **Number of Replicas** parameter set to "1". This ensures that only one replica is created for each volume in Longhorn.

    :::info important
    The default StorageClass "harvester-longhorn" has a replica count value of "3" for high availability. If you use this StorageClass to create volumes for your single-node cluster, Longhorn is unable to create the configured number of replicas. This results in volumes being marked as "Degraded" on the Longhorn UI.
    :::
