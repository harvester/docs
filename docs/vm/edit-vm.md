---
sidebar_position: 3
sidebar_label: Edit a Virtual Machine
title: ""
keywords:
  - Harvester
  - harvester
  - Rancher
  - rancher
  - Virtual Machine
  - virtual machine
  - Edit a VM
Description: Edit Virtual Machines from the Harvester VM page.
---

# Edit a Virtual Machine

## How to Edit a VM

After creating a virtual machine, you can edit your virtual machine by clicking the `⋮` button and selecting the `Edit Configurations` button.

:::note

In addition to editing the description, a restart of the virtual machine is required for configuration changes to take effect.

:::

### Basics

On the basics tab, you can config your requested CPU and memory, a VM restart is required for this configuration to take effect.

SSH Keys are injected into the cloud-init script when the virtual machine is first powered on. In order for the modified ssh key to take effect after the virtual machine is startup, the cloud-init script needs to be [reinstalled](../faq.md#how-to-install-the-qemu-guest-agent-of-a-running-vm) from your guest OS.

![edit-vm](/img/v1.1/vm/edit-vm-basics.png)

### Networks

You can add additional VLAN networks to your VM instances after booting, the `management network` is optional if you have the VLAN network configured.

Additional NICs are not enabled by default unless you configure them manually in the guest OS, e.g. using [wicked for your OpenSUSE Server](https://doc.opensuse.org/documentation/leap/reference/html/book-reference/cha-network.html#sec-network-manconf) or [netplan for your Ubuntu Server](https://ubuntu.com/server/docs/network-configuration).

![edit-vm](/img/v1.1/vm/edit-vm-networks.png)

For more details about the network implementation, please refer to the [Networking](../networking/harvester-network.md) page.

### Volumes

You can add additional volumes to the VM after booting. You can also expand the size of the volume after shutting down the VM, click the VM and go to the `Volumes` tab, then click `Edit Image Volume` to edit the size of the expanded volume. After waiting for the resize to complete and restarting the VM, your disk will automatically finish expanding.

![edit-vm](/img/v1.1/vm/edit-vm-volumes.png)

### Access Credentials

Access Credentials allow you to inject basic auth or ssh keys dynamically at run time when your guest OS has quemu guest agent installed.

For more details please check the page here: [Dynamic SSH Key Injection via Qemu guest agent](./access-to-the-vm.md#dynamic-ssh-key-injection-via-qemu-guest-agent).