---
sidebar_position: 2
sidebar_label: Create a Windows Virtual Machine
title: ""
keywords:
  - Harvester
  - harvester
  - Rancher
  - rancher
  - Windows
  - windows
  - Virtual Machine
  - virtual machine
  - Create a Windows VM
Description: Create one or more Windows virtual machines from the Virtual Machines page.
---

# Create a Windows Virtual Machine

Create one or more virtual machines from the **Virtual Machines** page.

:::note

For creating Linux virtual machines, please refer to [this page](./create-vm.md).

:::

## How to Create a Windows VM

### Header Section

1. Create a single VM instance or multiple VM instances.
1. Set the VM name.
1. (Optional) Provide a description for the VM.
1. (Optional) Select the VM template `windows-iso-image-base-template`. This template will add a volume with the `virtio` drivers for Windows.

### Basics Tab

1. Configure the number of `CPU` cores assigned to the VM.
1. Configure the amount of `Memory` assigned to the VM.
1. (Optional) Select existing `SSH keys` or upload new ones.

![create-windows-vm](/img/v1.1/vm/create-windows-vm.png)

:::note

As mentioned above, it is recommended that you use the Windows VM template. The `Volumes` section will describe the options which the Windows VM template created automatically.

:::

:::caution

The `bootOrder` values need to be set with the installation image first. If you change it, your VM might not boot into the installation disk.

:::

### Volumes Tab

1. The **first volume** is an `Image Volume` with the following values: 
    1. `Name`: The value `cdrom-disk` is set by default. You can keep it or change it.
    2. `Image`: Select the Windows image to be installed. See [Upload Images](../upload-image.md) for the full description on how to create new images.
    3. `Type`: Select `cd-rom`.
    4. `Size`: The value `20` is set by default. You can change it if your image has a bigger size.
    5. `Bus`: The value `SATA` is set by default. It's recommended you don't change it.
