---
sidebar_position: 4
sidebar_label: Access to the Virtual Machine
title: ""
keywords:
  - Harvester
  - harvester
  - Rancher
  - rancher
  - Access to the VM
Description: Once the VM is up and running, it can be accessed using either VNC or the serial console from the Harvester UI.
---

# Access to the Virtual Machine

Once the VM is up and running, you can access it using either the Virtual Network Computing (VNC) client or the serial console from the Harvester UI.

Additionally, you can connect directly from your computer's SSH client.

## Access with the Harvester UI

VMs can be accessed from the UI directly using either VNC or the serial console.

If the VGA display is not enabled on the VM, as with the `Ubuntu-minimal-cloud` image, the VM can only be accessed with the serial console.

![](/img/v1.0/vm/access-to-vm.png)

## SSH Access

Harvester provides two ways to inject SSH public keys into virtual machines. Generally, these methods fall into two categories. [Static key injection](#static-ssh-key-injection-via-cloud-init), which places keys in the cloud-init script when the virtual machine is first powered on; [dynamic injection](#dynamic-ssh-key-injection-via-qemu-guest-agent), which allows keys or basic auth to be updated dynamically at runtime.

### Static SSH Key Injection via cloud-init

You can provide ssh keys to your virtual machines during the creation time on the `Basics` tab. Additionally, you can place the public ssh keys into your cloud-init script to allow it to take place.

![](/img/v1.0/vm/vm-ssh-keys.png)

#### Example of SSH key cloud-init configuration:
```yaml
#cloud-config
ssh_authorized_keys:
  - >-
    ssh-rsa #replace with your public key
```

### Dynamic SSH Key Injection via Qemu guest agent

_Available as of v1.0.1_

Harvester supports dynamically injecting public ssh keys at run time through the use of the [qemu guest agent](https://wiki.qemu.org/Features/GuestAgent). This is achieved through the `qemuGuestAgent` propagation method.

:::note

This method requires the qemu guest agent to be installed within the guest VM.

When using `qemuGuestAgent` propagation, the `/home/$USER/.ssh/authorized_keys` file will be owned by the guest agent. Changes to that file that are made outside of the qemu guest agent's control will get deleted.

:::

You can inject your access credentials via the Harvester dashboard as below:

1. Select the VM and click `⋮` button.
2. Click the `Edit Config` button and go to the `Access Credentials` tab.
3. Click to add either basic auth credentials or ssh keys, (e.g., add `opensuse` as the user and select your ssh keys if your guest OS is OpenSUSE).
4. Make sure your qemu guest agent is already installed and the VM should be restarted after the credentials are added.

:::note

You need to enter the VM to edit password or remove SSH-Key after deleting the credentials from the UI.

:::

![](/img/v1.0/vm/vm-add-access-credentails.png)



### Access with the SSH Client
Once the VM is up and running, you can enter the IP address of the VM in a terminal emulation client, such as PuTTY. You may also run the following command to access the VM directly from your computer's SSH client:

```
 ssh -i ~/.ssh/your-ssh-key user@<ip-address-or-hostname>
```
