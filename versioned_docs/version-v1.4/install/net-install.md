---
sidebar_position: 9
sidebar_label: Net Install ISO
title: "Net Install ISO"
keywords:
  - Harvester
  - Net ISO Installation
  - BMC ISO Redirection
  - BMC Virtual Media
description: Harvester Net Install ISO is a minimal ISO that contains only the OS binaries. It's useful for some situations.
---

<head>
  <link rel="canonical" href="https://docs.harvesterhci.io/v1.5/install/net-install"/>
</head>

The Harvester net install ISO is a minimal installation image that contains only the core OS components, allowing the installer to boot and then install the Harvester OS on a disk. After installation is completed, the Harvester OS pulls all required container images from the internet (mostly from Docker Hub).

You can use the net install ISO in the following situations:
- The virtual media implementation on a server is buggy or slow. Community users have reported that ISO redirection is too slow to preload all images onto a system. For more information, see [Issue 2651](https://github.com/harvester/harvester/issues/2651).
- You have a private registry that contains all Harvester images, as well as the knowledge and experience required to configure image mirrors for containerd.

:::caution
**You must always use the full ISO to bootstrap a Harvester cluster** (in other words, use the ISO without the `-net-install` suffix). The full ISO contains all required images, and the installer preloads those images during installation. You can easily reach the [Docker Hub rate limit](https://docs.docker.com/docker-hub/download-rate-limit/) when using a net install ISO to bootstrap the Harvester cluster.
:::


## Usage

Download the net install ISO from the GitHub [Releases](https://github.com/harvester/harvester/releases) page, and then boot the ISO to install Harvester. Net install ISO file names have the suffix `net-install` (for example, https://releases.rancher.com/harvester/v1.3.0/harvester-v1.3.0-amd64-net-install.iso).

## PXE Installation

If you decide to use the net install ISO as the PXE installation source, add the following parameter when booting the kernel:

```
harvester.install.with_net_images=true
```

Please check [PXE Boot Installation](./pxe-boot-install.md) for more information.
