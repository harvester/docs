---
sidebar_position: 11
sidebar_label: Upgrade Manager
title: "Upgrade Manager (Experimental)"
---

<head>
  <link rel="canonical" href="https://docs.harvesterhci.io/v1.8/advanced/addons/virtual-machine-auto-balance"/>
</head>

_Available as of v1.8.0_

The Upgrade Manager provides a declarative, Kubernetes-native way to orchestrate Harvester cluster upgrades. In contrast to the previous upgrade mechanics, you create an `UpgradePlan` custom resource and the manager handles the entire lifecycle: downloading the ISO, preloading container images, upgrading the cluster components, upgrading each node in sequence, and cleaning up afterward.

:::note

**harvester-upgrade-manager** is an *experimental* add-on. Its add-on manifest, Helm chart, and container image are not included in the published Harvester ISO image, but you can download them from the [experimental-addons repository](https://github.com/harvester/experimental-addons) and Docker Hub. For more information about experimental features, see [Feature Labels](../../getting-started/document-conventions.md#feature-labels).

:::

## Installing and Enabling the Add-on

To install the Upgrade Manager, first apply the add-on manifest from the experimental-addons repository:

```bash
kubectl apply -f \
    https://raw.githubusercontent.com/harvester/experimental-addons/refs/heads/main/harvester-upgrade-manager/harvester-upgrade-manager.yaml
```

Then enable the add-on by patching its resource:

```bash
kubectl -n harvester-system patch addons.harvesterhci harvester-upgrade-manager \
    --type=json -p '[{"op":"replace","path":"/spec/enabled","value":true}]'
```

Verify that the manager deployment is running and ready:

```bash
$ kubectl -n harvester-system get deployments -l app.kubernetes.io/name=harvester-upgrade-manager
NAME                                           READY   UP-TO-DATE   AVAILABLE   AGE
harvester-upgrade-manager-controller-manager   1/1     1            1           36m
```

## Starting an Upgrade

The Upgrade Manager supports two ways to specify the target release. Both approaches result in an `UpgradePlan` resource that the manager reconciles through its upgrade pipeline.

### Version-based Entrypoint

With the version-based approach, you first create a `Version` resource that points to the ISO download URL, optionally with its checksum, then create an `UpgradePlan` that references the version by name. The manager automatically resolves the ISO URL from the `Version` resource.

```yaml
apiVersion: harvesterhci.io/v1beta1           
kind: Version            
metadata:
  name: v1.8.0
  namespace: harvester-system                        
spec:                                                                                     
  isoURL: https://releases.rancher.com/harvester/v1.8.0/harvester-v1.8.0-amd64.iso
```

```yaml
apiVersion: management.harvesterhci.io/v1beta1
kind: UpgradePlan
metadata:
  generateName: hvst-upgrade-
spec:
  version: v1.8.0
```

### VirtualMachineImage-based Entrypoint

Alternatively, you can import the ISO as a `VirtualMachineImage` and reference it in the `UpgradePlan`. This approach is useful when the ISO has already been uploaded or when you want more control over the image storage policy.

The `harvesterhci.io/os-upgrade-image: "True"` annotation marks the image as eligible for the Harvester Upgrade.

```yaml
apiVersion: harvesterhci.io/v1beta1
kind: VirtualMachineImage
metadata:
  annotations:
    harvesterhci.io/os-upgrade-image: "True"
  name: harvester-v1-8-0-amd64
  namespace: harvester-system
spec:
  backend: cdi
  displayName: harvester-v1.8.0-amd64.iso
  sourceType: download
  url: https://releases.rancher.com/harvester/v1.8.0/harvester-v1.8.0-amd64.iso
  retry: 3
  targetStorageClassName: longhorn-static
```

```yaml
apiVersion: management.harvesterhci.io/v1beta1
kind: UpgradePlan
metadata:
  generateName: hvst-upgrade-
spec:
  image: harvester-v1-8-0-amd64
```

## Monitoring the Upgrade Progress

Once an `UpgradePlan` is created, the manager drives it through a series of phases. You can monitor the overall progress by inspecting the `UpgradePlan` resource.

Use `kubectl get upgradeplans -o yaml` to view the full resource status, including the current phase, phase transition timestamps, node upgrade statuses, and release metadata:

```bash
$ kubectl get upgradeplans -o yaml
apiVersion: v1
items:
- apiVersion: management.harvesterhci.io/v1beta1
  kind: UpgradePlan
  metadata:
    annotations:
      management.harvesterhci.io/replica-replenishment-wait-interval: "600"
    creationTimestamp: "2026-04-15T05:07:13Z"
    generateName: hvst-upgrade-
    generation: 1
    name: hvst-upgrade-9s9cd
    resourceVersion: "898907"
    uid: 47b0458d-e2ed-43ff-9453-262eec0a8823
  spec:
    image: harvester-v1-8-0-rc5-amd64
  status:
    conditions:
    - lastTransitionTime: "2026-04-15T05:47:54Z"
      message: UpgradePlan has completed
      observedGeneration: 1
      reason: Succeeded
      status: "False"
      type: Progressing
    - lastTransitionTime: "2026-04-15T05:47:54Z"
      message: ""
      observedGeneration: 1
      reason: ReconcileSuccess
      status: "False"
      type: Degraded
    - lastTransitionTime: "2026-04-15T05:47:54Z"
      message: Entered one of the terminal phases
      observedGeneration: 1
      reason: Executed
      status: "False"
      type: Available
    currentPhase: Succeeded
    isoImageID: harvester-v1-8-0-rc5-amd64
    nodeUpgradeStatuses:
      alfa-1-tink-system:
        state: ImageCleaned
    phaseTransitionTimestamps:
    - phase: Initializing
      phaseTransitionTimestamp: "2026-04-15T05:07:13Z"
    - phase: Initialized
      phaseTransitionTimestamp: "2026-04-15T05:07:13Z"
    - phase: ISODownloading
      phaseTransitionTimestamp: "2026-04-15T05:07:13Z"
    - phase: ISODownloaded
      phaseTransitionTimestamp: "2026-04-15T05:11:13Z"
    - phase: RepoCreating
      phaseTransitionTimestamp: "2026-04-15T05:11:13Z"
    - phase: RepoCreated
      phaseTransitionTimestamp: "2026-04-15T05:11:16Z"
    - phase: MetadataPopulating
      phaseTransitionTimestamp: "2026-04-15T05:11:16Z"
    - phase: MetadataPopulated
      phaseTransitionTimestamp: "2026-04-15T05:11:27Z"
    - phase: ImagePreloading
      phaseTransitionTimestamp: "2026-04-15T05:11:27Z"
    - phase: ImagePreloaded
      phaseTransitionTimestamp: "2026-04-15T05:20:11Z"
    - phase: ClusterUpgrading
      phaseTransitionTimestamp: "2026-04-15T05:20:12Z"
    - phase: ClusterUpgraded
      phaseTransitionTimestamp: "2026-04-15T05:32:19Z"
    - phase: NodeUpgrading
      phaseTransitionTimestamp: "2026-04-15T05:32:19Z"
    - phase: NodeUpgraded
      phaseTransitionTimestamp: "2026-04-15T05:45:57Z"
    - phase: CleaningUp
      phaseTransitionTimestamp: "2026-04-15T05:45:57Z"
    - phase: CleanedUp
      phaseTransitionTimestamp: "2026-04-15T05:47:53Z"
    - phase: Succeeded
      phaseTransitionTimestamp: "2026-04-15T05:47:54Z"
    previousVersion: v1.7.1
    releaseMetadata:
      harvester: v1.8.0-rc5
      harvesterChart: 1.8.0-rc5
      kubernetes: v1.35.2+rke2r1
      minUpgradableVersion: v1.7.0
      monitoringChart: 108.0.2+up77.9.1-rancher.11
      os: Harvester v1.8.0-rc5
      rancher: v2.14.0
    singleNode: alfa-1-tink-system
kind: List
metadata:
  resourceVersion: ""
```

For a more detailed view that includes Kubernetes events emitted by the manager during each phase transition, use `kubectl describe upgradeplans`. The events section is particularly useful for diagnosing transient errors that the manager recovers from automatically:

```bash
$ kubectl describe upgradeplans
Name:         hvst-upgrade-9s9cd
Namespace:
Labels:       <none>
Annotations:  management.harvesterhci.io/replica-replenishment-wait-interval: 600
API Version:  management.harvesterhci.io/v1beta1
Kind:         UpgradePlan
Metadata:
  Creation Timestamp:  2026-04-15T05:07:13Z
  Generate Name:       hvst-upgrade-
  Generation:          1
  Resource Version:    898907
  UID:                 47b0458d-e2ed-43ff-9453-262eec0a8823
Spec:
  Image:  harvester-v1-8-0-rc5-amd64
Status:
  Conditions:
    Last Transition Time:  2026-04-15T05:47:54Z
    Message:               UpgradePlan has completed
    Observed Generation:   1
    Reason:                Succeeded
    Status:                False
    Type:                  Progressing
    Last Transition Time:  2026-04-15T05:47:54Z
    Message:
    Observed Generation:   1
    Reason:                ReconcileSuccess
    Status:                False
    Type:                  Degraded
    Last Transition Time:  2026-04-15T05:47:54Z
    Message:               Entered one of the terminal phases
    Observed Generation:   1
    Reason:                Executed
    Status:                False
    Type:                  Available
  Current Phase:           Succeeded
  Iso Image Id:            harvester-v1-8-0-rc5-amd64
  Node Upgrade Statuses:
    alfa-1-tink-system:
      State:  ImageCleaned
  Phase Transition Timestamps:
    Phase:                       Initializing
    Phase Transition Timestamp:  2026-04-15T05:07:13Z
    Phase:                       Initialized
    Phase Transition Timestamp:  2026-04-15T05:07:13Z
    Phase:                       ISODownloading
    Phase Transition Timestamp:  2026-04-15T05:07:13Z
    Phase:                       ISODownloaded
    Phase Transition Timestamp:  2026-04-15T05:11:13Z
    Phase:                       RepoCreating
    Phase Transition Timestamp:  2026-04-15T05:11:13Z
    Phase:                       RepoCreated
    Phase Transition Timestamp:  2026-04-15T05:11:16Z
    Phase:                       MetadataPopulating
    Phase Transition Timestamp:  2026-04-15T05:11:16Z
    Phase:                       MetadataPopulated
    Phase Transition Timestamp:  2026-04-15T05:11:27Z
    Phase:                       ImagePreloading
    Phase Transition Timestamp:  2026-04-15T05:11:27Z
    Phase:                       ImagePreloaded
    Phase Transition Timestamp:  2026-04-15T05:20:11Z
    Phase:                       ClusterUpgrading
    Phase Transition Timestamp:  2026-04-15T05:20:12Z
    Phase:                       ClusterUpgraded
    Phase Transition Timestamp:  2026-04-15T05:32:19Z
    Phase:                       NodeUpgrading
    Phase Transition Timestamp:  2026-04-15T05:32:19Z
    Phase:                       NodeUpgraded
    Phase Transition Timestamp:  2026-04-15T05:45:57Z
    Phase:                       CleaningUp
    Phase Transition Timestamp:  2026-04-15T05:45:57Z
    Phase:                       CleanedUp
    Phase Transition Timestamp:  2026-04-15T05:47:53Z
    Phase:                       Succeeded
    Phase Transition Timestamp:  2026-04-15T05:47:54Z
  Previous Version:              v1.7.1
  Release Metadata:
    Harvester:               v1.8.0-rc5
    Harvester Chart:         1.8.0-rc5
    Kubernetes:              v1.35.2+rke2r1
    Min Upgradable Version:  v1.7.0
    Monitoring Chart:        108.0.2+up77.9.1-rancher.11
    Os:                      Harvester v1.8.0-rc5
    Rancher:                 v2.14.0
  Single Node:               alfa-1-tink-system
Events:
  Type     Reason                     Age                From                      Message
  ----     ------                     ----               ----                      -------
  Normal   PhaseTransition            67m                upgradeplan-controller    Entering phase ISODownload
  Normal   PhaseCompleted             63m                upgradeplan-controller    Completed phase ISODownload
  Normal   PhaseTransition            63m                upgradeplan-controller    Entering phase RepoCreate
  Warning  ReconcileError             63m                upgradeplan-controller    Pipeline error: Deployment.apps "hvst-upgrade-9s9cd-repo" not found
  Normal   PhaseCompleted             63m                upgradeplan-controller    Completed phase RepoCreate
  Normal   PhaseTransition            63m                upgradeplan-controller    Entering phase MetadataPopulate
  Normal   PhaseCompleted             63m                upgradeplan-controller    Completed phase MetadataPopulate
  Normal   PhaseTransition            63m                upgradeplan-controller    Entering phase ImagePreload
  Warning  ReconcileError             63m                upgradeplan-controller    Pipeline error: Plan.upgrade.cattle.io "hvst-upgrade-9s9cd-image-preload" not found
  Normal   PhaseCompleted             54m                upgradeplan-controller    Completed phase ImagePreload
  Normal   PhaseTransition            54m                upgradeplan-controller    Entering phase ClusterUpgrade
  Normal   PhaseCompleted             42m (x2 over 42m)  upgradeplan-controller    Completed phase ClusterUpgrade
  Normal   PhaseTransition            42m (x2 over 42m)  upgradeplan-controller    Entering phase NodeUpgrade
  Normal   RestoreVMConfigMapCreated  41m                vm-live-migrate-detector  ConfigMap harvester-system/hvst-upgrade-9s9cd-restore-vm created
  Normal   VMShutdownCompleted        41m                vm-live-migrate-detector  Shutdown completed for 0 VM(s) on node alfa-1-tink-system, success: 0, failed: 0
  Normal   PhaseCompleted             28m                upgradeplan-controller    Completed phase NodeUpgrade
  Normal   PhaseTransition            28m                upgradeplan-controller    Entering phase ImageCleanup
  Warning  ReconcileError             28m                upgradeplan-controller    Pipeline error: fetch image list from http://hvst-upgrade-9s9cd-repo.harvester-system/harvester-iso/bundle/harvester/images-lists-archive/v1.7.1/image_list_all.txt: Get "http://hvst-upgrade-9s9cd-repo.harvester-system/harvester-iso/bundle/harvester/images-lists-archive/v1.7.1/image_list_all.txt": dial tcp: lookup hvst-upgrade-9s9cd-repo.harvester-system on 10.53.0.10:53: read udp 10.52.0.25:37478->10.53.0.10:53: read: connection refused
  Warning  ReconcileError             28m                upgradeplan-controller    Pipeline error: fetch image list from http://hvst-upgrade-9s9cd-repo.harvester-system/harvester-iso/bundle/harvester/images-lists-archive/v1.7.1/image_list_all.txt: Get "http://hvst-upgrade-9s9cd-repo.harvester-system/harvester-iso/bundle/harvester/images-lists-archive/v1.7.1/image_list_all.txt": dial tcp 10.53.31.29:80: connect: connection refused
  Normal   PhaseCompleted             26m (x2 over 26m)  upgradeplan-controller    Completed phase ImageCleanup
  Normal   UpgradeSucceeded           26m (x2 over 26m)  upgradeplan-controller    Upgrade completed successfully
```
