---
sidebar_position: 1
sidebar_label: Harvester Overview
slug: /
title: "Harvester Overview"
keywords:
  - Harvester
  - harvester
  - Rancher
  - rancher
  - Harvester Intro
Description: Harvester is an open source hyper-converged infrastructure (HCI) software built on Kubernetes. It is an open source alternative to vSphere and Nutanix.
---
[Harvester](https://harvesterhci.io/) is a modern, open, interoperable, [hyperconverged infrastructure (HCI)](https://en.wikipedia.org/wiki/Hyper-converged_infrastructure) solution built on Kubernetes. It is an open-source alternative designed for operators seeking a [cloud-native](https://about.gitlab.com/topics/cloud-native/) HCI solution. Harvester runs on bare metal servers and provides integrated virtualization and distributed storage capabilities. In addition to traditional virtual machines (VMs), Harvester supports containerized environments automatically through integration with [Rancher](https://ranchermanager.docs.rancher.com/integrations-in-rancher/harvester). It offers a solution that unifies legacy virtualized infrastructure while enabling the adoption of containers from core to edge locations.

## Harvester Architecture

The Harvester architecture consists of cutting-edge open-source technologies:
- **Linux OS.** [Elemental for SLE-Micro 5.3](https://github.com/rancher/elemental-toolkit) is at the core of Harvester and is an immutable Linux distribution designed to remove as much OS maintenance as possible in a Kubernetes cluster. 
- **Built on top of Kubernetes.** [Kubernetes](https://kubernetes.io/) has become the predominant infrastructure language across all form factors, and Harvester is an HCI solution with Kubernetes under the hood.
- **Virtualization management with Kubevirt.** [Kubevirt](https://kubevirt.io/) provides virtualization management using KVM on top of Kubernetes.
- **Storage management with Longhorn.** [Longhorn](https://longhorn.io/) provides distributed block storage and tiering.
- **Observability with Grafana and Prometheus.** [Grafana](https://grafana.com/) and [Prometheus](https://prometheus.io/) provide robust monitoring and logging.

![](/img/v1.2/architecture.svg)

## Harvester Features

Harvester is an enterprise-ready, easy-to-use infrastructure platform that leverages local, direct attached storage instead of complex external SANs. It utilizes Kubernetes API as a unified automation language across container and VM workloads. Some key features of Harvester include:
- **Easy to get started.** Since Harvester ships as a bootable appliance image, you can install it directly on a bare metal server with the [ISO image](https://github.com/harvester/harvester/releases) or automatically install it using [iPXE](./install/pxe-boot-install.md) scripts.
- **VM lifecycle management.** Easily create, edit, clone, and delete VMs, including SSH-Key injection, cloud-init, and graphic and serial port console.
- **VM live migration.** Move a VM to a different host or node with zero downtime.
- **VM backup, snapshot, and restore.** Back up your VMs from NFS, S3 servers, or NAS devices. Use your backup to restore a failed VM or create a new VM on a different cluster.
- **Storage management.** Harvester supports distributed block storage and tiering. Volumes represent storage; you can easily create, edit, clone, or export a volume.
- **Network management.** Supports using a virtual IP (VIP) and multiple Network Interface Cards (NICs). If your VMs need to connect to the external network, create a VLAN or untagged network.
- **Integration with Rancher.** Access Harvester directly within Rancher through Rancher’s Virtualization Management page and manage your VM workloads alongside your Kubernetes clusters.

## Harvester Dashboard

Harvester provides a powerful and easy-to-use web-based dashboard for visualizing and managing your infrastructure. Once you install Harvester, you can access the IP address for the Harvester Dashboard from the node's terminal.

<div class="text-center">
   <iframe width="99%" height="450" src="https://www.youtube.com/embed/Ngsk7m6NYf4" title="YouTube video player" frameborder="0" allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture" allowfullscreen></iframe>
</div>
