---
sidebar_position: 6
sidebar_label: Nvidia Driver Toolkit
title: "Nvidia Driver Toolkit"
---

<head>
  <link rel="canonical" href="https://docs.harvesterhci.io/advanced/nvidiadrivertoolkit"/>
</head>

_Available as of v1.3.0_

Nvidia Driver toolkit is an addon to allow users to deploy NVIDIA GRID KVM drivers out of band to their existing Harvester clusters.

:::note
the toolkit does not ship the NVIDIA KVM drivers but only the correct harvester OS image, build utils and kernel headers to allow nvidia drivers to be compiled and loaded from the container. Users will need a valid NVIDIA subscription to be able to download the NVIDIA KVM drivers. Please refer to the [NVIDIA Documentation](https://www.nvidia.com/en-au/drivers/vgpu-software-driver/) to identify the correct NVIDIA driver for your GPU.
:::

The harvester iso currently does not ship with the nvidia-driver-toolkit container image due to the size of the image. By default the image will be pulled from docker hub. For airgapped environments, the users can download and push the image to their private registry.

![](/img/v1.3/advanced/nvidia-driver-toolkit.png)

Users can refer to `Image Repository` and `Image Tag` for details of image to download.

:::note
Harvester will always be releasing the correct version of nvidia-driver-toolkit with each Harvester release to ensure that all dependencies needed to install the nvidia kvm drivers are available in the image.
:::

To enable the addon, users need to perform the following:
* Provide the `Driver Location`: which is an http location where nvidia vgpu kvm driver file is located (as shown in the example)
* update the `Image Repository` and `Image Tag` if needed

Once the addon is enabled, a nvidia-driver-toolkit daemonset is deployed to the cluster.

On pod startup, the entrypoint script will download the nvidia driver from the speificied `Driver Location`, install the driver and load the kernel drivers.

The `PCIDevices` addon can now leverage this addon to manage the lifecycle of the vGPU devices on nodes containing supported GPU devices.