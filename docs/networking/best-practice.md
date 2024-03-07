---
sidebar_position: 6
sidebar_label: Harvester Network Best Practice
title: "Harvester Network Best Practice"
keywords:
- Harvester
- Networking
- Best Practice
---

<head>
  <link rel="canonical" href="https://docs.harvesterhci.io/v1.1/networking/best-practice"/>
</head>

# Harvester Network Best Practice

## Replace Ethernet NICs

You may plan to replace the ethernet NICs (Network Interface Card) of a bare-metal node in the running Harvester cluster due to the following reasons:

- NICs are broken
- NICs are with insufficent hardware capacity
- NICs are not with expected features

You may follow the below steps and run them in each node step by step.

### Validate the new NICs

1. Confirm with SUSE/Harvester if the new NICs are certificated by the related Harvester version.

1. Test the new NICs in non-production environment.

### Pre-check

1. Check all VMs from the Harvester [VM page](../vm/access-to-the-vm.md#access-with-the-harvester-ui), they should be either running or stopped.

1. Check all Longhorn volumes are healthy from the [embedded Longhorn dashboard](../troubleshooting/harvester.md#access-embedded-rancher-and-longhorn-dashboards). It also displays those none-VM related volumes.

1. (Optional) Generate a [support bundle](../troubleshooting/harvester.md#generate-a-support-bundle) for comparison with the new node later.

### Collect Information

Before any action is taken, it is important to collect the current network information and status.

- Harvester network configuration

    Harvester creates a `mgmt-bo` bond interface for the [built-in cluster network](../networking/clusternetwork.md/#built-in-cluster-network) by default, and will create a new bond interface for the uplink of each new [custom cluster network](../networking/clusternetwork.md/#custom-cluster-network). Harvester saves network configuration details in the file `/oem/90_custom.yaml`.

    Example: A NIC named `ens3` was added to the `mgmt-bo` bond interface.

    ```
    - path: /etc/sysconfig/network/ifcfg-mgmt-bo
      permissions: 384
      owner: 0
      group: 0
      content: |+
        STARTMODE='onboot'
        BONDING_MASTER='yes'
        BOOTPROTO='none'
        POST_UP_SCRIPT="wicked:setup_bond.sh"
        BONDING_SLAVE_0='ens3'
        BONDING_MODULE_OPTS='miimon=100 mode=active-backup '
        DHCLIENT_SET_DEFAULT_ROUTE='no'
      encoding: ""
      ownerstring: ""

    - path: /etc/sysconfig/network/ifcfg-ens3
      permissions: 384
      owner: 0
      group: 0
      content: |
        STARTMODE='hotplug'
        BOOTPROTO='none'
      encoding: ""
      ownerstring: ""
    ```

- Linux network links

    `ip link` show network links related information, including the state of each NIC and the corresponding master (if applicable).

    Example:

    ```
    $ ip link | grep master -1

    2: ens3: <BROADCAST,MULTICAST,SLAVE,UP,LOWER_UP> mtu 1500 qdisc pfifo_fast master mgmt-bo state UP mode DEFAULT group default qlen 1000
        link/ether 52:54:00:03:3a:e4 brd ff:ff:ff:ff:ff:ff
    --

    4: mgmt-bo: <BROADCAST,MULTICAST,MASTER,UP,LOWER_UP> mtu 1500 qdisc noqueue master mgmt-br state UP mode DEFAULT group default qlen 1000
        link/ether 52:54:00:03:3a:e4 brd ff:ff:ff:ff:ff:ff

    ```

- Linux PCI devices

    `lspci` shows a list of devices, which allows you to quickly identify the network NICs.

    Example:

    ```
    $ lspci
    00:03.0 Ethernet controller: Intel Corporation 82540EM Gigabit Ethernet Controller (rev 03)
    ```

    `lspci -v` shows detailed information about each device.

    Example:

    ```
    $ lspci -v
    00:03.0 Ethernet controller: Intel Corporation 82540EM Gigabit Ethernet Controller (rev 03)
      Subsystem: Red Hat, Inc. QEMU Virtual Machine
      Physical Slot: 3
      Flags: bus master, fast devsel, latency 0, IRQ 11
      Memory at fc080000 (32-bit, non-prefetchable) [size=128K]
      I/O ports at c000 [size=64]
      Expansion ROM at fc000000 [disabled] [size=512K]
      Kernel driver in use: e1000
      Kernel modules: e1000
    ```

- Linux kernel log

    Linux kernel log includes most of the required information. Suppose you save the output of `dmesg` to a file called `kernel.log`, then you can check the driver and link status:

    Example:

    Harvester puts sub NICs into the bond interfaces. In the following example, an additional bond interface named `data-bo` is created in the cluster.

    ```
    $ grep "(slave" kernel.log  (or: dmesg | grep "(slave")

    Jan 08 00:35:00 localhost kernel: mgmt-bo: (slave eno5): Enslaving as a backup interface with an up link
    Jan 08 00:35:00 localhost kernel: mgmt-bo: (slave ens4f0): Enslaving as a backup interface with an up link
    Jan 08 00:37:34 localhost kernel: data-bo: (slave eno6): Enslaving as a backup interface with an up link
    Jan 08 00:37:35 localhost kernel: data-bo: (slave ens4f1): Enslaving as a backup interface with an up link
    ```

    The NICs are renamed.
    ```
    $ grep "renamed" kernel.log

    Jan 08 00:34:48 localhost kernel: tg3 0000:02:00.0 eno1: renamed from eth2 // eth2 / eno1 is not used by Harvester
    Jan 08 00:34:48 localhost kernel: tg3 0000:02:00.3 eno4: renamed from eth6 // eth6 / eno4 is not used by Harvester
    Jan 08 00:34:48 localhost kernel: tg3 0000:02:00.2 eno3: renamed from eth5 // eth5 / eno3 is not used by Harvester
    Jan 08 00:34:48 localhost kernel: tg3 0000:02:00.1 eno2: renamed from eth3 // eth3 / eno2 is not used by Harvester
    Jan 08 00:34:49 localhost kernel: i40e 0000:5d:00.0 eno5: renamed from eth0
    Jan 08 00:34:49 localhost kernel: i40e 0000:af:00.0 ens4f0: renamed from eth4
    Jan 08 00:34:49 localhost kernel: i40e 0000:5d:00.1 eno6: renamed from eth1
    Jan 08 00:34:49 localhost kernel: i40e 0000:af:00.1 ens4f1: renamed from eth2
    ```

    The NIC driver of `eno5(0000:5d:00.0)` is `(intel) i40e 10Gbps Full Duplex`.
    ```
    $ grep "0000:5d:00.0" kernel.log

    Jan 08 00:34:47 localhost kernel: i40e 0000:5d:00.0: fw 8.71.63306 api 1.11 nvm 10.54.7 [8086:1572] [103c:22fc]
    Jan 08 00:34:47 localhost kernel: i40e 0000:5d:00.0: MAC address: 48:df:37:24:c2:00
    Jan 08 00:34:47 localhost kernel: i40e 0000:5d:00.0: FW LLDP is enabled
    Jan 08 00:34:47 localhost kernel: i40e 0000:5d:00.0 eth0: NIC Link is Up, 10 Gbps Full Duplex, Flow Control: None
    Jan 08 00:34:47 localhost kernel: i40e 0000:5d:00.0: PCI-Express: Speed 8.0GT/s Width x8
    Jan 08 00:34:47 localhost kernel: i40e 0000:5d:00.0: Features: PF-id[0] VFs: 64 VSIs: 66 QP: 112 RSS FD_ATR FD_SB NTUPLE DCB VxLAN Geneve PTP VEPA
    Jan 08 00:34:49 localhost kernel: i40e 0000:5d:00.0 eno5: renamed from eth0
    ```

    The enabled NICs are detected.
    ```
    $ grep "is Up" kernel.log

    Jan 08 00:34:47 localhost kernel: i40e 0000:5d:00.0 eth0: NIC Link is Up, 10 Gbps Full Duplex, Flow Control: None
    Jan 08 00:34:48 localhost kernel: i40e 0000:5d:00.1 eth1: NIC Link is Up, 10 Gbps Full Duplex, Flow Control: None
    Jan 08 00:34:48 localhost kernel: i40e 0000:af:00.0 eth4: NIC Link is Up, 10 Gbps Full Duplex, Flow Control: None
    Jan 08 00:34:49 localhost kernel: i40e 0000:af:00.1 eth2: NIC Link is Up, 10 Gbps Full Duplex, Flow Control: None
    ```

### Enable the Maintenance Mode

1. (Optional) Stop a VM if you do not want it to migrate or know it cannot migrate.

1. Put the target node into [maintenance mode](../host/host.md#node-maintenance), it will leverage the VM live migration feature to migrate all VMs on this node to other nodes automatically.

- Wait for everything to get ready, repeat the steps in [pre-check](#pre-check).

- Stop a VM manually when:

    - The VM fails to migrate

    - The VM has some selectors which cause it has no other nodes to migrate

    - The VM has special hardwares like pci-passthrough or vgpu and fails to migrate

### (Optional) Update the VM Network

:::note
When the new Nics will be placed in different physical slots or those nics will have different uplink parameters, this step is mandatory.
:::

1. Check the node.

    For a Harvester cluster node, when it is belonging to a VM Network (VlanConfig), the node object has a label with key `network.harvesterhci.io/vlanconfig`.

    Example:

    ```
    apiVersion: v1
    kind: Node
    metadata:
      labels:
        ...
        network.harvesterhci.io/vlanconfig: vlan123
    ```

1. Remove this node from the VM network.

    When the new Nics are placed in different slots, you need to change the VM Network (VlanConfig) to exclude this Node.
    If the VM Network object selects only this node from `nodeSelector`, you can also delete the VlanConfig.

    Example:

    ```
    apiVersion: network.harvesterhci.io/v1beta1
    kind: VlanConfig
    spec:
      clusterNetwork: data
      nodeSelector:
        kubernetes.io/hostname: node123  // select one or more nodes
      uplink:
        bondOptions:
          miimon: 100
          mode: 802.3ad
        linkAttributes:
          mtu: 1500
          txQLen: -1
        nics:
        - enp0s1
        - enp0s2
    ```

    If any affected node (e.g., happened to exclude 2 nodes) has running VMs, the network webhook will report error.

1. Wait the node.

    Wait and check the `Node` object, until it's label `network.harvesterhci.io/vlanconfig` is changed or gone.

1. Wait the VlanStatus.

    Wait and check the related VlanStatus object until its `ready` condition is "True" or this object is deleted.

    Example:

    ```
    apiVersion: network.harvesterhci.io/v1beta1
    kind: VlanStatus
    metadata:
    ...
    status:
      clusterNetwork: data
      conditions:
      - lastUpdateTime: "2024-02-03T18:32:41Z"
        status: "True"
        type: ready
      linkMonitor: public
      localAreas:
      - cidr: 10.190.186.0/24
        vlanID: 2013
      node: node123
      vlanConfig: vlan123
    ```

### (Optional) Drain the Node

You may find that some of Longhorn replicas are still active on this node after all above operations.

1. Drain the node.

    This is optional in Harvester by default. Suppose the numReplicas of all volumes are 3, there are three active replicas for each Longhorn volume. None of the replicas holds any special significance to Longhorn. This is what Longhorn is designed for. The engine will recognize that it can no longer communicate with a replica when the node is down, mark it as failed, and stop trying. It will not care as long as it has at least one replica to communicate with.

    However, if you have some volumes which have less than the default 3 replicas; or you have manually attached volumes using the Harvester/Longhorn UI, you need to refer the following document to manually move the replicas to other nodes/detach them, and drain the node until it finishs successfully.

    You need to use `kubectl drain --ignore-daemonsets <node name>` with option --ignore-daemonsets to [drain this node](https://longhorn.io/docs/1.4.3/volumes-and-nodes/maintenance/#updating-the-node-os-or-container-runtime). The --ignore-daemonsets is needed because Longhorn deployed some daemonsets such as Longhorn manager, Longhorn CSI plugin, engine image.

    The running replicas on the node will be stopped at this stage. They will be shown as Failed.

    The engine processes on the node will be migrated with the Pod to other nodes.

    After the drain is completed, there should be no engine or replica process running on this node.

1. Replenish replicas.

    After a node is shutdown, Longhorn will not start rebuilding the replicas on other nodes until `replica-replenishment-wait-interval` (default 600 s) is exceeded. When the node comes back online before the wait-interval, Longhorn can reuse the replicas. If not, Longhorn will rebuild the replicas on another node.

    In a system maintenance, you may already know the node will be down for long time, then you can adjust the [replica-replenishment-wait-interval](https://longhorn.io/docs/1.4.3/references/settings/#replica-replenishment-wait-interval) from the from the [embedded Longhorn dashboard](../troubleshooting/harvester.md#access-embedded-rancher-and-longhorn-dashboards) to guide Longhorn to rebuild the replicas quickly.

    Harvester v1.3.0 has Longhorn v1.6.0 embedded. Harvester v1.2.1 has Longhorn v1.4.3 embedded.

### Replace the Nics

1. Shutdown the node.

1. Replace the NICs.

1. Restart the node.

### Check the new Nics Information

Repeat the operations in [collect information](#collect-information) and check them.

If anything is abnormal, please hold on to this step and double-check with Harvester. Generate a [support bundle](../troubleshooting/harvester.md#generate-a-support-bundle) for troubleshooting.

### (Optional) Re-update the VM Network

:::note
When the new Nics are placed in different slots, this step is a must.
:::

1. Add this node to the VM network.

    You need to create a new VM Network (VlanConfig) or change the existing VM Network (VlanConfig) to include this Node.

1. Wait the node.

    Wait and check the `Node` object, until it's label `network.harvesterhci.io/vlanconfig` has this VlanConfig.

1. Wait the VlanStatus.

    Wait and check the related `VlanStatus` object until its `ready` condition is "True".

### Disable the Maintenance Mode

1. Wait the [node](../host/host.md) is back to cluster.

1. Disable the maintenance mode and continue wait until everything is ready.

1. (Optional) Start the VMs which were manually stopped.

1. (Optional) Manually [migrate](../vm/live-migration.md#starting-a-migration) some VMs to this node.

### Troubleshooting

Harvester has a couple of network related pods and CRDs. It is very helpful to check the logs of pods, the status of CRD objects.

Pods:

```
$ kubectl get pods -n harvester-system
NAME                                                    READY   STATUS    RESTARTS      AGE
harvester-network-controller-cnf22                      1/1     Running   2 (60m ago)   3d22h  // Network controller agent daemonSet, deployed in each node
harvester-network-controller-manager-859c4bd874-xcllf   1/1     Running   2 (60m ago)   3d22h  // Network controller
harvester-network-webhook-56b877d5d5-z42dp              1/1     Running   2 (60m ago)   3d22h
```

CRDs:

```
clusternetworks.network.harvesterhci.io
linkmonitors.network.harvesterhci.io
vlanconfigs.network.harvesterhci.io
vlanstatuses.network.harvesterhci.io
```
