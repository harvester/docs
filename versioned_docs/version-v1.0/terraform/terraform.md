---
sidebar_position: 1
sidebar_label: Harvester Terraform Provider
title: ""
---

# Harvester Terraform Provider

## Requirements

- [Terraform](https://www.terraform.io/downloads.html) >= 0.13.x
- [Go](https://golang.org/doc/install) 1.18 to build the provider plugin

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