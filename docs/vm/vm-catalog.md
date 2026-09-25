---
sidebar_position: 16
sidebar_label: VM Catalog
title: "VM Catalog"
keywords:
  - Harvester
  - harvester
  - Virtual Machine
  - virtual machine
  - Catalog
  - catalog
  - Instance Type
  - instance type
  - Preference
  - preference
description: Create virtual machines by picking an operating system and a size, based on KubeVirt instance types and preferences.
---

<head>
  <link rel="canonical" href="https://docs.harvesterhci.io/v1.10/vm/vm-catalog"/>
</head>

On the **Catalog** page, you create virtual machines by selecting an operating system, choosing a size, and entering basic details. It provides a faster alternative to the full [Create a Virtual Machine](./create-vm.md) form for standard VMs created from standard images.

The catalog uses three resources already present in every Harvester cluster:

| Building block | Resource | Provides |
|---|---|---|
| Operating system | `VirtualMachineImage` (`harvesterhci.io`) | The root disk content. |
| OS defaults | `VirtualMachineClusterPreference` (`instancetype.kubevirt.io`) | Disk bus, network model, firmware, clock settings, and the catalog icon. |
| Size | `VirtualMachineClusterInstancetype` (`instancetype.kubevirt.io`) | The number of vCPUs and the amount of memory. |

Instance types and preferences come from upstream KubeVirt APIs. Harvester deploys the KubeVirt **common-instancetypes** bundle automatically.

![vm-catalog-overview](/img/v1.10/vm/vm-catalog-overview.png)

## Instance Types

Instance types are grouped in series. The catalog shows one tab per series and, by default, the four most common sizes of the selected series.

| Series | Name | Intended for |
|---|---|---|
| `u1` | General purpose | Most workloads. Default series. |
| `o1` | Overcommitted | Workloads that tolerate memory overcommitment. |
| `cx1` | Compute | CPU-intensive workloads (dedicated CPUs). |
| `m1` | Memory | Memory-intensive workloads (hugepages). |
| `n1` | Network | Network-intensive workloads (DPDK). |
| `rt1` | Real-time | Real-time workloads. |

Common sizes in the `u1` series:

| Size | vCPU | Memory |
|---|---|---|
| `u1.small` | 1 | 2 GiB |
| `u1.medium` | 1 | 4 GiB |
| `u1.large` | 2 | 8 GiB |
| `u1.xlarge` | 4 | 16 GiB |

Click **Show all sizes** to display every size of a series, from `nano` to `8xlarge`.

![vm-catalog-sizes](/img/v1.10/vm/vm-catalog-sizes.png)

:::note

Series such as `cx1`, `m1`, `n1`, and `rt1` request dedicated CPUs, hugepages, or other node features. A VM created with one of these sizes remains unschedulable if no node provides them.

:::

## Prepare Images for the Catalog

The catalog lists every image that meets all of these conditions:

- The image is fully imported.
- The image is a disk image (`qcow2` or `raw`). ISO images are excluded because they are installers, not bootable disks.
- The image is not a Harvester upgrade image.

Each image is assigned to an operating system tile through a preference. The catalog resolves the preference in the following order:

1. The label `instancetype.kubevirt.io/default-preference` on the image.
2. The Harvester OS type label `harvesterhci.io/os-type` on the image.
3. The image display name (for example, a name containing `tumbleweed` maps to `opensuse.tumbleweed`).
4. If nothing matches, the image appears under **Other** without a preference.

Label images explicitly to map them to the intended preference and default size:

| Label | Purpose | Example |
|---|---|---|
| `instancetype.kubevirt.io/default-preference` | Preference applied to VMs created from this image. | `opensuse.leap` |
| `instancetype.kubevirt.io/default-instancetype` | Size preselected when the image is chosen. Defaults to `u1.medium`. | `u1.large` |
| `harvesterhci.io/os-type` | Harvester OS type, copied to the VM. | `openSUSE` |

Example:

```bash
kubectl label virtualmachineimage -n harvester-public <image-name> \
  harvesterhci.io/os-type=openSUSE \
  instancetype.kubevirt.io/default-preference=opensuse.leap \
  instancetype.kubevirt.io/default-instancetype=u1.medium
```

You can also add the labels in the **Labels** tab when you create or edit the image.

:::tip

Create catalog images in the `harvester-public` namespace to make them available to all namespaces.

:::

### Recommended Linux Images

The following cloud images work with the catalog. Create each one from **Images > Create**, using **URL** as the source, then apply the labels.

