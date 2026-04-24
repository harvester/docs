---
sidebar_position: 10
sidebar_label: Rancher RBAC
title: "Rancher RBAC"
keywords:
  - Harvester
  - harvester
  - Rancher
  - rancher
  - Rancher Integration
description: Harvester Rancher RBAC integration allows cluster administrator to assign cluster and project roles to govern team members' level of permissions appropriate for their functions and responsibilities.
---

<head>
  <link rel="canonical" href="https://docs.harvesterhci.io/v1.8/rancher/rancher-rbac"/>
</head>

:::info

Experimental feature: The Harvester Rancher RBAC integration is available with Rancher 2.14.1 as an experimental feature. It has been tested to ensure that permission access is correctly enforced at the API level. Meanwhile, the user interface (UI) is still under development and may have some issues. In particular, read-only users may see certain UI options that they don't have permissions to operate. Harvester would reject requests originated from such unauthorized usages of the UI options with "permission denied" errors.

See GitHub [issue #10241](https://github.com/harvester/harvester/issues/10241) for the list of known UI issues.

:::

Harvester provides a set of [role-based access control (RBAC) roles](https://ranchermanager.docs.rancher.com/how-to-guides/new-user-guides/authentication-permissions-and-global-configuration/manage-role-based-access-control-rbac) to regulate Rancher users' operational privileges on Harvester. A Rancher administrator can assign these roles to team members to ensure they have the appropriate level of cluster and project scoped permissions to execute their functions in a multi-tenant environment.

The new roles are defined using Rancher [role templates](https://ranchermanager.docs.rancher.com/how-to-guides/new-user-guides/authentication-permissions-and-global-configuration/manage-role-based-access-control-rbac/custom-roles). They are derived from Rancher's built-in roles and complement the existing Harvester/Rancher integration authentication and authorization model which seamlessly maps Rancher user permissions to Harvester resources.

## Installation

:::info

The Harvester Rancher RBAC integration is made available as a Helm chart with Rancher 2.14.1 and later.

:::

The Helm chart can be installed from the [charts catalog](https://ranchermanager.docs.rancher.com/how-to-guides/new-user-guides/helm-charts-in-rancher#access-charts) on Rancher:

* Click ☰ > **Cluster Management**.
* Find the `local` cluster. Click **Explore** at the end of the cluster's row.
* In the left navigation menu on the **Cluster Dashboard**, click **Apps** > **Charts**.
* Search for "Harvester RBAC".
* Follow the UI instructions to install the chart.

Once the chart is installed, the following 4 custom roles are added to Rancher:

* Cluster-scoped "View Virtualization Resources" role
* Cluster-scoped "Manage Virtualization Resources" role
* Project-scoped "View Virtualization Resources" role
* Project-scoped "Manage Virtualization Resources" role

Their permissions specification can be viewed on the **Users & Authentication** > **Role Template** page, under the **Cluster** and **Project** tabs.

## Cluster Roles Definitions

The Harvester Rancher RBAC provides the following 2 custom cluster roles:

* View Virtualization Resources
* Manage Virtualization Resources

Their default aggregated permissions do not exceed those of their parent roles. Hence, users of these roles do not have permissions to view or modify guest clusters that they don't own. They also don't have permissions to modify global settings associated to Rancher membership, node drivers configuration etc.

### Roles Assignment

The administrator can add a user as a cluster member to Harvester by following the steps below:

* Click ☰ > **Virtualization Management**.
* Find the Harvester cluster. Click **Edit Config** at the end of the cluster's row.
* Navigate to the **Member Roles** section. Click **Add**.
* Find the user from the **Member** dropdown.
* Select the desired cluster role from the **Cluster Permissions** section.
* Click **Add**.

This can also be done during the cluster import process. When you import Harvester into Rancher, you can assign cluster roles to users from the **Member Roles** section of the **Harvester Cluster:Create** page.

### Roles Definition

#### View Virtualization Resources

The "View Virtualization Resources" role provides a read-only "single pane of glass" experience to cluster operators. It inherits the built-in "View Cluster Member" role.

With this role, a user can:

* View all workload resources including virtual machines, volumes, virtual machine images and storage classes
* View all backup, restore and snapshot resources
* View all infrastructure resources such as hosts, disks and networks
* View all host devices like PCI devices, SR-IOV devices, vGPU devices
* View all projects and namespaces
* View cluster memberships
* View project memberships
* View SSH keys, templates and secrets
* View advanced cluster settings
* View cluster and workload metrics
* Generate support bundles

This role does not grant permissions to:

* Modify any of the resources described above
* Upgrade Harvester

#### Manage Virtualization Resources

The "Manage Virtualization Resources" role provides a cluster "power user" with management access to all virtualization resources on a Harvester cluster. It inherits the built-in "Cluster Member" role.

With this role, a cluster user can:

* Modify all workload resources including virtual machines, volumes, virtual machine images, storage classes
* Modify all backup, restore and snapshot resources
* Modify all infrastructure resources such as hosts, disks and networks
* Modify all host devices like PCI devices, SR-IOV devices, vGPU devices
* Modify all projects, namespaces
* Modify SSH keys, templates and secrets
* Modify advanced cluster settings
* Modify project memberships
* Modify cluster memberships
* View cluster and workload metrics
* Generate support bundles
* Upgrade the cluster

This role does not grant permissions to:

* Access or modify resources in other Harvester clusters that the user doesn't have memberships to
* Access or modify Rancher global settings associated to membership, node drivers configuration etc.

## Project Roles Definitions

The Harvester Rancher RBAC provides the following 2 custom project roles:

* View Virtualization Resources
* Manage Virtualization Resources

Their aggregated permissions do not exceed those of their parent roles. Hence, these roles do not have permissions to access resources in other projects on the same Harvester cluster. They also don't have permissions to view or modify guest clusters that the users don't own.

### Roles Assignment

The Rancher administrator can add a user as a project member to specific projects in Harvester by following the steps below:

* Click ☰ > **Virtualization Management**.
* Find the Harvester cluster. Click on the cluster name hyperlink to access the Harvester UI.
* Navigate to the **Projects/Namespaces** page.
* Find the project. Click **Edit Config** at the end of the project's row.
* Navigate to the **Members** section. Click **Add**.
* Find the user from the **Member** dropdown.
* Select the desired project role from the **Cluster Permissions** section.
* Click **Add**.

### Roles Definition

#### View Virtualization Resources

The "View Virtualization Resources" role provides a read-only "single pane of glass" experience to specific projects in Harvester. It inherits the built-in "Read-Only" role.

It offers project users permissions to:

* View all virtualization resources within the project
* View SSH keys, templates and secrets within the project
* View namespaces within the project

This role does not grant permissions to:

* Modify resources within the project
* Modify project memberships
* Modify infrastructure resources
* Modify host devices like PCI devices, SR-IOV devices, vGPU devices
* View monitoring metrics (cluster-scoped permissions required)

#### Manage Virtualization Resources

The "Manage Virtualization Resources" role inherits the permissions of the built-in "Project User" role, allowing project users to:

* Modify all resources within the designated project
* Modify SSH keys, templates and secrets within the designated project
* Modify namespaces within the project

This role does not grant permissions to:

* Modify project memberships
* Modify infrastructure resources
* Modify host devices like PCI devices, SR-IOV devices, vGPU devices
* View monitoring metrics (cluster-scoped permissions required)

## Add New Permissions

When the permissions provided by the roles are not sufficient to meet your use cases, you can extend their scope by creating new custom roles to inherit from the existing roles and add new permissions to them.

For example, Harvester does not grant non-admin user roles with permissions to create or modify logging output resources for security reasons. Only administrator user or system service accounts have the permissions to modify these resources.

To allow certain cluster operators to manage logging resources, you can create a new custom role that inherits from the "Manage Virtualization Resources" cluster role and add the necessary permissions to it:

* Click ☰ > **Users & Authentication**.
* Navigate to the **Role Template** page.
* Click on the **Cluster** tab. Click **Create Cluster Role**.
* Fill in the form with the following information:
  * Name: "Manage Logging Resources"
  * Description: "A custom cluster role to manage Harvester logging output resources"
  * Grant Resources:
    * Verbs: *
    * Resource: *
    * API Groups: logging.banzaicloud.io
  * Inherit From: "Manage Virtualization Resources"
* Click **Create**.

Assign this new role to the cluster operators who need to manage logging resources. They will have the permissions of the "Manage Virtualization Resources" role plus the additional permissions to manage logging resources.

The Harvester Rancher RBAC Helm chart also provides the following custom value settings to allow you to add new permissions to the existing roles:

* `clusterRole.virtClusterManage` - A list of additional permissions to be added to the "Manage Virtualization Resources" cluster role
* `clusterRole.virtClusterView` - A list of additional permissions to be added to the "View Virtualization Resources" cluster role
* `projectRole.virtProjectManage` - A list of additional permissions to be added to the "Manage Virtualization Resources" project role
* `projectRole.virtProjectView` - A list of additional permissions to be added to the "View Virtualization Resources" project role

For example, to allow _all_ users with the "Manage Virtualization Resources" cluster role to manage logging resources, you can add the following permissions to the `clusterRole.virtClusterManage` chart value:

```yaml
clusterRole:
  virtClusterManage:
    additionalRules:
    - apiGroups: ["logging.banzaicloud.io"]
      resources: ["*"]
      verbs: ["*"]
```

:::important

Permissions added through the Helm chart values will be applied to _all_ users of the role. Ensure that the additional permissions are appropriate for the scope of the role to avoid over-privileging.

:::

:::important

Resources in the `default` and `harvester-public` namespaces are accessible to all cluster and project members.

:::

:::warning

The permissions scope of roles are additive. If a user is assigned multiple roles, they will have the combined permissions of all their assigned roles. Therefore, when creating new custom roles, make sure to carefully review the permissions you are granting to avoid unintentional over-privileging.

:::

## Guest Cluster Permissions

By default, users only have access to guest clusters that they own. They can view and modify resources in these clusters.

A cluster user with the "Manage Virtualization Resources" cluster role can create guest clusters in any projects on the Harvester cluster. Meanwhile, a project user with the "Manage Virtualization Resources" project role can only create guest clusters in the projects that they have memberships to.

Users with the "View Virtualization Resources" cluster or project role do not have permissions to create guest clusters.

A Rancher administrator can assign users as cluster members to existing guest clusters by following the steps below:

* Click ☰ > **Cluster Management**.
* Find the guest cluster. Click **Edit Config** at the end of the cluster's row.
* Navigate to the **Member Roles** section. Click **Add**.
* Find the user from the "Member" dropdown.
* Select the desired cluster role from the "Cluster Permissions" section.
* Click **Add**.

## Support Bundle Permissions

Project users do not have permissions to generate support bundles because the controller requires access to system namespaces and the hosts in order to collect the necessary logs and diagnostics information. Granting project users with permissions to access system namespaces and hosts may lead to security risks. Therefore, only cluster users have permissions to generate support bundles.