2. The **second volume** is a `Volume` with the following values:
    1.  `Name`: The value `rootdisk` is set by default. You can keep it or change it.
    2.  `Size`: The value `32` is set by default. See the disk space requirements for [Windows Server](https://docs.microsoft.com/en-us/windows-server/get-started/hardware-requirements#storage-controller-and-disk-space-requirements) and [Windows 11](https://docs.microsoft.com/en-us/windows/whats-new/windows-11-requirements#hardware-requirements) before changing this value.
    3.  `Bus`: The value `VirtIO` is set by default. You can keep it or change it to the other available options, `SATA` or `SCSI`.
3. The **third volume** is a `Container` with the following values:
    1. `Name`: The value `virtio-container-disk` is set by default. You can keep it or change it.
    2. `Docker Image`: The value `registry.suse.com/suse/vmdp/vmdp:2.5.3` is set by default. It's recommended you don't change it.
    3. `Bus`: The value `SATA` is set by default. It's recommended you don't change it.
4. You can add additional disks using the buttons `Add Volume`, `Add Existing Volume`, `Add VM Image`, or `Add Container`.

![create-windows-vm-volumes](/img/v1.1/vm/create-windows-vm-volumes.png)

### Networks Tab

1. The **Management Network** is added by default with the following values: 
    1. `Name`:  The value `default` is set by default. You can keep it or change it.
    2. `Network`: The value `management Network` is set by default. You can't change this option if no other network has been created. See [Harvester Network](../networking/harvester-network) for the full description on how to create new networks.
    3. `Model`: The value `e1000` is set by default. You can keep it or change it to the other available options from the dropdown.
    4. `Type`: The value `masquerade` is set by default. You can keep it or change it to the other available option, `bridge`.
2. You can add additional networks by clicking  `Add Network`.

![create-windows-vm-networks](/img/v1.1/vm/create-windows-vm-networks.png)

:::caution

Changing the `Node Scheduling` settings can impact Harvester features, such as disabling `Live migration`.

:::

### Node Scheduling Tab

1. `Node Scheduling` is set to `Run VM on any available node` by default. You can keep it or change it to the other available options from the dropdown.

![create-windows-vm-scheduling](/img/v1.1/vm/create-windows-vm-scheduling.png)

### Advanced Options Tab

1. `OS Type`: The value `Windows` is set by default. It's recommended you don't change it.
2. `Machine Type`: The value `None` is set by default. It's recommended you don't change it. See the [KubeVirt Machine Type](https://kubevirt.io/user-guide/virtual_machines/virtual_hardware/#machine-type) documentation before you change this value.
3. (Optional) `Hostname`: Set the VM hostname.
4. (Optional) `Cloud Config`: Both `User Data` and `Network Data` values are set with default values. Currently, these configurations are not applied to Windows-based VMs.

![create-windows-vm-advanced](/img/v1.1/vm/create-windows-vm-advanced.png)

### Footer Section

1. `Start virtual machine on creation`: This option is checked by default. You can uncheck it if you don't want the VM to start once it's created.

Once all the settings are in place, click on `Create` to create the VM.

:::note

If you need to add advanced settings, you can edit the VM configuration directly by clicking on `Edit as YAML`. 
And if you want to cancel all changes made, click `Cancel`.

:::

## Installation of Windows

1. Select the VM you just created, and click `Start` to boot up the VM.(If you checked `Start virtual machine on creation` the VM will start automatically once it's created)

2. Boot into the installer, and follow the instructions given by the installer.

3. (Optional) If you are using `virtio` based volumes, you will need to load the specific driver to allow the installer to detect them. If you're using VM template `windows-iso-image-base-template`, the instruction is as follows:
    1. Click on `Load driver`, and then click `Browse` on the dialog box, and find a CD-ROM drive with a `VMDP-WIN` prefix. Next, find the driver directory according to the Windows version you're installing; for example, Windows Server 2012r2 should expand `win8.1-2012r2` and choose the `pvvx` directory inside.
    ![find-virtio-driver-directory](/img/v1.1/vm/find-virtio-driver-directory.png)
    2. Click `OK` to allow the installer to scan this directory for drivers, choose `SUSE Block Driver for Windows`, and click `Next` to load the driver.
    ![select-virtio-block-driver](/img/v1.1/vm/select-virtio-block-driver.png)
    1. Wait for the installer to load up the driver. If you choose the correct driver version the `virtio` volumes will be detected once the driver is loaded.
    ![installer-found-virtio-drive](/img/v1.1/vm/installer-found-virtio-drive.png)

4. (Optional) If you are using other `virtio` based hardware like network adapter, you will need to install those drivers manually after completing the installation. To install drivers, open the VMDP driver disk, and use the installer based on your platform.

The support matrix of VMDP driver pack for Windows are as follows (assume the VMDP CD-ROM drive path is E):

| Version | Supported | Driver path |
| :-----: | :-------: | :---------- |
| Windows 7 | No | `N/A` |
| Windows Server 2008 | No | `N/A` |
| Windows Server 2008r2 | No | `N/A` |
| Windows 8 x86(x64) | Yes | `E:\win8-2012\x86(x64)\pvvx` |
| Windows Server 2012 x86(x64) | Yes | `E:\win8-2012\x86(x64)\pvvx` |
| Windows 8.1 x86(x64) | Yes | `E:\win8.1-2012r2\x86(x64)\pvvx` |
| Windows Server 2012r2 x86(x64) | Yes | `E:\win8.1-2012r2\x86(x64)\pvvx` |
| Windows 10 x86(x64) | Yes | `E:\win10-server\x86(x64)\pvvx` |
| Windows Server 2016 x86(x64) | Yes | `E:\win10-server\x86(x64)\pvvx` |
| Windows Server 2019 x86(x64) | Yes | `E:\win10-server\x86(x64)\pvvx` |
| Windows 11 x86(x64) | Yes | `E:\win10-2004\x86(x64)\pvvx` |
| Windows Server 2022 x86(x64) | Yes | `E:\win10-2004\x86(x64)\pvvx` |

:::note

If you didn't use the `windows-iso-image-base-template` template, and you still need `virtio` devices, please make sure to add your custom Windows virtio driver to allow it to detect the hardware correctly.

:::

## Known Issues

### Windows ISO unable to boot when using EFI mode

When using EFI mode with Windows, you may find the system booted with other devices like HDD or UEFI shell like the one below:

![efi-shell](/img/v1.1/vm/efi-shell.png)

That's because Windows will prompt a `Press any key to boot from CD or DVD...` to let the user decide whether to boot from the installer ISO or not, and it needs human intervention to allow the system to boot from CD or DVD.

![boot-from-cd](/img/v1.1/vm/boot-from-cd.png)

Alternately if the system has already booted into the UEFI shell, you can type in `reset` to force the system to reboot again. Once the prompt appears you can press any key to let system boot from Windows ISO.

### VM crashes when reserved memory not enough

There is a known issue with Windows VM when it is allocated more than 8GiB without enough reserve memory configured. The VM crashes without warning.

This can be fixed by allocating at least 256MiB of reserved memory to the template on the Advanced Options tab.

![reserved-memory-config](/img/v1.1/vm/reserved-memory-config.png)

We will add a default 256MiB of reserved memory to the Windows template to prevent this problem in the future release.

### BSoD (Blue Screen of Death) at first boot time of Windows

There is a known issue with Windows VM using Windows Server 2016 and above, a BSoD with error code `KMODE_EXCEPTION_NOT_HANDLED` may appears at the first boot time of Windows. We are still looking into it and will fix this issue in the future release.

As a workaround, you can create or modify the file `/etc/modprobe.d/kvm.conf` within the installation of Harvester by updating `/oem/99_custom.yaml` like below:

```YAML
name: Harvester Configuration
stages:
  initramfs:
  - commands: # ...
    files:
    - path: /etc/modprobe.d/kvm.conf
      permissions: 384
      owner: 0
      group: 0
      content: |
          options kvm ignore_msrs=1
      encoding: ""
      ownerstring: ""
      # ...
```

:::note

This is still an experimental solution. For more information, please refer to [this issue](https://github.com/harvester/harvester/issues/276) and please let us know if you have encountered any issues after applying this workaround.

:::