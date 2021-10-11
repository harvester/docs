---
keywords:
- Harvester
- Rancher
- RBAC
- Authentication
- Authorization
---

## Multi-tenancy

In single Harvester cluster view, multi-tenancy is not supported. There's only one admin user.
In multi-cluster view, multi-tenancy is supported by Rancher authentication and authorization system.

> Prerequisites
> - Harvester clusters are imported to and managed by Rancher

### Managing Users & Authentication

1. In Rancher UI, click **☰ > Users & Authentication**.
1. Click **Auth Providers**. By default, local auth is enabled. You can configure additional external auth providers.
1. Click **Users**. As an admin, you can create and delete users, reset password and change global permissions for users.

For more details, please refer to the Rancher [authentication docs](https://rancher.com/docs/rancher/v2.6/en/admin-settings/authentication/).

### Grant User Permissions

#### Grant access to a Harvester cluster
1. In Rancher UI, click **☰ > Virtualization Management**.
1. Click the name of the cluster you want to access.
1. Click **RBAC > Cluster Members**.
1. Click **Add**.
1. Click **Select Member** and select the user you want to grant permissions.
1. Choose the **Cluster Permissions** for the user.
1. Click **Create**.

#### Grant access to a project.

1. In Rancher UI, click **☰ > Virtualization Management**.
1. Click the name of the cluster you want to access.
1. Click **Projects/Namespaces**.
1. Find the project you want to add members to and click **⋮ > Edit Config**.
1. Click **Add** in the **Members** tab.
1. Click **Select Member** and select the user you want to grant permissions.
1. Choose the **Project Permissions** for the user.
1. Click **Add**.
