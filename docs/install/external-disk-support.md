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
  <link rel="canonical" href="https://docs.harvesterhci.io/v1.4/install/external-disk-support"/>
</head>

_Available as of v1.4.0_

### Background
A common ask from Harvester users has been the ability to install and boot Harvester from external disks. Such diskless systems are common in large datacenter environments.

Nodes with NIC's or HBA supporting boot from external iSCSI devices or SAN storage arrays can leverage this feature to install Harvester to diskless systems.

We will cover a simple example of installing to an external iscsi disk. The workflow for SAN arrays will be similar but a different set of kernel arguments may be needed to allow Harvester to successfully boot from the SAN array

### iscsi disk based install

#### configure iscsi target
:::note
bios/firmware changes will need to be adapter for user specific hardware
:::
When your system to be installed powers on or is reset, you must enter the firmware setup menu to change the boot settings and enable booting via iSCSI.

Precise details for this are difficult to provide because they vary from system to system.

It is typical to force the system to enter the firmware settings menu by typing a special key such as F2, F7, ESC, etc. Which one works for your system varies. Often the system will display a list of which key(s) are available for specific firmware functions, but it is not uncommon for the firmware to erase this list and start to boot after only a very short delay, so you have to pay close attention.

If in doubt, consult the system provider's documentation. An example document link is provided in the References section. Other vendors should provide similar documentation.

The typical things you need to configure are:

* Enable UEFI boot
* Configure iSCSI initiator and target parameters
* Enable the iSCSI device in the boot menu
* Set the boot order so that your system will boot from the iSCSI device

![target-details.png](/img/v1.4/external-disk/target-details.png)

#### install Harvester
This can be done by whatever means you would normally use to load the Harvester install image.

The Harvester installer should automatically "see" the iSCSI device in the dialog where you chose the installation destination. Choose this device to install.

The following changes have been made to the installer when an iscsi target is used:
* network interfaces being used for mounting the iscsi volumes are skipped from the installer network configuration page
* the disks page will show the first path to a multipath'd remote disk, however post install assuming `os.externalStorageConfig` is provided, the OS will boot off the multipath device

During the install phase, users need to provide a config yaml to configure multipath and additional kernel arguments. This information is added to the installed OS to allow subsequent boots from an iscsi target

For example in our environment we have provided the following config.yaml

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

In our test setup, we have multiple tagged VLANs. With VLAN 2017 used for connecting with the iSCSI volume and VLAN2011 being used for Harvester management interface.

`vlan=enp4s0f0.2017:enp4s0f0 ip=10.115.48.10::10.115.55.254:255.255.248.0::enp4s0f0.2017:none` kernel argument is only needed if the iSCSI volume is accessible via an interface on a tagged VLAN. The arguments ensure that additional tagged interface is created during boot and a static address is allocated to the same.

Please refer to the [dracut cmdline arguments](https://manpages.opensuse.org/Tumbleweed/dracut/dracut.cmdline.7.en.html) to configure the kernel arguments to suit your use case.

The `write_files` directive is needed to ensure that the management interface is used as the default gateway. This is essential as RKE2 uses the interface with the default gateway as the node address. 

Post install Harvester should boot up and work as it would normally.