---
sidebar_position: 9
sidebar_label: Net Install ISO
title: "Net Install ISO"
keywords:
  - Harvester
  - Net ISO Installation
  - BMC ISO Redirection
  - BMC Virtual Media
description: Harvester Net Install ISO is a minimum ISO that contains only the OS binary. It's useful for some situations.
---


<head>
  <link rel="canonical" href="https://docs.harvesterhci.io/v1.3/install/net-install"/>
</head>


Harvester Net Install ISO is a minimum ISO that contains only the OS binary. It allows booting the Harvester installer to install Harvester OS on a disk. After the OS boots, the Harvester system bootstraps by pulling all required container images from the internet (most from Dockerhub).

A user can use Net Install ISO in these situations:
- A server has a buggy or slow virtaul media implementation. There are [reports](https://github.com/harvester/harvester/issues/2651) from the community that ISO redirection is too slow to preload all images into a system.
- A user has a private registry containing all Harvester images and has the experience and knowledge to configure image mirrors for containerd.

:::caution

**A user should always uses the ordinary ISO to bootstrap a Harvester cluster** (e.g., using the ISO without the `-net-install` suffix). The ordinary ISO contains all required images, and the installer preloads all images during the installation. It's easy for a user to reach [Docker Hub's rate limit](https://docs.docker.com/docker-hub/download-rate-limit/) when using a Net Install ISO to bootstrap the Harvester cluster.

:::

## Usage

Download the Net Install ISO from the GitHub release page and boot the ISO to install Harvester. A Net Install ISO has the suffix `net-install` in its name. e.g., https://releases.rancher.com/harvester/v1.3.0/harvester-v1.3.0-amd64-net-install.iso

## PXE Installation

When using the Net Install ISO as the PXE Installation source, please add this kernel parameter when booting the kernel:

```
harvester.install.with_net_images=true
```

Please check [PXE Boot Installation](./pxe-boot-install.md) for more information.
