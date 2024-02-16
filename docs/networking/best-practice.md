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

### Replace the Nics

1. Shutdown the node

1. Replace the NICs

1. Restart the node

### Check the new Nics Information

Repeat the operations in [collect information](#collect-information) and check them.

If anything is abnormal, please hold on to this step and double-check with Harvester. Generate a [support bundle](../troubleshooting/harvester.md#generate-a-support-bundle) for troubleshooting.

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
