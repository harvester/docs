---
sidebar_position: 7
sidebar_label: Hot-Plug Volumes
title: "Hot-Plug Volumes"
keywords:
  - Harvester
  - Hot-plug
  - Volume
Description: Adding hot-plug volumes to a running VM.
---

<head>
  <link rel="canonical" href="https://docs.harvesterhci.io/v1.1/vm/hotplug-volume"/>
</head>

Harvester supports adding hot-plug volumes to a running VM.

:::info

Currently, KubeVirt only supports disk bus `scsi` for hot-plug volumes. For more information, see this [issue](https://github.com/kubevirt/kubevirt/issues/5080#issuecomment-785183128).

:::

## Adding Hot-Plug Volumes to a Running VM

The following steps assume that you have a running VM and a ready volume:

1. Go to the **Virtual Machines** page.
1. Find the VM that you want to add a volume to and select **⋮ > Add Volume**.

    ![Add Volume Button](/img/v1.2/vm/add-volume-button.png)

1. Enter the **Name** and select the **Volume**.
1. Click **Apply**.

    ![Add Volume Panel](/img/v1.2/vm/add-volume-panel.png)
