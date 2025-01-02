---
sidebar_position: 11
sidebar_label: Guest Clusters
title: "Guest Clusters"
keywords:
  - Harvester
  - guest cluster
  - guest operating systems
  - guest OS
description: Information concerning guest clusters that run in Harvester virtual machines
---

<head>
  <link rel="canonical" href="https://docs.harvesterhci.io/v1.4/install/guest-os"/>
</head>

A guest cluster is a group of integrated Kubernetes worker machines that run in virtual machines on top of a Harvester cluster. Guest clusters form the main infrastructure for running container workloads.

You can create RKE1, RKE2, and K3s guest clusters using the Harvester and Rancher interfaces. Creating guest clusters involves pulling images from either the internet or a private registry.

## Supported Guest Operating Systems

The following operating systems have been validated to run in Harvester virtual machines:

| Operating System | Harvester v1.3.0 | Harvester v1.3.1 | Harvester v1.3.2 | Harvester v1.4.0 |
| --- | --- | --- | --- | --- |
| OpenSUSE Leap | 15.4 | 15.4 | 15.5 | 15.6 |
| SLE Micro | N/A | N/A | 6 | 6 |
| SLES | 15 SP4, 15 SP5 | 15 SP4, 15 SP5 | 15 SP4, 15 SP6 | 15 SP4, 15 SP6 |
| RHEL | N/A | N/A | 9.4 | 9.4 |
| Ubuntu | 22.04, 23.04 | 22.04, 23.04 | 24.04 | 24.04 |
| Windows |	11 | 11 | 11 | 11 |
| Windows Server | 2022 | 2022 | 2022 | 2022 |

:::note

The list includes only operating systems that were tested by SUSE and is not intended to be exhaustive. Other operating systems may also run in Harvester virtual machines. However, SUSE cannot be held responsible for any damage or loss of data that may occur through the use of untested operating systems.

The contents of this document may not reflect the most current situation and may change at any time without notice.

:::