| Distribution | Download location | `default-preference` | `os-type` | Default user |
|---|---|---|---|---|
| openSUSE Leap | `https://download.opensuse.org/distribution/leap/<version>/appliances/` (Minimal VM, Cloud variant) | `opensuse.leap` | `openSUSE` | Check the image documentation |
| openSUSE Tumbleweed | `https://download.opensuse.org/tumbleweed/appliances/openSUSE-Tumbleweed-Minimal-VM.x86_64-Cloud.qcow2` | `opensuse.tumbleweed` | `openSUSE` | Check the image documentation |
| Fedora | `https://download.fedoraproject.org/pub/fedora/linux/releases/<version>/Cloud/x86_64/images/` (`Fedora-Cloud-Base-Generic-*.qcow2`) | `fedora` | `fedora` | `fedora` |
| Ubuntu | `https://cloud-images.ubuntu.com/<codename>/current/<codename>-server-cloudimg-amd64.img` | `ubuntu` | `ubuntu` | `ubuntu` |

:::note

- Leap and Fedora file names include a version or build number. Get the current file name from the directory listing.
- Tumbleweed is a rolling release. The image is downloaded once and does not update itself. Include the import date in the display name, for example `tumbleweed-2026-09`.
- SUSE Linux Enterprise Server images require SUSE Customer Center credentials and must be uploaded manually or served from an internal mirror.

:::

### Air-Gapped Environments

