---
sidebar_position: 5
sidebar_label: VM
title: "VM"
---

<head>
  <link rel="canonical" href="https://docs.harvesterhci.io/v1.2/troubleshooting/vm"/>
</head>

The following sections contain information useful in troubleshooting issues related to Harvester VM management.

## VM Start Button is Not Visible

### Issue Description

On rare occasions, the **Start** button is unavailable on the Harvester UI for VMs that are *Off*. Without that button, users are unable to start the VMs.

![](/img/v1.2/troubleshooting/vm-start-button-is-not-visible.png)

### VM General Operations

On the Harvester UI, the **Stop** button is visible after a VM is created and started.

![](/img/v1.2/troubleshooting/stop-vm-from-webui.png)

The **Start** button is visible after the VM is stopped.

![](/img/v1.2/troubleshooting/start-vm-after-vm-is-stopped-from-webui.png)

When the VM is powered off from inside the VM, both the **Start** and **Restart** buttons are visible.

![](/img/v1.2/troubleshooting/actively-powered-off-vm.png)

### General VM Related Objects

#### A Running VM

The objects `vm`, `vmi`, and `pod`, which are all related to the VM, exist. The status of all three objects is `Running`.

```
 # kubectl get vm
NAME   AGE     STATUS    READY
vm8    7m25s   Running   True

 # kubectl get vmi
NAME   AGE   PHASE     IP            NODENAME   READY
vm8    78s   Running   10.52.0.199   harv41     True

 # kubectl get pod
NAME                      READY   STATUS    RESTARTS   AGE
virt-launcher-vm8-tl46h   1/1     Running   0          80s
```

#### A VM Stopped Using the Harvester UI

Only the object `vm` exists and its status is `Stopped`. Both `vmi` and `pod` disappear.

```
 # kubectl get vm
NAME   AGE    STATUS    READY
vm8    123m   Stopped   False

 # kubectl get vmi
No resources found in default namespace.

 # kubectl get pod
No resources found in default namespace.
 # 
```

#### A VM Stopped Using the VM's Poweroff Command

The objects `vm`, `vmi`, and `pod`, which are all related to the VM, exist. The status of `vm` is `Stopped`, while the status of `pod` is `Completed`.

```
 # kubectl get vm
NAME   AGE    STATUS    READY
vm8    134m   Stopped   False

 # kubectl get vmi
NAME   AGE     PHASE       IP            NODENAME   READY
vm8    2m49s   Succeeded   10.52.0.199   harv41     False

 # kubectl get pod
NAME                      READY   STATUS      RESTARTS   AGE
virt-launcher-vm8-tl46h   0/1     Completed   0          2m54s

```

### Issue Analysis

When the issue occurs, the objects `vm`, `vmi`, and `pod` exist. The status of the objects is similar to that of **A VM Stopped Using the VM's Poweroff Command**.

Example:

The VM `ocffm031v000` is not ready (`status: "False"`) because the virt-launcher pod is terminating (`reason: "PodTerminating"`).

```
- apiVersion: kubevirt.io/v1
  kind: VirtualMachine
...
  status:
    conditions:
    - lastProbeTime: "2023-07-20T08:37:37Z"
      lastTransitionTime: "2023-07-20T08:37:37Z"
      message: virt-launcher pod is terminating
      reason: PodTerminating
      status: "False"
      type: Ready
```

Similarly, the VMI (virtual machine instance) `ocffm031v000` is not ready (`status: "False"`) because the virt-launcher pod is terminating (`reason: "PodTerminating"`).

```
- apiVersion: kubevirt.io/v1
  kind: VirtualMachineInstance
...
    name: ocffm031v000
...
  status:
    activePods:
      ec36a1eb-84a5-4421-b57b-2c14c1975018: aibfredg02
    conditions:
    - lastProbeTime: "2023-07-20T08:37:37Z"
      lastTransitionTime: "2023-07-20T08:37:37Z"
      message: virt-launcher pod is terminating
      reason: PodTerminating
      status: "False"
      type: Ready
```

