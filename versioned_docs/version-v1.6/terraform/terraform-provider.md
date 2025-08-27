---
id: terraform-provider
sidebar_position: 1
sidebar_label: Harvester Terraform Provider
title: "Harvester Terraform Provider"
---

<head>
  <link rel="canonical" href="https://docs.harvesterhci.io/v1.6/terraform/terraform-provider"/>
</head>

## Support Matrix

| Harvester Version                                                    | Supported Terraform Provider Harvester                                                  | Supported Terraformer Harvester                                                            |
|----------------------------------------------------------------------|-----------------------------------------------------------------------------------------| ------------------------------------------------------------------------------------------ |
| [v1.4.2](https://github.com/harvester/harvester/releases/tag/v1.4.2) | [v0.6.7](https://github.com/harvester/terraform-provider-harvester/releases/tag/v0.6.7), [v0.6.6](https://github.com/harvester/terraform-provider-harvester/releases/tag/v0.6.6), [v0.6.5](https://github.com/harvester/terraform-provider-harvester/releases/tag/v0.6.5) | [v1.1.1-harvester](https://github.com/harvester/terraformer/releases/tag/v1.1.1-harvester) |
| [v1.4.1](https://github.com/harvester/harvester/releases/tag/v1.4.1) | [v0.6.7](https://github.com/harvester/terraform-provider-harvester/releases/tag/v0.6.7), [v0.6.6](https://github.com/harvester/terraform-provider-harvester/releases/tag/v0.6.6), [v0.6.5](https://github.com/harvester/terraform-provider-harvester/releases/tag/v0.6.5) | [v1.1.1-harvester](https://github.com/harvester/terraformer/releases/tag/v1.1.1-harvester) |
| [v1.4.0](https://github.com/harvester/harvester/releases/tag/v1.4.0) | [v0.6.7](https://github.com/harvester/terraform-provider-harvester/releases/tag/v0.6.7), [v0.6.6](https://github.com/harvester/terraform-provider-harvester/releases/tag/v0.6.6), [v0.6.5](https://github.com/harvester/terraform-provider-harvester/releases/tag/v0.6.5) | [v1.1.1-harvester](https://github.com/harvester/terraformer/releases/tag/v1.1.1-harvester) |
| [v1.3.2](https://github.com/harvester/harvester/releases/tag/v1.3.2) | [v0.6.4](https://github.com/harvester/terraform-provider-harvester/releases/tag/v0.6.4) | [v1.1.1-harvester](https://github.com/harvester/terraformer/releases/tag/v1.1.1-harvester) |
| [v1.3.1](https://github.com/harvester/harvester/releases/tag/v1.3.1) | [v0.6.4](https://github.com/harvester/terraform-provider-harvester/releases/tag/v0.6.4) | [v1.1.1-harvester](https://github.com/harvester/terraformer/releases/tag/v1.1.1-harvester) |
| [v1.3.0](https://github.com/harvester/harvester/releases/tag/v1.3.0) | [v0.6.4](https://github.com/harvester/terraform-provider-harvester/releases/tag/v0.6.4) | [v1.1.1-harvester](https://github.com/harvester/terraformer/releases/tag/v1.1.1-harvester) |
| [v1.2.2](https://github.com/harvester/harvester/releases/tag/v1.2.2) | [v0.6.4](https://github.com/harvester/terraform-provider-harvester/releases/tag/v0.6.4) | [v1.1.1-harvester](https://github.com/harvester/terraformer/releases/tag/v1.1.1-harvester) |
| [v1.2.1](https://github.com/harvester/harvester/releases/tag/v1.2.1) | [v0.6.4](https://github.com/harvester/terraform-provider-harvester/releases/tag/v0.6.4) | [v1.1.1-harvester](https://github.com/harvester/terraformer/releases/tag/v1.1.1-harvester) |
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

### Resource Timeouts

Several resource-related operations (for example, creating a new image and
downloading its content from the internet) may take some time to complete.
Depending on the host hardware and other factors, these operations may exceed
default timeout settings and cause errors. To modify timeout values for such
operations, define a timeout block in the resource.

```hcl
resource "harvester_image" "opensuse154" {
  name      = "opensuse154"
  namespace = "harvester-public"

  display_name = "openSUSE-Leap-15.4.x86_64-NoCloud.qcow2"
  source_type  = "download"
  url          = "https://downloadcontent-us1.opensuse.org/repositories/Cloud:/Images:/Leap_15.4/images/openSUSE-Leap-15.4.x86_64-NoCloud.qcow2"

  timeouts {
    create = "15m"
    update = "15m"
    delete = "1m"
  }
}
```
