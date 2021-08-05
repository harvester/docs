---
sidebar_position: 4
keywords:
  - Harvester
  - harvester
  - Rancher
  - rancher
  - Terraform
  - terraform
Description: Harvester can be managed with Terraform and Terraformer
---

# Terraforming Harvester

## Harvester Terraform Provider
Starting from version `0.3.0`, Harvester can be managed by Terraform using the [Harvester provider](https://github.com/harvester/terraform-provider-harvester).

[Terraform](https://www.terraform.io/) is a CLI tool widely used for building Infrastructure as Code (IaC) in HashiCorp Configuration Language (HCL).

## Configuration example
For avoiding duplication, you can find out how to use the provider directly on the Terraform registry website at this [address](https://registry.terraform.io/providers/rancher/harvester/latest/docs)

## Harvester Terraformer
The current implementation of Terraform import can only import resources into the state. It does not generate the .tf configuration files.
Because of this, prior to running terraform import it is necessary to write manually a resource configuration block for the resource, to which the imported object will be mapped.
That's not very user-friendly, so we need a tool to generates tf/json and tfstate files based on existing infrastructure (reverse Terraform).
This is where [Terraformer](https://github.com/harvester/terraformer) comes in.

### Basic import example
Before getting started, make sure that the kubeconfig path file is declared by the KUBECONFIG environment variable.

```
terraformer import harvester -r image,virtualmachine
```

Once it's imported, you will be able to find out the tf files into the generated folder.
Use the tf files and tfstate files to manage the existing resources.
```
terraform init
terraform plan
terraform apply
```