On the other hand, the pod `virt-launcher-ocffm031v000-rrkss` is not ready (`status: "False"`) because the pod has run to completion (`reason: "PodCompleted"`).

The underlying container `0d7a0f64f91438cb78f026853e6bebf502df1bdeb64878d351fa5756edc98deb` is terminated, and the `exitCode` is 0.

```
- apiVersion: v1
  kind: Pod
...
    name: virt-launcher-ocffm031v000-rrkss
...
    ownerReferences:
    - apiVersion: kubevirt.io/v1
...
      kind: VirtualMachineInstance
      name: ocffm031v000
      uid: 8d2cf524-7e73-4713-86f7-89e7399f25db
    uid: ec36a1eb-84a5-4421-b57b-2c14c1975018
...
  status:
    conditions:
    - lastProbeTime: "2023-07-18T13:48:56Z"
      lastTransitionTime: "2023-07-18T13:48:56Z"
      message: the virtual machine is not paused
      reason: NotPaused
      status: "True"
      type: kubevirt.io/virtual-machine-unpaused
    - lastProbeTime: "null"
      lastTransitionTime: "2023-07-18T13:48:55Z"
      reason: PodCompleted
      status: "True"
      type: Initialized
    - lastProbeTime: "null"
      lastTransitionTime: "2023-07-20T08:38:56Z"
      reason: PodCompleted
      status: "False"
      type: Ready
    - lastProbeTime: "null"
      lastTransitionTime: "2023-07-20T08:38:56Z"
      reason: PodCompleted
      status: "False"
      type: ContainersReady
...
    containerStatuses:
    - containerID: containerd://0d7a0f64f91438cb78f026853e6bebf502df1bdeb64878d351fa5756edc98deb
      image: registry.suse.com/suse/sles/15.4/virt-launcher:0.54.0-150400.3.3.2
      imageID: sha256:43bb08efdabb90913534b70ec7868a2126fc128887fb5c3c1b505ee6644453a2
      lastState: {}
      name: compute
      ready: false
      restartCount: 0
      started: false
      state:
        terminated:
          containerID: containerd://0d7a0f64f91438cb78f026853e6bebf502df1bdeb64878d351fa5756edc98deb
          exitCode: 0
          finishedAt: "2023-07-20T08:38:55Z"
          reason: Completed
          startedAt: "2023-07-18T13:50:17Z"
```

A critical difference is that the `Stop` and `Start` actions appear in the `stateChangeRequests` property of `vm`.

```
  status:
    conditions:
...
    printableStatus: Stopped
    stateChangeRequests:
    - action: Stop
      uid: 8d2cf524-7e73-4713-86f7-89e7399f25db
    - action: Start
```

#### Root Cause

The root cause of this issue is under investigation.

It is notable that the [source code](https://github.com/harvester/harvester/blob/7357d0b660557566bf9ff2e83790635aea71d1bc/pkg/api/vm/formatter.go#L166) checks the status of `vm` and assumes that the object is starting. No `Start` and `Restart` operations are added to the object.

```
func (vf *vmformatter) canStart(vm *kubevirtv1.VirtualMachine, vmi *kubevirtv1.VirtualMachineInstance) bool {
	if vf.isVMStarting(vm) {
		return false
	}
..
}

func (vf *vmformatter) canRestart(vm *kubevirtv1.VirtualMachine, vmi *kubevirtv1.VirtualMachineInstance) bool {
	if vf.isVMStarting(vm) {
		return false
	}
...
}

func (vf *vmformatter) isVMStarting(vm *kubevirtv1.VirtualMachine) bool {
	for _, req := range vm.Status.StateChangeRequests {
		if req.Action == kubevirtv1.StartRequest {
			return true
		}
	}
	return false
}
```

### Workaround

To address the issue, you can force delete the pod using the command `kubectl delete pod virt-launcher-ocffm031v000-rrkss -n namespace --force`.

After the pod is successfully deleted, the `Start` button becomes visible again on the Harvester UI.

### Related Issue

https://github.com/harvester/harvester/issues/4659
