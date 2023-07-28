---
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
   ![iso-install.png](/img/v1.1/install/iso-install.png)
1. Choose the installation mode by either creating a new Harvester cluster, or by joining an existing one.
      - Note: By default, the first node will be the management node of the cluster. When there are 3 nodes, the other 2 nodes added first are automatically promoted to management nodes to form an HA cluster.
      
      If you want to promote management nodes from different zones, you can add the node label `topology.kubernetes.io/zone` in the [os.labels](./harvester-configuration.md#oslabels) config by providing a URL of [Harvester configuration](./harvester-configuration.md) on the customize the host step. In this case, at least three different zones are required.
1. Choose the installation device on which the Harvester cluster will be installed
      - Note: By default, Harvester uses [GPT](https://en.wikipedia.org/wiki/GUID_Partition_Table) partitioning schema for both UEFI and BIOS. If you use the BIOS boot, then you will have the option to select [MBR](https://en.wikipedia.org/wiki/Master_boot_record).
   ![iso-install-disk.png](/img/v1.1/install/iso-install-disk.png)
1. We recommend choosing a separate disk to store VM data.
   ![iso-install-disk.png](/img/v1.1/install/iso-select-data-disk.png )
1. Configure the hostname and select the network interface for the management network. By default, Harvester will create a bonded NIC named `mgmt-bo`, and the IP address can be configured via DHCP or a statically assigned one <small>(Note: The Node IP can not change at the lifecycle of a Harvester cluster. If DHCP is used, users must make sure the DHCP server always offers the same IP for the same Node. If Node IP is changed, the related Node cannot join the cluster and might even break the cluster)</small>.

   ![iso-installed.png](/img/v1.1/install/iso-nic-config.png)
1. (Optional) Configure the DNS servers. Use commas as a delimiter.
1. Configure the `Virtual IP` which you can use to access the cluster or join other nodes to the cluster <small>(Note: If your IP address is configured via DHCP, you will need to configure static MAC-to-IP address mapping on your DHCP server in order to have a persistent Virtual IP, VIP must be different than any Node IP)</small>.
1. Configure the `cluster token`. This token will be used for adding other nodes to the cluster.
1. Configure the login password of the host. The default SSH user is `rancher`.
1. Recommended configuring the NTP server to make sure all nodes' times are synchronized. This defaults to `0.suse.pool.ntp.org`.
1. (Optional) If you need to use an HTTP proxy to access the outside world, enter the proxy URL address here. Otherwise, leave this blank.
1. (Optional) You can choose to import SSH keys from a remote server URL. Your GitHub public keys can be used with `https://github.com/<username>.keys`.
1. (Optional) If you need to customize the host with a [Harvester configuration](./harvester-configuration.md) file, enter the HTTP URL here.
1. After confirming the installation options, Harvester will be installed to your host. The installation may take a few minutes to be complete.
1. Once the installation is complete, it will restart the host. After the restart, the Harvester console containing the management URL and status will be displayed. You can use `F12` to switch from the Harvester console to the Shell and type `exit` to go back to the Harvester console.
1. The default URL of the web interface is `https://your-virtual-ip`.
   ![iso-installed.png](/img/v1.1/install/iso-installed.png)
1. You will be prompted to set the password for the default `admin` user when logging in for the first time.
   ![first-login.png](/img/v1.1/install/first-time-login.png)


<!-- :::note
In some cases, if you are using an older VGA connector, you may encounter an `panic: invalid dimensions` error with ISO installation. See issue [#2937](https://github.com/harvester/harvester/issues/2937#issuecomment-1278545927) for a workaround.
::: -->

## Known Issue

### Installer may crash when using an older graphics card/monitor

In some cases, if you are using an older graphics card/monitor, you may encounter a `panic: invalid dimensions` error during ISO installation.

![invalid-dimensions.png](/img/v1.1/install/invalid-dimensions.png)

This is a known issue we are working on, and will be fixed in future releases. Here is a workaround for this issue:
1. Boot up with the ISO, and press `E` to edit the first menu entry:
   ![grub-menu.png](/img/v1.1/install/grub-menu.png)
2. Append `vga=792` to the line started with `$linux`:
   ![edit-menu-entry.png](/img/v1.1/install/edit-menu-entry.png)
3. Press `Ctrl+X` or `F10` to boot up.