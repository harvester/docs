---
sidebar_position: 2
sidebar_label: Creating an RKE2 Kubernetes Cluster
title: "Creating an RKE2 Kubernetes Cluster"
---

<head>
  <link rel="canonical" href="https://docs.harvesterhci.io/v1.7/rancher/node/rke2-cluster"/>
</head>

You can now provision RKE2 Kubernetes clusters on top of the Harvester cluster in Rancher using the built-in Harvester node driver.

![rke2-cluster](/img/v1.2/rancher/rke2-k3s-node-driver.png)

:::note

- [VLAN network](../../networking/harvester-network.md#vlan-network) is required for Harvester node driver.
- Provisioning RKE2 Kubernetes clusters involves configuring the IP address of the underlying virtual machines. You can do this using a DHCP server on the VLAN network that the virtual machines are attached to. If such a server does not exist on the network, you can use the [Managed DHCP](../../advanced/addons/managed-dhcp.md) feature to configure the IP address.
- Harvester node driver only supports cloud images.
- For the port requirements of the guest clusters deployed within Harvester, please refer to the doc [here](../../install/requirements.md#port-requirements-for-k3s-or-rke2-clusters).
- For RKE2 with Harvester cloud provider support matrix, please refer to the website [here](https://www.suse.com/suse-harvester/support-matrix/all-supported-versions/).

:::

### Backward Compatibility Notice

:::note

Please note a known backward compatibility issue if you're using the Harvester cloud provider version **v0.2.2** or higher.  If your Harvester version is below **v1.2.0** and you intend to use newer RKE2 versions (i.e., >= `v1.26.6+rke2r1`, `v1.25.11+rke2r1`, `v1.24.15+rke2r1`), it is essential to upgrade your Harvester cluster to v1.2.0 or a higher version before proceeding with the upgrade of the guest Kubernetes cluster or Harvester cloud provider.

For a detailed support matrix, please refer to the **Harvester CCM & CSI Driver with RKE2 Releases** section of the official [website](https://www.suse.com/suse-harvester/support-matrix/all-supported-versions/).

:::


### Create your cloud credentials

1. Click **☰ > Cluster Management**.
2. Click **Cloud Credentials**.
3. Click **Create**.
4. Click **Harvester**.
5. Enter your cloud credential name
6. Select "Imported Harvester Cluster".
7. Click **Create**.

![create-harvester-cloud-credentials](/img/v1.2/rancher/create-cloud-credentials.png)

###  Create RKE2 kubernetes cluster

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
11. (optional) Configure the **Show Advanced > User Data** to install the required packages of VM.
```yaml
#cloud-config
packages:
  - iptables
```

:::note

Calico and Canal networks require the `iptables` or `xtables-nft` package to be installed on the node, for more details, please refer to the [RKE2 known issues](https://docs.rke2.io/known_issues#canal-and-ip-exhaustion).

:::


12. Click **Create**.

![create-rke2-harvester-cluster-1](/img/v1.2/rancher/create-rke2-harvester-cluster-1.png)
![create-rke2-harvester-cluster-2](/img/v1.2/rancher/create-rke2-harvester-cluster-2.png)
![create-rke2-harvester-cluster-3](/img/v1.2/rancher/create-rke2-harvester-cluster-3.png)

:::note

- RKE2 v1.21.5+rke2r2 or above provides a built-in Harvester Cloud Provider and Guest CSI driver integration.
- Only imported Harvester clusters are supported by the Harvester node driver.

:::

#### Add node affinity

_Available as of v1.0.3 + Rancher v2.6.7_

The Harvester node driver now supports scheduling a group of machines to particular nodes through the node affinity rules, which can provide high availability and better resource utilization.

Node affinity can be added to the machine pools during the cluster creation:

1. Click the `Show Advanced` button and click the `Add Node Selector`
   ![affinity-add-node-selector](/img/v1.2/rancher/affinity-rke2-add-node-selector.png)
2. Set priority to `Required` if you wish the scheduler to schedule the machines only when the rules are met.
3. Click `Add Rule` to specify the node affinity rules, e.g., for the [topology spread constraints](./node-driver.md#topology-spread-constraints) use case, you can add the `region` and `zone` labels as follows:
   ```yaml
   key: topology.kubernetes.io/region
   operator: in list 
   values: us-east-1
   ---
   key: topology.kubernetes.io/zone
   operator: in list 
   values: us-east-1a
   ```
   ![affinity-add-rules](/img/v1.2/rancher/affinity-rke2-add-rules.png)

#### Add workload affinity

_Available as of v1.2.0 + Rancher v2.7.6_

The workload affinity rules allow you to constrain which nodes your machines can be scheduled on based on the labels of workloads (VMs and Pods) already running on these nodes, instead of the node labels.

Workload affinity rules can be added to the machine pools during the cluster creation:

1. Select **Show Advanced** and choose **Add Workload Selector**.
   ![affinity-add-workload-selector](/img/v1.2/rancher/affinity-rke2-add-workload-selector.png)
2. Select **Type**, **Affinity** or **Anti-Affinity**.
3. Select **Priority**. **Prefered** means it's an optional rule, and **Required** means a mandatory rule.
4. Select the namespaces for the target workloads.
5. Select **Add Rule** to specify the workload affinity rules.
6. Set **Topology Key** to specify the label key that divides Harvester hosts into different topologies.

See the [Kubernetes Pod Affinity and Anti-Affinity Documentation](https://kubernetes.io/docs/concepts/scheduling-eviction/assign-pod-node/#inter-pod-affinity-and-anti-affinity) for more details.

###  Update RKE2 Kubernetes cluster

The fields highlighted below of the RKE2 machine pool represent the Harvester VM configurations. Any modifications to these fields will trigger node reprovisioning.

![rke2-harvester-fields](/img/v1.2/rancher/rke2-harvester-fields.png)

### Using Harvester RKE2 node driver in air gapped environment

RKE2 provisioning relies on the `qemu-guest-agent` package to get the IP of the virtual machine.

Calico and Canal require the `iptables` or `xtables-nft` package to be installed on the node.

However, it may not be feasible to install packages in an air gapped environment.

You can address the installation constraints with the following options:

- Option 1. Use a VM image preconfigured with required packages (e.g., `iptables`, `qemu-guest-agent`).
- Option 2. Go to **Show Advanced** > **User Data** to allow VMs to install the required packages via an HTTP(S) proxy.

Example user data in Harvester node template:
```
#cloud-config
apt:
  http_proxy: http://192.168.0.1:3128
  https_proxy: http://192.168.0.1:3128
```
