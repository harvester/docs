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

## Using the openSUSE Build Service

The easiest way to create custom VM images is to use the openSUSE Build Service, starting at https://build.opensuse.org/image_templates. For example, to create an image based on SLE 15 SP5, you would select "SLE 15 SP5 Minimal" under the "Templates using SUSE Linux Enterprise 15 SP5" heading then click the "Create appliance" button. From there, OBS provides a convenient user interface for adding additional packages. Your image will be automatically built, and can be downloaded from OBS, then you can upload it into Harvester. More information about OBS is available in the [User Guide](https://openbuildservice.org/help/manuals/obs-user-guide/).

### 1. Create a new image based on an existing template

Go to https://build.opensuse.org/image_templates, select the desired template, choose a name, and click the "Create appliance" button.

![](/img/v1.3/advanced/custom-vm-01-select-template.png)

Your image will automatially build. The default view in OBS will show an overview including the number of packages installed and the build status.

![](/img/v1.3/advanced/custom-vm-02-image-overview.png)

### 2. Use the Software tab to select a profile and add packages

Click the Software tab to select which image profile(s) to build, and to add and remove packages. As mentioned above you will ordinarily want to build the Cloud image.

![](/img/v1.3/advanced/custom-vm-03-image-software.png)

Packages can be added and removed further down on this screen:

![](/img/v1.3/advanced/custom-vm-04-image-software-packages.png)

![](/img/v1.3/advanced/custom-vm-05-image-software-add-package.png)

### 3. For finer control, switch to "View Package"

When you use OBS to create a VM image as above, it will default to "View Image" mode. If you need finer control over configuration, you can switch to "View Package" mode by clicking the appropriate link in the sidebar:

![](/img/v1.3/advanced/custom-vm-06-view-package.png)

This will show all the files that make up your Kiwi template, under "Source Files". You can click on any of the source files to edit them:

![](/img/v1.3/advanced/custom-vm-07-view-package-details.png)

### 4. Add and remove packages by editing Minimal.kiwi

Click on the Minimal.Kiwi file to edit it. The main list of packages to be installed can be found in the `<packages type="image">` section, but each image profile can also specify additional packages. By default, the Cloud image profile (`<package type="image" profiles="Cloud">`) will install the "kernel-default-base" package. In this example, we're chaning it to install "kernel-default" instead, because the latter package includes extra modules necessary for iSCSI support:

![](/img/v1.3/advanced/custom-vm-08-edit-kiwi-config.png)

### 5. Wait for the image build to complete

Once the image build is complete, the Build Results on the Overview screen will indicate success:

![](/img/v1.3/advanced/custom-vm-09-build-succeeded.png)

Note that the "images" link under the Build Results tab will take you to where you can download the built VM image for subsequent upload to Harvester:

![](/img/v1.3/advanced/custom-vm-10-binaries-link.png)

![](/img/v1.3/advanced/custom-vm-11-binaries-download.png)

### 6. Enable publishing to share your VM image

If you want to make your VM image available for public download, go to the Repositories tab of your project on OBS, and enable the "Publish" flag:

![](/img/v1.3/advanced/custom-vm-12-project-publish-repositories.png)

This will then publish your image to https://download.opensuse.org/, under `repositories/home:/YOUR_USER_NAME:/branches:/SUSE:/Templates:/Images:/`:

![](/img/v1.3/advanced/custom-vm-13-download.openuse.org.png)

## Using the Kiwi Command-line Tool

As an alternative to the openSUSE Build Service, you can create images locally using the Kiwi command-line tool. For documentation on how to use Kiwi, see https://documentation.suse.com/appliance/kiwi-9/html/kiwi/index.html. As a starting point for your custom image, you'll need to download the `Minimal.kiwi` file and the `config.sh` and `editbootinstall_rpi.sh` scripts from the appropriate project on OBS.

| OS                 | openSUSE Build Service Project                                                                       |
| -------------------|-----------------------------------------------------------------------------------|
| SLE 15 SP5         | https://build.opensuse.org/package/show/SUSE:SLE-15-SP5:GA/kiwi-templates-Minimal |
| openSUSE Leap 15.5 | https://build.opensuse.org/package/show/openSUSE:Leap:15.5/kiwi-templates-Minimal |
| SLE 15 SP4         | https://build.opensuse.org/package/show/SUSE:SLE-15-SP4:GA/kiwi-templates-Minimal |
| openSUSE Leap 15.4 | https://build.opensuse.org/package/show/openSUSE:Leap:15.4/kiwi-templates-Minimal |
