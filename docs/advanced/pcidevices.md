---
sidebar_position: 0
sidebar_label: PCI Devices
title: ""
---

# PCI Devices

A PCIDevice represents a host device with a PCI address. 
The devices can be passed through the hypervisor to a VM by creating a PCIDeviceClaim, 
or by using the UI to enable passthrough. Passing a device through the hypervisor means that 
the VM can directly access the device, and effectively owns the device. A VM can even install 
it's own drivers for that device.

## Enabling passthrough on a PCI Device

Go to the Advanced -> PCI Devices UI:

![](/img/v1.1/pcidevices/advanced-pcidevices-index.png)

Search for your device by vendor name (e.g. NVIDIA, Intel, etc.) or device name.

![](/img/v1.1/pcidevices/search-pcidevices.png)

Select the devices you want to enable for passthrough:

![](/img/v1.1/pcidevices/select-pcidevices.png)

Then click "Enable Passthrough", read the warning*, and if you still want to enable for those devices, click "Enable" and wait until all the devices say "Enabled"

![](/img/v1.1/pcidevices/enable-pcidevices-inprogress.png)

*The warning looks like this:
![](/img/v1.1/pcidevices/warning.png)


![](/img/v1.1/pcidevices/enable-pcidevices-done.png)

## Attaching PCI Devices to a VM

Go to the VM UI and select "Edit Config"

![](/img/v1.1/pcidevices/vm-pcidevices-edit-config.png)

Then select "PCI Devices" and use the "Available PCI Devices" drop-down, select the devices you want to attach, and then click Save.

![](/img/v1.1/pcidevices/vm-pcidevices-attach.png)


## Using a passed-through PCI Device inside the VM

Boot the VM up, and run `lspci` inside the VM, the attached PCI devices will show up, although the PCI address in the VM won't necessarily match the PCI address in the host. 


## Installing drivers for your PCI device inside the VM

This is just like installing drivers in the host. The PCI passthrough feature will bind the host device to the `vfio-pci` driver, which gives VMs the ability to use their own drivers. [Here is a screencast](https://tobilehman.com/posts/suse-harvester-pci/#toc) of NVIDIA drivers being installed in a VM, it includes a CUDA example that proves that the device drivers work.
