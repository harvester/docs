---
sidebar_position: 16
sidebar_label: Delete Protection
title: "Delete Protection"
keywords:
  - Harvester
  - harvester
  - Rancher
  - rancher
  - Virtual Machine
  - virtual machine
  - Delete Protection
  - deletion protection
description: Prevent accidental deletion of virtual machines. A protected virtual machine cannot be deleted until delete protection is disabled.
---

<head>
  <link rel="canonical" href="https://docs.harvesterhci.io/v1.9/vm/delete-protection"/>
</head>

_Available as of v1.11.0_

Delete protection prevents a virtual machine from being deleted by accident. While delete protection is enabled, Harvester rejects every request to delete the virtual machine, whether it comes from the Harvester UI, Rancher, `kubectl`, Terraform or any other API client. To delete the virtual machine, you must first disable delete protection.

Delete protection only blocks deletion. You can still start, stop, restart, migrate, edit, snapshot, back up, and clone a protected virtual machine.

## How Delete Protection Works

Delete protection is controlled by the `kubevirt.io/vm-delete-protection` label on the `VirtualMachine` object.

| Label value | Result |
| --- | --- |
| `true`, `True`, `TRUE`, `t`, `T` or `1` | Delete protection is enabled. Delete requests are rejected. |
| `false`, any other value, or no label | Delete protection is disabled. |

Harvester uses the same label as KubeVirt's delete protection feature in OpenShift Virtualization, ensuring tools and manifests that already use this label behave the same way on Harvester. KubeVirt accepts only `true` and `True`, so use `true` in manifests that must also work on other KubeVirt clusters.

When a delete request is rejected, the virtual machine and its volumes are left unchanged. Volumes that you selected for removal in the delete dialog are not deleted.

## Enable Delete Protection When Creating a Virtual Machine

1. Go to **Virtual Machines**, and then click **Create**.
2. On the **Basics** tab, select **Delete Protection**.
    When the [`default-vm-delete-protection`](../advanced/settings.md#default-vm-delete-protection) setting is `true`, this checkbox is selected by default. Clear it to create the virtual machine without delete protection.
3. Configure the remaining settings, and then click **Create**.

You can also change the **Delete Protection** checkbox later on the **Basics** tab of the **Edit Config** screen.

## Enable or Disable Delete Protection on an Existing Virtual Machine

1. Go to **Virtual Machines**.
2. Locate the virtual machine, and then select **⋮** > **Enable Delete Protection** or **⋮** > **Disable Delete Protection**.

You can select multiple virtual machines and apply either action to all of them at once.

If you try to delete a protected virtual machine from the Harvester UI, the delete dialog lists the protected virtual machines and the **Delete** button is disabled. Disable delete protection on those virtual machines first, or clear them from your selection.

## Use kubectl

Enable delete protection:

```bash
kubectl -n <namespace> label vm <vm-name> kubevirt.io/vm-delete-protection=true --overwrite
```

A delete request for a protected virtual machine fails with an error similar to the following:

```
$ kubectl -n default delete vm vm-1
Error from server (BadRequest): admission webhook "validator.harvesterhci.io" denied the request: VirtualMachine default/vm-1 has delete protection enabled; disable delete protection (set label kubevirt.io/vm-delete-protection to "false") before deleting it
```

Disable delete protection, and then delete the virtual machine:

```bash
kubectl -n <namespace> label vm <vm-name> kubevirt.io/vm-delete-protection=false --overwrite
kubectl -n <namespace> delete vm <vm-name>
```

Removing the label (`kubectl -n <namespace> label vm <vm-name> kubevirt.io/vm-delete-protection-`) also disables delete protection.

To create a protected virtual machine from a manifest, add the label to the `VirtualMachine` metadata:

```yaml
apiVersion: kubevirt.io/v1
kind: VirtualMachine
metadata:
  name: vm-1
  namespace: default
  labels:
    kubevirt.io/vm-delete-protection: "true"
spec:
  # ...
```

## Enable Delete Protection by Default

Use the [`default-vm-delete-protection`](../advanced/settings.md#default-vm-delete-protection) setting to enable delete protection on new virtual machines automatically.

1. Go to **Advanced** > **Settings**.
2. Locate `default-vm-delete-protection`, and then select **⋮** > **Edit Setting**.
3. Select **True**, and then click **Save**.

When the setting is `true`, Harvester adds the `kubevirt.io/vm-delete-protection: "true"` label to a virtual machine when it is created, provided all of the following conditions are met:

- No `kubevirt.io/vm-delete-protection` label exists on the virtual machine. An explicit `"false"` value is kept, which allows you to opt out for individual virtual machines. When you create a virtual machine in the Harvester UI, the label is always set according to the **Delete Protection** checkbox.
- Neither the Rancher Harvester node driver nor the Cluster API Provider Harvester created the virtual machine (label `harvesterhci.io/creator: docker-machine-driver-harvester`). Rancher must be able to delete these virtual machines when it scales down or deletes a guest cluster.
- It is not an internal Harvester virtual machine (label `harvesterhci.io/creator: harvester` or namespace `harvester-system`), such as the virtual machine that Harvester creates during an upgrade.

Changing this setting affects only virtual machines that are created after the setting is modified. Existing virtual machines are not modified. To protect or unprotect existing virtual machines, use the virtual machine actions in the UI or `kubectl`.

## Use Terraform

In the [Harvester Terraform provider](../terraform/terraform-provider.md), the `harvester_virtualmachine` resource supports delete protection through the `delete_protection` argument.

```hcl
resource "harvester_virtualmachine" "vm1" {
  name              = "vm-1"
  namespace         = "default"
  delete_protection = true
  # ...
}
```

When `delete_protection` is not set, Terraform keeps the value that Harvester applied, including the value set by the `default-vm-delete-protection` setting, without reporting a difference.

`terraform destroy` fails for a protected virtual machine. To destroy it, set `delete_protection = false`, run `terraform apply`, and then run `terraform destroy`.

To manage the default with Terraform, use the `harvester_setting` resource:

```hcl
resource "harvester_setting" "default_vm_delete_protection" {
  name  = "default-vm-delete-protection"
  value = "true"
}
```

## Limitations

- Delete protection prevents accidental deletion; it is not an access control mechanism. Any user who is allowed to edit a virtual machine can disable delete protection and then delete the virtual machine. Use Kubernetes RBAC to restrict who can edit virtual machines.
- A namespace that contains a protected virtual machine remains in the `Terminating` state after you delete it, because the virtual machine cannot be deleted. Disable delete protection on the virtual machine to let the namespace deletion finish.
- Delete protection applies only to `VirtualMachine` objects. Volumes attached to a virtual machine are already protected from deletion by Harvester while the virtual machine is using them.
