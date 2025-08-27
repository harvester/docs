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
  <link rel="canonical" href="https://docs.harvesterhci.io/v1.6/advanced/customsuseimages"/>
</head>

SUSE provides [SUSE Linux Enterprise (SLE)](https://www.suse.com/download/sles/) and [openSUSE Leap](https://get.opensuse.org/leap/) virtual machine (VM) images suitable for use in Harvester. These images are built on the [openSUSE Build Service](https://build.opensuse.org/) (OBS) using the [Kiwi](https://osinside.github.io/kiwi/) image building tool, and can be used immediately after downloading.

For most cases, you can use the *Minimal VM Cloud* qcow2 images because these include the cloud-init tool necessary for automatic VM configuration. Other image variants require you to log onto the VM console and then perform initial configuration.

:::info
The *Minimal VM Cloud* images were named *Minimal VM OpenStack Cloud* in releases earlier than SLES 15 SP5 and openSUSE 15.5.
:::

## Using the openSUSE Build Service (OBS)

You can create custom images based on what SUSE provides using OBS [image templates](https://build.opensuse.org/image_templates), which are pre-configured Kiwi image configurations. For example, if you want use other packages with SLE 15 SP5, you can create an image using the *SLE 15 SP5 Minimal* template. OBS provides an interface for adding packages and automatically builds the image, which you can download and then upload to Harvester. For more information, see the [OBS User Guide](https://openbuildservice.org/help/manuals/obs-user-guide/).

### 1. Create a custom image based on an existing template.

1. Go to https://build.opensuse.org/image_templates. You must sign in to your openSUSE account to access the resources.

1. Select the template that you want to use.

1. Specify a name for the image, and then select **Create appliance**.

   ![](/img/v1.3/advanced/custom-vm-01-select-template.png)

   OBS automatically builds the image. By default, the interface shows the **Overview** tab, which contains information such as the number of included packages and the build status.

   ![](/img/v1.3/advanced/custom-vm-02-image-overview.png)

### 2. Select image profiles and add packages.

1. Go to the **Software** tab.

1. Select the image profiles that you want OBS to build.

  :::info
  For most cases, you can use the *Minimal VM Cloud* qcow2 images because these include the cloud-init tool necessary for automatic VM configuration. Other image variants require you to log onto the VM console and then perform initial configuration.
  :::

   ![](/img/v1.3/advanced/custom-vm-03-image-software.png)

1. (Optional) Add and remove packages.

   ![](/img/v1.3/advanced/custom-vm-04-image-software-packages.png)

   ![](/img/v1.3/advanced/custom-vm-05-image-software-add-package.png)

### 3. (Optional) Switch to *View Package* mode.

*View Package* mode provides more granular control over configuration. To switch, click the *View Package* icon in the navigation bar.

![](/img/v1.3/advanced/custom-vm-06-view-package.png)

The **Source Files** section of the **Overview** tab shows all the files that comprise your Kiwi template. You can edit any of the files by selecting the corresponding file name.

![](/img/v1.3/advanced/custom-vm-07-view-package-details.png)

### 4. (Optional) Edit the configuration file `Minimal.kiwi`.

Select the file name to open the text editor. The `<packages type="image">` section lists the packages to be installed. You can specify additional packages for each image profile.

By default, the *Cloud* image profile (`<package type="image" profiles="Cloud">`) installs the *kernel-default-base* package. In the following example, that package is replaced with *kernel-default*, which includes modules necessary for iSCSI support.

![](/img/v1.3/advanced/custom-vm-08-edit-kiwi-config.png)

### 5. Wait for OBS to finish building the image.

Once the process is completed, the **Build Results** section on the **Overview** tab shows the status *succeeded*.

![](/img/v1.3/advanced/custom-vm-09-build-succeeded.png)

The **Build Results** section also contains a download link for the new image.

![](/img/v1.3/advanced/custom-vm-10-binaries-link.png)

![](/img/v1.3/advanced/custom-vm-11-binaries-download.png)

### 6. Enable publishing to share the image.

To allow the public to download your custom image, go to the **Repositories** tab of your OBS project and enable the *Publish* flag.

![](/img/v1.3/advanced/custom-vm-12-project-publish-repositories.png)

Your image is published to https://download.opensuse.org/ (under `repositories/home:/YOUR_USER_NAME:/branches:/SUSE:/Templates:/Images:/`).

![](/img/v1.3/advanced/custom-vm-13-download.openuse.org.png)

## Using the Kiwi Command-line Tool

As an alternative to the openSUSE Build Service, you can create images locally using the Kiwi command-line tool. For more information about the tool, see [Building Linux System Appliances with KIWI Next Generation (KIWI NG)](https://documentation.suse.com/appliance/kiwi-9/html/kiwi/index.html).

To create custom images, you must first download the file `Minimal.kiwi`, and the scripts `config.sh` and `editbootinstall_rpi.sh` from the corresponding project on OBS.

| OS                 | openSUSE Build Service Project                                                                       |
| -------------------|-----------------------------------------------------------------------------------|
| SLE 15 SP5         | https://build.opensuse.org/package/show/SUSE:SLE-15-SP5:GA/kiwi-templates-Minimal |
| openSUSE Leap 15.5 | https://build.opensuse.org/package/show/openSUSE:Leap:15.5/kiwi-templates-Minimal |
| SLE 15 SP4         | https://build.opensuse.org/package/show/SUSE:SLE-15-SP4:GA/kiwi-templates-Minimal |
| openSUSE Leap 15.4 | https://build.opensuse.org/package/show/openSUSE:Leap:15.4/kiwi-templates-Minimal |
