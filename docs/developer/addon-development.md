---
id: addon-development-guide
title: "Addon Development Guide"
sidebar_position: 1
sidebar_label: Addon Development Guide
keywords:
  - Harvester
  - harvester
  - Addon Development
Description: How to write your own Harvester Addon
---

# Background
Harvester Addons provide a means to enable/disable specific Harvester or third party components based on the user requirements. 

Addons provide a wrapper around [RKE2 HelmChart CRD](https://docs.rke2.io/helm#using-the-helm-crd).


## Prerequisites

- An existing Harvester cluster

## Addon Spec

The Addon CRD supports the following fields

```yaml
apiVersion: harvesterhci.io/v1beta1
kind: Addon                         
metadata:
  name: example-addon           # name of Addon
  namespace: example-namespace  # namespace where Addon is deployed. The associated k8s components will be deployed in the same namespace as the Addon crd
  labels:                       # optional Addon labels
    addon.harvesterhci.io/experimental: "true" # predefined label used by Harvester dashboard to indicate experimental tag in UI
spec:
  enabled: false                # boolean indicating if an Addon should be enabled or disabled on definition
  repo: https://chartsrepo.com  # helm chart repo containing the helm chart being managed by Addon
  version: "v0.19.0"            # version of helm chart to be installed
  chart: mychart                # name of helm chart in the helm chart repo
  valuesContent: |-             # values.yaml that needs to be passed to the helm chart
    contents of values.yaml
    that need to be passed
    to the chart
```

## Installation

```bash
kubectl apply -f /path/to/addon.yaml
```

## Usage
Once an Addon CRD has been created, end users can toggle the `enabled` field to `true/false` to accordingly enable and disable the associated Helm Chart

## Upgrade
Changes to the `repo`, `version`, `chart` or `valueContent` field will trigger an underlying `helm upgrade` which will force the existing helm chart to be upgraded

## Uninstallation

```bash
kubectl delete -f /path/to/addon.yaml
```
