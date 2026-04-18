---
sidebar_position: 14
sidebar_label: CD-ROM Hotplug
title: "CD-ROM Hotplug"
keywords:
  - Harvester
  - harvester
  - Virtual Machine
  - virtual machine
  - Hotplug
  - CD-ROM
description: Hotplug and hotunplug CD-ROM volumes.
---

<head>
  <link rel="canonical" href="https://docs.harvesterhci.io/v1.7/vm/cdrom-hotplug"/>
</head>

_Available as of v1.8.0_

Harvester supports hotplugging and hotunplugging CD-ROM volumes for running virtual machines. This feature allows you to insert and eject images from CD-ROM devices.

:::note

You cannot perform CD-ROM volume hotplugging on existing CD-ROM devices of virtual machines created in clusters running Harvester versions earlier than v1.8.0.

In addition, it is important to distinguish this feature from attaching or detaching the CD-ROM *device* itself, which still typically requires a VM restart.

:::

## Eject an image from an occupied CD-ROM device

1. On the Harvester UI, go to the **Virtual Machines** screen.

1. Click the name of the target virtual machine, and then go to the **Volumes** tab.

    ![Eject An Image](/img/v1.8/cdrom-hotplug/eject-image.png)

1. Locate the target occupied CD-ROM volume, and then click **Eject Image** and **Apply**.

## Insert an image into an empty CD-ROM device

1. On the Harvester UI, go to the **Virtual Machines** screen.

1. Click the name of the target virtual machine, and then go to the **Volumes** tab.

    ![Insert An Image](/img/v1.8/cdrom-hotplug/insert-image.png)

1. Locate the target empty CD-ROM volume, and then click **Insert Image**.

1. Select the **Image** and click **Apply**.

    ![Dialog To Insert An Image](/img/v1.8/cdrom-hotplug/insert-image-dialog.png)
