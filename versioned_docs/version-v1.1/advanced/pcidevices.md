---
sidebar_position: 6
sidebar_label: PCI Devices
title: "PCI Devices (Experimental)"
---

_Available as of v1.1.0_

A `PCIDevice` in Harvester represents a host device with a PCI address. 
The devices can be passed through the hypervisor to a VM by creating a `PCIDeviceClaim` resource, 
or by using the UI to enable passthrough. Passing a device through the hypervisor means that 
the VM can directly access the device, and effectively owns the device. A VM can even install 
its own drivers for that device.

This is accomplished by using the `pcidevices-controller` addon.

To use the PCI devices feature, users need to enable the `pcidevices-controller` addon first.

![](/img/v1.1/vm-import-controller/EnableAddon.png)

## Enabling Passthrough on a PCI Device

1. Now go to the `Advanced -> PCI Devices` page:

   ![](/img/v1.1/pcidevices/advanced-pcidevices-index.png)

1. Search for your device by vendor name (e.g. NVIDIA, Intel, etc.) or device name.

   ![](/img/v1.1/pcidevices/search-pcidevices.png)

1. Select the devices you want to enable for passthrough:

   ![](/img/v1.1/pcidevices/select-pcidevices.png)

1. Then click **Enable Passthrough** and read the warning message. If you still want to enable these devices, click **Enable** and wait for all devices to be `Enabled`.
   :::caution
   Please do not use `host-owned` PCI devices (e.g., management and VLAN NICs). Incorrect device allocation may cause damage to your cluster, including node failure.
   :::

   ![](/img/v1.1/pcidevices/enable-pcidevices-inprogress.png)

   ![](/img/v1.1/pcidevices/enable-pcidevices-done.png)

## Attaching PCI Devices to a VM

After enabling these PCI devices, you can navigate to the **Virtual Machines** page and select **Edit Config** to pass these devices.

![](/img/v1.1/pcidevices/vm-pcidevices-edit-config.png)

Select **PCI Devices** and use the **Available PCI Devices** drop-down. Select the devices you want to attach from the list displayed and then click **Save**.

![](/img/v1.1/pcidevices/vm-pcidevices-attach.png)


## Using a passed-through PCI Device inside the VM

Boot the VM up, and run `lspci` inside the VM, the attached PCI devices will show up, although the PCI address in the VM won't necessarily match the PCI address in the host. 


## Installing drivers for your PCI device inside the VM

This is just like installing drivers in the host. The PCI passthrough feature will bind the host device to the `vfio-pci` driver, which gives VMs the ability to use their own drivers. [Here is a screenshot](https://tobilehman.com/posts/suse-harvester-pci/#toc) of NVIDIA drivers being installed in a VM. It includes a CUDA example that proves that the device drivers work.

# Known Issues

1. The 1.1.0 version of PCI passthrough matches VMs to devices using `vendorId:deviceId`. This means that if there is more than one device with the same `vendorId:deviceId` pair, then KubeVirt will choose which device to allocate to a VM in a way that is essentially random. This will be addressed in 1.1.2 with the new deviceplugin implementation.
