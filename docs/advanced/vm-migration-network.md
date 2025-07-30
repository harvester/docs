---
sidebar_position: 12
sidebar_label: VM Migration Network
title: "VM Migration Network"
---

A VM migration network is useful for isolating migration traffic from cluster traffic on `mgmt` and other cluster-wide workloads. Using a VM migration network results in better network bandwidth and performance.

:::note

Avoid configuring KubeVirt settings directly, as this can result in unexpected or unwanted system behavior.

:::

## Prerequisites

There are some prerequisites before configuring the Harvester VM Migration Network setting.

- Well-configured Cluster Network and VLAN Config.
    - Users have to ensure the Cluster Network is configured and VLAN Config will cover all nodes and ensure the network connectivity is working and expected in all nodes.
- No VM Migration in progress before configuring the VM Migration Network setting.

:::caution

If the Harvester cluster was upgraded from v1.0.3, please check if Whereabouts CNI is installed properly before you move on to the next step. We will always recommend following this guide to check. [Issue 3168](https://github.com/harvester/harvester/issues/3168) describes that the Harvester cluster will not always install Whereabouts CNI properly.

- Verify the `ippools.whereabouts.cni.cncf.io` CRD exists with the following command.
    - `kubectl get crd ippools.whereabouts.cni.cncf.io`

:::

## Configuration Example

- VLAN ID
	- Please check with your network switch setting, and provide a dedicated VLAN ID for VM Migration Network.
- Well-configured Cluster Network and VLAN Config
	- Please refer Networking page for more details and configure [Cluster Network](../networking/clusternetwork.md) and [VLAN Config](../networking/harvester-network.md).
- IP range for VM Migration Network
	- IP range should not conflict or overlap with Kubernetes cluster networks(`10.42.0.0/16`, `10.43.0.0/16`, `10.52.0.0/16` and `10.53.0.0/16` are reserved).
	- IP range should be in IPv4 CIDR format.
  - Exclude IP addresses that KubeVirt pods and the VM migration network must not use.

We will take the following configuration as an example to explain the details of the VM Migration Network

- VLAN ID for VM Migration Network: `100`
- Cluster Network: `vm-migration`
- IP range: `192.168.1.0/24`
- Exclude Address: `192.168.1.1/32`

### Harvester VM Migration Network Setting

The [`vm-migration-network` setting](./settings.md#vm-migration-network) allows you to configure the network used to isolate in-cluster VM migration traffic when segregation is required.

You can [enable](#enable-the-vm-migration-network) and [disable](#disable-the-vm-migration-network) the VM migration network using either the UI or the CLI. When the setting is enabled, you must construct a Multus `NetworkAttachmentDefinition` CRD by configuring certain fields.

#### Web UI

:::tip

Using the Harvester UI to configure the `vm-migration-network` setting is strongly recommended.

:::

##### Enable the VM Migration Network

1. Go to **Advanced > Settings > vm-migration-network**.

1. Select **Enabled**.

1. Configure the **VLAN ID**, **Cluster Network**, **IP Range**, and **Exclude** fields to construct a Multus `NetworkAttachmentDefinition` CRD.

1. Click **Save**.

![storage-network-enabled.png](/img/v1.4/storagenetwork/storage-network-enabled.png)

##### Disable the VM Migration Network

1. Go to **Advanced > Settings > vm-migration-network**.

1. Select **Disabled**.

1. Click **Save**.

Once the VM migration network is disabled, KubeVirt starts using the mgmt network for VM migration related operations.

![storage-network-disabled.png](/img/v1.4/storagenetwork/storage-network-disabled.png)

#### CLI

You can use the following command to configure the [`vm-migration-network` setting](./settings.md#vm-migration-network).

```bash
kubectl edit settings.harvesterhci.io vm-migration-network
```

The value format is JSON string or empty string as shown in below:

```json
{
    "vlan": 100,
    "clusterNetwork": "vm-migration",
    "range": "192.168.1.0/24",
    "exclude":[
      "192.168.1.100/32"
    ]
}
```

The full configuration is like this example:

```yaml
apiVersion: harvesterhci.io/v1beta1
kind: Setting
metadata:
  name: vm-migration-network
value: '{"vlan":100,"clusterNetwork":"vm-migration","range":"192.168.1.0/24", "exclude":["192.168.1.100/32"]}'
```

When the VM migration network is disabled, the full configuration is as follows:

```yaml
apiVersion: harvesterhci.io/v1beta1
kind: Setting
metadata:
  name: vm-migration-network
```

:::caution

Harvester considers extra insignificant characters in a JSON string as a different configuration.

Specifying a valid value in the `value` field enables the storage network. Deleting the `value` field disables the storage network.

:::

### After Applying Harvester VM Migration Network Setting

Harvester will create a new NetworkAttachmentDefinition and update the KubeVirt configuration.

Once the KubeVirt configuration is updated, KubeVirt will restart all `virt-handler` pods to apply the new network configuration.

### Verify Configuration is Completed

#### Step 1

Check if Harvester VM Migration Network setting's status is `True` and the type is `configured`.

```bash
kubectl get settings.harvesterhci.io vm-migration-network -o yaml
```

Completed Setting Example:

```yaml
apiVersion: harvesterhci.io/v1beta1
kind: Setting
metadata:
  annotations:
    vm-migration-network.settings.harvesterhci.io/hash: ec8322fb6b741f94739cbb904fc73c3fda864d6d
    vm-migration-network.settings.harvesterhci.io/net-attach-def: harvester-system/vm-migration-network-6flk7
  creationTimestamp: "2022-10-13T06:36:39Z"
  generation: 51
  name: storage-network
  resourceVersion: "154638"
  uid: 2233ad63-ee52-45f6-a79c-147e48fc88db
status:
  conditions:
  - lastUpdateTime: "2022-10-13T13:05:17Z"
    reason: Completed
    status: "True"
    type: configured
```

#### Step 2

Verify the readiness of all KubeVirt `virt-handler` pods, and confirm that their networks are correctly configured.

Execute the following command to inspect a pod's details:

```bash
kubectl -n harvester-system describe pod <pod-name>
```

#### Step 3

Check the `k8s.v1.cni.cncf.io/network-status` annotations and ensure that an interface named `migration0` exists, with an IP address within the designated IP range.

Users could use the following command to show all `virt-handler` pods to verify.

```bash
kubectl get pods -n harvester-system -l kubevirt.io=virt-handler -o yaml
```

Correct Network Example:

```yaml
apiVersion: v1
kind: Pod
metadata:
  annotations:
    cni.projectcalico.org/containerID: 004522bc8468ea707038b43813cce2fba144f0e97551d2d358808d57caf7b543
    cni.projectcalico.org/podIP: 10.52.2.122/32
    cni.projectcalico.org/podIPs: 10.52.2.122/32
    k8s.v1.cni.cncf.io/network-status: |-
      [{
          "name": "k8s-pod-network",
          "ips": [
              "10.52.2.122"
          ],
          "default": true,
          "dns": {}
      },{
          "name": "harvester-system/vm-migration-network-6flk7",
          "interface": "migration0",
          "ips": [
              "10.1.2.1"
          ],
          "mac": "c6:30:6f:02:52:3e",
          "dns": {}
      }]
    k8s.v1.cni.cncf.io/networks: vm-migration-network-6flk7@migration0

Omitted...
```

## Best Practices

- When configuring an [IP range](#configuration-example) for the VM migration network, ensure that the allocated IP addresses can service the future needs of the cluster. This is important because KubeVirt pods (`virt-handler`) stop running when new nodes are added to the cluster after the VM migration network is configured, and when the required number of IPs exceeds the allocated IPs. Resolving the issue involves reconfiguring the storage network with the correct IP range.

- Configure the VM migration network on a non-`mgmt` cluster network to ensure complete separation of the VM migration traffic from the Kubernetes control plane traffic. Using `mgmt` is possible but not recommended because of the negative impact (resource and bandwidth contention) on the control plane network performance. Use `mgmt` only if your cluster has NIC-related constraints and if you can completely segregate the traffic.
