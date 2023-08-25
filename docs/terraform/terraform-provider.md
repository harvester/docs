---
sidebar_position: 1
sidebar_label: Harvester Terraform Provider
title: "Harvester Terraform Provider"
---

<head>
  <link rel="canonical" href="https://docs.harvesterhci.io/v1.1/terraform/terraform-provider"/>
</head>

## Support Matrix

| Harvester Version                                                    | Supported Terraform Provider Harvester                                                  | Supported Terraformer Harvester                                                            |
|----------------------------------------------------------------------|-----------------------------------------------------------------------------------------| ------------------------------------------------------------------------------------------ |
| [v1.2.0](https://github.com/harvester/harvester/releases/tag/v1.2.0) | [v0.6.3](https://github.com/harvester/terraform-provider-harvester/releases/tag/v0.6.3) | [v1.1.1-harvester](https://github.com/harvester/terraformer/releases/tag/v1.1.1-harvester) |
| [v1.1.2](https://github.com/harvester/harvester/releases/tag/v1.1.2) | [v0.6.3](https://github.com/harvester/terraform-provider-harvester/releases/tag/v0.6.3) | [v1.1.1-harvester](https://github.com/harvester/terraformer/releases/tag/v1.1.1-harvester) |
| [v1.1.1](https://github.com/harvester/harvester/releases/tag/v1.1.1) | [v0.6.3](https://github.com/harvester/terraform-provider-harvester/releases/tag/v0.6.3) | [v1.1.1-harvester](https://github.com/harvester/terraformer/releases/tag/v1.1.1-harvester) |
| [v1.1.0](https://github.com/harvester/harvester/releases/tag/v1.1.0) | [v0.6.3](https://github.com/harvester/terraform-provider-harvester/releases/tag/v0.6.3) | [v1.1.1-harvester](https://github.com/harvester/terraformer/releases/tag/v1.1.1-harvester) |

## Requirements

- [Terraform](https://www.terraform.io/downloads.html) >= 0.13.x
- [Go](https://go.dev/doc/install) 1.18 to build the provider plugin

## Install The Provider

copy and paste this code into your Terraform configuration. Then, run `terraform init` to initialize it.
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

## Using the provider

More details about the provider-specific configurations can be found in the [docs](https://registry.terraform.io/providers/harvester/harvester/latest/docs).

Github Repo: [https://github.com/harvester/terraform-provider-harvester](https://github.com/harvester/terraform-provider-harvester)