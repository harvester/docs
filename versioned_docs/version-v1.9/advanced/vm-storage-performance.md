---
id: vm-storage-performance
sidebar_position: 16
sidebar_label: VM Storage Performance Options
title: "VM Storage Performance Options"
description: Tune how virtual machine disks submit and cache I/O with KubeVirt cache mode, I/O mode, dedicated I/O threads, I/O threads policy and virtio block multi-queue.
keywords:
  - Harvester
  - harvester
  - Virtual Machine
  - virtual machine
  - Storage Performance
  - I/O Threads
  - Multi-Queue
---

<head>
  <link rel="canonical" href="https://docs.harvesterhci.io/v1.9/advanced/vm-storage-performance"/>
</head>

Starting with Harvester v1.9.1, you can tune how virtual machine disks handle I/O directly from the Harvester UI. The options map to KubeVirt [disk and I/O thread settings](https://kubevirt.io/user-guide/storage/disks_and_volumes/) that previously could only be set by editing the virtual machine YAML.

The options are divided into two groups:

- [Per-volume options](#configure-per-volume-options): The cache mode, the I/O mode, and a dedicated I/O thread, which are set on each disk.
- [VM-wide options](#configure-vm-wide-options): Virtio block multi-queue and the I/O threads policy, which apply to every disk of the virtual machine.

All options are optional. If you do not set an option, KubeVirt and the hypervisor apply their defaults, and the virtual machine specification remains unchanged.

## Prerequisites

- Harvester v1.9.1 or later.
- For **Cache Mode** `none` and **I/O Mode** `native` (including the **High Performance** profile): Storage that supports direct I/O. Use volumes with the **Block** volume mode.
- For **Dedicated I/O Thread** and **Virtio Block Multi-Queue**: Disks that use the virtio bus.
- For the **Supplemental Pool** I/O threads policy: Enough free CPUs on the node for the additional CPUs that are added to the pod of the virtual machine.

## Limitations

- The options are applied when the virtual machine starts. If you change them on a running virtual machine, the changes take effect only after the virtual machine is restarted.
- **I/O Mode** `native` requires **Cache Mode** `none`. For more information, see [I/O Mode](#io-mode).
- Dedicated I/O threads are not supported on the SCSI bus.
- On **Filesystem** volumes, the storage might not support direct I/O. In this case, a virtual machine with **Cache Mode** `none` fails to start.
- You cannot verify **Virtio Block Multi-Queue** from inside the guest. For more information, see [Virtio Block Multi-Queue](#virtio-block-multi-queue).

## Configure Per-Volume Options

<Tabs>
<TabItem value="ui" label="UI" default>

1. Go to **Virtual Machines**, and then perform one of the following actions:

    - To create a virtual machine, click **Create**.
    - To edit an existing virtual machine, select **⋮ > Edit Config**.

1. On the **Volumes** tab, locate the target disk, and then click **Show high-performance options**.

    The **Storage Performance Options** section is available on image, new, existing, and container volumes.

1. Select a **Performance Profile**.

    | Profile | Effect |
    |---|---|
    | **Default (Balanced)** | No options are set. KubeVirt and the hypervisor select the cache mode and the I/O mode, as described in the following sections. |
    | **High Performance** | A preset for disks with heavy I/O that sets the virtio bus, **Cache Mode** `none`, **I/O Mode** `native`, and a **Dedicated I/O Thread**. Use this profile on **Block** volumes. |
    | **Custom** | You set **Cache Mode**, **I/O Mode**, and **Dedicated I/O Thread** individually. |

1. (Optional) If you selected **Custom**, configure the [Cache Mode](#cache-mode), [I/O Mode](#io-mode), and [Dedicated I/O Thread](#dedicated-io-thread) settings.

1. Click **Create** or **Save**.

    If the virtual machine is running, the **Restart Virtual Machine** dialog appears. Click **Save and Restart** to apply the changes immediately. If you do not restart the virtual machine, the changes are applied on the next restart.

:::info

You can also set the options when you create a volume. Go to **Volumes**, click **Create**, and then configure the **Storage Performance Options** section. The options are saved as defaults on the volume and are applied when the volume is attached to a virtual machine as a disk.

:::

</TabItem>
<TabItem value="api" label="API">

Per-volume options are fields of each disk in the `VirtualMachine` object.

```yaml
spec:
  template:
    spec:
      domain:
        devices:
          disks:
            - name: disk-0
              bootOrder: 1
              disk:
                bus: virtio
              cache: none                   # none, writeback or writethrough
              io: native                    # native or threads
              dedicatedIOThread: true
```

For details on each field, see [Disks and Volumes](https://kubevirt.io/user-guide/storage/disks_and_volumes/) in the KubeVirt user guide.

</TabItem>
</Tabs>

### Cache Mode

The cache mode determines whether the host page cache is used between the guest and the storage. The following table describes each cache mode:

| Cache mode | Description | Trade-offs | Recommended use |
|---|---|---|---|
| Default (not set) | KubeVirt uses `none` if the storage supports direct I/O, and `writethrough` otherwise. | | Most virtual machines. |
| **None (no host cache)** | Guest I/O bypasses the host page cache, and reads and writes go directly to the storage (direct I/O). The cache and flush requests of the guest still apply. | The storage **must support direct I/O.** Otherwise, the virtual machine fails to start. This can occur on **Filesystem** volumes, for which the UI displays a warning. | Disks with large I/O requirements on **Block** volumes. KubeVirt describes this mode as generally the best choice. This mode is required for **I/O Mode** `native`. |
| **WriteBack** | Guest I/O is cached on the host. A write completes as soon as the data reaches the host page cache, and the data is written to the storage when the guest operating system issues a flush. | The host page cache consumes host memory. This mode is safe only if the guest operating system flushes its disk caches correctly. Otherwise, a host crash or power loss can corrupt data in the guest. | Guests whose operating system reliably flushes its disk caches, on storage that does not support direct I/O, when writes must complete without waiting for the storage. |
| **WriteThrough** | Guest reads are cached on the host. A write completes only after the data is written to the storage. | Write performance is significantly lower than with the other modes because each write waits for the storage. | Guests that do not flush their disk caches correctly, when write durability is more important than write performance. |

### I/O Mode

The I/O mode determines how QEMU submits disk I/O to the host. The following table describes each I/O mode:

| I/O mode | Description | Trade-offs | Recommended use |
|---|---|---|---|
| Default (not set) | The hypervisor selects the mode. On block volumes with cache mode `none`, KubeVirt selects `native`. | | Most virtual machines. |
| **Native (AIO)** | QEMU submits I/O through the native asynchronous I/O interface of the Linux kernel. | This mode requires **Cache Mode** `none`. When you select this mode, the UI sets **Cache Mode** to `none` and disables the other cache modes. | Disks with **Cache Mode** `none` on **Block** volumes, as in the **High Performance** profile. |
| **Threads** | QEMU submits I/O from a pool of host worker threads. | | Disks with **Cache Mode** `writeback` or `writethrough`, which the `native` mode does not support. |

:::caution

**I/O Mode** `native` requires **Cache Mode** `none`. The UI enforces this requirement. However, if a virtual machine is created or edited through YAML or the API with `io: native` and a different cache mode, the virtual machine is accepted but fails to start. The virtual machine remains in the **Starting** state, and its `Synchronized` condition reports `unsupported configuration: io='native' needs either no disk cache or directsync cache mode`.

:::

### Dedicated I/O Thread

An I/O thread is a host thread that processes disk I/O. The **Dedicated I/O Thread** option assigns the disk an I/O thread that is never shared with other disks. Without this option, the disk shares I/O threads with other disks according to the [I/O threads policy](#io-threads-policy).

- **Recommended use**: A disk with heavy I/O whose processing must not compete with the other disks of the virtual machine. For example, a database data disk.
- **Requirements**: The disk must use the virtio bus. Dedicated I/O threads are not supported on the SCSI bus. If a disk with performance options uses a different bus, the UI displays a tip.
- **Effect on the virtual machine**: Enabling this option on any disk also enables the I/O threads policy of the virtual machine. If no policy is selected, the UI sets the policy to **Shared**.

## Configure VM-Wide Options

The VM-wide options apply to all volumes of the virtual machine and complement the per-volume options.

<Tabs>
<TabItem value="ui" label="UI" default>

1. Go to **Virtual Machines**, and then perform one of the following actions:

    - To create a virtual machine, click **Create**.
    - To edit an existing virtual machine, select **⋮ > Edit Config**.

1. On the **Volumes** tab, locate the **High Performance (I/O Threads and Multi-Queue)** section below the disks, and then click **Show VM-wide high-performance options**.

    The section is already expanded if the virtual machine uses one of these options.

1. (Optional) Select **Virtio Block Multi-Queue**.

    At least one disk must use the virtio bus.

1. (Optional) Select an [I/O Threads Policy](#io-threads-policy).

    If you select **Supplemental Pool**, specify the **I/O Thread Count**.

1. Click **Create** or **Save**.

    If the virtual machine is running, the **Restart Virtual Machine** dialog appears. Click **Save and Restart** to apply the changes immediately. If you do not restart the virtual machine, the changes are applied on the next restart.

</TabItem>
<TabItem value="api" label="API">

VM-wide options are fields of the domain in the `VirtualMachine` object.

```yaml
spec:
  template:
    spec:
      domain:
        ioThreadsPolicy: supplementalPool   # shared, auto or supplementalPool
        ioThreads:
          supplementalPoolThreadCount: 2    # only with supplementalPool
        devices:
          blockMultiQueue: true
```

For details on each field, see [Disks and Volumes](https://kubevirt.io/user-guide/storage/disks_and_volumes/) in the KubeVirt user guide.

</TabItem>
</Tabs>

### Virtio Block Multi-Queue

**Virtio Block Multi-Queue** maps the I/O of each virtio disk to multiple queues, one per vCPU, so that disk I/O can be processed on several CPUs in parallel.

- **Queue count**: The number of queues automatically matches the number of vCPUs of the virtual machine, as libvirt recommends. You do not need to configure the queue count.
- **Requirements**: At least one disk must use the virtio bus, and the virtual machine must have a specific CPU allocation. Harvester virtual machines always have a specific CPU allocation.
- **Recommended use**: Virtual machines with multiple vCPUs that run disk I/O from many threads or processes concurrently.

:::note

You cannot verify multi-queue from inside the guest by counting the queues of a disk (for example, by running `ls /sys/block/vda/mq`). By default, QEMU already assigns one queue per vCPU to virtio-blk disks, so the guest reports the same number of queues regardless of whether the option is enabled. To verify the setting, check the virtual machine YAML for `blockMultiQueue: true`, as described in [Verify the Settings](#verify-the-settings).

:::

### I/O Threads Policy

The I/O threads policy determines the number of I/O threads of the virtual machine and how disks are assigned to them. The following table describes each policy:

| Policy | Description | Recommended use |
|---|---|---|
| **Disabled (default)** | No I/O threads are used. | Most virtual machines. |
| **Shared** | All disks share one I/O thread. Disks with **Dedicated I/O Thread** enabled receive their own thread in addition. | Virtual machines with a small number of disks, or with one or two disks that require a dedicated thread. The UI selects this policy when a disk requests a dedicated thread and no policy is set. |
| **Auto** | KubeVirt creates a pool of I/O threads and distributes the disks across the pool. The pool is limited to twice the number of vCPUs. | Virtual machines with many disks, so that the disks do not all share one thread. |
| **Supplemental Pool** | Creates the number of I/O threads specified in **I/O Thread Count** (default: `2`) and adds the same number of CPUs to the pod of the virtual machine. With [dedicated CPU placement](../vm/cpu-pinning.md), each I/O thread is pinned to one of the added CPUs, so that I/O threads and vCPUs run on separate physical CPUs. | Workloads that require explicit control over the number of I/O threads. For example, virtual machines that use CPU pinning. Account for the added CPUs when sizing nodes. |

## Verify the Settings

<Tabs>
<TabItem value="ui" label="UI" default>

1. Go to **Virtual Machines**.

    If the saved options differ from the options of the running virtual machine, the UI displays a **Pending Restart** notification that lists the virtual machine, and the state of the virtual machine indicates that a restart is required for the configuration change to take effect.

1. Locate the target virtual machine, and then select **⋮ > Edit Config**.

1. On the **Volumes** tab, expand the **Storage Performance Options** section of each disk and the **High Performance (I/O Threads and Multi-Queue)** section to view the saved options.

</TabItem>
<TabItem value="cli" label="CLI">

Inspect the disks and domain settings of the virtual machine. The `VirtualMachine` object shows the saved settings, and the `VirtualMachineInstance` object shows the settings of the running virtual machine. If the two differ, the virtual machine has not been restarted since the change, and the `VirtualMachine` object has the `RestartRequired` condition.

```sh
# Saved settings
kubectl get vm <vm-name> -n <namespace> -o yaml | grep -E 'cache:|io:|dedicatedIOThread|blockMultiQueue|ioThreadsPolicy|supplementalPoolThreadCount'

# Settings of the running virtual machine
kubectl get vmi <vm-name> -n <namespace> -o yaml | grep -E 'cache:|io:|dedicatedIOThread|blockMultiQueue|ioThreadsPolicy|supplementalPoolThreadCount'
```

</TabItem>
</Tabs>

### Measure the Effect

To measure the effect, run the same benchmark in the guest before and after you change the options. For example, the following [fio](https://fio.readthedocs.io/) command runs a random read/write test against a 1 GiB test file in a Linux guest. Use a test file rather than a raw device to avoid overwriting data, and delete the file afterwards.

```sh
fio --name=randrw --filename=/var/tmp/fio-test --size=1G \
    --rw=randrw --bs=4k --ioengine=libaio --direct=1 \
    --iodepth=32 --numjobs=4 --runtime=60 --time_based --group_reporting
rm /var/tmp/fio-test
```

Compare the IOPS and latency in the output. The results depend on the storage, the workload, and the number of vCPUs, so test with an I/O pattern that resembles your workload.
