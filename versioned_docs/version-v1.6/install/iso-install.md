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
description: To get the Harvester ISO, download it from the Github releases. During the installation you can either choose to form a new cluster, or join the node to an existing cluster.
---

<head>
  <link rel="canonical" href="https://docs.harvesterhci.io/v1.6/install/index"/>
</head>

Harvester ships as a bootable appliance image, you can install it directly on a bare metal server with the ISO image. To get the ISO image, download **💿 harvester-v1.x.x-amd64.iso** from the [Harvester releases](https://github.com/harvester/harvester/releases) page.

During the installation, you can either choose to **create a new Harvester cluster** or **join the node to an existing Harvester cluster**.

The following [video](https://youtu.be/X0VIGZ_lExQ) shows a quick overview of an ISO installation.

<div class="text-center">
<iframe width="800" height="400" src="https://www.youtube.com/embed/X0VIGZ_lExQ" title="YouTube video player" frameborder="0" allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture" allowfullscreen></iframe>
</div>

## Installation Steps

1. Mount the Harvester ISO file and boot the server by selecting the `Harvester Installer` option.

   ![iso-install.png](/img/v1.2/install/iso-install.png)

   The installer automatically checks the hardware and displays warning messages if the minimum requirements are not met. The **Hardware Checks** screen is not displayed if all checks are passed.

   ![hardware-checks.png](/img/v1.3/install/hardware-checks.png)

1. Use the arrow keys to choose an installation mode. By default, the first node will be the management node of the cluster.

	![choose-installation-mode.png](/img/v1.2/install/choose-installation-mode.png)

	- `Create a new Harvester cluster`: creates an entirely new Harvester cluster.

	- `Join an existing Harvester cluster`: joins an existing Harvester cluster. You need the VIP and cluster token of the cluster you want to join.

	- `Install Harvester binaries only`: If you choose this option, additional setup is required after the first bootup.

	:::info
	When there are 3 nodes, the other 2 nodes added first are automatically promoted to management nodes to form an HA cluster. If you want to promote management nodes from different zones, you can add the node label `topology.kubernetes.io/zone` in the [os.labels](./harvester-configuration.md#oslabels) config by providing a URL of [Harvester configuration](./harvester-configuration.md) on the customize the host step. In this case, at least three different zones are required.
	:::

1. Choose a role for the node. You are required to perform this step if you selected the installation mode `Join an existing Harvester cluster`.

	![choose-node-role.png](/img/v1.3/install/select-role.png)

	- `Default Role`: Allows a node to function as a management node or a worker node. This role does not have any specific privileges or restrictions.
	- `Management Role`: Allows a node to be prioritized when Harvester promotes nodes to management nodes.
	- `Witness Role`: Restricts a node to being a witness node (only functions as an etcd node) in a specific cluster.
	- `Worker Role`: Restricts a node to being a worker node (never promoted to management node) in a specific cluster.

1. Choose the installation disk you want to install the Harvester cluster on and the data disk you want to store VM data on. By default, Harvester uses [GUID Partition Table (GPT)](https://en.wikipedia.org/wiki/GUID_Partition_Table) partitioning schema for both UEFI and BIOS. If you use the BIOS boot, then you will have the option to select [Master boot record (MBR)](https://en.wikipedia.org/wiki/Master_boot_record).

	![choose-installation-target-data-disk.png](/img/v1.2/install/choose-installation-target-data-disk.png)

	- `Installation disk`: The disk to install the Harvester cluster on.
	- `Data disk`: The disk to store VM data on. Choosing a separate disk to store VM data is recommended. Not applicable for witness nodes.
	- `Persistent size`: If you only have one disk or use the same disk for both OS and VM data, you need to configure persistent partition size to store system packages and container images. The default and minimum persistent partition size is 150 GiB. You can specify a size like 200Gi or 153600Mi.

1. Configure the `HostName` of the node.

   ![config-hostname.png](/img/v1.2/install/config-hostname.png)

1. Configure network interface(s) for the management network. By default, Harvester creates a [bonded NIC](./requirements.md#hardware-requirements) named `mgmt-bo` for the [built-in management cluster network](../networking/clusternetwork.md#built-in-cluster-network), and the IP address can be configured via DHCP or statically assigned.

   ![config-network.png](/img/v1.2/install/config-network.png)

	:::note
	It is not possible to change the node IP throughout the lifecycle of a Harvester cluster. If using DHCP, you must ensure the DHCP server always offers the same IP for the same node. If the node IP is changed, the related node cannot join the cluster and might even break the cluster.

	In addition, you are required to add the *routers* option (`option routers`) when configuring the DHCP server. This option is used to add the default route on the Harvester host. Without the default route, the node will fail to start.
	For example:
	```
	Linux~ # ip route
	default via 192.168.122.1 dev mgmt-br proto dhcp
	```
	For more information, see [DHCP Server Configuration](./pxe-boot-install.md#dhcp-server-configuration).

	The default MTU value of the bonded NIC is `1500`. If you require a different MTU value, configure the [`install.management_interface`](./harvester-configuration.md#installmanagement_interface) setting in a Harvester configuration file per following step.
	:::

1. (Optional) Configure the CIDRs for the cluster pods and services.

    If you want to use the default values, leave the fields blank.

    ![config-cluster-cidrs.png](/img/v1.5/install/config-cluster-cidrs.png)

    :::info important

    The CIDR values must not overlap and must be within the private IP address range of 10.0.0.0/8, 172.16.0.0/12, or 192.168.0.0/16.

    The DNS service IP must be within the range defined by the **Service CIDR** field.

    :::

    Example of a valid CIDR configuration:

    - **Pod CIDR**: 172.16.0.0/16
    - **Service CIDR**: 172.22.0.0/16
    - **Cluster DNS IP**: 172.22.0.10

1. (Optional) Configure the `DNS Servers`. Use commas as a delimiter to add more DNS servers. Leave it blank to use the default DNS server.

	![config-dns-server.png](/img/v1.2/install/config-dns-server.png)

1. Configure the virtual IP (VIP) by selecting a `VIP Mode`. This VIP is used to access the cluster or for other nodes to join the cluster.

	:::note
	For DHCP setup with static MAC-to-IP address mappings configured, enter the MAC address in the provided field to fetch the unique persistent virtual IP (VIP). Otherwise, leave it blank.
	:::

	![config-virtual-ip.png](/img/v1.5/install/config-virtual-ip.png)

1. Configure the `Cluster token`. This token is used for adding other nodes to the cluster.

	![config-cluster-token.png](/img/v1.2/install/config-cluster-token.png)

1. Configure and confirm a `Password` to access the node. The default SSH user is `rancher`.

	![config-password.png](/img/v1.2/install/config-password.png)

1. Configure `NTP servers` to make sure all nodes' times are synchronized. This defaults to `0.suse.pool.ntp.org`. Use commas as a delimiter to add more NTP servers.

	![config-ntp-server.png](/img/v1.2/install/config-ntp-server.png)

	:::note
	Using multiple NTP servers provides redundancy, better accuracy, fault tolerance, and improved performance. It ensures that time synchronization continues even if one server fails or gives incorrect data, and it helps distribute the load across different servers.
	:::

1. (Optional) If you need to use an HTTP proxy to access the outside world, enter the `Proxy address`. Otherwise, leave this blank.

	![config-proxy.png](/img/v1.2/install/config-proxy.png)

1. (Optional) You can choose to import SSH keys by providing `HTTP URL`. For example, your GitHub public keys `https://github.com/<username>.keys` can be used.

	![import-ssh-keys.png](/img/v1.2/install/import-ssh-keys.png)

1. (Optional) If you need to customize the host with a [Harvester configuration](./harvester-configuration.md) file, enter the `HTTP URL` here.

	![remote-config.png](/img/v1.2/install/remote-config.png)

1. Review and confirm your installation options. After confirming the installation options, Harvester will be installed to your host. The installation may take a few minutes to be complete.

	![confirm-install.png](/img/v1.2/install/confirm-install.png)

1. Once the installation is complete, your node restarts. After the restart, the Harvester console displays the management URL and status. The default URL of the web interface is `https://your-virtual-ip`. You can use `F12` to switch from the Harvester console to the Shell and type `exit` to go back to the Harvester console.

	:::note
	Choosing `Install Harvester binaries only` on the first page requires additional setup after the first bootup.
	:::

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

1. Append `vga=792` to the line started with `$linux`:

   ![edit-menu-entry.png](/img/v1.2/install/edit-menu-entry.png)

1. Press `Ctrl+X` or `F10` to boot up.
