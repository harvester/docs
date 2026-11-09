---
sidebar_position: 14
sidebar_label: Resource Health
title: "Resource Health (Experimental)"
---

<head>
  <link rel="canonical" href="https://docs.harvesterhci.io/v1.10/advanced/addons/resource-health"/>
</head>

_Available as of v1.10.0_

:::note

**harvester-resource-health-controller** is an *experimental* add-on. For information about feature maturity, see [Feature Labels](../../getting-started/document-conventions.md#feature-labels).

This add-on is not included in the Harvester ISO, but you can download the manifest (`harvester-resource-health-controller-addon.yaml`) from the [Harvester **Releases** page](https://github.com/harvester/harvester/releases). The manifest source files are located in the `addons/standalone` directory of the [Harvester repository](https://github.com/harvester/harvester/tree/master/addons/standalone).

:::

The **harvester-resource-health-controller** add-on checks Harvester resources for known problems, such as an image that failed to download, a volume that cannot schedule its replicas, or a virtual machine that cannot be live migrated. The results are displayed on the **Components** tab of the **Dashboard** screen, so you can see what needs attention without inspecting each resource. You can ignore the problems that are expected in your cluster.

The add-on runs a controller in the `harvester-system` namespace. The controller reports the checks of each resource type in a `ComponentHealth` resource and counts the errors and warnings in a `HealthSummary` resource. The checks to ignore are defined in `HealthIgnoreRule` resources. All three are cluster-scoped and belong to the `health.harvesterhci.io` API group.

## Installing and Enabling the Add-on

1. Apply the add-on manifest from the Harvester release page.

    ```bash
    kubectl apply -f \
        https://github.com/harvester/harvester/releases/download/<version>/harvester-resource-health-controller-addon.yaml
    ```

    Replace `<version>` with the version of your Harvester cluster (for example, `v1.10.0`).

2. On the Harvester UI, go to **Advanced** > **Add-ons**.

3. Select **harvester-resource-health-controller**, and then select **⋮** > **Enable**.

Once the add-on is deployed, the controller creates its reports. You can list them using the command `kubectl get componenthealths`.

## Viewing the Health of Resources

When the add-on is enabled, the **Components** tab is displayed on the **Dashboard** screen, next to the **VMs**, **Hosts**, **Volumes**, and **Images** event tabs. A red alert icon on the tab indicates that at least one check reports an error. Hover over the icon to see the number of errors.

![](/img/v1.10/resource-health/components-tab.png)

The table contains one row for each component, with its severity (**Error**, **Warning**, or **Healthy**) and its number of errors and warnings. Rows are collapsed by default. To view the checks of a component, select the arrow next to the row or the name of the component. You can also select **Expand All** or **Collapse All**.

Each check includes the following information:

- **Severity**: **Error**, **Warning**, or **Info**. Checks with the **Info** severity are not counted as errors or warnings.
- **Check**: The name of the problem (for example, `ImageRetryLimitExceeded`).
- **Message**: What the check found. If the message is long, select **Show more** to read all of it.
- **Affected Resources**: The resources with the problem, grouped by type, with their number and API version. If not all resources are listed, select **+ N more** to view the rest.

You can use the **Filter** box to find checks by component, severity, check name, message, resource type, or resource name.

## Available Checks

In v1.10.0, all checks are reported by the `harvester-controller` component. Each type of resource is checked in its own `ComponentHealth` resource, which is listed in parentheses.

- **Nodes** (`harvester-controller-node`): `NodeCordoned` (Info).
- **Virtual machines** (`harvester-controller-vm`): `VMHostDeviceLiveMigrationUnsupported` and `VMNodeSelectorLiveMigrationUnsupported` (Warning).
- **Volumes** (`harvester-controller-volume`): One check for each Longhorn volume condition that is false, named after the reason, such as `ReplicaSchedulingFailure` (Warning).
- **Virtual machine images** (`harvester-controller-vmimage`): `ImageRetryLimitExceeded`, `ImageUploadFailed`, `ImageImportFailed`, and `ImageInitializationFailed` (Error); `ImageRetryingAfterFailure` and `ImageBackingImageMissing` (Warning).
- **Virtual machine backups** (`harvester-controller-vmbackup`): `VMBackupFailed` (Error).
- **Virtual machine schedules** (`harvester-controller-schedulevmbackup`): One check for each condition of a schedule that reports a problem, named after the reason (Error).
- **`VolumeRemoteBackup` resources** (`harvester-controller-volumeremotebackup`): `VolumeRemoteBackupFailed` (Error).
- **`VolumeRemoteRestore` resources** (`harvester-controller-volumeremoterestore`): `VolumeRemoteRestoreFailed` (Error).
- **Upgrades** (`harvester-controller-upgrade`): `UpgradeFailed`, `UpgradeImageNotReady`, `UpgradeRepoNotProvisioned`, `UpgradeNodesPrepareFailed`, `UpgradeNodesUpgradeFailed`, and `UpgradeSystemServicesFailed` (Error); `UpgradeLogNotReady` (Warning).
- **Upgrade logs** (`harvester-controller-upgradelog`): `UpgradeLogOperatorNotReady`, `UpgradeLogInfraNotReady`, and `UpgradeLogNotStarted` (Warning).
- **Add-ons** (`harvester-controller-addon`): `AddonOperationFailed` (Error).
- **Support bundles** (`harvester-controller-supportbundle`): `SupportBundleFailed` (Error); `SupportBundleGenerating` (Info).

## Ignoring a Check

Some problems are expected in a cluster (for example, a test volume that cannot have all of its replicas). You can ignore an entire check or some of its resources. Ignored checks and resources are not counted as errors or warnings, and they are hidden unless you select **Show ignored**.

1. On the **Components** tab, open the row of the component.

1. Locate the check, and then select **⋮** > **Create Ignore Rule**.

1. Configure the following settings:

    - **Scope**: Select **Entire check** to ignore the check, or **Selected resources** to ignore only some of its resources. All affected resources are selected by default, so remove the ones that must still be reported. Resources that are affected by the check later are still reported.
    - **Ignore for**: Select **7 days**, **30 days**, or **Forever**. The dialog shows when the rule will expire.
    - **Reason** (optional): Specify why the check is ignored.

    ![](/img/v1.10/resource-health/create-ignore-rule.png)

1. Select **Create**.

When some resources of a check are ignored, the number of hidden resources is displayed under the affected resources (for example, **+ 6 ignored**). The label of the **Show ignored** checkbox includes the number of ignored checks and resources.

The **⋮** menu only includes the actions that your account is allowed to perform on ignore rules.

### Viewing, Editing, and Deleting an Ignore Rule

When a check has an ignore rule, the **⋮** menu of the check includes **View Ignore Rule**, **Edit Ignore Rule**, and **Delete Ignore Rule**.

- **View Ignore Rule**: Displays the settings of the rule and when it expires.
- **Edit Ignore Rule**: Displays when the rule expires, with no option selected under **Ignore for**. To keep the current expiry, leave the options unselected. To extend the rule, select a duration. **Save** is enabled only after you change something.
- **Delete Ignore Rule**: Deletes the rule after you confirm. The check and its resources are reported again.

An expired rule is not deleted, but it no longer applies, so the check is reported again. To ignore the check again, edit the rule and select a duration. If you change an expired rule without selecting a duration, a warning indicates that the rule remains expired.

### Managing Ignore Rules Using kubectl

You can also create ignore rules using `kubectl`. Use the name of the `ComponentHealth` resource and the name of the check, as listed in [Available Checks](#available-checks).

```yaml
apiVersion: health.harvesterhci.io/v1beta1
kind: HealthIgnoreRule
metadata:
  name: harvester-controller-volume.replicaschedulingfailure
spec:
  componentHealth: harvester-controller-volume
  checkKey: ReplicaSchedulingFailure
  # Optional. When not set, the entire check is ignored.
  resources:
  - pvc-0569ce77-6c9c-4759-87fb-e63b9919b762
  # Optional. When not set, the rule never expires.
  expiresAt: "2026-12-01T00:00:00Z"
  # Optional.
  reason: "Test volume with a single replica"
```

The **Components** tab manages one ignore rule for each check, named `<ComponentHealth resource>.<check in lowercase>`. Rules with other names still apply, but you can only view, edit, or delete them using `kubectl`. To list all ignore rules, run the command `kubectl get healthignorerules`.
