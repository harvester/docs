---
id: index
sidebar_position: 1
sidebar_label: Upgrading Harvester
title: "Upgrading Harvester"
keywords:
  - Harvester
  - harvester
  - Rancher
  - rancher
  - Harvester Upgrade
description: Harvester provides two ways to upgrade. Users can either upgrade using the ISO image or upgrade through the UI.
---

<head>
  <link rel="canonical" href="https://docs.harvesterhci.io/v1.6/upgrade/index"/>
</head>

Harvester is adopting a new lifecycle strategy that simplifies version management and upgrades. This strategy includes the following:

- Four-month minor release cadence (April, August, and December)
- Two-month patch release cadence (best effort)
- Component adoption policy

:::note

Harvester does not support downgrades. This restriction helps prevent unexpected system behavior and issues associated with function incompatibility, deprecation, and removal.

:::

## Upgrade paths

The following table outlines the supported upgrade paths.

| Installed Version | Supported Upgrade Versions |
| --- | --- |
| v1.5.0/v1.5.1/v1.5.2 | [v1.6.0](./v1-5-x-to-v1-6-0.md) |
| v1.5.0 | [v1.5.1](./v1-5-0-to-v1-5-1.md) |
| v1.4.2/v1.4.3 | [v1.5.0](./v1-4-2-to-v1-5-0.md) and [v1.5.1](./v1-4-2-to-v1-5-1.md) |
| v1.4.1/v1.4.2 | [v1.4.3](./v1-4-1-to-v1-4-3.md) |
| v1.4.1 | [v1.4.2](./v1-4-1-to-v1-4-2.md) |
| v1.4.0 | [v1.4.1](./v1-4-0-to-v1-4-1.md) |
| v1.3.2 | [v1.4.0](./v1-3-2-to-v1-4-0.md) |
| v1.3.1 | [v1.3.2](./v1-3-1-to-v1-3-2.md) |
| v1.2.2/v1.3.0 | [v1.3.1](./v1-2-2-to-v1-3-1.md) |
| v1.2.1 | [v1.2.2](./v1-2-1-to-v1-2-2.md) |
| v1.1.2/v1.1.3/v1.2.0 | [v1.2.1](./v1-2-0-to-v1-2-1.md) |

Harvester v1.5.x and later versions allow the following:

- Upgrading from one minor version to the next (for example, from v1.4.2 to v1.5.1) without needing to install the patches released in between the two versions. This is possible because Harvester allows a maximum of one minor version upgrade for underlying components.
- Upgrading to a later patch version (for example, from v1.5.0 to v1.5.1), assuming that the same component versions are used across the releases for a given minor version.

The following table outlines the components used in these versions:

| Components | Harvester v1.5.x | Harvester v1.6.0 |
| --- | --- | --- |
| KubeVirt | v1.4 | v1.5.2 |
| Longhorn | v1.8 | v1.9.1 |
| Rancher | v2.11 | v2.12.0 |
| RKE2 | v1.32 | v1.33.3 |

:::note

