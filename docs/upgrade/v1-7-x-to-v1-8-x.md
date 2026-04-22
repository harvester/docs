---
sidebar_position: 2
sidebar_label: Upgrade from v1.7.x to v1.8.x
title: "Upgrade from v1.7.x to v1.8.x"
---

<head>
  <link rel="canonical" href="https://docs.harvesterhci.io/v1.8/upgrade/v1-7-x-to-v1-8-x"/>
</head>

## General Information

An **Upgrade** button appears on the **Dashboard** screen whenever a new Harvester version that you can upgrade to becomes available. For more information, see [Start an upgrade](./automatic.md#start-an-upgrade).

Clusters running v1.7.x can upgrade to v1.8.x directly because Harvester allows a maximum of one minor version upgrade for underlying components. Harvester v1.7.0 and v1.7.1 use the same minor version of RKE2 (v1.34), while Harvester v1.8.0 uses the next minor version (v1.35). For more information, see [Upgrade paths](./automatic.md#upgrade-paths).

For information about upgrading Harvester in air-gapped environments, see [Prepare an air-gapped upgrade](./automatic.md#prepare-an-air-gapped-upgrade).

### Update Harvester UI Extension on Rancher v2.14

You must use a compatible version (v1.8.x) of the Harvester UI Extension to import Harvester v1.8.x clusters on Rancher v2.14.

1. On the Rancher UI, go to **local > Apps > Repositories**.

1. Locate the repository named **harvester**, and then select **⋮ > Refresh**.

1. Go to the **Extensions** screen.

1. Locate the extension named **Harvester**, and then click **Update**.

1. Select a compatible version, and then click **Update**.

1. Allow some time for the extension to be updated and then refresh the screen.

---

## Known Issues

### 1. Virtual Machines Fail to Migrate with "KubeVirt Not Ready" Error

After upgrading from v1.7.x to v1.8.x, virtual machines may fail to migrate with the error message **"KubeVirt is not ready"**. This issue is caused by a race condition in which a `virt-handler` pod is created with missing annotations that are required by KubeVirt to determine whether the pod is up-to-date.

![](/img/v1.8/upgrade/kubevirt-not-ready.png)

The KubeVirt operator continuously waits for the outdated `virt-handler` pod to terminate, preventing the KubeVirt custom resource from reaching the "Available" state. This blocks virtual machine operations including live migration.

:::note

This issue has been observed in three-node clusters with one witness node, but may occur in other configurations as well.

:::

#### Identifying the Issue

1. Check the KubeVirt custom resource status:

   ```bash
   kubectl get kubevirt/kubevirt -n harvester-system -o yaml | yq '.status.conditions'
   ```

   If the issue is present, you will see the `Available` condition set to `False` with the reason `DeploymentInProgress`:

   ```yaml
   - lastProbeTime: "2026-04-18T17:42:39Z"
     lastTransitionTime: "2026-04-18T17:42:39Z"
     message: Deploying version 1.7.0-150700.3.16.2 with registry registry.suse.com/suse/sles/15.7
     reason: DeploymentInProgress
     status: "False"
     type: Available
   ```

1. Check the `virt-operator` logs:

   ```bash
   kubectl logs deployment/virt-operator -n harvester-system --tail 10 | grep waiting
   ```

   You should see messages indicating that the DaemonSet is waiting for outdated pods to terminate:

   ```
   {"component":"virt-operator","level":"info","msg":"DaemonSet virt-handler waiting for out of date pods to terminate.","pos":"readycheck.go:63","timestamp":"2026-04-20T02:19:14.503468Z"}
   ```

1. Identify the problematic `virt-handler` pod by checking which pod is missing the required KubeVirt annotations:

   ```bash
   kubectl get pods -n harvester-system -l kubevirt.io=virt-handler -o json | \
     jq -r '.items[] | "\(.metadata.name):\n" + ((.metadata.annotations // {}) | to_entries | map(select(.key | startswith("kubevirt.io/install-strategy-"))) | map("  \(.key): \(.value)") | join("\n")) + "\n"'
   ```

   The output will show each pod with its KubeVirt install-strategy annotations. The problematic pod will have no annotations listed:

   ```
   virt-handler-64r9v:
     kubevirt.io/install-strategy-identifier: 9890638436fb4150e2046eff9f500bc4f18812f8
     kubevirt.io/install-strategy-registry: registry.suse.com/suse/sles/15.7
     kubevirt.io/install-strategy-version: 1.7.0-150700.3.16.2

   virt-handler-wzmdv:

   ```

   The pod with no annotations (in this example, `virt-handler-wzmdv`) is the problematic one that needs to be deleted.

#### Workaround

Delete the problematic `virt-handler` pod. Kubernetes will automatically recreate it with the correct annotations.

1. Identify the name of the problematic pod (for example, `virt-handler-wzmdv`).

1. Delete the problematic pod:

   ```bash
   kubectl delete pod virt-handler-wzmdv -n harvester-system
   ```

1. Wait for the pod to be recreated and verify that the KubeVirt custom resource is now available:

   ```bash
   kubectl get kubevirt/kubevirt -n harvester-system -o yaml | yq '.status.conditions[] | select(.type == "Available")'
   ```

   The `Available` condition should now be set to `True`:

   ```yaml
   - lastProbeTime: "2026-04-18T17:45:00Z"
     lastTransitionTime: "2026-04-18T17:45:00Z"
     message: All components ready
     reason: AllComponentsReady
     status: "True"
     type: Available
   ```

1. Verify that virtual machine operations are now working correctly.

Related issue: [#10447](https://github.com/harvester/harvester/issues/10447)
