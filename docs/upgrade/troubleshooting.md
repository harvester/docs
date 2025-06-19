---
sidebar_position: 12
sidebar_label: Troubleshooting
title: "Troubleshooting"
---

<head>
  <link rel="canonical" href="https://docs.harvesterhci.io/v1.5/upgrade/troubleshooting"/>
</head>

## Overview

Here are some tips to troubleshoot a failed upgrade:

- Check [version-specific upgrade notes](./automatic.md#upgrade-support-matrix). You can click the version in the support matrix table to see if there are any known issues.
- Dive into the upgrade [design proposal](https://github.com/harvester/harvester/blob/master/enhancements/20220413-zero-downtime-upgrade.md). The following section briefly describes phases within an upgrade and possible diagnostic methods.

## Upgrade Flow

The Harvester upgrade process involves several phases.

![](/img/v1.2/upgrade/ts_upgrade_phases.png)

### Phase 1: Provision an Upgrade Repository Virtual Machine

The Harvester controller downloads a release ISO file and uses it to provision a repository virtual machine. The virtual machine name uses the format `upgrade-repo-hvst-xxxx`.

![](/img/v1.2/upgrade/ts_status_phase1.png)

Network speed and cluster resource utilization strongly influence the completion of this phase. Upgrades typically fail because of network speed issues.

If the upgrade fails at this point, check the status of the repository virtual machine and its corresponding pod before [restarting the upgrade](#restart-the-upgrade). You can check the status using the command `kubectl get vm -n harvester-system`.

Example:

```
$ kubectl get vm -n harvester-system
NAME                              AGE    STATUS     READY
upgrade-repo-hvst-upgrade-9gmg2   101s   Starting   False

$ kubectl get pods -n harvester-system | grep upgrade-repo-hvst
virt-launcher-upgrade-repo-hvst-upgrade-9gmg2-4mnmq     1/1     Running     0          4m44s
```

### Phase 2: Preload Container Images

The Harvester controller creates jobs that download and preload container images from the repository virtual machine. These images are required for the next release.

Allow some time for the images to be downloaded and preloaded on all nodes.

![](/img/v1.2/upgrade/ts_status_phase2.png)

If the upgrade fails at this point, check the job logs in the `cattle-system` namespace before [restarting the upgrade](#restart-the-upgrade). You can check the logs using the command `kubectl get jobs -n cattle-system | grep prepare`.

Example:

```
$ kubectl get jobs -n cattle-system | grep prepare
apply-hvst-upgrade-9gmg2-prepare-on-node1-with-2bbea1599a-f0e86   0/1           47s        47s
apply-hvst-upgrade-9gmg2-prepare-on-node4-with-2bbea1599a-041e4   1/1           2m3s       2m50s

$ kubectl logs jobs/apply-hvst-upgrade-9gmg2-prepare-on-node1-with-2bbea1599a-f0e86 -n cattle-system
...
```

### Phase 3: Upgrade System Services

The Harvester controller creates a job that upgrades component Helm charts.

![](/img/v1.2/upgrade/ts_status_phase3.png)

You can check the `apply-manifest` job using the command `$ kubectl get jobs -n harvester-system -l harvesterhci.io/upgradeComponent=manifest`.

Example:

```
$ kubectl get jobs -n harvester-system -l harvesterhci.io/upgradeComponent=manifest
NAME                                 COMPLETIONS   DURATION   AGE
hvst-upgrade-9gmg2-apply-manifests   0/1           46s        46s

$ kubectl logs jobs/hvst-upgrade-9gmg2-apply-manifests -n harvester-system
...
```

:::caution

If the upgrade fails at this point, you must generate a [support bundle](../troubleshooting/harvester.md#generate-a-support-bundle) before [restarting the upgrade](#restart-the-upgrade). The support bundle contains logs and resource manifests that can help identify the cause of the failure.

:::

### Phase 4: Upgrade Nodes

The Harvester controller creates the following jobs on each node:

- Multi-node clusters:
  - `pre-drain` job: Live-migrates or shuts down virtual machines on the node. Once completed, the embedded Rancher service upgrades the RKE2 runtime on the node.
  - `post-drain` job: Upgrades and reboots the operating system.
- Single-node clusters:
  - `single-node-upgrade` job: Upgrades the operating system and RKE2 runtime. The job name uses the format `hvst-upgrade-xxx-single-node-upgrade-<hostname>`.

![](/img/v1.2/upgrade/ts_status_phase4.png)

You can check the jobs running on each node by running the command `kubectl get jobs -n harvester-system -l harvesterhci.io/upgradeComponent=node`.

Example:

```
$ kubectl get jobs -n harvester-system -l harvesterhci.io/upgradeComponent=node
NAME                                  COMPLETIONS   DURATION   AGE
hvst-upgrade-9gmg2-post-drain-node1   1/1           118s       6m34s
hvst-upgrade-9gmg2-post-drain-node2   0/1           9s         9s
hvst-upgrade-9gmg2-pre-drain-node1    1/1           3s         8m14s
hvst-upgrade-9gmg2-pre-drain-node2    1/1           7s         85s

$ kubectl logs -n harvester-system jobs/hvst-upgrade-9gmg2-post-drain-node2
...
```

:::warning

If the upgrade fails at this point, **DO NOT restart** the upgrade unless instructed by [SUSE support](https://www.suse.com/support/).

:::

### Phase 5: Cleanup

The Harvester controller deletes the repository virtual machine and all files that are no longer necessary.

## Common Operations

### Stop the Ongoing Upgrade

:::warning

If the ongoing upgrade fails or becomes stuck at [Phase 4: Upgrade Nodes](#phase-4-upgrade-nodes), **DO NOT restart** the upgrade unless instructed by [SUSE support](https://www.suse.com/support/).

:::

You can stop the upgrade by performing the following steps:

1. Log in to a control plane node.

1. List the `Upgrade` CRs in the cluster.

    ```
    # become root
    $ sudo -i

    # list the on-going upgrade
    $ kubectl get upgrade.harvesterhci.io -n harvester-system -l harvesterhci.io/latestUpgrade=true
    NAME                 AGE
    hvst-upgrade-9gmg2   10m
    ```

1. Delete the `Upgrade` CR.

    ```
    $ kubectl delete upgrade.harvesterhci.io/hvst-upgrade-9gmg2 -n harvester-system
    ```

1. Resume the paused ManagedCharts.

    ManagedCharts are paused to avoid a data race between the upgrade and other processes. When the upgrade is manually stopped, the ManagedCharts might not been resumed, you need to manually resume all paused ManagedCharts.

    ```
    cat > resumeallcharts.sh << 'FOE'
    resume_all_charts() {

      local patchfile="/tmp/charttmp.yaml"

      cat >"$patchfile" << 'EOF'
    spec:
      paused: false
    EOF
      echo "the to-be-patched file"
      cat "$patchfile"

      local charts="harvester harvester-crd rancher-monitoring-crd rancher-logging-crd"

      for chart in $charts; do
        echo "unapuse managedchart $chart"
        kubectl patch managedcharts.management.cattle.io $chart -n fleet-local --patch-file "$patchfile" --type merge || echo "failed, check reason"
      done

      rm "$patchfile"
    }

    resume_all_charts

    FOE

    chmod +x ./resumeallcharts.sh

    ./resumeallcharts.sh

    ```

### Restart the Upgrade

:::warning

If the ongoing upgrade fails or becomes stuck at [Phase 4: Upgrade Nodes](#phase-4-upgrade-nodes), **DO NOT restart** the upgrade unless instructed by [SUSE support](https://www.suse.com/support/).

:::

1. [Stop the ongoing upgrade](#stop-the-ongoing-upgrade).

1. Click the **Upgrade** button on the Harvester UI **Dashboard** screen.

    If you [customized the version](./automatic.md#customize-the-version), you might need to [create the version object](./automatic.md#prepare-the-version) again.

### Download Upgrade Logs

Harvester automatically collects all the upgrade-related logs and display the upgrade procedure. By default, this is enabled. You can also choose to opt out of such behavior.

![The "Enable Logging" checkbox on the upgrade confirmation dialog](/img/v1.2/upgrade/enable_logging.png)

You can click the **Download Log** button to download the log archive during an upgrade.

![Download the upgrade log archive by clicking the "Download Log" button on the upgrade dialog](/img/v1.2/upgrade/download_upgradelog_dialog.png)

Log entries will be collected as files for each upgrade-related Pod, even for intermediate Pods. The support bundle provides a snapshot of the current state of the cluster, including logs and resource manifests, while the upgrade log preserves any logs generated during an upgrade. By combining these two, you can further investigate the issues during upgrades.

![The upgrade log archive contains all the logs generated by the upgrade-related Pods](/img/v1.2/upgrade/upgradelog_archive.png)

After the upgrade ends, Harvester stops collecting the upgrade logs to avoid occupying the disk space. In addition, you can click the **Dismiss it** button to purge the upgrade logs.

![The upgrade log archive contains all the logs generated by the upgrade-related Pods](/img/v1.2/upgrade/dismiss_upgrade_to_remove_upgradelog.png)

For more details, please refer to the [upgrade log HEP](https://github.com/harvester/harvester/blob/master/enhancements/20221207-upgrade-observability.md).

:::caution

The default size of the volume that stores upgrade-related logs is 1 GB. When errors occur, these logs may completely consume the volume's available space. To work around this issue, you can perform the following steps:

1. Detach the `log-archive` volume by scaling down the `fluentd` StatefulSet and `downloader` deployment.

    ```
    # Locate the StatefulSet and Deployment
    $ kubectl -n harvester-system get statefulsets -l harvesterhci.io/upgradeLogComponent=aggregator
    NAME                                               READY   AGE
    hvst-upgrade-xxxxx-upgradelog-infra-fluentd   1/1     43s

    $ kubectl -n harvester-system get deployments -l harvesterhci.io/upgradeLogComponent=downloader
    NAME                                            READY   UP-TO-DATE   AVAILABLE   AGE
    hvst-upgrade-xxxxx-upgradelog-downloader   1/1     1            1           38s

    # Scale down the resources to terminate any Pods using the volume
    $ kubectl -n harvester-system scale statefulset hvst-upgrade-xxxxx-upgradelog-infra-fluentd --replicas=0
    statefulset.apps/hvst-upgrade-xxxxx-upgradelog-infra-fluentd scaled

    $ kubectl -n harvester-system scale deployment hvst-upgrade-xxxxx-upgradelog-downloader --replicas=0
    deployment.apps/hvst-upgrade-xxxxx-upgradelog-downloader scaled
    ```

1. Expand the volume size using the Longhorn UI.

    ```
    # Here's how to find out the actual name of the target volume
    $ kubectl -n harvester-system get pvc -l harvesterhci.io/upgradeLogComponent=log-archive -o jsonpath='{.items[].spec.volumeName}'
    pvc-63355afb-ce61-46c4-8781-377cf962278a
    ```

    For more information, see [Volume Expansion](https://longhorn.io/docs/1.8.1/nodes-and-volumes/volumes/expansion/) in the Longhorn documentation.

1. Recover the `fluentd` StatefulSet and `downloader` deployment.

    ```
    $ kubectl -n harvester-system scale statefulset hvst-upgrade-xxxxx-upgradelog-infra-fluentd --replicas=1
    statefulset.apps/hvst-upgrade-xxxxx-upgradelog-infra-fluentd scaled

    $ kubectl -n harvester-system scale deployment hvst-upgrade-xxxxx-upgradelog-downloader --replicas=1
    deployment.apps/hvst-upgrade-xxxxx-upgradelog-downloader scaled
    ```

:::

### Clean Up Unused Images

The default value of `imageGCHighThresholdPercent` in [KubeletConfiguration](https://kubernetes.io/docs/reference/config-api/kubelet-config.v1beta1/#kubelet-config-k8s-io-v1beta1-KubeletConfiguration) is `85`. When disk usage exceeds 85%, the kubelet attempts to remove unused images.

New images are loaded to each Harvester node during upgrades. When disk usage exceeds 85%, these new images may be marked for cleanup because they are not used by any containers. In air-gapped environments, removal of new images from the cluster may break the upgrade process.

If you encounter the error message `Node xxx will reach xx.xx% storage space after loading new images. It's higher than kubelet image garbage collection threshold 85%.`, run `crictl rmi --prune` to clean up unused images before starting a new upgrade.

![Disk space not enough error message](/img/v1.4/upgrade/disk-space-not-enough-error-message.png)