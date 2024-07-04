---
sidebar_position: 2
sidebar_label: PCI Devices
title: "PCI Devices"
---

<head>
  <link rel="canonical" href="https://docs.harvesterhci.io/v1.1/advanced/pcidevices"/>
</head>

_Available as of v1.1.0_

_Unavailable on ARM64 architecture_

A `PCIDevice` in Harvester represents a host device with a PCI address. 
The devices can be passed through the hypervisor to a VM by creating a `PCIDeviceClaim` resource, 
or by using the UI to enable passthrough. Passing a device through the hypervisor means that 
the VM can directly access the device, and effectively owns the device. A VM can even install 
its own drivers for that device.

This is accomplished by using the `pcidevices-controller` addon.

To use the PCI devices feature, users need to enable the `pcidevices-controller` addon first.

![](/img/v1.2/vm-import-controller/EnableAddon.png)

Once the `pcidevices-controller` addon is deployed successfully, it can take a few minutes for it to scan and the PCIDevice CRDs to become available.
![](/img/v1.2/pcidevices/PcideviceEnabled.png)
## Enabling Passthrough on a PCI Device

1. Now go to the `Advanced -> PCI Devices` page:

   ![](/img/v1.2/pcidevices/advanced-pcidevices-index.png)

1. Search for your device by vendor name (e.g. NVIDIA, Intel, etc.) or device name.

   ![](/img/v1.2/pcidevices/search-pcidevices.png)

1. Select the devices you want to enable for passthrough:

   ![](/img/v1.2/pcidevices/select-pcidevices.png)

1. Then click **Enable Passthrough** and read the warning message. If you still want to enable these devices, click **Enable** and wait for all devices to be `Enabled`.
   :::caution
   Please do not use `host-owned` PCI devices (e.g., management and VLAN NICs). Incorrect device allocation may cause damage to your cluster, including node failure.
   :::

   ![](/img/v1.2/pcidevices/enable-pcidevices-inprogress.png)

   ![](/img/v1.2/pcidevices/enable-pcidevices-done.png)

## Attaching PCI Devices to a VM

After enabling these PCI devices, you can navigate to the **Virtual Machines** page and select **Edit Config** to pass these devices.

![](/img/v1.2/pcidevices/vm-pcidevices-edit-config.png)

Select **PCI Devices** and use the **Available PCI Devices** drop-down. Select the devices you want to attach from the list displayed and then click **Save**.

![](/img/v1.2/pcidevices/vm-pcidevices-attach.png)


## Using a passed-through PCI Device inside the VM

Boot the VM up, and run `lspci` inside the VM, the attached PCI devices will show up, although the PCI address in the VM won't necessarily match the PCI address in the host. 


## Installing drivers for your PCI device inside the VM

This is just like installing drivers in the host. The PCI passthrough feature will bind the host device to the `vfio-pci` driver, which gives VMs the ability to use their own drivers. [Here is a screenshot](https://tobilehman.com/posts/suse-harvester-pci/#toc) of NVIDIA drivers being installed in a VM. It includes a CUDA example that proves that the device drivers work.

## SRIOV Network Devices
_Available as of v1.2.0_

![](/img/v1.2/pcidevices/SriovNetworkDevicesLink.png)

The `pcidevices-controller` addon can now scan network interfaces on the underlying hosts and check if they support SRIOV Virtual Functions (VFs). If a valid device is found, `pcidevices-controller` will generate a new `SRIOVNetworkDevice` object.

![](/img/v1.2/pcidevices/SriovNetworkDevicesList.png)

To create VFs on a SriovNetworkDevice, you can click **⋮ > Enable** and then define the **Number of Virtual Functions**.
![](/img/v1.2/pcidevices/SriovNetworkDeviceEnable.png)

![](/img/v1.2/pcidevices/SriovNetworkVFDefinition.png)

The `pcidevices-controller` will define the VFs on the network interface and report the new PCI device status for the newly created VFs.

![](/img/v1.2/pcidevices/SriovNetworkDevicesVFStatus.png)

On the next re-scan, the `pcidevices-controller` will create the PCIDevices for VFs. This can take up to 1 minute.

You can now navigate to the **PCI Devices** page to view the new devices.

We have also introduced a new filter to help you filter PCI devices by the underlying network interface.

![](/img/v1.2/pcidevices/SriovNetworkDevicesFilter.png)

The newly created PCI device can be passed through to virtual machines like any other PCI device.
![](/img/v1.2/pcidevices/SriovNetworkDevicesFilterResult.png)
