---
sidebar_position: 1
sidebar_label: Harvester Terraform Provider
title: "Harvester Terraform Provider"
---

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