---
sidebar_position: 3
sidebar_label: Creating an RKE2 Kubernetes Cluster
title: ""
keywords:
  - Harvester
  - harvester
  - Rancher
  - rancher
  - Rancher Integration
  - RKE2
Description: Users can now provision RKE2 Kubernetes clusters on top of the Harvester cluster in Rancher v2.6.1+ using the built-in Harvester node driver.
---

# Creating an RKE2 Kubernetes Cluster

Users can now provision RKE2 Kubernetes clusters on top of the Harvester cluster in Rancher `v2.6.1+` using the built-in Harvester node driver.

![rke2-cluster](../assets/rke2-node-driver.png)

:::note

- Harvester RKE2 node driver is in tech preview.
- VLAN network is required for Harvester node driver.

:::

### Create Your Cloud Credentials

1. Click **☰ > Cluster Management**.
2. Click **Cloud Credentials**.
3. Click **Create**.
4. Click **Harvester**.
5. Enter your cloud credential name
6. Select "Imported Harvester" or "External Harvester".
7. Click **Create**.

![create-harvester-cloud-credentials](../assets/harvester-create-cloud-credentials.png)

###  Create RKE2 Kubernetes Cluster

Users can create a RKE2 Kubernetes cluster from the **Cluster Management** page via the RKE2 node driver.

1. Select **Clusters** menu.
2. Click **Create** button.
3. Toggle Switch to **RKE2/K3s**.
4. Select Harvester node driver.
5. Select a **Cloud Credential**.
6. Enter **Cluster Name** (required).
7. Enter **Namespace** (required).
8. Enter **Image** (required).
9. Enter **Network Name** (required).
10. Enter **SSH User** (required).
11. Click **Create**.

![create-rke2-harvester-cluster](../assets/create-rke2-harvester-cluster.png)

:::note

RKE2 v1.21.5+rke2r2 or above provides a built-in Harvester Cloud Provider and Guest CSI driver integration.

- Currently only imported Harvester clusters are supported automatically.

:::
