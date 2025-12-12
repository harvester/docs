---
sidebar_position: 4
sidebar_label: Upgrade from v1.5.x to v1.6.x
title: "Upgrade from v1.5.x to v1.6.x"
---

<head>
  <link rel="canonical" href="https://docs.harvesterhci.io/v1.6/upgrade/v1-5-x-to-v1-6-x"/>
</head>

## General Information

An **Upgrade** button appears on the **Dashboard** screen whenever a new Harvester version that you can upgrade to becomes available. For more information, see [Start an upgrade](./automatic.md#start-an-upgrade).

Clusters running v1.5.x can upgrade to v1.6.x directly because Harvester allows a maximum of one minor version upgrade for underlying components. Harvester v1.5.0, v1.5.1, and v1.5.2 use the same minor version of RKE2 (v1.32), while Harvester v1.6.0 and v1.6.1 use the next minor version (v1.33). For more information, see [Upgrade paths](./automatic.md#upgrade-paths).

:::note

Only customers affected by issues listed in the Bug Fixes section of the [release notes](https://github.com/harvester/harvester/releases/tag/v1.5.2) must install v1.5.2.

:::

For information about upgrading Harvester in air-gapped environments, see [Prepare an air-gapped upgrade](./automatic.md#prepare-an-air-gapped-upgrade).

### Update Harvester UI Extension on Rancher v2.12

You must use a compatible version (v1.6.x) of the Harvester UI Extension to import Harvester v1.6.x clusters on Rancher v2.12.

1. On the Rancher UI, go to **local > Apps > Repositories**.

1. Locate the repository named **harvester**, and then select **⋮ > Refresh**.

1. Go to the **Extensions** screen.

1. Locate the extension named **Harvester**, and then click **Update**.

1. Select a compatible version, and then click **Update**.

1. Allow some time for the extension to be updated, and then refresh the screen.

---

## Known Issues

### 1. Upgrade Is Stuck in the "Pre-drained" State

In certain situations, the Longhorn Instance Manager might fail to clean up an engine instance, even after the state of the engine CR has changed to "Stopped". The upgrade process becomes stuck in the "Pre-drained" state because the instance-manager pod cannot be deleted while the corresponding PodDisruptionBudget (PDB) still exists.

The workaround is to delete the instance-manager PDB after ensuring that all volumes are healthy.

Related issues: [#8977](https://github.com/harvester/harvester/issues/8977) and [#11605](https://github.com/longhorn/longhorn/issues/11605)

### 2. Guest Cluster Is Stuck in the "Updating" State

An RKE2 guest cluster may become stuck in the "Updating" state after Harvester is upgraded. The following error message is displayed on the Harvester UI:

```
Configuring etcd node(s) rke2-pool1-xdvfc-qf4vb: Node condition MemoryPressure is Unknown. Node condition DiskPressure is Unknown. Node condition PIDPressure is Unknown. Node condition Ready is Unknown, waiting for probes: calico, etcd, kube-apiserver, kube-controller-manager
```

The issue occurs when the guest node's IP address changes after the upgrade, causing etcd to malfunction. It is likely that the underlying virtual machine was rebooted several times and received a new IP address from the DHCP server.

To address the issue, perform the following steps:

1. On the Rancher UI, delete the error-causing node from the guest cluster.
1. On the Harvester UI, check the status of the underlying virtual machine.
1. If necessary, restart the virtual machine.

The virtual machine is removed, and the guest cluster attempts to create a new node. Once the node is created, the status of the guest cluster changes to "Active".

Related issue: [#8950](https://github.com/harvester/harvester/issues/8950)

### 3. Stopped Virtual Machine Is Stuck in the "Starting" State

A Longhorn volume can flap between the "Detaching" and "Detached" states after a live migration. Because the volume is not ready, the associated virtual machine is unable to fully start.

The workaround is to clear the Longhorn volume's `status.currentMigrationNodeID` using the following command:

```
kubectl patch -n longhorn-system volume <volume> \
  --type=merge \
  --subresource status \
  -p '{"status":{"currentMigrationNodeID":""}}'
```

Related issues: [#8949](https://github.com/harvester/harvester/issues/8949) and [#11479](https://github.com/longhorn/longhorn/issues/11479)

### 4. Nodes Stuck in “Waiting Reboot” State Due to Network Setup Error

Nodes may become stuck in the `Waiting Reboot` state during an upgrade if the following criteria are met:

- Harvester v1.2.1 or an earlier version was initially installed, and the nodes were upgraded incrementally.
- The `vlan_id` field in the `install.management_interface` setting is either set to `1` or is empty.

The issue occurs because of a network setup error, as indicated by the message `yaml: line did not find expected key` in the node logs.

During the upgrade, the `/oem/90_custom.yaml` file is updated to reflect changes in the behavior of v1.5.x, which added VLANs 2–4094 to `mgmt-br` and `mgmt-bo`. Two scripts in that file (`/etc/wicked/scripts/setup_bond.sh` and `/etc/wicked/scripts/setup_bridge.sh`) may be truncated by a `sed` operation if they use the format generated by `gopkg.in/yaml.v2`, which was used in the installer of Harvester versions earlier than 1.2.2. The `sed` operation removes the line `bridge vlan add vid 2-4094 dev $INTERFACE`. This truncation issue does not affect scripts that use the format generated by `gopkg.in/yaml.v3`

Content of `/etc/wicked/scripts/setup_bond.sh` within `/oem/90_custom.yaml` file generated from gopkg.in/yaml.v2:

```
"#!/bin/sh\n\nACTION=$1\nINTERFACE=$2\n\ncase $ACTION in\n\tpost-up)\n\t\t#
inherit MAC address\n\t\tip link set dev mgmt-br address $(ip -json link show
dev $INTERFACE | jq -j '.[0][\"address\"]')\n\n\t\t# accept all vlan, PVID=1
by default\n\t\tbridge vlan add vid 2-4094 dev $INTERFACE\n\t\t;;\n\nesac\n"
```

Content of `/etc/wicked/scripts/setup_bond.sh` within `/oem/90_custom.yaml` file generated from gopkg.in/yaml.v3:

```
#!/bin/sh

ACTION=$1
INTERFACE=$2

case $ACTION in
        post-up)
                # inherit MAC address
                ip link set dev mgmt-br address $(ip -json link show dev $INTERFACE | jq -j '.[0]["address"]')

                #accept all vlan,PVID=1 by default
                bridge vlan add vid 2-4094 dev $INTERFACE
                ;;

esac
```

Content of `/etc/wicked/scripts/setup_bridge.sh` within `/oem/90_custom.yaml` file generated from gopkg.in/yaml.v2:

```
"#!/bin/sh\n\nACTION=$1\nINTERFACE=$2\n\ncase $ACTION in\n\tpre-up)\n\t\t#
enable vlan-aware\n\t\tip link set dev $INTERFACE type bridge vlan_filtering 1\n\t\t\t;;\n\n\tpost-up)\n\t\t#
accept all vlan, PVID=1 by default\n\t\tbridge vlan add vid 2-4094 dev $INTERFACE
self\n\t\tbridge vlan add vid 2-4094 dev mgmt-bo\n\t\t;;\n\nesac\n"
```

Content of `/etc/wicked/scripts/setup_bridge.sh` within `/oem/90_custom.yaml` file generated from gopkg.in/yaml.v3:

```
#!/bin/sh

ACTION=$1
INTERFACE=$2

case $ACTION in
        pre-up)
               #enable vlan-aware
               ip link set $INTERFACE type bridge vlan_filtering 1
               ;;

        post-up)
                #accept all vlan, PVID=1 by default
                bridge vlan add vid 2-4094 dev $INTERFACE self
                bridge vlan add vid 2-4094 dev mgmt-bo
                ;;
esac
```

The workaround is to replace the above contents generated from gopkg.in/yaml.v3 for `/etc/wicked/scripts/setup_bond.sh` and `/etc/wicked/scripts/setup_bridge.sh` in `/oem/90_custom.yaml` file. Once the file is updated, the upgrade process should resume its progress.

Related issue: [#9033](https://github.com/harvester/harvester/issues/9033)

### 5. Network connectivity lost on secondary VLAN interfaces on the `mgmt` cluster network

In v1.6.0, a feature change was introduced to only attach required VLAN interfaces to mgmt-br and mgmt-bo, instead of all secondary VLANs. This is intended behavior to reduce unnecessary VLAN provisioning.Due to this all secondary VLAN interfaces previously attached to the `mgmt-br` bridge and `mgmt-bo` are removed from the management hosts after the cluster is upgraded to v1.6.x.

:::warning

Workloads that rely on these interfaces will lose network connectivity.

For more information, see [issue #7650](https://github.com/harvester/harvester/issues/7650).

:::

After upgrading to v1.6.x, perform the following steps:

1. Verify VLANs attached to the `mgmt-br` and `mgmt-bo` by running the following command on management hosts:

    ```
    bridge vlan show
    ```
   The above outputs only the primary vlan part of `mgmt-br` and `mgmt-bo`

1. Manually add the required secondary VLANs to the `mgmt-br` bridge and the `mgmt-bo` interface by adding the following commands to the `/oem/90_custom.yaml` file:

    - `/etc/wicked/scripts/setup_bond.sh` section

    ```
    bridge vlan add vid <vlan-id> dev $INTERFACE
    ```

    - `/etc/wicked/scripts/setup_bridge.sh` section

    ```
    bridge vlan add vid <vlan-id> dev $INTERFACE self
    bridge vlan add vid <vlan-id> dev mgmt-bo
    ```

    :::info important

    You must include a separate command for each distinct VLAN ID. Ensure that the `vlan-id` placeholder is replaced with the actual ID.

    :::

1. Once the `/oem/90_custom.yaml` file is updated, reboot the management hosts.

1. Verify that all the required VLANs were added by running the following command on the hosts:

    ```
    bridge vlan show
    ```

#### Upgrade Scenario Example

In the following example, a v1.5.x cluster was initially installed with a [primary VLAN interface](../install/harvester-configuration.md#installmanagement_interface) (VLAN ID: `2021`). To add a secondary VLAN interface (VLAN ID: `2113`), the `/oem/99_vlan-ifcfg.yaml` file  was created on the management hosts with the following contents:

```
stages:
  initramfs:
    - name: "Host VLAN interface mgmt-br.353"
      files:
        - path: /etc/sysconfig/network/ifcfg-mgmt-br.2113
          owner: 0
          group: 0
          permissions: 384
          content: |
            STARTMODE='onboot'
            BOOTPROTO='static'
            IPADDR='10.255.113.150/24'
            VLAN_ID='2113'
            ETHERDEVICE='mgmt-br'
            VLAN='yes'
            DEFROUTE='no'

```
The typical expectation is that an additional VLAN sub-interface is created on the `mgmt` interface (`mgmt-br.2113`) and assigned an IPv4 address. In addition, this sub-interface and the primary interface (`mgmt-br.2021`) are both expected to be used for L3 connectivity after the cluster is upgraded to v1.6.x.

In actuality after the upgrade to v1.6.0, however, the VLAN sub-interface is created but the secondary VLAN (VLAN ID: `2113`) is removed from the `mgmt-br` bridge and the `mgmt-bo` interface. After a reboot, only the primary VLAN ID is assigned to the `mgmt-br` bridge and the `mgmt-bo` interface (using the `/oem/90_custom.yaml` file).
To mitigate the effects of this change, you must perform the workaround described in the previous section. This involves identifying secondary VLAN interfaces and then adding the necessary ones to the `mgmt-br` bridge and the `mgmt-bo` interface.

### 6. Running VMs show "Restart action is required for the virtual machine configuration change to take effect"

When upgrading Harvester from v1.5.x to v1.6.x, updating the harvester-ui-extension to v1.6.x, or using Rancher v2.12.x to import an existing Harvester cluster, you may encounter a warning message on some running virtual machines (VMs). This message indicates that the VM configuration has changed and that a restart is required to apply the changes.

![vm-restart-action-required](/img/v1.6/upgrade/vm-restart-required-message.png)

To fix this, you can restart the VM.

![vm-restart](/img/v1.6/upgrade/vm-restart.png)

#### Why is there a message about running VMs?

Before Harvester v1.6.0, the controller patched the MAC address from the VMI into the VM spec during VM creation. This ensured that the MAC address remained consistent after a VM restart. However, this approach modified the VM spec without requiring a restart, which caused the KubeVirt controller to add a "RestartRequired" condition to the VM status. Previously, this condition was not displayed in the UI, though it was visible in the VM’s YAML.

Starting from v1.6.0, to support the CPU and Memory hot-plug feature and to inform users that certain CPU and memory changes might not take effect immediately, we decided to expose the “RestartRequired” condition in the UI. That’s why this message appears after upgrading Harvester or updating the harvester-ui-extension to v1.6.x.

### 7.Change in default VLAN Behavior for Secondary Pod Interfaces (Harvester v1.5.x → v1.6.1)

Until Harvester v1.6.0, pods with secondary network interfaces (such as VM networks or storage networks) were automatically assigned to VLAN ID 1 in addition to the VLAN ID configured in the VLAN network. This dual-VID behavior allowed the Linux bridge to forward untagged traffic to the veth interfaces of these pods.

Starting with Harvester v1.6.1 (which includes CNI plugin v1.8.0), this behavior changed. Secondary pod interfaces are now associated only with the VLAN ID specified by the VLAN network. They are no longer added to VLAN ID 1, which means the bridge will not forward untagged traffic to these interfaces.

Related Issue: https://github.com/harvester/harvester/issues/8816

This change will impact environments upgraded from v1.5.x to v1.6.1 if the external switch port is configured as an access port sending untagged frames, causing the bridge to drop the traffic because the pod interfaces no longer accepted VLAN 1. Updating the external switch configuration to use a trunk port will resolve the issue.

Pods with secondary interfaces attached to untagged or with vlan-id `1` is not affected by this.