Skipping multiple Kubernetes minor versions is not supported upstream and is a key reason behind the limited upgrade paths. For more information, see [Version Skew Policy](https://kubernetes.io/releases/version-skew-policy) in the Kubernetes documentation.

:::

## Rancher upgrade

If you are using Rancher to manage your Harvester cluster, you must [upgrade Rancher](https://ranchermanager.docs.rancher.com/getting-started/installation-and-upgrade/install-upgrade-on-a-kubernetes-cluster/upgrades) *before* upgrading Harvester. 

:::info important

The Harvester and Rancher upgrade processes are independent of each other. During a Rancher upgrade, you can still access your Harvester cluster using its virtual IP. Harvester is not automatically upgraded.

:::

When a Rancher version reaches its End of Maintenance (EOM) date, Harvester only provides fixes for critical security-related issues that affect integration functions (Virtualization Management). For more information, see the [Harvester & Rancher Support Matrix](https://www.suse.com/suse-harvester/support-matrix/all-supported-versions/).

## Virtual Machine Management through the Upgrade

### Live-Migratable Virtual Machines

[Live-migratable virtual machines](../vm/live-migration.md#live-migratable-virtual-machines) are automatically migrated to other nodes via [batch migration](../vm/live-migration.md#automatically-triggered-batch-migration) before the current node is upgraded. These virtual machines experience zero downtime during migration.

### Non-Migratable Virtual Machines

When an upgrade is triggered, Harvester performs certain actions depending on the value of the [`upgrade-config`](../advanced/settings.md#upgrade-config) setting's `restoreVM` option.

- `false`: Harvester does not perform the upgrade when [non-migratable virtual machines](../vm/live-migration.md#non-migratable-virtual-machines) are still running. You must manually power off the virtual machines.

- `true`: Harvester automatically powers off non-migratable virtual machines when the node is upgraded and then restores them after the node is rebooted.

:::caution

Non-migratable virtual machines experience downtime during migration.

:::

For more information, see [Phase 4: Upgrade Nodes](./troubleshooting.md#phase-4-upgrade-nodes).

## Before starting an upgrade

Check out the available [`upgrade-config` setting](../advanced/settings.md#upgrade-config) to tweak the upgrade strategies and behaviors that best suit your cluster environment.

## Start an upgrade

:::caution

- Before you upgrade your Harvester cluster, we highly recommend:
    - Back up your VMs if needed.
- Do not operate the cluster during an upgrade. For example, creating new VMs, uploading new images, etc.
- Make sure your hardware meets the **preferred** [hardware requirements](../install/requirements.md#hardware-requirements). This is due to there will be intermediate resources consumed by an upgrade.
- Make sure each node has at least 30 GiB of free system partition space (`df -h /usr/local/`). If any node in the cluster has less than 30 GiB of free system partition space, the upgrade will be denied. Check [free system partition space requirement](#free-system-partition-space-requirement) for more information.
- Run the pre-check script on a Harvester control-plane node. Please pick a script according to your cluster's version: https://github.com/harvester/upgrade-helpers/tree/main/pre-check.
- A number of one-off privileged pods will be created in the `harvester-system` and `cattle-system` namespaces to perform host-level upgrade operations. If [pod security admission](https://kubernetes.io/docs/concepts/security/pod-security-admission/) is enabled, adjust these policies to allow these pods to run.

:::

:::caution

- Make sure all nodes' times are in sync. Using an NTP server to synchronize time is recommended. If an NTP server is not configured during the installation, you can manually add an NTP server **on each node**:

    ```
    $ sudo -i

    # Add time servers
    $ vim /etc/systemd/timesyncd.conf
    [ntp]
    NTP=0.pool.ntp.org

    # Enable and start the systemd-timesyncd
    $ timedatectl set-ntp true

    # Check status
    $ sudo timedatectl status
    ```

:::

:::caution

- NICs that connect to a PCI bridge might be renamed after an upgrade. Please check the [knowledge base article](https://harvesterhci.io/kb/nic-naming-scheme) for further information.

:::

1. Make sure to read the above `caution`.

1. On the Harvester UI **Dashboard** screen, click **Upgrade**.

    The **Upgrade** button appears whenever a new Harvester version that you can upgrade to becomes available.

    If your environment does not have direct internet access, follow the instructions in [Prepare an air-gapped upgrade](#prepare-an-air-gapped-upgrade), which provides an efficient approach to downloading the Harvester ISO.

    ![](/img/v1.2/upgrade/upgrade_button.png)

1. Select a version that you want to upgrade to.

    If you require customizations, see [Customize the Version](#customize-the-version).

    ![](/img/v1.2/upgrade/upgrade_select_version.png)

1. Click the progress indicator (the **circle** button) to view the status of each related process.

    ![](/img/v1.2/upgrade/upgrade_progress.png)

### Customize the Version

1. Download the version file (`https://releases.rancher.com/harvester/{version}/version.yaml`).

    Example:

    The [Harvester v1.5.0 version file](https://releases.rancher.com/harvester/v1.5.0/version.yaml) is downloaded as `v1.5.0.yaml`.

    ```
    apiVersion: harvesterhci.io/v1beta1
    kind: Version
    metadata:
      name: v1.5.0-customized # Changed, to avoid duplicated with the official version name
      namespace: harvester-system
    spec:
      isoChecksum: 'df28e9bf8dc561c5c26dee535046117906581296d633eb2988e4f68390a281b6856a5a0bd2e4b5b988c695a53d0fc86e4e3965f19957682b74317109b1d2fe32'  # Don't change
      isoURL: https://releases.rancher.com/harvester/v1.5.0/harvester-v1.5.0-amd64.iso # Official ISO path by default
      releaseDate: '20250425'
    ```

1. Run `kubectl create -f v1.5.0.yaml` to create the version.

## Prepare an air-gapped upgrade

:::caution

Make sure to check [Upgrade paths](#upgrade-paths) section first about upgradable versions.

:::

### Prepare the ISO File

1. Download a Harvester ISO file from the [Releases](https://github.com/harvester/harvester/releases) page.

1. Save the ISO to a local HTTP server. Assume the file is hosted at `http://10.10.0.1/harvester.iso`.

### Prepare the Version

1. Download the version file (`https://releases.rancher.com/harvester/{version}/version.yaml`).

    - Replace `isoURL` value in the `version.yaml` file:

        ```
        apiVersion: harvesterhci.io/v1beta1
        kind: Version
        metadata:
          name: v1.5.0
          namespace: harvester-system
        spec:
          isoChecksum: <SHA-512 checksum of the ISO>
          isoURL: http://10.10.0.1/harvester.iso  # change to local ISO URL
          releaseDate: '20250425'
        ```

    - Assume the file is hosted at `http://10.10.0.1/version.yaml`.

    - If you require customizations, see [Customize the Version](#customize-the-version).

1. Access one of the control plane nodes via SSH and log in using the root account.

1. Create a version object.

    ```
    rancher@node1:~> sudo -i
    rancher@node1:~> kubectl create -f http://10.10.0.1/version.yaml
    ```

### Start the Upgrade

The **Upgrade** button appears on the **Dashboard** screen whenever a new Harvester version that you can upgrade to becomes available. Refresh the screen if the button does not appear.

## Manually Start an Upgrade before the Harvester Official Upgrade is Available

The **Upgrade** button does not appear on the UI immediately after a new Harvester version is released. If you want to upgrade your cluster before the option becomes available on the UI, follow the steps in [Prepare an air-gapped upgrade](#prepare-an-air-gapped-upgrade).

:::tip

In production environments, upgrading clusters via the Harvester UI is recommended.

:::

## Free system partition space requirement

_Available as of v1.5.0_

Harvester loads images on each node during upgrades. When disk usage exceeds the kubelet's garbage collection threshold, the kubelet deletes unused images to free up space. This may cause issues in airgapped environments because the images are not available on the node.

Harvester includes checks that ensure nodes do not trigger garbage collection after loading new images.

When disk space is insufficient, Harvester blocks the upgrade and returns an error similar to the following:

```
Node "harvester-node-0" will reach 92.84% storage space after loading new images. It's higher than kubelet image garbage collection threshold 85%.
```

If you want to try upgrading even if the free system partition space is insufficient on some nodes, you can update the `harvesterhci.io/skipGarbageCollectionThresholdCheck: true` annotation of the `Upgrade` object.

```yaml
apiVersion: harvesterhci.io/v1beta1
kind: Upgrade
metadata:
  annotations:
    harvesterhci.io/skipGarbageCollectionThresholdCheck: true
  generateName: hvst-upgrade-
  namespace: harvester-system
spec:
  version: "1.6.0"
  logEnabled: true
```

:::caution

Setting a smaller value than the pre-defined value may cause the upgrade to fail and is not recommended in a production environment.

:::

The following sections describe solutions for issues related to this requirement.

### Free System Partition Space Manually

Harvester attempts to remove unnecessary container images after an upgrade is completed. However, this automatic image cleanup may not be performed for various reasons. You can use [this script](https://github.com/harvester/upgrade-helpers/blob/main/bin/harv-purge-images.sh) to manually remove images. For more information, see issue [#6620](https://github.com/harvester/harvester/issues/6620).

### Set Up a Private Container Registry and Skip Image Preloading

The system partition might still lack free space even after you remove images. To address this, set up a private container registry for both current and new images, and configure the setting [`upgrade-config`](advanced/settings.md#upgrade-config) with following value:

```
{"imagePreloadOption":{"strategy":{"type":"skip"}}, "restoreVM": false}
```

Harvester skips the upgrade image preloading process. When the deployments on the nodes are upgraded, the container runtime loads the images stored in the private container registry.

:::caution

Do not rely on the public container registry. Note any potential internet service interruptions and how close you are to reaching your [Docker Hub rate limit](https://www.docker.com/increase-rate-limits/). Failure to download any of the required images may cause the upgrade to fail and may leave the cluster in a middle state.

:::

## Certificate Expiry Check

_Available as of v1.5.0_

Harvester checks the validity period of certificates on each node. This check eliminates the possibility of certificates expiring while the upgrade is in progress. If a certificate will expire within 7 days, an error is returned. This behavior can be overridden by setting the `harvesterhci.io/minCertsExpirationInDay` annotation.

Example:

```yaml
apiVersion: harvesterhci.io/v1beta1
kind: Upgrade
metadata:
  annotations:
    harvesterhci.io/minCertsExpirationInDay: "14"
  generateName: hvst-upgrade-
  namespace: harvester-system
spec:
  version: "1.6.0"
  logEnabled: true
```

When this annotation is added to the `Upgrade` object, Harvester returns an error when it detects a certificate that will expire within 14 days.

For more information, see [auto-rotate-rke2-certs](advanced/settings.md/#auto-rotate-rke2-certs).

## VM Backup Compatibility

In Harvester v1.4.2 and later versions, you may encounter certain limitations when creating and restoring [backups that involve external storage](https://docs.harvesterhci.io/v1.4/advanced/csidriver#vm-backup-compatibility)

## Longhorn Manager Crashes Due to Backing Image Eviction

:::caution

When upgrading to Harvester **v1.4.x**, Longhorn Manager may crash if the `EvictionRequested` flag is set to `true` on any node or disk. This issue is caused by a [race condition](https://longhorn.io/kb/troubleshooting-longhorn-manager-crashes-due-to-backing-image-eviction/) between the deletion of a disk in the backing image spec and the updating of its status.

To prevent the issue from occurring, ensure that the `EvictionRequested` flag is set to `false` before you start the upgrade process.

:::

## Re-enable RKE2 ingress-nginx Admission Webhooks (CVE-2025-1974)

If you [disabled the RKE2 ingress-nginx admission webhooks](https://harvesterhci.io/kb/2025/03/25/cve-2025-1974) to mitigate [CVE-2025-1974](https://nvd.nist.gov/vuln/detail/CVE-2025-1974), you must re-enable the webhook after upgrading to Harvester v1.5.0 or later.

1. Confirm that Harvester is using nginx-ingress v1.12.1 or later.

  ```sh
  $ kubectl -n kube-system get po -l"app.kubernetes.io/name=rke2-ingress-nginx" -ojsonpath='{.items[].spec.containers[].image}'
  rancher/nginx-ingress-controller:v1.12.1-hardened1
  ```

1. Run `kubectl -n kube-system edit helmchartconfig rke2-ingress-nginx` to **remove** the following configurations from the `HelmChartConfig` resource.

   * `.spec.valuesContent.controller.admissionWebhooks.enabled: false`
   * `.spec.valuesContent.controller.extraArgs.enable-annotation-validation: true`

1. Verify that the new `.spec.ValuesContent` configuration is similar to the following example.

  ```yaml
  apiVersion: helm.cattle.io/v1
  kind: HelmChartConfig
  metadata:
    name: rke2-ingress-nginx
    namespace: kube-system
  spec:
    valuesContent: |-
      controller:
        admissionWebhooks:
          port: 8444
        extraArgs:
          default-ssl-certificate: cattle-system/tls-rancher-internal
        config:
          proxy-body-size: "0"
          proxy-request-buffering: "off"
        publishService:
          pathOverride: kube-system/ingress-expose
  ```

  :::info important
  If the `HelmChartConfig` resource contains other custom ingress-nginx configuration, you must retain them when editing the resource.
  :::

1. Exit the `kubectl edit` command execution to save the configuration.

  Harvester automatically applies the change once the content is saved.

1. Verify that the `rke2-ingress-nginx-admission` webhook configuration is re-enabled.

  ```sh
  $ kubectl get validatingwebhookconfiguration rke2-ingress-nginx-admission
  NAME                           WEBHOOKS   AGE
  rke2-ingress-nginx-admission   1          6s
  ```

1. Verify that the ingress-nginx pods are restarted successfully.

  ```sh
  kubectl -n kube-system get po -lapp.kubernetes.io/instance=rke2-ingress-nginx
  NAME                                  READY   STATUS    RESTARTS   AGE
  rke2-ingress-nginx-controller-l2cxz   1/1     Running   0          94s
  ```

## Upgrade is Stuck in the "Pre-drained" State

The upgrade process may become stuck in the "Pre-drained" state. Kubernetes is supposed to drain the workload on the node, but some factors may cause the process to stall.

![](/img/v1.2/upgrade/known_issues/3730-stuck.png)

A possible cause is processes related to orphan engines of the Longhorn Instance Manager. To determine if this applies to your situation, perform the following steps:

1. Check the name of the `instance-manager` pod on the stuck node.

    Example:

    The stuck node is `harvester-node-1`, and the name of the Instance Manager pod is `instance-manager-d80e13f520e7b952f4b7593fc1883e2a`.

    ```
    $ kubectl get pods -n longhorn-system --field-selector spec.nodeName=harvester-node-1 | grep instance-manager
    instance-manager-d80e13f520e7b952f4b7593fc1883e2a          1/1     Running   0              3d8h
    ```

1. Check the Longhorn Manager logs for informational messages.

    Example:

    ```
    $ kubectl -n longhorn-system logs daemonsets/longhorn-manager
    ...
    time="2025-01-14T00:00:01Z" level=info msg="Node instance-manager-d80e13f520e7b952f4b7593fc1883e2a is marked unschedulable but removing harvester-node-1 PDB is blocked: some volumes are still attached InstanceEngines count 1 pvc-9ae0e9a5-a630-4f0c-98cc-b14893c74f9e-e-0" func="controller.(*InstanceManagerController).syncInstanceManagerPDB" file="instance_manager_controller.go:823" controller=longhorn-instance-manager node=harvester-node-1
    ```

    The `instance-manager` pod cannot be drained because of the engine `pvc-9ae0e9a5-a630-4f0c-98cc-b14893c74f9e-e-0`.

1. Check if the engine is still running on the stuck node.

    Example:

    ```
    $ kubectl -n longhorn-system get engines.longhorn.io pvc-9ae0e9a5-a630-4f0c-98cc-b14893c74f9e-e-0 -o jsonpath='{"Current state: "}{.status.currentState}{"\nNode ID: "}{.spec.nodeID}{"\n"}'
    Current state: stopped
    Node ID:
    ```

    The issue likely exists if the output shows that the engine is not running or even the engine is not found.

1. Check if all volumes are healthy.

    ```
    kubectl get volumes -n longhorn-system -o yaml | yq '.items[] | select(.status.state == "attached")| .status.robustness'
    ```

    All volumes must be marked `healthy`. If this is not the case, please help to report the issue.

1. Remove the `instance-manager` pod's PodDisruptionBudget (PDB) .

    Example:

    ```
    kubectl delete pdb instance-manager-d80e13f520e7b952f4b7593fc1883e2a -n longhorn-system
    ```

Related issues: [#7366](https://github.com/harvester/harvester/issues/7366), [#6764](https://github.com/longhorn/longhorn/issues/6764), [#8977](https://github.com/harvester/harvester/issues/8977) and [#11605](https://github.com/longhorn/longhorn/issues/11605)