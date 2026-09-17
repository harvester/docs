---
id: baremetal-workload
sidebar_position: 12
sidebar_label: Baremetal Workload
title: "Baremetal Workload Support"
Description: Leverage Harvester for baremetal workloads
---

<head>
  <link rel="canonical" href="https://docs.harvesterhci.io/v1.9/rancher/baremetal-workload"/>
</head>

_Available as of v1.9.0_

:::caution

Do not use the embedded Rancher instance to deploy and manage production bare-metal workloads. This embedded instance is strictly for cluster debugging and validation. You must use an external Rancher instance to manage container workloads running on a Harvester cluster.

:::

## Rancher `harvester-baremetal-container-workload` Feature Flag

_GA as of Rancher v2.15.x_

Enabling the Rancher feature flag `harvester-baremetal-container-workload` exposes managed Harvester clusters as traditional downstream Kubernetes clusters within the Rancher UI.

![](/img/baremetal-workload-feature.png)

Once enabled, you can access and manage these Harvester clusters from the following Rancher UI locations:

- **Virtualization Management > Harvester Clusters**
  ![](/img/gpu-workload.png)

- **Cluster Management > Clusters**
  ![](/img/cluster-workloads.png)

:::caution

Harvester manages the lifecycle of the following embedded add-ons:

- Rancher Monitoring
- Rancher Logging

These components are upgraded automatically as part of Harvester cluster upgrades. Modifying or upgrading these add-ons manually out of band can result in cluster instability and other undesirable side effects.

:::

## Bare-Metal GPU Workloads

:::note

This configuration applies only when running a combination of virtual machines using vGPUs alongside containers leveraging physical GPUs on the same Harvester cluster.

Harvester leverages the [NVIDIA GPU Operator](https://docs.rke2.io/add-ons/gpu_operators) for bare-metal GPU workloads.

:::

If your cluster includes multiple GPU-equipped nodes, you can dedicate specific nodes exclusively to bare-metal container workloads by applying the node label `harvesterhci.io/gpu-baremetal-workloads: "true"`.

Applying this label disables Harvester's internal `SRIOVGPUDevice` management on the designated nodes and prevents `nvidia-driver-toolkit` pods from deploying to them, allowing the NVIDIA GPU Operator to take full control of the host GPU devices.

### Sample Cluster Configuration

The following example uses a two-node Harvester cluster with three physical GPUs:

- Node `hp-195` contains 2 GPUs.
- Node `hp-1992` contains 1 GPU.

```shell
(⎈|local:default)➜  ~ kubectl get nodes -o wide
k NAME      STATUS   ROLES                AGE   VERSION          INTERNAL-IP     EXTERNAL-IP   OS-IMAGE           KERNEL-VERSION                     CONTAINER-RUNTIME
hp-195    Ready    control-plane,etcd   82d   v1.36.3+rke2r1   10.115.50.225   <none>        Harvester v1.9.0   6.12.0-160000.37-default (amd64)   containerd://2.3.3-k3s1
hp-1992   Ready    <none>               82d   v1.36.3+rke2r1   10.115.53.172   <none>        Harvester v1.9.0   6.12.0-160000.37-default (amd64)   containerd://2.3.3-k3s1
(⎈|local:default)➜  ~ kubectl get sriovgpudevices
NAME                ADDRESS        NODE NAME   ENABLED   VGPUDEVICES
hp-195-000026000    0000:26:00.0   hp-195      false
hp-195-000089000    0000:89:00.0   hp-195      false
hp-1992-000026000   0000:26:00.0   hp-1992     false
```

1. Apply the label `harvesterhci.io/gpu-baremetal-workloads: "true"` to the bare-metal GPU node `hp-1992`.

    

1. Apply the operand exclusion label to node `hp-195` to prevent the GPU Operator from deploying container drivers to nodes reserved for virtual machine-based vGPU workloads.

    

1. Deploy the NVIDIA GPU Operator to the cluster using a HelmChart resource.

    

1. After a few minutes, verify that all GPU Operator components are deployed and running on `hp-1992`.

    

1. Test GPU workload execution by deploying a sample CUDA benchmark pod.

    


You can also configure GPU requests and limits for container workloads directly using the Rancher UI.

![](/img/gpu-pod.png)