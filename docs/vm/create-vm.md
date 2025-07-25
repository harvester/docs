---
id: index
sidebar_position: 2
sidebar_label: Create a Virtual Machine
title: "Create a Virtual Machine"
keywords:
  - Harvester
  - harvester
  - Rancher
  - rancher
  - Virtual Machine
  - virtual machine
  - Create a VM
description: Create one or more virtual machines from the Virtual Machines page.
---

<head>
  <link rel="canonical" href="https://docs.harvesterhci.io/v1.5/vm/index"/>
</head>

## How to Create a VM

<Tabs>
<TabItem value="ui" label="UI" default>

You can create one or more virtual machines from the **Virtual Machines** page.

:::note

Please refer to [this page](./create-windows-vm.md) for creating Windows virtual machines.

:::

1. Choose the option to create either one or multiple VM instances.
1. Select the namespace of your VMs, only the `harvester-public` namespace is visible to all users.
1. The VM Name is a required field.
1. (Optional) VM template is optional, you can choose `iso-image`, `raw-image` or `windows-iso-image` template to speed up your VM instance creation.
1. On the **Basics** tab, configure the following settings:
    - **CPU** and **Memory**: You can allocate a maximum of **254** vCPUs. If virtual machines are not expected to fully consume the allocated resources most of the time, you can use the [`overcommit-config`](../advanced/settings.md#overcommit-config) setting to optimize physical resource allocation.
    - **SSHKey**: Select SSH keys or upload new keys.
1. Select a custom VM image on the **Volumes** tab. The default disk will be the root disk. You can add more disks to the VM.
1. To configure networks, go to the **Networks** tab.
    1. The **Management Network** is added by default, you can remove it if the VLAN network is configured.
    1. You can also add additional networks to the VMs using VLAN networks. You may configure the VLAN networks on **Advanced > Networks** first.
1. (Optional) Set node affinity rules on the **Node Scheduling** tab.
1. (Optional) Set workload affinity rules on the **VM Scheduling** tab.
1. Advanced options such as run strategy, os type and cloud-init data are optional. You may configure these in the **Advanced Options** section when applicable.

![create-vm](/img/v1.2/vm/create-vm.png)
</TabItem>
<TabItem value="api" label="API">

To create virtual machines using the Kubernetes API, create a `VirtualMachine` object.

```yaml
apiVersion: kubevirt.io/v1
kind: VirtualMachine
metadata:
  name: new-vm
  namespace: default
spec:
  runStrategy: RerunOnFailure
  template:
    spec:
      domain:
        cpu:
          cores: 2
          sockets: 1
          threads: 1
        memory: "3996Mi"
        devices:
          disks: []
          interfaces:
            - name: default
              model: virtio
              masquerade: {}
        machine:
          type: q35
        resources:
          requests:
            cpu: "125m"
            memory: "2730Mi"
          limits:
            cpu: 2
            memory: "4Gi"
        networks:
          - name: default
            pod: {}
```

For more information, see the [API reference](../api/create-namespaced-virtual-machine).

</TabItem>
<TabItem value="terraform" label="Terraform">

To create a virtual machine using the [Harvester Terraform Provider](https://registry.terraform.io/providers/harvester/harvester/latest),
define a `harvester_virtualmachine` resource block:

```hcl

resource "harvester_virtualmachine" "opensuse154" {
  name                 = "opensuse154"
  namespace            = "default"
  restart_after_update = true

  cpu    = 2
  memory = "2Gi"

  run_strategy = "RerunOnFailure"
  hostname     = "opensuse154"
  machine_type = "q35"

  ssh_keys = [
    harvester_ssh_key.mysshkey.id
  ]

  network_interface {
    name           = "nic-1"
    network_name   = harvester_network.cluster-vlan1.id
    wait_for_lease = true
  }

  disk {
    name       = "rootdisk"
    type       = "disk"
    size       = "10Gi"
    bus        = "virtio"
    boot_order = 1

    image       = harvester_image.opensuse154.id
    auto_delete = true
  }

  cloudinit {
    user_data_secret_name    = harvester_cloudinit_secret.cloud-config-opensuse154.name
    network_data_secret_name = harvester_cloudinit_secret.cloud-config-opensuse154.name
  }
}

```
</TabItem>
</Tabs>

## Volumes

You can add volumes on the **Volumes** tab. By default, the first disk is used as the `root disk`. You can change the boot order by dragging and dropping volumes, or using the arrow buttons.

A disk can be made accessible via the following types:

| type   | description                                                                                    |
|:--------|:-----------------------------------------------------------------------------------------------|
| disk   | This type will expose the volume as an ordinary disk to the VM.                           |
| cd-rom | This type will expose the volume as a cd-rom drive to the VM. It is read-only by default. |

A volume's [StorageClass](../advanced/storageclass.md) can be specified when adding a new empty volume; for other volumes (such as VM images), the `StorageClass` is defined during image creation.
If you are using external storage, ensure that the correct **StorageClass** and **Volume Mode** are selected. For example, a volume with the **nfs-csi** StorageClass must use the **Filesystem** volume mode.

:::info important

When creating volumes from a VM image, ensure that the volume size is greater than or equal to the image size. The volume may become corrupted if the configured volume size is less than the size of the underlying image. This is particularly important for qcow2 images because the virtual size is typically greater than the physical size.

By default, Harvester sets the volume size to either 10 GiB or the virtual size of the VM image, whichever is greater.

:::

![create-vm](/img/v1.2/vm/create-vm-volumes.png)

### Adding a container disk

A container disk is an ephemeral storage volume that can be assigned to any number of VMs and provides the ability to store and distribute VM disks in the container image registry. A container disk is:
- An ideal tool if you want to replicate a large number of VM workloads or inject machine drivers that do not require persistent data. Ephemeral volumes are designed for VMs that need more storage but don't care whether that data is stored persistently across VM restarts or only expect some read-only input data to be present in files, like configuration data or secret keys.
- Not a good solution for any workload that requires persistent `root disks` across VM restarts.

A container disk is added when creating a VM by providing a Docker image. When creating a VM, follow these steps:

1. Go to the **Volumes** tab.
1. Select **Add Container**.
  ![add-container-volume](/img/v1.2/vm/add-container-volume-1.png)
1. Enter a **Name** for the container disk.
1. Choose a disk **Type**.
1. Add a **Docker Image**.
    - A disk image, with the format qcow2 or raw, must be placed into the `/disk` directory.
    - Raw and qcow2 formats are supported, but qcow2 is recommended in order to reduce the container image's size. If you use an unsupported image format, the VM will get stuck in a `Running` state.
    - A container disk also allows you to store disk images in the `/disk` directory. An example of creating such a container image can be found [here](https://kubevirt.io/user-guide/virtual_machines/disks_and_volumes/#containerdisk-workflow-example).
1. Choose a **Bus** type.
  ![add-container-volume](/img/v1.2/vm/add-container-volume-2.png)

## Networks

You can choose to add both the `management network` or `VLAN network` to your VM instances via the `Networks` tab, the `management network` is optional if you have the VLAN network configured.

Network interfaces are configured through the `Type` field. They describe the properties of the virtual interfaces seen inside the guest OS:

| type       | description                                      |
|:-----------|:-------------------------------------------------|
| bridge     | Connect using a Linux bridge                     |
| masquerade | Connect using iptables rules to NAT the traffic  |

### Management Network

A management network represents the default VM eth0 interface configured by the cluster network solution that is present in each VM.

By default, VMs are accessible through the management network within the cluster nodes.

### Secondary Network

It is also possible to connect VMs using additional networks with Harvester's built-in [VLAN networks](../networking/harvester-network.md).

In bridge VLAN, virtual machines are connected to the host network through a linux `bridge`. The network IPv4 address is delegated to the virtual machine via DHCPv4. The virtual machine should be configured to use DHCP to acquire IPv4 addresses.

## Node Scheduling
`Node Scheduling` allows you to constrain which nodes your VMs can be scheduled on based on node labels.

See the [Kubernetes Node Affinity Documentation](https://kubernetes.io/docs/concepts/scheduling-eviction/assign-pod-node/#node-affinity) for more details.

## VM Scheduling

`VM Scheduling` allows you to constrain which nodes your VMs can be scheduled on based on the labels of workloads (VMs and Pods) already running on these nodes, instead of the node labels.

For instance, you can combine `Required` with `Affinity` to instruct the scheduler to place VMs from two services in the same zone, enhancing communication efficiency. Likewise, the use of `Preferred` with `Anti-Affinity` can help distribute VMs of a particular service across multiple zones for increased availability.

See the [Kubernetes Pod Affinity and Anti-Affinity Documentation](https://kubernetes.io/docs/concepts/scheduling-eviction/assign-pod-node/#inter-pod-affinity-and-anti-affinity) for more details.

### Automatically Applied Affinity Rules

Based on the definition of VM, Harvester applies some `Affinity` rules automatically. These rules can affect the list of eligible virtual machine scheduling/migration target nodes. In some cases, scheduling/migration fails due to no target node can satisfy the affinity constraints.

For more information, see [Virtual Machine is Unschedulable due to the unsatisfied Affinity Rules](../troubleshooting/vm.md#virtual-machine-is-unschedulable-due-to-the-unsatisfied-affinity-rules).

:::note

Do not edit those automatically applied rules, the manual changes get reverted by Harvester webhook.

:::

#### Cluster Network Related

When a VM attaches to some [Secondary Networks](#secondary-network), Harvester ensures it like following example:

1. One [Cluster Network](../networking/clusternetwork.md#cluster-network) `cn2` is created.
1. One [Network Configuration](../networking/clusternetwork.md#network-configuration) `cn2-vc1` is created to set up the `uplink` and other parameters, it selects `node1` and `node2` on the cluster.
1. One [VM Network](../networking/harvester-network.md#create-a-vm-network) `cn2-nad-100` is created with `vlan id 100`.

1. A `VM vm1` attaches to [Secondary Network](#secondary-network) `cn2-nad-100`.

Validation:

1. Kubernetes `node` objects are labled by Harvester controller automatically.

`kubectl get node node1 -oyaml`

```
...
metadata:
  labels:
    network.harvesterhci.io/cn2: "true"
    network.harvesterhci.io/mgmt: "true"
    network.harvesterhci.io/vlanconfig: cn2-vc1
...
```

1. `virtualmachine` object is updated by Harvester webhook automatically.

```
spec:
  template:
    spec:
      affinity:
        nodeAffinity:
          requiredDuringSchedulingIgnoredDuringExecution:
            nodeSelectorTerms:
              - matchExpressions:
                  - key: network.harvesterhci.io/cn2
                    operator: In
                    values:
                      - 'true'
```

1. When the VM runs, it will be scheduled to `node1` or `node2`, not others.

:::note

1. When a VM attaches to multi `Secondary Networks`, and they are backed by mutli `Cluster Network`, then multi `Affinity` rules are applied. All of those rules work together to determin the final schedulable target nodes.

1. The [Built-in Cluster Network `mgmt`](../networking/clusternetwork.md#built-in-cluster-network) covers all nodes by default, when a vm attaches to `VM Networks` which are backed by `mgmt` cluster network, they are not converted to `Affinity` rules. All nodes are schedulable target nodes.

:::

#### CPU Pinning Related

1. Enable the [cpu-manager](./cpu-pinning.md#enable-and-disable-cpu-manager) on some/all nodes.

After the enablement is successfully done, the `node` object has below label.

```
...
metadata:
  labels:
    cpumanager: "true"
...
```

2. Enable the [CPU Pinning](./cpu-pinning.md#enable-cpu-pinning-on-a-new-vm)  on VM

When `CPU Pinning` selection box is ticked while creating a VM, Harvester applies another `Affinity` rule automatically.

```
spec:
  template:
    spec:
      affinity:
        nodeAffinity:
          requiredDuringSchedulingIgnoredDuringExecution:
            nodeSelectorTerms:
              - matchExpressions:
                  - key: cpumanager
                    operator: In
                    values:
                      - 'true'
```

This `Affinity` rule ensures that the VM is only scheduled to those nodes which has already enabled the `cpu manager`.

## Annotations

Harvester allows you to attach custom metadata to virtual machines using annotations. These key-value pairs enable extended features or behaviors without requiring changes to the core virtual machine configuration.

You can use the `harvesterhci.io/custom-ip` annotation to set an IP address on the Harvester UI *for display purposes*. This is useful when the virtual machine is unable to report its IP address because of a missing `qemu-guest-agent` or other reasons.

## Advanced Options

### Run Strategy

_Available as of v1.0.2_

Prior to v1.0.2, Harvester used the `Running` (a boolean) field to determine if the VM instance should be running. However, a simple boolean value is not always sufficient to fully describe the user's desired behavior. For example, in some cases the user wants to be able to shut down the instance from inside the virtual machine. If the `running` field is used, the VM will be restarted immediately.

In order to meet the scenario requirements of more users, the `RunStrategy` field is introduced. This is mutually exclusive with `Running` because their conditions overlap somewhat. There are currently four `RunStrategies` defined:

- Always: The VM instance will always exist. If VM instance crashes, a new one will be spawned. This is the same behavior as `Running: true`.

- RerunOnFailure (default): If the previous instance failed in an error state, a VM instance will be respawned. If the guest is successfully stopped (e.g. shut down from inside the guest), it will not be recreated.

- Manual: The presence or absence of a VM instance is controlled only by the `start/stop/restart` VirtualMachine actions.

- Stop: There will be no VM instance. If the guest is already running, it will be stopped. This is the same behavior as `Running: false`.


### Reserved Memory

Each VM is configured with a memory value, this memory is targeted for the VM guest OS to see and use. In Harvester, the VM is carried by a Kubernetes POD. The memory limitation is achieved by Kubernetes [Resource requests and limits of Pod and container](https://kubernetes.io/docs/concepts/configuration/manage-resources-containers/#resource-requests-and-limits-of-pod-and-container). Certain amount of memory is required to simulate and manage the `CPU/Memory/Storage/Network/...` for the VM to run. Harvester and KubeVirt summarize such additional memory as the VM `Memory Overhead`. The `Memory Overhead` is computed by a complex formula. However, sometimes the OOM(Out Of Memory) can still happen and the related VM is killed by the Harvester OS, the direct cause is that the whole POD/Container exceeds its memory limits. From practice, the `Memory Overhead` varies on different kinds of VM, different kinds of VM operating system, and also depends on the running workloads on the VM.

Harvester adds a `Reserved Memory` field and a setting `additional-guest-memory-overhead-ratio` for users to adjust the guest OS memory and the `Total Memory Overhead`.

The `Total Memory Overhead` = automatically computed `Memory Overhead` + Harvester `Reserved Memory`.

All the details are described in the setting [additional-guest-memory-overhead-ratio](../advanced/settings.md#additional-guest-memory-overhead-ratio).

:::important

Read the document carefully, understand how it works and set a proper value on this field.

:::


### Cloud Configuration

Harvester supports the ability to assign a startup script to a virtual machine instance which is executed automatically when the VM initializes.

These scripts are commonly used to automate injection of users and SSH keys into VMs in order to provide remote access to the machine. For example, a startup script can be used to inject credentials into a VM that allows an Ansible job running on a remote host to access and provision the VM.


#### Cloud-init
[Cloud-init](https://cloudinit.readthedocs.io/en/latest/) is a widely adopted project and the industry standard multi-distribution method for cross-platform cloud instance initialization. It is supported across all major cloud image provider like SUSE, Redhat, Ubuntu and etc., cloud-init has established itself as the defacto method of providing startup scripts to VMs.

Harvester supports injecting your custom cloud-init startup scripts into a VM instance through the use of an ephemeral disk. VMs with the cloud-init package installed will detect the ephemeral disk and execute custom user-data and network-data scripts at boot.




Example of password configuration for the default user:

```YAML
#cloud-config
password: password
chpasswd: { expire: False }
ssh_pwauth: True
```

Example of network-data configuration using DHCP:

```YAML
network:
  version: 1
  config:
    - type: physical
      name: eth0
      subnets:
        - type: dhcp
    - type: physical
      name: eth1
      subnets:
        - type: dhcp
```

You can also use the `Advanced > Cloud Config Templates` feature to create a pre-defined cloud-init configuration template for the VM.

:::note

The network configuration of a virtual machine running an Ubuntu release later than 16.04 is likely managed by `netplan` by default. Please use the following `network` settings as reference for DHCP configuration to prevent IP address conflicts when restoring a virtual machine from a snapshot or backup.

```YAML
network:
  ethernets:
    enp1s0:
      dhcp4: true
      dhcp6: true
      dhcp-identifier: mac
  version: 2
```

If dhcp-identifier: mac is not specified, the restored virtual machine will receive the same IP address from the DHCP server. This happens because netplan defaults to using the machine ID as the DHCP client identifier. As a result, the restored virtual machine will receive the same IP address from the DHCP server and lead to IP address conflicts.

:::

#### Installing the QEMU guest agent
The QEMU guest agent is a daemon that runs on the virtual machine instance and passes information to the host about the VM, users, file systems, and secondary networks.

`Install guest agent` checkbox is enabled by default when a new VM is created.

![](/img/v1.2/vm/qga.png)

:::note

If your OS is openSUSE and the version is less than 15.3, please replace `qemu-guest-agent.service` with `qemu-ga.service`.

:::

### TPM Device

_Available as of v1.2.0_

[Trusted Platform Module (TPM)](https://en.wikipedia.org/wiki/Trusted_Platform_Module) is a cryptoprocessor that secures hardware using cryptographic keys.

According to [Windows 11 Requirements](https://learn.microsoft.com/en-us/windows/whats-new/windows-11-requirements), the TPM 2.0 device is a hard requirement of Windows 11.

In the Harvester UI, you can add an emulated TPM 2.0 device to a VM by checking the `Enable TPM` box in the **Advanced Options** tab.

:::note

Currently, only non-persistent vTPMs are supported, and their state is erased after each VM shutdown. Therefore, [Bitlocker](https://learn.microsoft.com/en-us/windows/security/information-protection/bitlocker/bitlocker-overview) should not be enabled.

:::

## One-time Boot For ISO Installation

When creating a VM to boot from cd-rom, you can use the **bootOrder** option so that the OS can boot from cd-rom during image installation, and boot from the disk when the installation is complete without unmounting the cd-rom.

The following example describes how to install an ISO image using [openSUSE Leap 15.4](https://get.opensuse.org/leap/15.4/):

1. Click **Images** in the left sidebar and download the openSUSE Leap 15.4 ISO image.
2. Click **Virtual Machines** in the left sidebar, then create a VM. You need to fill up those VM basic configurations.
3. Click the **Volumes** tab, In the **Image** field, select the image downloaded in step 1 and ensure **Type** is `cd-rom`
4. Click **Add Volume** and select an existing **StorageClass**.
5. Drag **Volume** to the top of **Image Volume** as follows. In this way, the **bootOrder** of **Volume** will become `1`.

![one-time-boot-create-vm-bootorder](/img/v1.2/vm/one-time-boot-create-vm-bootorder.png)

6. Click **Create**.
7. Open the VM web-vnc you just created and follow the instructions given by the installer.
8. After the installation is complete, reboot the VM  as instructed by the operating system (you can remove the installation media after booting the system).
9. After the VM reboots, it will automatically boot from the disk volume and start the operating system.
