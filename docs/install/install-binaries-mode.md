---
sidebar_position: 8
sidebar_label: Install Harvester Binaries Only
title: "Install Harvester Binaries Only"
keywords:
  - Harvester
  - harvester
  - Rancher
  - rancher
  - ISO Installation
Description: To get the Harvester ISO, download it from the GitHub releases. During the installation, you can choose to install the binaries only.
---

<head>
  <link rel="canonical" href="https://docs.harvesterhci.io/v1.2/install/install-binaries-mode"/>
</head>

_Available as of v1.2.0_

The `Install Harvester binaries only` mode allows you to install and configure binaries only, making it ideal for cloud and edge use cases.

![choose-installation-mode.png](/img/v1.2/install/choose-installation-mode.png)

### Background
Currently when a new Harvester node is launched it needs to be the first node in the cluster or join an existing cluster.
These two modes are useful when you already know enough about the environment to install the Harvester node.
However, for use cases such as bare-metal cloud providers and the edge, these installation modes load the OS and Harvester content to the node without letting you configure the network. Moreover, the K8s and networking configuration will not be applied.

If you choose `Install Harvester binaries only`, you will need to perform additional configuration after the first bootup:

- Create/Join option for Harvester
- Management network interface details
- Cluster token
- Node password

Then, the installer will apply the endpoint configuration and boot Harvester. No further reboots will be required.

### Stream disk mode
Harvester has published a raw image artifact for pre-installed Harvester. The Harvester installer now allows streaming a pre-installed image directly to disk to support better integration with cloud providers.

On `Equinix Metal`, you can use the following kernel arguments to use the streaming mode:

```
ip=dhcp net.ifnames=1 rd.cos.disable rd.noverifyssl root=live:http://${artifactEndpoint}/harvester-v1.2.0-rootfs-amd64.squashfs harvester.install.automatic=true harvester.scheme_version=1 harvester.install.device=/dev/vda  harvester.os.password=password harvester.install.raw_disk_image_path=http://${artifactEndpoint}/harvester-v1.2.0-amd64.raw harvester.install.mode=install console=tty1 harvester.install.tty=tty1 harvester.install.config_url=https://metadata.platformequinix.com/userdata harvester.install.management_interface.interfaces="name:enp1s0" harvester.install.management_interface.method=dhcp harvester.install.management_interface.bond_options.mode=balance-tlb harvester.install.management_interface.bond_options.miimon=100
```

:::note
When streaming to disk, it is recommended to host the raw disk artifact closer to the targets, as the raw disk artifact is nearly 16G in size.
:::