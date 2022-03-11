---
sidebar_position: 1
keywords:
  - Harvester
  - harvester
  - Rancher
  - rancher
  - Virtual Machine
  - virtual machine
  - Create a VM
Description: Create one or more virtual machines from the Virtual Machines page.
---

# Create a VM

## How to Create a VM

Create one or more virtual machines from the **Virtual Machines** page.

!!! note
	For creating Windows virtual machines, please refer to [this page](./create-windows-vm.md).


1. Choose the option to create either one or multiple VM instances.
1. The VM Name is a required field.
1. The VM Template is optional. You can select ISO, raw, and Windows image templates as default options.
1. Configure the CPU and Memory of the VM.
1. Select SSH keys or upload new keys.
1. Select a custom VM image on the **Volumes** tab. The default disk will be the root disk. You can add more disks to the VM.
1. To configure networks, go to the **Networks** tab. The **Management Network** is added by default. It is also possible to add secondary networks to the VMs using VLAN networks. You may configure these on **Advanced > Networks**.
1. Advanced options such as hostname and cloud-init data are optional. You may configure these in the **Advanced Options** section.

![create-vm](assets/create-vm.png)

![create-vm](assets/choose-vm-image.png)

## Cloud Configuration Examples

Password configuration for the default user:

```YAML
# cloud-config
password: password
chpasswd: { expire: False }
ssh_pwauth: True
```

Network-data configuration using DHCP:

```YAML
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

You can also use the `Cloud Config Template` feature to include a pre-defined cloud-init configuration for the VM.

### Installing the QEMU guest agent
The QEMU guest agent is a daemon that runs on the virtual machine and passes information to the host about the virtual machine, users, file systems, and secondary networks.

Qemu guest agent is installed by default when a VM is created.

![](assets/qga.png)

!!! note
	If your OS is openSUSE and the version is less than 15.3, please replace `qemu-guest-agent.service` with `qemu-ga.service`.

## Networks

### Management Network

A management network represents the default VM eth0 interface configured by the cluster network solution that is present in each VM.

By default, a VM can be accessed via the management network.

### Secondary Network

It is also possible to connect VMs using additional networks with Harvester's built-in [VLAN networks](../networking/harvester-network.md).
