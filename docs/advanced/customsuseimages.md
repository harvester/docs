---
id: customsuseimages
sidebar_position: 8
sidebar_label: Custom SUSE VM Images
title: "Custom SUSE VM Images"
keywords:
- Custom Images
Description: How to create custom SLES and openSUSE guest virtual machine images
---

<head>
  <link rel="canonical" href="https://docs.harvesterhci.io/v1.3/advanced/customsuseimages"/>
</head>

SUSE provides SUSE Linux Enterprise (SLE) and openSUSE Leap virtual machine (VM) images suitable for use in Harvester. These images are built on the [openSUSE Build Service](https://build.opensuse.org/) (OBS) using the [Kiwi](https://osinside.github.io/kiwi/) image building tool.

SLE and openSUSE VM images can be downloaded and used as-is from https://www.suse.com/download/sles/ and https://get.opensuse.org/leap/ respectively. You will ordinarily want to use the Minimal VM Cloud qcow2 images, as these include the cloud-init tool necessary for automatically configuring the VM. Other image variants require logging into the VM console to perform initial configuration.

:::info
Prior to SLES 15 SP5 and openSUSE 15.5 the Minimal VM Cloud images were named Minimal VM OpenStack Cloud.
:::

If you want to create custom VM images based on the above, for example to include additional packages, you can do so based on the appropriate Kiwi template.

The easiest way to do this is to use the openSUSE Build Service, starting at https://build.opensuse.org/image_templates. For example, to create an image based on SLE 15 SP5, you would select "SLE 15 SP5 Minimal" under the "Templates using SUSE Linux Enterprise 15 SP5" heading then click the "Create appliance" button. From there, OBS provides a convenient user interface for adding additional packages. Your image will be automatically built, and can be downloaded from OBS, then you can upload it into Harvester. More information about OBS is available in the [User Guide](https://openbuildservice.org/help/manuals/obs-user-guide/).

Alternately, you can create images locally using the Kiwi command-line tool. For documentation on how to use Kiwi, see https://documentation.suse.com/appliance/kiwi-9/html/kiwi/index.html. As a starting point for your custom image, you'll need to download the `Minimal.kiwi` file and the `config.sh` and `editbootinstall_rpi.sh` scripts from the appropriate project on OBS.

| OS                 | openSUSE Build Service Project                                                                       |
| -------------------|-----------------------------------------------------------------------------------|
| SLE 15 SP5         | https://build.opensuse.org/package/show/SUSE:SLE-15-SP5:GA/kiwi-templates-Minimal |
| openSUSE Leap 15.5 | https://build.opensuse.org/package/show/openSUSE:Leap:15.5/kiwi-templates-Minimal |
| SLE 15 SP4         | https://build.opensuse.org/package/show/SUSE:SLE-15-SP4:GA/kiwi-templates-Minimal |
| openSUSE Leap 15.4 | https://build.opensuse.org/package/show/openSUSE:Leap:15.4/kiwi-templates-Minimal |
