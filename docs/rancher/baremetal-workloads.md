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

:::note

Embedded Rancher should not be used for managing the baremetal workloads. 

Users are advised to use an external Rancher for managing workloads on Harvester cluster

:::

## Rancher harvester-baremetal-container-workload feature

_GA as of Rancher v2.15.x_

Users can enable the Rancher feature flag `harvester-baremetal-container-workload` to expose managed Harvester clusters as a traditional downstream cluster.

![](/img/baremetal-workload-feature.png)

View from Virtualization Management
![](/img/gpu-workload.png)

View from Cluster Management
![](/img/cluster-workloads.png)

:::caution

Harvester manages the following packages as its embedded addons:

* Rancher Monitoring
* Rancher Logging

The lifecycle of these components needs to be managed via Harvester. Their upgrades are managed as part of Harvester. Manually updating these out of band from Harvester can have undesireable side effects.

:::

## Baremetal GPU workload
:::note

Only applicable if users wish to run a combination of VM's with vGPUs and containers leveraging GPUs on Harvester cluster

For baremetal GPU workloads Harvester leverages the [NVIDIA GPU Operator](https://docs.rke2.io/add-ons/gpu_operators)
:::

Users with multiple GPU nodes can split the cluster and dedicate nodes to run baremetal GPU workloads. 

This can be done by using the label `harvesterhci.io/gpu-baremetal-workloads: "true"` on nodes reserved for baremetal GPU workloads.

Applying the label disables the nodes from Harvester's `SRIOVGPUDevice` management. In addition, the `nvidia-driver-toolkit` pods are no longer deployed to these nodes.

For example we have a 2 node cluster, with 3 GPUs. Node hp-195 contains 2 GPU's while node hp-1992 contains a single GPU.

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

We will label node `hp-1992` with the label `harvesterhci.io/gpu-baremetal-workloads: "true"`

```shell
kubectl label node hp-1992 harvesterhci.io/gpu-baremetal-workloads=true
```

Applying the label will trigger removal of associated `SRIOVGPUDevices` from the node

```shell
(⎈|local:default)➜  ~ kubectl get sriovgpudevices
NAME               ADDRESS        NODE NAME   ENABLED   VGPUDEVICES
hp-195-000026000   0000:26:00.0   hp-195      false
hp-195-000089000   0000:89:00.0   hp-195      false
(⎈|local:default)➜  ~
```

Apply the labels to nodes dedicated for VM based vGPU workloads

```shell
kubectl label node hp-195 nvidia.com/gpu.deploy.operands=false
```

Deploy the GPU Operator the cluster

```yaml
apiVersion: helm.cattle.io/v1
kind: HelmChart
metadata:
  name: gpu-operator
  namespace: kube-system
spec:
  repo: https://helm.ngc.nvidia.com/nvidia
  chart: gpu-operator
  version: v26.3.2
  targetNamespace: gpu-operator
  createNamespace: true
  valuesContent: |-
    toolkit:
      env:
      - name: CONTAINERD_SOCKET
        value: /run/k3s/containerd/containerd.sock
    driver:
      repository: registry.suse.com/third-party/nvidia
      usePrecompiled: true
      version: 595 
```

After a few minutes the GPU Operator components should be deployed and running

```
(⎈|local:default)➜  ~ kubectl get pods -n gpu-operator -o wide
NAME                                                              READY   STATUS      RESTARTS   AGE     IP           NODE      NOMINATED NODE   READINESS GATES
gpu-feature-discovery-jrkpl                                       1/1     Running     0          3m      10.52.1.41   hp-1992   <none>           <none>
gpu-operator-6d8769c57c-5vmxr                                     1/1     Running     0          3m31s   10.52.1.31   hp-1992   <none>           <none>
gpu-operator-node-feature-discovery-gc-847bb8f7b6-l6kt9           1/1     Running     0          3m31s   10.52.1.30   hp-1992   <none>           <none>
gpu-operator-node-feature-discovery-master-d98f944cd-sphdv        1/1     Running     0          3m31s   10.52.1.32   hp-1992   <none>           <none>
gpu-operator-node-feature-discovery-worker-6bhr2                  1/1     Running     0          3m31s   10.52.1.33   hp-1992   <none>           <none>
gpu-operator-node-feature-discovery-worker-csz6t                  1/1     Running     0          3m31s   10.52.0.82   hp-195    <none>           <none>
nvidia-container-toolkit-daemonset-9dfb6                          1/1     Running     0          3m      10.52.1.36   hp-1992   <none>           <none>
nvidia-cuda-validator-kss5x                                       0/1     Completed   0          26s     10.52.1.42   hp-1992   <none>           <none>
nvidia-dcgm-exporter-zq594                                        0/1     Running     0          3m      10.52.1.39   hp-1992   <none>           <none>
nvidia-device-plugin-daemonset-b7g8z                              1/1     Running     0          3m      10.52.1.40   hp-1992   <none>           <none>
nvidia-driver-daemonset-6.12.0-160000.37-default-sles16.0-8x7x6   1/1     Running     0          3m9s    10.52.1.34   hp-1992   <none>           <none>
nvidia-operator-validator-nbqd4                                   1/1     Running     0          3m      10.52.1.38   hp-1992   <none>           <none>
```

Users can now run GPU workloads directly on the underlying Harvester cluster.

For example to test the setup

```yaml
apiVersion: v1
kind: Pod
metadata:
  name: nbody-gpu-benchmark
  namespace: default
spec:
  restartPolicy: OnFailure
  # runtimeClassName: nvidia <== Only needed for v25.3.x
  containers:
  - name: cuda-container
    image: nvcr.io/nvidia/k8s/cuda-sample:nbody
    args: ["nbody", "-gpu", "-benchmark"]
    resources:
      limits:
        nvidia.com/gpu: 1
```

```shell
(⎈|local:default)➜  ~ kubectl get pod
kubNAME                  READY   STATUS      RESTARTS   AGE
nbody-gpu-benchmark   0/1     Completed   0          11s
(⎈|local:default)➜  ~ kubectl logs nbody-gpu-benchmark
Run "nbody -benchmark [-numbodies=<numBodies>]" to measure performance.
	-fullscreen       (run n-body simulation in fullscreen mode)
	-fp64             (use double precision floating point values for simulation)
	-hostmem          (stores simulation data in host memory)
	-benchmark        (run benchmark to measure performance)
	-numbodies=<N>    (number of bodies (>= 1) to run in simulation)
	-device=<d>       (where d=0,1,2.... for the CUDA device to use)
	-numdevices=<i>   (where i=(number of CUDA devices > 0) to use for simulation)
	-compare          (compares simulation results running once on the default GPU and once on the CPU)
	-cpu              (run n-body simulation on the CPU)
	-tipsy=<file.bin> (load a tipsy model file for simulation)

NOTE: The CUDA Samples are not meant for performance measurements. Results may vary when GPU Boost is enabled.

> Windowed mode
> Simulation data stored in video memory
> Single precision floating point simulation
> 1 Devices used for simulation
MapSMtoCores for SM 8.9 is undefined.  Default to use 128 Cores/SM
MapSMtoArchName for SM 8.9 is undefined.  Default to use Ampere
GPU Device 0: "Ampere" with compute capability 8.9

> Compute 8.9 CUDA device: [NVIDIA L4]
59392 bodies, total time for 10 iterations: 56.420 ms
= 625.207 billion interactions per second
= 12504.139 single-precision GFLOP/s at 20 flops per interaction
(⎈|local:default)➜  ~
```

Users can also define GPU limits / requests via the Rancher UI

![](/img/gpu-pod.png)