---
sidebar_position: 10
sidebar_label: External Disk Support
title: "External Disk Support"
keywords:
  - Harvester
  - Net ISO Installation
  - BMC ISO Redirection
  - BMC Virtual Media
description: Install Harvester on diskless systems.
---


<head>
  <link rel="canonical" href="https://docs.harvesterhci.io/v1.6/install/external-disk-support"/>
</head>

_Available as of v1.4.0_

## Background

Harvester can now be installed on and booted from external disks. This is particularly useful in environments where hosts have NICs or HBA cards that support booting from external iSCSI devices or SAN storage arrays. Such diskless systems are common in large datacenters.

The following sections provide information about installing Harvester on an external iSCSI device. The workflow for SAN arrays is similar, but a different set of kernel arguments may be needed to allow Harvester to successfully boot from a SAN array.

## iSCSI-Based Installation

### Configure the iSCSI Target

:::note

Necessary changes to the BIOS or firmware will depend on the hardware that you use.

:::

When the installation destination powers on or resets, you must enter the firmware setup menu to change the boot settings and enable booting via iSCSI. The settings vary from system to system.

Entering the firmware setup menu usually requires pressing a designated key (for example, F2, F7, or ESC). The system will likely display a list of keys that are available for specific firmware functions. However, this list is displayed for a very short time, so you must select a menu option before the list disappears and the system starts to boot.

Configuration tasks that you must perform include the following:

- Enable UEFI boot
- Configure iSCSI initiator and target parameters
- Enable the iSCSI device in the boot menu
- Set the boot order so that your system boots from the iSCSI device

See your system provider's documentation for more information about boot settings and firmware functions. A link to a sample document is provided in the References section.

![target-details.png](/img/v1.4/external-disk/target-details.png)

### Install Harvester

You can load the Harvester ISO using any of the standard methods. The installer should automatically detect the iSCSI device. Select this device when you are prompted to specify the installation disk.

The information displayed on the installer differs slightly when you select an iSCSI target.

- Network configuration screen: Does not show the network interfaces that are used for mounting the iSCSI volumes.
- Disk configuration screen: Shows the first path to a multipath'd remote disk. However, after installation (assuming `os.externalStorageConfig` is provided), the operating system boots from the multipath device.

During installation, you must provide a configuration file (`config.yaml`) that contains multipath and additional kernel arguments. The information is added to the installed operating system to allow subsequent boots from an iSCSI target.

Example (`config.yaml`):

```
os:
  write_files:
  - content: |
      name: "fix default gateway"
      stages:
        network:
          - commands:
            - ip route delete default dev enp4s0f0.2017
            - ip route add default via 10.115.7.254
    path: /oem/99_fix_gateway.yaml
  externalStorageConfig:
    enabled: true
    multiPathConfig:
    - vendor: "IET"
      product: "MediaFiles"
  additionalKernelArguments: "rd.iscsi.firmware vlan=enp4s0f0.2017:enp4s0f0 ip=10.115.48.10::10.115.55.254:255.255.248.0::enp4s0f0.2017:none"
``` 

:::info important

The multiPathConfig structure changed starting in v1.7.0. While this change does not affect upgrades, you must review the [`os.externalStorageConfig`](/v1.7/install/harvester-configuration#osexternalstorageconfig) documentation before performing a fresh installation of v1.7.0 or later versions.

:::

The test setup uses multiple tagged VLANs, such as VLAN 2017 (used for connecting with the iSCSI volume) and VLAN 2011 (used for the Harvester management interface).

The kernel argument `vlan=enp4s0f0.2017:enp4s0f0 ip=10.115.48.10::10.115.55.254:255.255.248.0::enp4s0f0.2017:none` is necessary only if the iSCSI volume is accessible via an interface on a tagged VLAN. The arguments ensure that an additional tagged interface is created during boot and that a static address is allocated to the interface. See [dracut.cmdline](https://manpages.opensuse.org/Tumbleweed/dracut/dracut.cmdline.7.en.html) for more information about configuring the kernel arguments to match your use case.

The `write_files` directive is needed to ensure that the management interface is used as the default gateway. This is essential because RKE2 uses the interface with the default gateway as the node address.


### References
[Dell PowerEdge R630 Owner's Manual](https://www.dell.com/support/manuals/en-au/poweredge-r630/r630_om_pub/uefi-iscsi-settings?guid=guid-adc7d625-5c7b-469d-ba9c-4a2c704fcc49&lang=en-us) This is an example of relevant vendor documentation. Other vendors such as HPE, IBM, Lenovo, etc should provide comparable documentation, though the details will vary.