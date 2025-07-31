---
sidebar_position: 4
sidebar_label: Storage Network
title: "Storage Network"
---

<head>
  <link rel="canonical" href="https://docs.harvesterhci.io/v1.5/advanced/storagenetwork"/>
</head>

Harvester uses Longhorn to provide block device volumes for virtual machines and pods. If you want to isolate Longhorn replication traffic from `mgmt` (the built-in cluster network) or other cluster-wide workloads, you can use a dedicated storage network for better network bandwidth and performance.

For more information, see [Longhorn Storage Network](https://longhorn.io/docs/1.8.1/advanced-resources/deploy/storage-network/).

:::note

- Avoid configuring Longhorn settings directly, as this can result in unexpected or unwanted system behavior.
- You can only use the Longhorn storage network with the Longhorn V1 Data Engine. Usage with the V2 Data Engine is not yet supported.

:::

## Prerequisites

Before you begin configuring the storage network, ensure that the following requirements are met:

- The network switches are correctly configured, and a dedicated VLAN ID is assigned to the storage network.

- The [cluster network](../networking/clusternetwork.md) and [VLAN network](../networking/harvester-network.md) are configured correctly. Ensure that both networks cover all nodes and are accessible.

- The IP range of the storage network has the following characteristics:

  - Uses the IPv4 CIDR format
    
  - Does not conflict or overlap with Kubernetes cluster networks
    
    The following addresses are reserved: `10.42.0.0/16`, `10.43.0.0/16`, `10.52.0.0/16`, and `10.53.0.0/16`.

  - Covers the requirements of the cluster
    
    The required number of IP addresses is calculated using the following formula: `Required number of IPs = (Number of nodes * 2) + (Number of disks * 2) + Number of images to be downloaded or uploaded`
    
    Example: If a cluster has five nodes with two disks each, and ten images are to be uploaded simultaneously, the IP range should be greater than or equal to `/26` (calculation: (5 x 2) + (5 x 2) + 10 = 30).

  - Excludes IP addresses that Longhorn pods and the storage network must not use, such as addresses reserved for [RWX volumes](../rancher/csi-driver.md#rwx-volumes-support), the gateway, and other components.

    Longhorn pods use the storage network as follows:

    - `instance-manager` pods: Longhorn Instance Manager components were [consolidated in Longhorn v1.5.0](https://longhorn.io/docs/1.5.0/deploy/important-notes/#instance-managers-consolidated). Each node requires one IP address. During an upgrade, both old and new versions of these pods exist, and the old version is deleted once the upgrade is completed.

    - `backing-image-ds` pods: These pods process on-the-fly uploads and downloads of backing image data sources, and are removed once the image uploads and downloads are completed.
    
    - `backing-image-manager` pods: Each disk requires one IP address. During an upgrade, both old and new versions of these pods exist, and the old version is deleted once the upgrade is completed.

- The Whereabouts CNI is installed correctly.

  You can check if the `ippools.whereabouts.cni.cncf.io` CRD exists in the cluster using the command `kubectl get crd ippools.whereabouts.cni.cncf.io`.
  
  If an empty string is returned, add the CRDs in [this directory](https://github.com/harvester/harvester/tree/v1.1.0/deploy/charts/harvester/dependency_charts/whereabouts/crds) using the following commands:

  ```
  kubectl apply -f https://raw.githubusercontent.com/harvester/harvester/v1.1.0/deploy/charts/harvester/dependency_charts/whereabouts/crds/whereabouts.cni.cncf.io_ippools.yaml

  kubectl apply -f https://raw.githubusercontent.com/harvester/harvester/v1.1.0/deploy/charts/harvester/dependency_charts/whereabouts/crds/whereabouts.cni.cncf.io_overlappingrangeipreservations.yaml
  ```

  :::note

  The Whereabouts CNI is not installed correctly in certain [upgrade scenarios](https://github.com/harvester/harvester/issues/3168).

  :::

- All virtual machines are stopped.

  You can check the status of virtual machines using the command `kubectl get -A vmi`, which should return an empty string.

- All pods that are attached to Longhorn volumes are stopped.

- All ongoing image uploads and downloads are either completed or deleted.

## Longhorn Replication Traffic Routing

The routing of Longhorn replication traffic depends on whether virtual machine VLAN traffic and the Longhorn storage network share the same physical interfaces or use different ones.

- **Same physical interfaces**: In the following example, both `eth2` and `eth3` are used for virtual machine VLAN traffic and the Longhorn storage network. The red line indicates that Longhorn sends replication traffic through `eth3`.

  ![storagenetwork-same.png](/img/v1.2/storagenetwork/storagenetwork-same.png)

  :::note

  You must include `eth2` and `eth3` in the cluster network and VLAN network configuration.

  :::

- **Different physical interfaces**: In the following example, `eth2` and `eth3` are used for virtual machine VLAN traffic, while `eth4` and `eth5` are used for the Longhorn storage network. The red line indicates that Longhorn sends replication traffic through `eth4`.

  ![storagenetwork-diff.png](/img/v1.2/storagenetwork/storagenetwork-diff.png)

  :::note

  You must include `eth4` and `eth5` in the cluster network and VLAN network configuration.

  :::

## `storage-network` Setting

The [`storage-network`](./settings.md#storage-network) setting allows you to configure the network used to isolate in-cluster storage traffic when segregation is required.

You can [enable](#enable-the-storage-network) and [disable](#disable-the-storage-network) the storage network using either the UI or the CLI. When the setting is enabled, you must construct a Multus `NetworkAttachmentDefinition` CRD by configuring certain fields.

The following occur once the `storage-network` setting is applied:

- Harvester stops all pods that are related to Longhorn volumes, Prometheus, Grafana, Alertmanager, and the VM Import Controller.
- Harvester creates a new `NetworkAttachmentDefinition` and updates the Longhorn Storage Network setting.
- Longhorn restarts all `instance-manager-r`, `instance-manager-e`, and `backing-image-manager` pods to apply the new network configuration.

### Configuration Steps

<Tabs>
<TabItem value="ui" label="UI" default>

:::tip

Using the Harvester UI to configure the `storage-network` setting is strongly recommended.

:::

#### Enable the Storage Network

1. Go to **Advanced > Settings > storage-network**.

  ![storage-network-enabled.png](/img/v1.4/storagenetwork/storage-network-enabled.png)

1. Select **Enabled**.

1. Configure the **VLAN ID**, **Cluster Network**, **IP Range**, and **Exclude** fields to construct a Multus `NetworkAttachmentDefinition` CRD.

1. Click **Save**.

#### Disable the Storage Network

1. Go to **Advanced > Settings > storage-network**.

  ![storage-network-disabled.png](/img/v1.4/storagenetwork/storage-network-disabled.png)

1. Select **Disabled**.

1. Click **Save**.

Once the storage network is disabled, Longhorn starts using the pod network for storage-related operations.

</TabItem>
<TabItem value="cli" label="CLI">

You can use the following command to configure the [`storage-network`](./settings.md#storage-network) setting.

```bash
kubectl edit settings.harvesterhci.io storage-network
```

The storage network is automatically enabled in the following situations:

- The value field contains a valid JSON string.

  Example:

  ```yaml
  apiVersion: harvesterhci.io/v1beta1
  kind: Setting
  metadata:
  name: storage-network
  value: '{"vlan":100,"clusterNetwork":"storage","range":"192.168.0.0/24", "exclude":["192.168.0.100/32"]}'
  ```

- The value field is empty.

  ```yaml
  apiVersion: harvesterhci.io/v1beta1
  kind: Setting
  metadata:
    name: storage-network
  value: ''
  ```

The storage network is disabled when you remove the value field.

  ```yaml
  apiVersion: harvesterhci.io/v1beta1
  kind: Setting
  metadata:
    name: storage-network
  ```

:::caution

Harvester considers extra insignificant characters in a JSON string as a different configuration.

:::

</TabItem>
</Tabs>

#### Change the MTU of the Storage Network

See [Change the MTU of a Network Configuration with an Attached Storage Network](../networking/clusternetwork.md#change-the-mtu-of-a-network-configuration-with-an-attached-storage-network).

### Post-Configuration Steps

:::info important

Harvester does not start virtual machines automatically. You must ensure that the configuration is correct and applied successfully, and then start the virtual machines when necessary.

:::

1. Verify that the `storage-network` setting's status is `True` and the type is `configured` using the following command:

    ```bash
    kubectl get settings.harvesterhci.io storage-network -o yaml
    ```

    Example:

    ```yaml
    apiVersion: harvesterhci.io/v1beta1
    kind: Setting
    metadata:
      annotations:
        storage-network.settings.harvesterhci.io/hash: da39a3ee5e6b4b0d3255bfef95601890afd80709
        storage-network.settings.harvesterhci.io/net-attach-def: ""
        storage-network.settings.harvesterhci.io/old-net-attach-def: ""
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

1. Verify that the Longhorn pods (`instance-manager-e`, `instance-manager-r`, and `backing-image-manager`) are ready and that their networks are correctly configured.

    You can inspect each pod using the following command:

    ```bash
    kubectl -n longhorn-system describe pod <pod-name>
    ```

    Errors similar to the following indicate that the storage network has exhausted its available IP addresses. You must reconfigure the storage network with a sufficient IP range.

    ```bash
    Events:
      Type     Reason                  Age                    From     Message
      ----     ------                  ----                   ----     -------
      ....

      Warning  FailedCreatePodSandBox  2m58s                  kubelet  Failed to create pod sandbox: rpc error: code = Unknown desc = failed to setup network for
    sandbox "04e9bc160c4f1da612e2bb52dadc86702817ac557e641a3b07b7c4a340c9fc48": plugin type="multus" name="multus-cni-network" failed (add): [longhorn-system/backing-image-ds-default-image-lxq7r/7d6995ee-60a6-4f67-b9ea-246a73a4df54:storagenetwork-sdfg8]: error adding container to network "storagenetwork-sdfg8": error at storage engine: Could not allocate IP in range: ip: 172.16.0.1 / - 172.16.0.6 / range: net.IPNet{IP:net.IP{0xac, 0x10, 0x0, 0x0}, Mask:net.IPMask{0xff,0xff, 0xff, 0xf8}}
    ....
    ```

    :::note

    If the storage network has exhausted its available IP addresses, you might encounter similar errors when you upload or download images. You must delete the affected images and reconfigure the storage network with a sufficient IP range.

    :::

1. Verify that an interface named `lhnet1` exists in the `k8s.v1.cni.cncf.io/network-status` annotations. The IP address of this interface must be within the designated IP range.

    You can retrieve a list of Longhorn `instance-manager` pods using the following command:

    ```bash
    kubectl get pods -n longhorn-system -l longhorn.io/component=instance-manager -o yaml
    ```

    Example:

    ```yaml
    apiVersion: v1
    kind: Pod
    metadata:
      annotations:
        cni.projectcalico.org/containerID: 2518b0696f6635896645b5546417447843e14208525d3c19d7ec6d7296cc13cd
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
              "name": "harvester-system/storagenetwork-95bj4",
              "interface": "lhnet1",
              "ips": [
                  "192.168.0.3"
              ],
              "mac": "2e:51:e6:31:96:40",
              "dns": {}
          }]
        k8s.v1.cni.cncf.io/networks: '[{"namespace": "harvester-system", "name": "storagenetwork-95bj4",
          "interface": "lhnet1"}]'
        k8s.v1.cni.cncf.io/networks-status: |-
          [{
              "name": "k8s-pod-network",
              "ips": [
                  "10.52.2.122"
              ],
              "default": true,
              "dns": {}
          },{
              "name": "harvester-system/storagenetwork-95bj4",
              "interface": "lhnet1",
              "ips": [
                  "192.168.0.3"
              ],
              "mac": "2e:51:e6:31:96:40",
              "dns": {}
          }]
        kubernetes.io/psp: global-unrestricted-psp
        longhorn.io/last-applied-tolerations: '[{"key":"kubevirt.io/drain","operator":"Exists","effect":"NoSchedule"}]'

    Omitted...
    ```

1. Test the communication between the Longhorn pods.

    The storage network is dedicated to internal communication between Longhorn pods, resulting in high performance and reliability. However, the storage network still relies on the [external network infrastructure](../networking/deep-dive.md#external-networking) for connectivity (similar to how the [virtual machine VLAN network](../networking/harvester-network.md#create-a-vm-with-vlan-network) functions). When the external network is not connected and configured correctly, you may encounter the following issues:

    - The newly created virtual machine becomes stuck at the `Not-Ready` state.
    
    - The `longhorn-manager` pod logs include error messages.

      Example:

      ```
      longhorn-manager-j6dhh/longhorn-manager.log:2024-03-20T16:25:24.662251001Z time="2024-03-20T16:25:24Z" level=error msg="Failed rebuilding of replica 10.0.16.26:10000" controller=longhorn-engine engine=pvc-0a151c59-ffa9-4938-9c86-59ebb296bc88-e-c2a7fe77 error="proxyServer=10.52.6.33:8501 destination=10.0.16.23:10000: failed to add replica tcp://10.0.16.26:10000 for volume: rpc error: code = Unknown desc = failed to get replica 10.0.16.26:10000: rpc error: code = Unavailable desc = all SubConns are in TransientFailure, latest connection error: connection error: desc = \"transport: Error while dialing dial tcp 10.0.16.26:10000: connect: no route to host\"" node=oml-harvester-9 volume=pvc-0a151c59-ffa9-4938-9c86-59ebb296bc88
      ```

    To test the communication between Longhorn pods, perform the following steps:

    1. Obtain the storage network IP of each Longhorn Instance Manager pod identified in the previous step.

      Example:

      ```
      instance-manager-r-43f1624d14076e1d95cd72371f0316e2
      storage network IP: 10.0.16.8

      instance-manager-e-ba38771e483008ce61249acf9948322f
      storage network IP: 10.0.16.14
      ```

    1. Log in to those pods.

      When you run the command `ip addr`, the output includes IPs that are identical to IPs in the pod annotations. In the following example, one IP is for the pod network, while the other is for the storage network.

      Example:

      ```
      $ kubectl exec -i -t -n longhorn-system instance-manager-e-ba38771e483008ce61249acf9948322f -- /bin/sh
      
      $ ip addr
      1: lo: <LOOPBACK,UP,LOWER_UP> mtu 65536 qdisc noqueue state UNKNOWN group default qlen 1000
          link/loopback 00:00:00:00:00:00 brd 00:00:00:00:00:00
          inet 127.0.0.1/8 scope host lo
      ...
      3: eth0@if2277: <BROADCAST,MULTICAST,UP,LOWER_UP> mtu 1450 qdisc noqueue state UP group default  // pod network link
          link/ether 0e:7c:d6:77:44:72 brd ff:ff:ff:ff:ff:ff link-netnsid 0
          inet 10.52.6.146/32 scope global eth0
      ...
      4: lhnet1@if2278: <BROADCAST,MULTICAST,UP,LOWER_UP> mtu 1500 qdisc noqueue state UP group default // storage network link, note the MTU value
          link/ether fe:92:4f:fb:dd:20 brd ff:ff:ff:ff:ff:ff link-netnsid 0
          inet 10.0.16.14/20 brd 10.0.31.255 scope global lhnet1
      ...

      $ ip route
      default via 169.254.1.1 dev eth0
      10.0.16.0/20 dev lhnet1 proto kernel scope link src 10.0.16.14
      169.254.1.1 dev eth0 scope link
      ```

      :::note

      The storage network link always inherits the MTU value from the attached [cluster network](../networking/clusternetwork.md#cluster-network), regardless of the [configured MTU value](../networking/clusternetwork.md#change-the-mtu-of-a-network-configuration-with-an-attached-storage-network).

      :::

    1. Start a simple HTTP server in one pod.
    
      You must explicitly bind this HTTP server to the storage network IP.

      Example:

      ```
      $ python3 -m http.server 8000 --bind 10.0.16.14 (replace with your pod storage network IP)
      ```

    1. Test the HTTP server in another pod.

      Example:

      ```
      From instance-manager-r-43f1624d14076e1d95cd72371f0316e2 (IP 10.0.16.8)

      $ curl http://10.0.16.14:8000
      ```

      When the storage network is functioning correctly, the `curl` command returns a list of files on the HTTP server.

    1. (Optional) Troubleshoot issues.

      The storage network may malfunction because of issues with the external network, such as the following:

      - Physical NICs (installed on Harvester nodes) that are associated with the storage network were not added to the same VLAN in the external switches.
      - The external switches are not correctly connected and configured.

Once the configuration is verified, you can manually start virtual machines when necessary.

## Best Practices

- When configuring an [IP range](#configuration-example) for the storage network, ensure that the allocated IP addresses can service the future needs of the cluster. This is important because Longhorn pods (`instance-manager` and `backing-image-manager`) stop running when new nodes are added to the cluster or more disks are added to a node after the storage network is configured, and when the required number of IPs exceeds the allocated IPs. Resolving the issue involves reconfiguring the storage network with the correct IP range.

- Configure the storage network on a non-`mgmt` cluster network to ensure complete separation of the Longhorn replication traffic from the Kubernetes control plane traffic. Using `mgmt` is possible but not recommended because of the negative impact (resource and bandwidth contention) on the control plane network performance. Use `mgmt` only if your cluster has NIC-related constraints and if you can completely segregate the traffic.
