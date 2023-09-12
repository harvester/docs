---
sidebar_position: 2
sidebar_label: 虚拟化管理
title: "虚拟化管理"
keywords:
  - Harvester
  - Rancher
---

借助 Rancher 的虚拟化管理功能，你可以导入和管理多个 Harvester 集群。你可以从单一管理平台进行虚拟化管理和容器管理。

此外，Harvester 利用 Rancher 的现有功能（例如[身份认证](https://ranchermanager.docs.rancher.com/v2.7/pages-for-subheaders/authentication-config)和 [RBAC 控制](https://ranchermanager.docs.rancher.com/v2.7/pages-for-subheaders/manage-role-based-access-control-rbac)）来提供完整的多租户支持。

## 导入 Harvester 集群
1. 请参阅 [Harvester 和 Rancher 支持矩阵](https://www.suse.com/suse-harvester/support-matrix/all-supported-versions/)查找所需的 Rancher 版本。你可以使用以下指南之一，在你的提供商中部署和配置 Rancher 和 Kubernetes 集群。
   - [AWS](https://ranchermanager.docs.rancher.com/v2.7/pages-for-subheaders/deploy-rancher-manager)（使用 Terraform）
   - [AWS Marketplace](https://ranchermanager.docs.rancher.com/v2.7/getting-started/quick-start-guides/deploy-rancher-manager/aws-marketplace)（使用 Amazon EKS）
   - [Azure](https://ranchermanager.docs.rancher.com/v2.7/getting-started/quick-start-guides/deploy-rancher-manager/azure)（使用 Terraform）
   - [DigitalOcean](https://ranchermanager.docs.rancher.com/v2.7/getting-started/quick-start-guides/deploy-rancher-manager/digitalocean)（使用 Terraform）
   - [GCP](https://ranchermanager.docs.rancher.com/v2.7/getting-started/quick-start-guides/deploy-rancher-manager/gcp)（使用 Terraform）
   - [Hetzner Cloud](https://ranchermanager.docs.rancher.com/v2.7/getting-started/quick-start-guides/deploy-rancher-manager/hetzner-cloud)（使用 Terraform）
   - [Vagrant](https://ranchermanager.docs.rancher.com/v2.7/getting-started/quick-start-guides/deploy-rancher-manager/vagrant)
   - [Equinix Metal](https://ranchermanager.docs.rancher.com/v2.7/getting-started/quick-start-guides/deploy-rancher-manager/equinix-metal)
   - [Outscale](https://ranchermanager.docs.rancher.com/v2.7/getting-started/quick-start-guides/deploy-rancher-manager/outscale-qs)（使用 Terraform）
   - [手动安装](https://ranchermanager.docs.rancher.com/v2.7/getting-started/quick-start-guides/deploy-rancher-manager/helm-cli)
1. Rancher Server 正常运行后，你可以登录进去，点击左上角的汉堡菜单，然后选择 **Virtualization Management** 选项卡。选择 **Import Existing**，将下游 Harvester 集群导入 Rancher Server。
   ![](/img/v1.2/rancher/vm-menu.png)
1. 指定 `Cluster Name` 并单击 **Create**。然后你将看到注册指南。请打开目标 Harvester 集群的仪表盘并按照指南进行操作。
   ![](/img/v1.2/rancher/harv-importing.png)
1. Agent 节点就绪后，你应该能够从 Rancher Server 查看和访问导入的 Harvester 集群，并管理你的虚拟机。
   ![](/img/v1.2/rancher/harv-cluster-view.png)
1. 在 Harvester UI 中，你可以单击汉堡菜单导航回 Rancher 多集群管理页面。
   ![](/img/v1.2/rancher/harv-go-back.png)

## 多租户

在 Harvester 中，我们利用了现有的 Rancher [RBAC 授权](https://ranchermanager.docs.rancher.com/v2.7/pages-for-subheaders/manage-role-based-access-control-rbac)，以便用户根据他们的集群和项目角色权限查看和管理一组资源。

在 Rancher 中，每个人都验证为一个用户来访问 Rancher。用户可以是本地用户或外部用户（如[身份验证](https://ranchermanager.docs.rancher.com/v2.7/pages-for-subheaders/authentication-config)中所述）。

用户登录到 Rancher 后，他们的授权（也称为访问权限）由全局权限以及集群和项目角色决定。

- [**全局权限**](https://ranchermanager.docs.rancher.com/v2.7/how-to-guides/new-user-guides/authentication-permissions-and-global-configuration/manage-role-based-access-control-rbac/global-permissions):
   - 在所有特定集群之外定义用户授权。
- [**集群和项目角色**](https://ranchermanager.docs.rancher.com/v2.7/how-to-guides/new-user-guides/authentication-permissions-and-global-configuration/manage-role-based-access-control-rbac/cluster-and-project-roles)：
   - 在为用户分配角色的特定集群或项目中定义用户授权。

全局权限以及集群和项目角色都是在 [Kubernetes RBAC](https://kubernetes.io/docs/reference/access-authn-authz/rbac/) 之上实现的。因此，权限和角色由 Kubernetes 执行。

- 集群所有者可以完全控制集群及其内部的所有资源，例如主机、虚拟机、卷、镜像、网络、备份和设置。
- 你可以将项目用户分配到有权限管理项目内部资源的特定项目。


### 多租户示例
以下示例解释了多租户功能的工作原理：

1. 首先，通过 Rancher `Users & Authentication` 页面添加新用户。然后点击 `Create` 添加两个新用户，分别为 `project-owner` 和 `project-readonly`。
   - `project-owner` 是有权管理特定项目（例如默认项目）的资源的用户。
   - `project-readonly` 是具有特定项目（例如默认项目）的只读权限的用户。
      ![](/img/v1.2/rancher/create-user.png)
1. 导航到 Harvester UI 后，单击其中一个导入的 Harvester 集群。
   - 点击 `Projects/Namespaces` 选项卡。
   - 选择一个项目（例如 `default`），然后单击 `Edit Config` 来将用户分配给该项目并分配适当的权限。例如，`project-owner` 用户会被分配到项目所有者角色。
      ![](/img/v1.2/rancher/add-member.png)
1. 继续将 `project-readonly` 用户添加到同一项目中，分配只读权限，然后单击**保存**。
   ![](/img/v1.2/rancher/added-user.png)
1. 打开浏览器的无痕浏览模式，并以 `project-owner` 身份登录。
1. 以 `project-owner` 用户身份登录后，单击 **Virtualization Management** 选项卡。然后，你将能看到你分配到的集群和项目。
1. 单击 **Images** 选项卡以查看之前上传到 `harvester-public` 命名空间的镜像列表。你也可以按需上传你自己的镜像。
1. 使用你上传的镜像创建一个虚拟机。
1. 使用另一个用户登录（例如 `project-readonly`），这个用户仅拥有项目的读权限。

:::note

`harvester-public` 是一个预定义的命名空间，分配给该集群的所有用户都可以访问这个命名空间。

:::

## 删除导入的 Harvester 集群
用户可以在 **Virtualization Management > Harvester Clusters** 页面，在 Rancher UI 中删除导入的 Harvester 集群。选择要删除的集群，然后单击 **Delete** 按钮，从而删除导入的 Harvester 集群。

你还需要重置关联 Harvester 集群上的 `cluster-registration-url` 设置，从而清理 Rancher Cluster Agent。

![delete-cluster](/img/v1.2/rancher/delete-harvester-cluster.png)

:::caution

不要运行 `kubectl delete -f ...` 命令来删除导入的 Harvester 集群，因为这将删除 Harvester 集群所需要的整个 `cattle-system` 命名空间。

:::
