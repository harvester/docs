---
id: developer-mode-installation
title: "Developer Mode Installation"
sidebar_position: 1
sidebar_label: Developer
keywords:
  - Harvester
  - harvester
  - Rancher
  - rancher
  - Developer Mode Installation
Description: Developer mode (dev mode) is intended to be used for testing and development purposes.
---

# Developer Mode

:::caution attention

Developer mode is intended to be used for development and testing purposes. Usage of this mode in production environments is not supported.

:::

## Prerequisites

- The node has passed the [host-check](https://raw.githubusercontent.com/harvester/harvester/master/hack/host-check.sh)
- Helm 3 and Git are installed on your local machine.

## Installation of the First Node

You can install Harvester on an [RKE2](https://docs.rke2.io/) cluster using the [Helm](https://helm.sh/) CLI. For more information about installing and configuring the Harvester Helm chart, see the [readme](https://github.com/harvester/harvester/blob/master/deploy/charts/harvester/README.md).

1. Create an RKE2 configuration file.
    ```bash
    sudo mkdir -p /etc/rancher/rke2
    cat <<EOF | sudo tee /etc/rancher/rke2/config.yaml
    disable:
    - rke2-snapshot-controller
    - rke2-snapshot-controller-crd
    - rke2-snapshot-validation-webhook
    node-label:
    - harvesterhci.io/managed=true
    token: token
    cni:
    - multus
    - canal
    EOF
    ```

1. Install RKE2.
    ```bash
    curl -sfL https://get.rke2.io | sudo sh -
    sudo systemctl enable rke2-server.service --now
    ```

1. Create a kubeconfig file.
    ```bash
    mkdir -p ~/.kube
    sudo cp /etc/rancher/rke2/rke2.yaml ~/.kube/config
    sudo chown $(id -u):$(id -g) ~/.kube/config
    ```

1. Install system-upgrade-controller. This Kubernetes-native upgrade controller for nodes installs `upgrade.cattle.io/v1` CRDs.
    ```bash
    kubectl apply -f https://github.com/rancher/system-upgrade-controller/releases/download/v0.13.1/system-upgrade-controller.yaml
    ```

:::info note
If you are unable to locate the `kubectl` binary in `/usr/local/bin`, check `/var/lib/rancher/rke2/bin`.
:::

1. Create the cattle-system namespace.
    ```bash
    kubectl create ns cattle-system
    ```

1. Add the Rancher chart repository.
    ```bash
    helm repo add rancher-latest https://releases.rancher.com/server-charts/latest
    ```

1. Install the Rancher v2.7.5 chart.
    ```bash
    helm install rancher rancher-latest/rancher \
    --namespace cattle-system \
    --set tls=external \
    --set rancherImagePullPolicy=IfNotPresent \
    --set rancherImage=rancher/rancher \
    --set rancherImageTag=v2.7.5 \
    --set noDefaultAdmin=false \
    --set features="multi-cluster-management=false\,multi-cluster-management-agent=false" \
    --set useBundledSystemChart=true \
    --set bootstrapPassword=admin
    ```

1. Clone the `rancher/charts` repository.
    ```bash
    git clone https://github.com/rancher/charts -b dev-v2.7
    ```

1. Install the rancher-monitoring-crd chart.
    ```bash
    helm install rancher-monitoring-crd ./charts/charts/rancher-monitoring-crd/102.0.2+up40.1.2/
    ```

1. Create the harvester-system namespace.
    ```bash
    kubectl create ns harvester-system
    ```

1. Clone the `harvester/harvester` repository.
    ```bash
    git clone https://github.com/harvester/harvester.git
    ```

1. Install the harvester-crd chart.
    ```bash
    helm install harvester-crd ./harvester/deploy/charts/harvester-crd --namespace harvester-system
    ```

1. Install the Harvester chart using kube-vip running on a static IP.
    ```bash
    VIP_ADDRESS="replace with an IP which is allocated to any device, such as 192.168.5.131"
    helm install harvester ./harvester/deploy/charts/harvester --namespace harvester-system \
    --set harvester-node-disk-manager.enabled=true \
    --set "harvester-node-disk-manager.labelFilter={COS_*,HARV_*}" \
    --set harvester-network-controller.enabled=true \
    --set harvester-network-controller.vipEnabled=true \
    --set harvester-load-balancer.enabled=true \
    --set kube-vip.enabled=true \
    --set kube-vip-cloud-provider.enabled=true \
    --set longhorn.enabled=true \
    --set longhorn.defaultSettings.defaultDataPath=/var/lib/harvester/defaultdisk \
    --set longhorn.defaultSettings.taintToleration=kubevirt.io/drain:NoSchedule \
    --set rancherEmbedded=true \
    --set service.vip.enabled=true \
    --set service.vip.mode=static \
    --set service.vip.ip=${VIP_ADDRESS}
    ```

1. Access the Harvester UI at https://${VIP_ADDRESS}. The default password is `admin`.

## Installation of Other Nodes

1. Create an RKE2 configuration file.
    ```bash
    sudo mkdir -p /etc/rancher/rke2
    cat <<EOF | sudo tee /etc/rancher/rke2/config.yaml
    server: https://<vip address>:9345
    token: token
    EOF
    ```

1. Install the RKE2 agent.
    ```bash
    curl -sfL https://get.rke2.io | INSTALL_RKE2_TYPE="agent" sudo sh -
    sudo systemctl enable rke2-agent.service --now
    ```

## Uninstallation

```bash
sudo /usr/local/bin/rke2-uninstall.sh
```
