---
sidebar_position: 8
sidebar_label: Install Binaries Only
title: "Install Binaries Only Mode"
keywords:
  - Harvester
  - harvester
  - Rancher
  - rancher
  - ISO Installation
Description: To get the Harvester ISO, download it from the Github releases. During the installation you can either choose install binaries only.
---

<head>
  <link rel="canonical" href="https://docs.harvesterhci.io/dev/install/install-binaries-mode"/>
</head>

_Available as of v1.2.0_

`Install Harvester binaries only` mode allows end users to install and configure binaries and is better suited for cloud and edge use cases.

![choose-installation-mode.png](/img/v1.2/install/choose-installation-mode.png)

### Background
Currently when a new harvester node is launched it needs to be the first node in the cluster or join an existing cluster.
This is very useful when we already know the details of the environment where harvester is being installed.
However for use cases like metal cloud providers and edge, the install mode load OS and Harvester content on the node without configuring the networking.

As part of this install the K8s and networking configuration will not be applied.

When the user boots this "configured" node, the console will wait for the end user to configure the following:

* create/join option for harvester
* management network interface details
* cluster token
* node password

Once this information is made available, the installer will apply the endpoint info and bootstrap harvester. No further reboots will be required.

### stream disk mode
Harvester now publishes a raw image artifact for pre-installed harvester. An additional feature has been built into the harvester installer to allow streaming this pre-installed image directly to disk.

This allows better integration with cloud providers.

On `Equinix Metal` the streaming mode can be leverage with the following kernel arguments:

```
ip=dhcp net.ifnames=1 rd.cos.disable rd.noverifyssl root=live:http://${artifactEndpoint}/harvester-v1.2.0-rootfs-amd64.squashfs harvester.install.automatic=true harvester.scheme_version=1 harvester.install.device=/dev/vda  harvester.os.password=password harvester.install.raw_disk_image_path=http://${artifactEndpoint}/harvester-v1.2.0-amd64.raw harvester.install.mode=install console=tty1 harvester.install.tty=tty1 harvester.install.config_url=https://metadata.platformequinix.com/userdata harvester.install.management_interface.interfaces="name:enp1s0" harvester.install.management_interface.method=dhcp harvester.install.management_interface.bond_options.mode=balance-tlb harvester.install.management_interface.bond_options.miimon=100
```

:::note
When leveraging streaming of disk, it is recommended to host the raw disk artifact closer to the targets. The raw disk artifact is nearly 16G in size.
:::