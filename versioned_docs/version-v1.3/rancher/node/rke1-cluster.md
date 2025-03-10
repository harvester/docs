---
sidebar_position: 2
sidebar_label: Creating an RKE1 Kubernetes Cluster
title: "Creating an RKE1 Kubernetes Cluster"
---

<head>
  <link rel="canonical" href="https://docs.harvesterhci.io/v1.1/rancher/node/rke1-cluster"/>
</head>
:::caution

Rancher Kubernetes Engine (RKE) will reach the end of its life on **July 31, 2025**. Harvester **v1.6.0** and later versions will not support RKE. Switching to RKE2, which provides a more secure and efficient environment, is recommended.

In-place upgrades are not an option, so you must [create new RKE2 clusters](./rke2-cluster.md) and migrate the workloads from your existing RKE clusters (known as replatforming). For more information, see [RKE End of Life](https://www.suse.com/support/kb/doc/?id=000021513).

:::

You can now provision RKE1 Kubernetes clusters on top of the Harvester cluster in Rancher using the built-in Harvester node driver.

RKE1 and RKE2 have several slight behavioral differences. Refer to the [differences between RKE1 and RKE2](https://ranchermanager.docs.rancher.com/v2.7/how-to-guides/new-user-guides/launch-kubernetes-with-rancher/rke1-vs-rke2-differences) to get some high-level insights.

![rke1-cluster](/img/v1.2/rancher/rke1-node-driver.png)

:::note

- VLAN network is required for Harvester node driver.
- Provisioning RKE1 Kubernetes clusters involves configuring the IP address of the underlying virtual machines. You can do this using a DHCP server on the VLAN network that the virtual machines are attached to. If such a server does not exist on the network, you can use the [Managed DHCP](../../advanced/addons/managed-dhcp.md) feature to configure the IP address.
- Harvester node driver only supports cloud images.
- For port requirements of guest clusters deployed within Harvester, please refer to the [port requirements for guest clusters](../../install/requirements.md#port-requirements-for-k3s-or-rkerke2-clusters).

:::

When you create a Kubernetes cluster hosted by the Harvester infrastructure, [node templates](https://rancher.com/docs/rancher/v2.6/en/cluster-provisioning/rke-clusters/node-pools/#node-templates) are used to provision the cluster nodes. These templates use Docker Machine configuration options to define an operating system image and settings/parameters for the node.

Node templates can use `cloud credentials` to access the credentials information required to provision nodes in the infrastructure providers. The same `cloud credentials` can be used by multiple node templates. By using `cloud credentials`, you do not have to re-enter access keys for the same cloud provider. `Cloud credentials` are stored as Kubernetes secrets.

You can create `cloud credentials` in two contexts:

- [During the creation of a node template](https://rancher.com/docs/rancher/v2.6/en/cluster-provisioning/rke-clusters/node-pools/#node-templates) for a cluster.
- In the User Settings page

All `cloud credentials` are bound to your user profile and cannot be shared with other users.

### Create your cloud credentials

1. Click **☰ > Cluster Management**.
1. Click **Cloud Credentials**.
1. Click **Create**.
1. Click **Harvester**.
1. Enter your cloud credential name.
1. Select "Imported Harvester Cluster".
1. Click **Create**.

![create-harvester-cloud-credentials](/img/v1.2/rancher/create-cloud-credentials.png)

### Create node templates 

You can use the Harvester node driver to create node templates and eventually node pools for your Kubernetes cluster.

1. Configure the  **Cloud Credentials**.
1. Configure **Instance Options**:
    * Configure the CPU, memory, and disk
    * Select an OS image that is compatible with the `cloud-init` config.
    * Select a network that the node driver is able to connect to; currently, only `VLAN` is supported.
    * Enter the SSH User; the username will be used to ssh to nodes. For example, a default user of the Ubuntu cloud image will be `ubuntu`.
1. (Optional) Configure **Advanced Options** if you want to customise the cloud-init config of the VMs:
1. Enter a **RANCHER TEMPLATE** name.

![](/img/v1.2/rancher/node-template.png)

See [nodes hosted by an infrastructure provider](https://rancher.com/docs/rancher/v2.6/en/cluster-provisioning/rke-clusters/node-pools/) for more information.

#### Add node affinity

_Available as of v1.0.3 + Rancher v2.6.7_

The Harvester node driver now supports scheduling a group of machines to particular nodes through the node affinity rules, which can provide high availability and better resource utilization.

Node affinity can be added to the node template during the cluster creation, click `Add Node Template` or edit your existing node template via `RKE1 Configuration > Node Templates`:

1. Check the `Advanced Options` tab and click `Add Node Selector`
   ![affinity-add-node-selector](/img/v1.2/rancher/affinity-add-node-selector.png)
1. Set priority to `Required` if you wish the scheduler to schedule the machines only when the rules are met.
1. Click `Add Rule` to specify the node affinity rules, e.g., for the [topology spread constraints](./node-driver.md#topology-spread-constraints) use case, you can add the `region` and `zone` labels as follows:
   ```yaml
   key: topology.kubernetes.io/region
   operator: in list 
   values: us-east-1
   ---
   key: topology.kubernetes.io/zone
   operator: in list 
   values: us-east-1a
   ```
   ![affinity-add-rules](/img/v1.2/rancher/affinity-add-rules.png)
1. Click `Create` to save the node template. After the cluster is installed, you can check whether its machine nodes are scheduled accordingly to the affinity rules.


### Create an RKE1 Kubernetes cluster

Users can create an RKE1 Kubernetes cluster from the **Cluster Management** page via the Harvester RKE1 node driver.

1. Select **Clusters** menu.
1. Click **Create** button.
1. Toggle Switch to **RKE1**.
1. Select Harvester node driver.
1. Enter **Cluster Name** (required).
1. Enter **Name Prefix** (required).
1. Enter **Template** (required).
1. Select **etcd** and **Control Plane** (required).
1. On the **Cluster Options** configure `Cloud Provider` to `Harvester` if you want to use the Harvester [Cloud Provider](../cloud-provider.md) and [CSI Diver](../csi-driver.md).
   ![](/img/v1.2/rancher/enable-harvester-cloud-provider.png)
1. Click **Create**.

![create-rke-harvester-cluster](/img/v1.2/rancher/create-rke-harvester-cluster.png)

### Using Harvester RKE1 node driver in air-gapped environments

RKE1 provisioning relies on the `qemu-guest-agent` to get the IP of the virtual machine, and `docker` to set up the RKE cluster. However, It may not be feasible to install `qemu-guest-agent` and `docker` in an air gapped environment.

You can address the installation constraints with the following options:

- Option 1. Use a VM image preconfigured with both `qemu-guest-agent` and `docker`.
- Option 2. Configure the `cloud-init` user data to enable the VMs to install `qemu-guest-agent` and `docker` via an HTTP(S) proxy.

Example user data in Harvester node template:
```
#cloud-config
apt:
  http_proxy: http://192.168.0.1:3128
  https_proxy: http://192.168.0.1:3128
write_files:
- path: /etc/environment
  content: |
    HTTP_PROXY="http://192.168.0.1:3128"
    HTTPS_PROXY="http://192.168.0.1:3128"
  append: true
```
