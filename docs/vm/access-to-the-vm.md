---
sidebar_position: 5
sidebar_label: Access to the Virtual Machine
title: "Access to the Virtual Machine"
keywords:
  - Harvester
  - harvester
  - Rancher
  - rancher
  - Access to the VM
description: Once the VM is up and running, it can be accessed using either VNC or the serial console from the Harvester UI.
---

<head>
  <link rel="canonical" href="https://docs.harvesterhci.io/v1.9/vm/access-to-the-vm"/>
</head>

Once the VM is up and running, you can access it using either the Virtual Network Computing (VNC) client or the serial console from the Harvester UI.

Additionally, you can connect directly from your computer's SSH client.

## Access with the Harvester UI

VMs can be accessed from the UI directly using either VNC or the serial console.

If the VGA display is not enabled on the VM, e.g., the `Ubuntu-Minimal-Cloud` image, the VM can only be accessed with the serial console.

![](/img/v1.2/vm/access-to-vm.png)

### VNC Console

The VNC console opens in a new browser window, which is titled with the VM name. The toolbar contains the following:

![](/img/v1.10/vm/vnc-console.png)

- **Shortcut Keys**: Sends key combinations that your browser or operating system would otherwise intercept, such as Ctrl+Alt+Del, Print Screen, and the function keys.
- **Ctrl+Alt+Del**: Sends Ctrl+Alt+Del after you confirm. Windows opens its sign-in or security screen, while most Linux systems restart the VM.
- **Custom Shortcut Keys**: Allows you to record your own key combinations and send them with one click.
- **Settings**: Contains the display options, which are saved in your browser.
  - **Display**: Scale the display to fit the window, or set the **Zoom** level (50% to 200%).
  - **View only**: Shows the display without sending your keyboard and mouse input to the VM.
  - **JPEG quality** and **Compression level**: Balance image quality against network bandwidth.
- Connection status: For example, **Connected**, **Connected (view only)**, or **Reconnecting**.
- **Soft Reboot**: Asks the guest operating system to restart after you confirm. Unsaved work inside the VM is lost. This button is displayed only when the VM supports soft reboot.
- **Reconnect**: Opens a new connection to the console.
- **Full Screen**: Shows the console in full screen. In Chromium-based browsers, shortcuts such as Ctrl+W and F11 are sent to the VM instead of the browser.

A ring is displayed around the console while it has keyboard focus. The console receives focus automatically when it connects.

#### Console in Use

_Available as of v1.10.0_

Only one VNC session can be connected to a VM at a time. If someone else is using the console, Harvester does not disconnect them. Instead, the message **This console is in use** is displayed.

![](/img/v1.10/vm/vnc-console-in-use.png)

- **Reconnect**: Tries to connect again. Use this option after the other session is closed.
- **Take Over**: Disconnects the other session and connects yours after you confirm. The console that was taken over does not take the console back. It keeps retrying and reconnects once the console is released.

:::note

**Take Over** requires Harvester v1.7.0 or later. When you use Rancher to manage an older Harvester cluster, the console connects without checking if it is in use, and the new session disconnects the existing one.

:::

## SSH Access

Harvester provides two ways to inject SSH public keys into virtual machines. Generally, these methods fall into two categories. [Static key injection](#static-ssh-key-injection-via-cloud-init), which places keys in the cloud-init script when the virtual machine is first powered on; [dynamic injection](#dynamic-ssh-key-injection-via-qemu-guest-agent), which allows keys or basic auth to be updated dynamically at runtime.

### Static SSH Key Injection via cloud-init

You can provide ssh keys to your virtual machines during the creation time on the `Basics` tab. Additionally, you can place the public ssh keys into your cloud-init script to allow it to take place.

![](/img/v1.2/vm/vm-ssh-keys.png)

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
3. Add either basic authentication credentials or SSH keys.
  You can only add a user that already exists in the guest operating system. For example, if you are using openSUSE, you can add the user `opensuse` and select SSH keys.
4. Make sure your qemu guest agent is already installed and the VM should be restarted after the credentials are added.

:::note

You need to enter the VM to edit password or remove SSH-Key after deleting the credentials from the UI.

:::

![](/img/v1.2/vm/vm-add-access-credentails.png)



### Access with the SSH Client
Once the VM is up and running, you can enter the IP address of the VM in a terminal emulation client, such as PuTTY. You may also run the following command to access the VM directly from your computer's SSH client:

```
 ssh -i ~/.ssh/your-ssh-key user@<ip-address-or-hostname>
```
