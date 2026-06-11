---
sidebar_position: 3
sidebar_label: Creating an K3s Kubernetes Cluster
title: "Creating an K3s Kubernetes Cluster"
---

<head>
  <link rel="canonical" href="https://docs.harvesterhci.io/v1.8/rancher/node/k3s-cluster"/>
</head>

You can now `Provision new nodes and create a cluster using RKE2/K3s` on top of the Harvester cluster in Rancher using the built-in Harvester node driver.

![k3s-cluster](/img/v1.9/rancher/create-cluster-via-harvester-node-driver.png)

:::note

- Harvester K3s node driver is in **Tech Preview**.
- Provisioning K3s Kubernetes clusters involves configuring the IP address of the underlying virtual machines. You can do this using a DHCP server on the VLAN network that the virtual machines are attached to. If such a server does not exist on the network, you can use the [Managed DHCP](../../advanced/addons/managed-dhcp.md) feature to configure the IP address.
- [VLAN network](../../networking/harvester-network.md#vlan-network) is required for Harvester node driver.
- Harvester node driver only supports cloud images.
- For the port requirements of the guest clusters deployed within Harvester, please refer to the [port requirements for guest clusters](../../install/requirements.md#port-requirements-for-k3s-or-rke2-clusters).

:::

### Create your cloud credentials

1. Click **☰ > Cluster Management**.
2. Click **Cloud Credentials**.
3. Click **Create**.
4. Click **Harvester**.
5. Enter your cloud credential name
6. Select "Imported Harvester Cluster".
7. Click **Create**.

![create-harvester-cloud-credentials](/img/v1.9/rancher/create-cloud-credentials-v2.14.2.png)

###  Create K3s Kubernetes cluster

Users can create a K3s Kubernetes cluster from the **Cluster Management** page via the Harvester node driver.

1. Select **Clusters** menu.
2. Click **Create** button.
3. Select Harvester node driver.
4. Select a **Cloud Credential**.
5. Enter **Cluster Name** (required).
6. Enter **Namespace** (required).
7. Enter **Image** (required).
8. Enter **Network Name** (required).
9. Enter **SSH User** (required).
10. (optional) Configure the **Show Advanced > User Data** to install the required packages of VM.
```yaml
#cloud-config
package_update: true
packages:
  - qemu-guest-agent
runcmd:
  - - systemctl
    - enable
    - '--now'
    - qemu-guest-agent.service
```
11. Select cluster type `(RKE2/K3s)` and version.
12. Configure cluster-specific settings. (Dynamically loads based on your selection.)
13. Click **Create**.

:::important

Ensure all **Machine Pools** use the same first(primary) Network. RKE2 relies on this network to boot the cluster; using different networks across machine pools may cause the cluster to fail.

:::

Machine Pools (Basic)
![create-rke2-harvester-cluster-1](/img/v1.9/rancher/create-rke2-harvester-cluster-1.png)

Machine Pools (Advanced)
![create-rke2-harvester-cluster-2](/img/v1.9/rancher/create-rke2-harvester-cluster-2.png)

Cluster Type & Version
![create-rke2-harvester-cluster-rke2-k3s-selection](/img/v1.9/rancher/create-rke2-harvester-cluster-rke2-k3s-selection.png)

K3s Settings (Only applies if K3s is selected)
![create-rke2-harvester-cluster-3](/img/v1.9/rancher/create-rke2-harvester-cluster-3-k3s.png)

:::note

- Only imported Harvester clusters are supported by the Harvester node driver.

:::

#### Add node affinity

_Available as of v1.0.3 + Rancher v2.6.7_

The Harvester node driver now supports scheduling a group of machines to particular nodes through the node affinity rules. This provides high availability and better resource utilization.

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
4. Click `Create` to save the node template. After the cluster is installed, you can check whether its machine nodes are scheduled according to the affinity rules.


### Using Harvester K3s node driver in air gapped environment

K3s provisioning relies on the `qemu-guest-agent` package to get the IP of the virtual machine.

However, it may not be feasible to install packages in an air gapped environment.

You can address the installation constraints with the following options:

- Option 1. Use a VM image preconfigured with the required packages (e.g., `iptables`, `qemu-guest-agent`).
- Option 2. Go to **Show Advanced** > **User Data** to allow VMs to install the required packages via an HTTP(S) proxy.

Example of `user data` in Harvester node template:
```
#cloud-config
apt:
  http_proxy: http://192.168.0.1:3128
  https_proxy: http://192.168.0.1:3128
```

### Known Issue: Cannot provision K3s after re-registering cluster

Cluster provisioning may fail with an error similar to: 

  ```bash
    clusters.management.cattle.io "<old-cluster-id>" not found
  ```

This can occur if a Harvester cluster was removed and re-registered in Rancher, leaving behind stale CloudCredentials.

For details and workaround, see:
[Harvester Cloud Provider documentation](../cloud-provider#known-issue-stale-harvester-cloudcredentials-after-re-registering-cluster)