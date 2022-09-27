---
sidebar_position: 1
sidebar_label: Harvester Terraform Provider
title: ""
---

# Harvester Terraform Provider

## Requirements

- [Terraform](https://www.terraform.io/downloads.html) >= 0.13.x
- [Go](https://golang.org/doc/install) 1.16 to build the provider plugin

## Install the Provider

### **Option 1:** Download and install the provider from the Terraform [registry](https://registry.terraform.io/providers/harvester/harvester/latest). 

To install this provider, copy and paste this code into your Terraform configuration. Then, run terraform init.

Terraform 0.13+
```text
terraform {
  required_providers {
    harvester = {
      source = "harvester/harvester"
      version = "0.2.8"
    }
  }
}

provider "harvester" {
  # Configuration options
}
```

For more details, please refer to the Harvester provider [documentation](https://registry.terraform.io/providers/harvester/harvester/latest/docs).

### **Option 2:** Build and install the provider manually.

#### **Building the provider:**

  * Clone the repository using the following command:
    ```
    git clone git@github.com:harvester/terraform-provider-harvester
    ```

  * Enter the provider directory and build the provider; this will build the provider and put the provider binary in `./bin`. Use the following command:
    ```
    cd terraform-provider-harvester
    make
    ```

#### **Installing the provider:**

  * The expected location for the Harvester provider for the target platform within one of the local search directories is as follows:
    ```
    registry.terraform.io/harvester/harvester/0.2.8/linux_amd64/terraform-provider-harvester_v0.2.8
    ```

  * The default location for locally-installed providers will be one of the following, depending on the operating system under which you are running Terraform:

    - Windows: `%APPDATA%\terraform.d\plugins`
    - All other systems: `~/.terraform.d/plugins`


  * Place the provider into the plugin directory as in the following example:
    ```
    version=0.2.8
    arch=linux_amd64
    terraform_harvester_provider_bin=./bin/terraform-provider-harvester

    terraform_harvester_provider_dir="${HOME}/.terraform.d/plugins/registry.terraform.io/harvester/harvester/${version}/${arch}/"
    mkdir -p "${terraform_harvester_provider_dir}"
    cp ${terraform_harvester_provider_bin} "${terraform_harvester_provider_dir}/terraform-provider-harvester_v${version}"}
    ```

## Using the provider
After placing the provider into your plugins directory,  run `terraform init` to initialize it.
More information about provider-specific configuration options can be found on the [docs directory](https://registry.terraform.io/providers/harvester/harvester/latest/docs)
