---
id: index
sidebar_position: 2
sidebar_label: ISO Installation
title: "ISO Installation"
keywords:
  - Harvester
  - harvester
  - Rancher
  - rancher
  - ISO Installation
Description: To get the Harvester ISO, download it from the Github releases. During the installation you can either choose to form a new cluster, or join the node to an existing cluster.
---

<head>
  <link rel="canonical" href="https://docs.harvesterhci.io/v1.1/install/iso-install"/>
</head>

## Installation Steps
To get the Harvester ISO image, download it from the [Github releases](https://github.com/harvester/harvester/releases) page.

During the installation you can either choose to form a new cluster, or join the node to an existing cluster.

Note: This [video](https://youtu.be/X0VIGZ_lExQ) shows a quick overview of the ISO installation.

<div class="text-center">
<iframe width="950" height="475" src="https://www.youtube.com/embed/X0VIGZ_lExQ" title="YouTube video player" frameborder="0" allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture" allowfullscreen></iframe>
</div>

1. Mount the Harvester ISO disk and boot the server by selecting the `Harvester Installer` option.
   ![iso-install.png](/img/v1.2/install/iso-install.png)

1. Choose an installation mode: 
   - Create a new Harvester cluster.
      - Note: By default, the first node will be the management node of the cluster. When there are 3 nodes, the other 2 nodes added first are automatically promoted to management nodes to form an HA cluster.

      If you want to promote management nodes from different zones, you can add the node label `topology.kubernetes.io/zone` in the [os.labels](./harvester-configuration.md#oslabels) config by providing a URL of [Harvester configuration](./harvester-configuration.md) on the customize the host step. In this case, at least three different zones are required.

   - Join an existing Harvester cluster.

   - Install Harvester binaries only.
      - Note: If you choose `Install Harvester binaries only`, additional setup is required after the first bootup.      

1. Choose the installation device you want to install the Harvester cluster on.
   ![select-disk.png](/img/v1.2/install/select-disk.png)
      - Note: By default, Harvester uses [GPT](https://en.wikipedia.org/wiki/GUID_Partition_Table) partitioning schema for both UEFI and BIOS. If you use the BIOS boot, then you will have the option to select [MBR](https://en.wikipedia.org/wiki/Master_boot_record).

      If you only have one disk or use the same disk for both OS and VM data, you need to configure persistent partition size to store system packages and container images. The default and minimum value is 150 GiB.
   
   :::info

   Choosing a separate disk to store VM data is recommended.

   :::

1. Configure the hostname of this node.
   ![config-hostname.png](/img/v1.2/install/config-hostname.png)

1. Configure network interface(s) for the management network. By default, Harvester will create a bonded NIC named `mgmt-bo`, and the IP address can be configured via DHCP or statically assigned.
   ![config-network.png](/img/v1.2/install/config-network.png)
      - Note: It is not possible to change the node IP throughout the lifecycle of a Harvester cluster. If using DHCP, you must ensure the DHCP server always offers the same IP for the same node. If the node IP is changed, the related node cannot join the cluster and might even break the cluster.

1. (Optional) Configure the DNS servers. Use commas as a delimiter.

1. Configure the `Virtual IP`, which can be used to access the cluster or for other nodes to join the cluster.
   - Note: If using DHCP to configure the IP address, you need to configure a static MAC-to-IP address mapping on your DHCP server to have a persistent virtual IP (VIP), and the VIP must be unique.

1. Configure the `cluster token`. This token will be used for adding other nodes to the cluster.

1. Configure the login password of the host. The default SSH user is `rancher`.

1. Recommended configuring the NTP server to make sure all nodes' times are synchronized. This defaults to `0.suse.pool.ntp.org`.

1. (Optional) If you need to use an HTTP proxy to access the outside world, enter the proxy URL address here. Otherwise, leave this blank.

1. (Optional) You can choose to import SSH keys from a remote server URL. Your GitHub public keys can be used with `https://github.com/<username>.keys`.

1. (Optional) If you need to customize the host with a [Harvester configuration](./harvester-configuration.md) file, enter the HTTP URL here.

1. After confirming the installation options, Harvester will be installed to your host. The installation may take a few minutes to be complete.

1. Once the installation is complete, your node restarts. After the restart, the Harvester console displays the management URL and status. You can use `F12` to switch from the Harvester console to the Shell and type `exit` to go back to the Harvester console.
   - Note: Choosing `Install Harvester binaries only` on the first page requires additional setup after the first bootup.

1. The default URL of the web interface is `https://your-virtual-ip`.
   ![iso-installed.png](/img/v1.2/install/iso-installed.png)

1. You will be prompted to set the password for the default `admin` user when logging in for the first time.
   ![first-login.png](/img/v1.2/install/first-time-login.png)


<!-- :::note
In some cases, if you are using an older VGA connector, you may encounter an `panic: invalid dimensions` error with ISO installation. See issue [#2937](https://github.com/harvester/harvester/issues/2937#issuecomment-1278545927) for a workaround.
::: -->

## Known Issue

### Installer may crash when using an older graphics card/monitor

In some cases, if you are using an older graphics card/monitor, you may encounter a `panic: invalid dimensions` error during ISO installation.

![invalid-dimensions.png](/img/v1.2/install/invalid-dimensions.png)

We are working on this known issue and planning a fix for a future release. You can try to use another GRUB entry to force it to use the resolution of `1024x768` when booting up.

![force-resolution.png](/img/v1.2/install/force-resolution.png)

If you are using a version earlier than v1.1.1, please try the following workaround:

1. Boot up with the ISO, and press `E` to edit the first menu entry:
   ![grub-menu.png](/img/v1.2/install/grub-menu.png)

2. Append `vga=792` to the line started with `$linux`:
   ![edit-menu-entry.png](/img/v1.2/install/edit-menu-entry.png)

3. Press `Ctrl+X` or `F10` to boot up.