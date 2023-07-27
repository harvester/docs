---
id: terraform-provider
sidebar_position: 1
sidebar_label: Harvester Terraform Provider
title: "Harvester Terraform Provider"
---

## 支持矩阵

| Harvester 版本 | 支持的 Terraform Provider Harvester | 支持的 Terraformer Harvester |
|----------------------------------------------------------------------|-----------------------------------------------------------------------------------------| ------------------------------------------------------------------------------------------ |
| [v1.1.1](https://github.com/harvester/harvester/releases/tag/v1.1.1) | [v0.6.1](https://github.com/harvester/terraform-provider-harvester/releases/tag/v0.6.1) | [v1.1.0-harvester](https://github.com/harvester/terraformer/releases/tag/v1.1.0-harvester) |
| [v1.1.0](https://github.com/harvester/harvester/releases/tag/v1.1.0) | [v0.6.1](https://github.com/harvester/terraform-provider-harvester/releases/tag/v0.6.1) | [v1.1.0-harvester](https://github.com/harvester/terraformer/releases/tag/v1.1.0-harvester) |
| [v1.0.3](https://github.com/harvester/harvester/releases/tag/v1.0.3) | [v0.5.4](https://github.com/harvester/terraform-provider-harvester/releases/tag/v0.5.4) | [v1.0.1-harvester](https://github.com/harvester/terraformer/releases/tag/v1.0.1-harvester) |

## 要求

- [Terraform](https://www.terraform.io/downloads.html) 版本大于等于 0.13.x
- [Go](https://go.dev/doc/install) 1.18，用来构建 provider 插件

## 安装 Provider

将此代码复制并粘贴到您的 Terraform 配置中。然后，运行 `terraform init` 进行初始化。
```hcl
terraform {
  required_providers {
    harvester = {
      source = "harvester/harvester"
      version = "<replace to the latest release version>"
    }
  }
}

provider "harvester" {
  # Configuration options
}
```

## 使用 provider

有关 Provider 配置的更多信息，请参见[文档](https://registry.terraform.io/providers/harvester/harvester/latest/docs)。

Github 仓库：[https://github.com/harvester/terraform-provider-harvester](https://github.com/harvester/terraform-provider-harvester)