Stage the images with [Hauler](https://docs.hauler.dev) and create the Harvester images from the internal file server URL:

```bash
hauler store add file https://download.opensuse.org/tumbleweed/appliances/openSUSE-Tumbleweed-Minimal-VM.x86_64-Cloud.qcow2
hauler store serve fileserver
```

The catalog only requires an imported disk image in Harvester; it does not require external network access.

## Create a Virtual Machine from the Catalog

:::note

The VM Catalog is an optional add-on. If it is not visible in the left navigation bar, enable it under **Advanced > Addons**.

:::

1. Go to **Catalog** in the left navigation bar.
1. **Operating system**: select a tile. If several images map to the same operating system, choose one in the **Image** list.

    ![vm-catalog-os](/img/v1.10/vm/vm-catalog-os.png)
1. **Size**: select a series tab, then a size. The bars show the vCPU and memory of each size relative to the largest size displayed.
1. **Details**:

    | Field | Description |
    |---|---|
    | Name | Prefilled with the operating system and a random word, for example `tumbleweed-heron-4um`. You can change it. |
    | Namespace | Namespace of the VM. |
    | Network | **Management network** or any VM network. |
    | Root disk | Size of the root disk. The minimum is the virtual size of the image. |
    | SSH keys | SSH keys injected through cloud-init. See [SSH Keys](./access-to-the-vm.md). |
    | Console password | Optional password for the image's default user, set through cloud-init. |
    | Start after creation | Selected by default. Clear it to create the VM in a stopped state. |

    ![vm-catalog-details](/img/v1.10/vm/vm-catalog-details.png)

1. (Optional) Click **Preview spec** to compare what you requested (the instance type and preference) with the specification KubeVirt resolves.

    ![vm-catalog-preview](/img/v1.10/vm/vm-catalog-preview.png)
1. Click **Create**. The VM details page opens.

## How It Works

The catalog delegates VM specification generation to KubeVirt:

1. The catalog creates a VM manifest referencing the selected instance type and preference, omitting hardware details such as CPU, memory, disk bus, network model, and firmware.
1. The catalog submits this manifest to the KubeVirt `expand-vm-spec` API, which resolves the references into a complete specification.
1. The catalog adds settings required by Harvester (`cpu.maxSockets` and `resources.limits`) and creates the VM.

The result is a regular Harvester VM:

- It can be edited, cloned, backed up, and [live migrated](./live-migration.md) like any other VM.
- [Resource overcommit](./resource-overcommit.md) applies normally.
- Changing the instance type later is not supported. Edit the CPU and memory values in the VM form instead.

The catalog records the source metadata in VM annotations:

| Annotation | Value |
|---|---|
| `catalog.harvesterhci.io/instancetype` | Instance type used at creation, for example `u1.large`. |
| `catalog.harvesterhci.io/preference` | Preference used at creation, for example `opensuse.leap`. |
| `catalog.harvesterhci.io/image` | Source image, as `<namespace>/<name>`. |

These annotations are informational and do not update when the VM is edited.

:::note

CPU hotplug headroom is disabled for catalog VMs (`maxSockets` equals the number of sockets), matching VMs created with the standard form. See [CPU and Memory Hotplug](./cpu-memory-hotplug.md).

:::

## Windows Images

Windows is available in the catalog through prepared (golden) disk images. Windows installer ISOs are not supported in the catalog.

### Check the Target Preference

The firmware used during installation must match the firmware applied by the preference. An image installed in BIOS mode does not boot with an EFI preference, and vice versa.

```bash
kubectl get virtualmachineclusterpreferences.instancetype.kubevirt.io | grep windows
kubectl get virtualmachineclusterpreference windows.2k25.virtio -o yaml
```

Review `spec.firmware` (EFI and Secure Boot), `spec.devices` (TPM), and `spec.features` (SMM). Use the `.virtio` variant of the preference, which configures VirtIO disk and network devices.

### Build the Image

1. Create a build VM as described in [Create a Windows Virtual Machine](./create-windows-vm.md), with the following changes:
    - Use the VirtIO bus for the root disk.
    - Use the firmware settings of the target preference.
1. Install Windows. Load the VirtIO storage driver from the VMDP disk when the installer does not detect the root disk.
1. After the first boot:
    1. Install the VMDP drivers and the QEMU guest agent. The guest agent is required to display the VM IP address in Harvester.
    1. Install Windows updates and your baseline configuration (for example, enable Remote Desktop).
1. Generalize the system with Sysprep, using an answer file that completes the Windows setup screens and sets the Administrator password. See [Sysprep (Generalize) a Windows installation](https://learn.microsoft.com/en-us/windows-hardware/manufacture/desktop/sysprep--generalize--a-windows-installation) and [Use answer files with Sysprep](https://learn.microsoft.com/en-us/windows-hardware/manufacture/desktop/use-answer-files-with-sysprep). The VM shuts down when Sysprep completes.

    ```
    sysprep.exe /generalize /oobe /shutdown /unattend:C:\unattend.xml
    ```

    :::caution

    Without an answer file, every VM created from the image stops at the interactive Windows setup screens on first boot.

    :::

1. Export the root volume as an image in the `harvester-public` namespace. See [Export a Volume to an Image](../volume/export-volume.md). Include the build date in the image name, for example `windows-server-2025-2026-09`.
1. Label the image:

    ```bash
    kubectl label virtualmachineimage -n harvester-public <image-name> \
      harvesterhci.io/os-type=windows \
      instancetype.kubevirt.io/default-preference=windows.2k25.virtio \
      instancetype.kubevirt.io/default-instancetype=u1.xlarge
    ```

1. Create a VM from the catalog and verify that it boots to the login screen, reports its IP address, and accepts Remote Desktop connections.

:::note

The system partition keeps the size of the image. When you select a larger root disk in the catalog, extend the partition in Disk Management, or add a first-boot command to the answer file.

:::

To update the image, keep the build VM or a snapshot of it, apply updates, run Sysprep again, and export a new dated image. Each version appears in the **Image** list of the Windows tile.

:::note

Evaluation ISOs provide a time-limited license and a limited number of sysprep rearms. Production images require a KMS, AVMA or volume license key.

:::

## Known Limitations

- **ISO images are not supported.** Build a disk image as described in [Windows Images](#windows-images).
- **Storage backend.** Root disks are created as `ReadWriteMany` block volumes, which matches images stored as Longhorn backing images. Images stored on other storage backends are not supported yet.
- **Firmware comes from the preference.** If an image requires UEFI and its preference does not enable it, the VM does not boot. Use a preference with the correct firmware, or build the image for the firmware the preference uses.
- **SSH keys and password on Windows.** The **SSH keys** and **Console password** fields generate Linux cloud-init configuration and have no effect on Windows images. The Administrator password is the one set by the Sysprep answer file.
- **Reserved memory on Windows.** Windows VMs with more than 8 GiB of memory can crash without enough reserved memory. The catalog does not set reserved memory. If this happens, edit the VM and set the reserved memory as described in [Create a Windows Virtual Machine](./create-windows-vm.md#vm-crashes-when-reserved-memory-not-enough).
- **Cluster-scoped objects only.** Namespaced `VirtualMachineInstancetype` and `VirtualMachinePreference` objects are not listed.
- **No customization step.** To change settings not covered by the catalog (additional disks, multiple networks, node scheduling), create the VM and then [edit it](./edit-vm.md), or use the standard [Create a Virtual Machine](./create-vm.md) form.
