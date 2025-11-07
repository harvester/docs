---
sidebar_position: 6
sidebar_label: NVIDIA Driver Toolkit
title: "NVIDIA Driver Toolkit"
---

<head>
  <link rel="canonical" href="https://docs.harvesterhci.io/v1.6/advanced/addons/nvidiadrivertoolkit"/>
</head>

_Available as of v1.3.0_

nvidia-driver-toolkit is an add-on that allows you to deploy out-of-band NVIDIA GRID KVM drivers to your existing Harvester clusters.

:::note
The toolkit only includes the correct Harvester OS image, build utilities, and kernel headers that allow NVIDIA drivers to be compiled and loaded from the container. You must download the NVIDIA KVM drivers using a valid NVIDIA subscription. For guidance on identifying the correct driver for your NVIDIA GPU, see the [NVIDIA documentation](https://www.nvidia.com/en-au/drivers/vgpu-software-driver/).
:::

The Harvester ISO does not include the nvidia-driver-toolkit container image. Because of its size, the image is pulled from Docker Hub by default. If you have an air-gapped environment, you can download and push the image to your private registry. The **Image Repository** and **Image Tag** fields on the **nvidia-driver-toolkit** screen provide information about the image that you must download.

![](/img/v1.3/advanced/nvidia-driver-toolkit.png)

:::note
Each new Harvester version will be released with the correct nvidia-driver-toolkit image to ensure that all dependencies required to install the NVIDIA vGPU KVM drivers are available in the image.
:::

To enable the addon, users need to perform the following:
* Provide the `Driver Location`: which is an http location where nvidia vgpu kvm driver file is located (as shown in the example)
* update the `Image Repository` and `Image Tag` if needed

Once the addon is enabled, a nvidia-driver-toolkit daemonset is deployed to the cluster.

On pod startup, the entrypoint script will download the nvidia driver from the speificied `Driver Location`, install the driver and load the kernel drivers.

The `PCIDevices` addon can now leverage this addon to manage the lifecycle of the vGPU devices on nodes containing supported GPU [devices](../vgpusupport.md).