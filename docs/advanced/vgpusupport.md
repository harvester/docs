---
sidebar_position: 9
sidebar_label: vGPU Support
title: "vGPU Support"
---

<head>
  <link rel="canonical" href="https://docs.harvesterhci.io/v1.1/advanced/vgpusupport"/>
</head>

_Available as of v1.3.0_

Harvester now offers the capability to share NVIDIA GPU's supporting SRIOV based virtualisation as vGPU devices.

The additional capability is provided by the `pcidevices-controller` addon, and leverages `sriov-manage` to manage the gpu. Please refer the [Nvidia Documentation](https://docs.nvidia.com/grid/15.0/grid-vgpu-user-guide/index.html#creating-sriov-vgpu-device-red-hat-el-kvm) and your GPU documentation to identify if the GPU is supported.


The [nvidia-driver-toolkit](./addons/nvidiadrivertoolkit.md) addon needs to be enabled for users to be able to manage the lifecycle of vGPU's on GPU devices.

## Usage

1. On the **Dashboard** screen of Harvester UI, navigate to `SR-IOV GPU Devices` and check if GPU devices have been scanned and an associated `sriovgpudevices.devices.harvesterhci.io` object has been created. Once device is found it can be enabled by the users
![](/img/v1.3/advanced/sriovgpudevices-disabled.png)

2. Once enabled, the associated vGPU device details will be available on the **Dashboard**
![](/img/v1.3/advanced/sriovgpudevices-enabled.png)

3. Users can now navigate to the `vGPU Devices` page and view the associated `vgpudevices.devices.harvesterhci.io` objects.
:::note
It can take upto a few minutes for the vGPU Devices to be scanned by the pcidevices controller and be available in the UI
:::
![](/img/v1.3/advanced/vgpudevicelist.png)

4. Users can now select a vGPU and configure an available profile from list of support profiles from the drop-down menu
![](/img/v1.3/advanced/vgpuprofiles.png)
:::note
The list of available profiles is dependent on GPU and is read from the underlying /sys tree of the host. Please refer to the [NVIDIA documentation](https://docs.nvidia.com/grid/15.0/grid-vgpu-user-guide/index.html#supported-gpus-grid-vgpu) to view the various profiles and associated capabilities available.
Once the first vGPU profile is selected, the NVIDIA driver automatically reconfigures the remaining vGPU's with the list of vGPU profiles available.
:::

5. Once a vGPU device has been setup, it can be attached to a new or existing VM
![](/img/v1.3/advanced/vgpuattachment.png)

Once the VM boots up, the vGPU will be available in the guest for usage by the workload. Additional vGPU drivers may be needed for your guest.

:::note
Once a vGPU has been assigned to a VM, it may not be possible to disable the same until the vGPU is removed from the VM.
:::


### Limitations

#### Attaching multiple vGPU's:

Known issue: https://github.com/harvester/harvester/issues/5289
Attaching multiple vGPU's to a VM may fail for 2 possible reasons:

1. Not all vGPU profiles support attachment of multiple vGPU's. Please refer to the [NVIDIA documentation](https://docs.nvidia.com/grid/16.0/grid-vgpu-release-notes-generic-linux-kvm/index.html#multiple-vgpu-support)  to identify the correct vGPU profile that supports the same. For example, we use NVIDIA A2/A16 GPU's and only Q-series vGPU's support attaching multiple vGPUs
![](/img/v1.3/advanced/multiplevgpu.png)

2. Once the correct profile is selected, only 1 GPU device in the VM definition can have `ramFB` enabled, and user needs to edit their VM as yaml and add the `virtualGPUOptions` to all non primary vGPU devices:
```
virtualGPUOptions:
  display:
     ramFB:
       enabled: false 
```
Post this change the guest should be able to use the multiple vGPU's 


#### Unable to use all vGPUs
By default when vGPU support is enabled on a GPU, the NVIDIA driver creates 16 vGPU devices. Based on the first profile selected, the NVIDIA driver automatically configures the profiles available for remaining vGPUs.

The profile used also dictates the maximum number of vGPUs available per GPU. Once the max count is exhausted then the remaining vGPU devices will have no profile available in their drop down menu and cannot be configured.

For example, on our [NVIDIA A2 GPU](https://docs.nvidia.com/grid/15.0/grid-vgpu-user-guide/index.html#vgpu-types-nvidia-a2), using the `NVIDIA A2-4Q` profile means we can only have 4 vGPUs setup.
![](/img/v1.3/advanced/nvidia-a2-example.png)

Once 4 vGPU devices are setup, the remaining vGPU devices can no longer be configured.


### Technical Deep dive

The pcidevices controller introduces to new CRD's
* sriovgpudevices.devices.harvesterhci.io
* vgpudevices.devices.harvesterhci.io

On boot the pcidevices controller scans the host for NVIDIA GPU's which support SRIOV vGPU devices. When such devices are found they are represented as a CRD as shown below.

```
apiVersion: devices.harvesterhci.io/v1beta1
kind: SRIOVGPUDevice
metadata:
  creationTimestamp: "2024-02-21T05:57:37Z"
  generation: 2
  labels:
    nodename: harvester-kgd9c
  name: harvester-kgd9c-000008000
  resourceVersion: "6641619"
  uid: e3a97ee4-046a-48d7-820d-8c6b45cd07da
spec:
  address: "0000:08:00.0"
  enabled: true
  nodeName: harvester-kgd9c
status:
  vGPUDevices:
  - harvester-kgd9c-000008004
  - harvester-kgd9c-000008005
  - harvester-kgd9c-000008016
  - harvester-kgd9c-000008017
  - harvester-kgd9c-000008020
  - harvester-kgd9c-000008021
  - harvester-kgd9c-000008022
  - harvester-kgd9c-000008023
  - harvester-kgd9c-000008006
  - harvester-kgd9c-000008007
  - harvester-kgd9c-000008010
  - harvester-kgd9c-000008011
  - harvester-kgd9c-000008012
  - harvester-kgd9c-000008013
  - harvester-kgd9c-000008014
  - harvester-kgd9c-000008015
  vfAddresses:
  - "0000:08:00.4"
  - "0000:08:00.5"
  - "0000:08:01.6"
  - "0000:08:01.7"
  - "0000:08:02.0"
  - "0000:08:02.1"
  - "0000:08:02.2"
  - "0000:08:02.3"
  - "0000:08:00.6"
  - "0000:08:00.7"
  - "0000:08:01.0"
  - "0000:08:01.1"
  - "0000:08:01.2"
  - "0000:08:01.3"
  - "0000:08:01.4"
  - "0000:08:01.5"
```

When a SRIOVGPUDevice is enabled, the pcidevices controller works with the `nvidia-driver-toolkit` daemonset to manage the GPU devices.

On subsequent scan of the /sys tree by the pcidevices, the vGPU devices are scanned by the pcidevices controller and managed as `VGPUDevices` CRD

```
NAME                        ADDRESS        NODE NAME         ENABLED   UUID                                   VGPUTYPE       PARENTGPUDEVICE
harvester-kgd9c-000008004   0000:08:00.4   harvester-kgd9c   true      dd6772a8-7db8-4e96-9a73-f94c389d9bc3   NVIDIA A2-4A   0000:08:00.0
harvester-kgd9c-000008005   0000:08:00.5   harvester-kgd9c   true      9534e04b-4687-412b-833e-3ae95b97d4d1   NVIDIA A2-4Q   0000:08:00.0
harvester-kgd9c-000008006   0000:08:00.6   harvester-kgd9c   true      a16e5966-9f7a-48a9-bda8-0d1670e740f8   NVIDIA A2-4A   0000:08:00.0
harvester-kgd9c-000008007   0000:08:00.7   harvester-kgd9c   true      041ee3ce-f95c-451e-a381-1c9fe71918b2   NVIDIA A2-4Q   0000:08:00.0
harvester-kgd9c-000008010   0000:08:01.0   harvester-kgd9c   false                                                           0000:08:00.0
harvester-kgd9c-000008011   0000:08:01.1   harvester-kgd9c   false                                                           0000:08:00.0
harvester-kgd9c-000008012   0000:08:01.2   harvester-kgd9c   false                                                           0000:08:00.0
harvester-kgd9c-000008013   0000:08:01.3   harvester-kgd9c   false                                                           0000:08:00.0
harvester-kgd9c-000008014   0000:08:01.4   harvester-kgd9c   false                                                           0000:08:00.0
harvester-kgd9c-000008015   0000:08:01.5   harvester-kgd9c   false                                                           0000:08:00.0
harvester-kgd9c-000008016   0000:08:01.6   harvester-kgd9c   false                                                           0000:08:00.0
harvester-kgd9c-000008017   0000:08:01.7   harvester-kgd9c   false                                                           0000:08:00.0
harvester-kgd9c-000008020   0000:08:02.0   harvester-kgd9c   false                                                           0000:08:00.0
harvester-kgd9c-000008021   0000:08:02.1   harvester-kgd9c   false                                                           0000:08:00.0
harvester-kgd9c-000008022   0000:08:02.2   harvester-kgd9c   false                                                           0000:08:00.0
harvester-kgd9c-000008023   0000:08:02.3   harvester-kgd9c   false                                                           0000:08:00.0
```

When a user enables and selects a profile for the `VGPUDevice` the pcidevices controller sets up the device and sets up the correct profile on the said device.

```
apiVersion: devices.harvesterhci.io/v1beta1
kind: VGPUDevice
metadata:
  creationTimestamp: "2024-02-26T03:04:47Z"
  generation: 8
  labels:
    harvesterhci.io/parentSRIOVGPUDevice: harvester-kgd9c-000008000
    nodename: harvester-kgd9c
  name: harvester-kgd9c-000008004
  resourceVersion: "21051017"
  uid: b9c7af64-1e47-467f-bf3d-87b7bc3a8911
spec:
  address: "0000:08:00.4"
  enabled: true
  nodeName: harvester-kgd9c
  parentGPUDeviceAddress: "0000:08:00.0"
  vGPUTypeName: NVIDIA A2-4A
status:
  configureVGPUTypeName: NVIDIA A2-4A
  uuid: dd6772a8-7db8-4e96-9a73-f94c389d9bc3
  vGPUStatus: vGPUConfigured
```

The pcidevices controller also runs a vGPU device plugin, which advertises the details of the various vGPU profiles to the kubelet. This is then used by the k8s scheduler to place the VM's requesting vGPU's to the correct nodes.

```
(⎈|local:harvester-system)➜  ~ k get nodes harvester-kgd9c -o yaml | yq .status.allocatable
cpu: "24"
devices.kubevirt.io/kvm: 1k
devices.kubevirt.io/tun: 1k
devices.kubevirt.io/vhost-net: 1k
ephemeral-storage: "149527126718"
hugepages-1Gi: "0"
hugepages-2Mi: "0"
intel.com/82599_ETHERNET_CONTROLLER_VIRTUAL_FUNCTION: "1"
memory: 131858088Ki
nvidia.com/NVIDIA_A2-4A: "2"
nvidia.com/NVIDIA_A2-4C: "0"
nvidia.com/NVIDIA_A2-4Q: "2"
pods: "200"
```

The pcidevices controller also setups the integration with kubevirt and advertises the vGPU devices as externally managed devices in the Kubevirt CR to ensure that the VM can consume the vGPU.