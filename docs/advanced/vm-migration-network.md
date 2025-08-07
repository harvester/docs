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

Before you begin configuring the VM migration network, ensure that the following requirements are met:

- The network switches are correctly configured, and a dedicated VLAN ID is assigned to the VM migration network.

- The [cluster network](../networking/clusternetwork.md) and [VLAN network](../networking/harvester-network.md) are configured correctly. Ensure that both networks cover all nodes and are accessible.

- No virtual machines are being migrated.

- The IP range of the VM migration network is in the IPv4 CIDR format and must neither conflict nor overlap with Kubernetes cluster networks. The following addresses are reserved: `10.42.0.0/16`, `10.43.0.0/16`, `10.52.0.0/16` and `10.53.0.0/16`.

### `vm-migration-network` Setting

The [`vm-migration-network`](./settings.md#vm-migration-network) setting allows you to configure the network used to isolate in-cluster VM migration traffic when segregation is required.

You can [enable](#enable-the-vm-migration-network) and [disable](#disable-the-vm-migration-network) the VM migration network using either the UI or the CLI. When the setting is enabled, you must construct a Multus `NetworkAttachmentDefinition` CRD by configuring certain fields.

<Tabs>
<TabItem value="ui" label="UI" default>

:::tip

Using the Harvester UI to configure the `vm-migration-network` setting is strongly recommended.

:::

#### Enable the VM Migration Network

1. Go to **Advanced > Settings > vm-migration-network**.

1. Select **Enabled**.

1. Configure the **VLAN ID**, **Cluster Network**, **IP Range**, and **Exclude** fields to construct a Multus `NetworkAttachmentDefinition` CRD.

1. Click **Save**.

![vm-migration-network-enabled.png](/img/v1.6/vm-migration-network/vm-migration-network-enabled.png)

#### Disable the VM Migration Network

1. Go to **Advanced > Settings > vm-migration-network**.

1. Select **Disabled**.

1. Click **Save**.

Once the VM migration network is disabled, KubeVirt starts using `mgmt` for VM migration-related operations.

![vm-migration-network-disabled.png](/img/v1.6/vm-migration-network/vm-migration-network-disabled.png)

</TabItem>

<TabItem value="cli" label="CLI">

You can use the following command to configure the [`vm-migration-network`](./settings.md#vm-migration-network) setting.

```bash
kubectl edit settings.harvesterhci.io vm-migration-network
```

The VM migration network is automatically enabled in the following situations:

- The value field contains a valid JSON string.

  ```yaml
  apiVersion: harvesterhci.io/v1beta1
  kind: Setting
  metadata:
    name: vm-migration-network
  value: '{"vlan":100,"clusterNetwork":"vm-migration","range":"192.168.1.0/24", "exclude":["192.168.1.100/32"]}'
  ```

The VM migration network is disabled when you remove the value field or set it to an empty string.

  ```yaml
  apiVersion: harvesterhci.io/v1beta1
  kind: Setting
  metadata:
    name: vm-migration-network
  ```

  ```yaml
  apiVersion: harvesterhci.io/v1beta1
  kind: Setting
  metadata:
    name: vm-migration-network
  value: ''
  ```

:::caution

Harvester considers extra insignificant characters in a JSON string as a different configuration.

:::

</TabItem>
</Tabs>

The following occur once the `vm-migration-network` setting is applied:

- Harvester creates a new `NetworkAttachmentDefinition` and updates the KubeVirt configuration.
- KubeVirt restarts all `virt-handler` pods to apply the new network configuration.

### Post-Configuration Steps

1. Verify that the setting's status is `True` and the type is `configured` using the following command:

    ```bash
    kubectl get settings.harvesterhci.io vm-migration-network -o yaml
    ```

    Example:

    ```yaml
    apiVersion: harvesterhci.io/v1beta1
    kind: Setting
    metadata:
      annotations:
        vm-migration-network.settings.harvesterhci.io/hash: ec8322fb6b741f94739cbb904fc73c3fda864d6d
        vm-migration-network.settings.harvesterhci.io/net-attach-def: harvester-system/vm-migration-network-6flk7
      creationTimestamp: "2025-06-13T06:36:39Z"
      generation: 51
      name: vm-migration--network
      resourceVersion: "154638"
      uid: 2233ad63-ee52-45f6-a79c-147e48fc88db
    status:
      conditions:
      - lastUpdateTime: "2025-06-13T13:05:17Z"
        reason: Completed
        status: "True"
        type: configured
    ```

1. Verify that all KubeVirt `virt-handler` pods are ready and that their networks are correctly configured.

    You can inspect pod details using the following command:

    ```bash
    kubectl -n harvester-system describe pod <pod-name>
    ```

1. Check the `k8s.v1.cni.cncf.io/network-status` annotations and verify that an interface named `migration0` exists. The IP address of this interface must be within the designated IP range.

    You can retrieve a list of `virt-handler` pods using the following command:

    ```bash
    kubectl get pods -n harvester-system -l kubevirt.io=virt-handler -o yaml
    ```

    Example:

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

- When configuring an [IP range](#prerequisites) for the VM migration network, ensure that the allocated IP addresses can service the future needs of the cluster. This is important because KubeVirt pods (`virt-handler`) stop running when new nodes are added to the cluster after the VM migration network is configured, and when the required number of IPs exceeds the allocated IPs. Resolving the issue involves reconfiguring the storage network with the correct IP range.

- Configure the VM migration network on a non-`mgmt` cluster network to ensure complete separation of the VM migration traffic from the Kubernetes control plane traffic. Using `mgmt` is possible but not recommended because of the negative impact (resource and bandwidth contention) on the control plane network performance. Use `mgmt` only if your cluster has NIC-related constraints and if you can completely segregate the traffic.
