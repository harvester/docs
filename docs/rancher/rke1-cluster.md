# RKE1 Kubernetes Cluster

Users can now provision RKE1 Kubernetes clusters on top of the Harvester cluster in Rancher `v2.6.1` using the built-in Harvester Node Driver.

![rke1-cluster](assets/rke1-node-driver.png)

!!! note
      - Harvester RKE1 node driver is in tech preview.
      - VLAN network is required for Harvester node driver.

### Create RKE1 Kubernetes Cluster

### Create Your Cloud Credentials

1. Click **☰ > Cluster Management**.
2. Click **Cloud Credentials**.
3. Click **Create**.
4. Click **Harvester**.
5. Enter your cloud credential name
6. Select "Imported Harvester" or "External Harvester"
7. Click **Create**.

![create-harvester-clould-credential](assets/harvester-create-cloud-credentials.png)

## Create Node Template

You can use the Harvester node driver to create node templates and eventually node pools for your Kubernetes cluster.

1. Configure the  **Cloud Credentials**
1. Configure **Instance Options**
    * Configure the CPU, memory, and disk
    * Select an OS image that is compatible with the `cloud-init` config.
    * Select a network that the node driver is able to connect to, currently only `VLAN` is supported.
    * Enter the SSH User, the username will be used to ssh to nodes. For example, a default user of the Ubuntu cloud image will be `ubuntu`.
1. Enter a **RANCHER TEMPLATE** name.

![](assets/node-template.png)

See [nodes hosted by an infrastructure provider](https://rancher.com/docs/rancher/v2.5/en/cluster-provisioning/rke-clusters/node-pools/) for more info.

## Create RKE1 Kubernetes Cluster

Users can create a RKE1 Kubernetes cluster from the **Cluster Management** page via the Harvester RKE1 node driver.

1. Select **Clusters** menu.
1. Click **Create** button.
1. Toggle Switch to **RKE1**.
1. Select Harvester node driver.
1. **Cluster Name** is required.
1. **Name Prefix** is required.
1. **Template** is required.
1. **etcd** and **Control Plane** is required.

![create-rke-harvester-cluster](assets/create-rke-harvester-cluster.png)
