---
sidebar_position: 4
sidebar_label: Harvester Cloud Provider
title: "Harvester Cloud Provider"
keywords:
  - Harvester
  - harvester
  - RKE2
  - rke2
  - Harvester Cloud Provider
description: The Harvester cloud provider used by the guest cluster in Harvester provides a CSI interface and cloud controller manager (CCM) which implements a built-in load balancer.
---

<head>
  <link rel="canonical" href="https://docs.harvesterhci.io/v1.8/rancher/cloud-provider"/>
</head>

## Introduction

You can provision [RKE2](./node/rke2-cluster.md) clusters in Rancher using the built-in **Harvester Node Driver**. This component provides [load balancer](#load-balancer-support) and [storage passthrough](./csi-driver.md) capabilities to guest Kubernetes clusters.

In this page we will learn:

- How to deploy the **Harvester Cloud Provider** in an RKE2 cluster.
- How to use the [Harvester load balancer](#load-balancer-support).

### Main Functionalities

The **Harvester Cloud Provider** (aka Cloud Controller Manager, or CCM) implements a subset of the cloudprovider interface defined by k8s.io/cloud-provider.

- **[Node Instance Metadata Support](#node-instance-metadata-support)**: Dynamically discovers and reports node metadata (such as node names, regions, zones, and IP addresses), acting as a critical bootstrap component for the guest cluster.

- **[Load Balancer Support](#load-balancer-support)**: Automatically provisions and configures load balancers for Kubernetes `Service` objects (type: `LoadBalancer`), routing external traffic to the correct guest nodes.


:::important

Harvester-cloud-provider operates in a strictly cloud-native manner by querying and managing resources directly through the Harvester Kubernetes API server:

- **API-Driven Discovery & Deterministic Node Instance Metadata**:
    It retrieves node instance metadata (such as `ProviderID`, region/zone topology, and IP addresses) by observing the `VirtualMachineInstance` (VMI) object status directly from the Harvester API server—rather than executing host-level commands (such as `ip addr`) or guessing and hard-coding specific network interfaces (NICs) or ports. Relying on the VMI status as the single source of truth guarantees consistent and deterministic metadata reporting across all nodes, providing a reliable foundation for downstream node lifecycle synchronization and load balancer traffic routing.

- **Centralized Management**:
    Running a defined number of Pods (as a Deployment rather than a per-node DaemonSet), it centrally queries and watches metadata for every node (VM) across the guest cluster via standard K8s API interactions.

- **CCM Framework Alignment & Flag-Based Control**:
    Built directly on top of the Kubernetes Cloud Controller Manager (CCM) framework, it uses standard public flags alongside extended Harvester flags (`--flag`) to modularly toggle controllers (such as standard CCM controllers or the custom VMI controller) and fine-tune networking behavior to match complex cluster setups.

:::

### Backward Compatibility Notice

:::note

For a detailed support matrix, please refer to the **Harvester CCM & CSI Driver with RKE2 Releases** section of the official [website](https://www.suse.com/suse-harvester/support-matrix/all-supported-versions/).

:::

## Deploying

Harvester-cloud-provider is packaged as an official Helm chart and natively integrated into the Rancher & RKE2 ecosystem.

- **Automatic Deployment (RKE2)**: When provisioning an RKE2 guest cluster on **Harvester Node Driver**, `harvester-cloud-provider` is **automatically** deployed into the guest cluster during cluster initialization as an **RKE2 bootstrap chart**.

- **Manual / Custom Deployment**: You can also [manually install](#deploying-to-the-k3s-cluster-with-harvester-node-driver-experimental), upgrade, or customize the provider's configuration settings using the official Helm chart directly.

### Chart Configuration Reference

For a complete reference of all configurable options, refer to the chart's [`values.yaml`](https://github.com/harvester/charts/blob/release/charts/harvester-cloud-provider/values.yaml).

The following table lists the most common parameters:

| Parameter | Description | Default | First Available Version |
| --- | --- | --- | --- |
| `extraArgs` | Additional CLI flags passed to the cloud provider container | `[]` | 0.2.12 |
| `cloudConfigPath` | Legacy host path to the cloud-config file | `"/etc/kubernetes/cloud-config"` | 0.2.3 |
| `cloudConfigPath` | Legacy host path to the cloud-config file | `"/var/lib/rancher/rke2/etc/config-files/cloud-provider-config"` | 0.2.10 |
| `cloudConfig.secretName` | Kubernetes Secret name containing cloud-config data | `""` | 0.2.12 |
| `cloudConfig.secretKey` | Secret key containing the configuration data | `"cloud-config"` | 0.2.12 |
| `cloudConfig.hostPath` | Fallback host path for cloud-config | `"/var/lib/rancher/rke2/etc/config-files/cloud-provider-config"` | 0.2.12 |
| `global.cattle.clusterName` | Target cluster name in Rancher | `""` | 0.2.3 |
| `kube-vip.enabled` | Enable embedded `kube-vip` for LoadBalancer VIPs | `true` | 0.2.7 |
| `kube-vip.env.svc_enable` | Enable `kube-vip` Service controller | `"true"` | 0.2.7 |
| `kube-vip.env.svc_election` | Enable leader election for Services (required for `externalTrafficPolicy: Local`) | `"false"` | 0.2.12 |


#### Rancher UI Configuration Options

The Rancher UI renders dynamic configuration forms driven by the chart's `questions.yaml` file. While the form exposes the most common options directly, you can click **Edit as YAML** of the Rancher UI form view to configure any additional parameters supported in `values.yaml`.

Below are the default options rendered in the Rancher Manager UI for `harvester-cloud-provider` v0.2.12:

![Rancher UI options for Harvester Cloud Provider](/img/v1.9/rancher/hcp-ui-options.png)

### Detailed Configuration Guides

#### 1. Cluster Identifier

The `global.cattle.clusterName` parameter configures a unique cluster identifier used by `harvester-cloud-provider` to tag and track resources allocated in the underlying Harvester cluster.

```yaml
global:
  cattle:
    clusterName: "my-guest-cluster"
```

:::note

- **Rancher Provisioned Clusters**: If you deploy an RKE2 guest cluster through the Rancher Manager UI, Rancher automatically injects `global.cattle.clusterName` with the cluster's unique name.

- **Manual Chart Deployments**: If you deploy or manage the `harvester-cloud-provider` chart manually, you must explicitly set this field to a unique, unified name for your cluster.

:::

:::warning

**Resource Allocation & Leakage Risks**

If `global.cattle.clusterName` is missing, the underlying Cloud Controller Manager framework defaults to using `kubernetes` as the cluster name.

Because Harvester manages multi-tenant and multi-cluster environments, using the generic fallback name prevents Harvester from effectively identifying which guest cluster owns specific backing resources (such as Load Balancers). This can cause resource tracking conflicts, resource leaks, or unexpected resource exhaustion across clusters sharing the same Harvester installation.

:::

#### 2. Remote Harvester Cloud Configuration

Harvester-cloud-provider requires a [cloud-config](#generate-the-cloud-config-for-harvester-cloud-provider) payload to connect to the remote Harvester cluster to manage VM metadata and LoadBalancers. You can configure this using either `legacy host-path mounts` or `Kubernetes Secrets`.

##### Legacy File-Based Cloud-Config

This approach relies on mounting the configuration file directly from the host node's filesystem.


- Default Path (`cloudConfigPath`): RKE2 automatically injects the cloud configuration into `/var/lib/rancher/rke2/etc/config-files/cloud-provider-config` for the cloud-provider container to access.

- Configuration Syntax:
    ```yaml
    cloudConfigPath: "/var/lib/rancher/rke2/etc/config-files/cloud-provider-config"
    ```

- Host Path Fallback (`cloudConfig.hostPath`):

    Maintained as a deprecation placeholder. This is only evaluated if `secretName` is empty and `cloudConfigPath` is removed.

##### New Secret-Based Cloud-Config (Recommended)

__Available as of Harvester-cloud-provider v0.2.12__

This modern approach uses a Kubernetes Secret to store and manage the configuration payload natively inside the cluster.

```yaml
cloudConfig:
  secretName: ""
  secretKey: "cloud-config"
  hostPath: "/var/lib/rancher/rke2/etc/config-files/cloud-provider-config"
```

:::important

In SELinux-enabled clusters, container runtimes enforce strict security context labeling. The `harvester-cloud-provider` container is blocked from mounting or reading local host files directly under `/var/lib/rancher/rke2/...` because host path access triggers SELinux permission violations (`EACCES: Permission denied`).

Using a **Kubernetes Secret** eliminates host filesystem dependency, allowing the pod to securely mount the configuration via standard Kubernetes volume mechanisms without SELinux denial issues.

:::

Configuration Precedence

1. `cloudConfig.secretName`: Highest Priority.
    When explicitly set, it mounts a Kubernetes Secret and overrides all other settings.
    - `cloudConfig.secretKey`: The key inside the Secret containing the config payload (defaults to "cloud-config").

1. `cloudConfigPath`: Legacy Default.
    Maintained for backward compatibility. Evaluated if `secretName` is empty.

1. `cloudConfig.hostPath`: (Fallback).
    Only used as a fallback when `secretName` is empty and `cloudConfigPath` is explicitly set to "".


#### 3. Extra Arguments

`harvester-cloud-provider` implements features on top of the [Kubernetes Cloud Controller Manager](https://kubernetes.io/docs/concepts/architecture/cloud-controller/) (CCM) framework. To cooperate with the CCM framework, it supports standard upstream public flags as well as Harvester-specific extended runtime flags. The CCM framework supports a wide variety of flags to flexibly tune controller features, networking logic, and system behavior.

__Available as of Harvester-cloud-provider v0.2.12__

:::note

* **Prior to v0.2.12**: Passing custom flags via `extraArgs` directly on the `harvester-cloud-provider` Deployment or Pod spec was non-persistent and would be overwritten during guest cluster upgrades or redeployments.

* **Starting in v0.2.12**: Chart-level flag configurations are supported, ensuring all custom arguments persist across cluster upgrades and redeployments.

:::

Supported flags overview:

1. **Framework & Standard CCM Controllers Flags**:

    - `--controllers`: List of controllers to enable (e.g., cloud-node-controller, node-route-controller). Omit to disable.

    - `--v`: Logging verbosity level (e.g., --v=5 for debug logging).

2. **Harvester Extended Controllers and Flags**:

    - `--disable-vmi-controller`: Set to `true` to disable Harvester's custom VMI controller.
        - **Context**: The standard CCM framework `--controllers` flag only toggles upstream CCM controllers. Harvester introduces a dedicated VMI controller to continuously watch Harvester `VirtualMachineInstance` (VMI) resources and dynamically sync topology changes (such as region and zone updates) back to guest `Node` objects.
        - **Recommendation**: Leave this enabled (`false`) to ensure dynamic topology sync works seamlessly as detailed in [Node Metadata Reporting](#node-metadata-reporting).

    - `--show-full-help-on-error`: Set to true to print full CLI help if a flag parsing error occurs at startup.
        - **Context**: By default, the upstream CCM framework dumps several hundred lines of help text on any CLI parsing error, making startup logs noisy and hard to read. `harvester-cloud-provider` silences this verbose help by default; setting this flag to `true` restores the upstream behavior.

3. **Harvester Networking & IP Selection Flags**:

    - `--management-network`: Defines the [target VM network name](../networking/harvester-network.md#create-a-vm-network) for network selection in multi-network environments where guest cluster nodes (Harvester VMs) are attached to multiple VM networks. When set, the provider will allocate LoadBalancer IPs and report node IP addresses specifically from this network (bypassing the default "first-hit" network selection logic).

    - `--node-ip-cidr`: CIDR range for exact IP selection in multi-IP environments.

    - `--node-exclude-ip-ranges`: Comma-separated blacklist of IPs/subnets to exclude from node status reports.

    - `--disable-annotation-alpha-provided-ip-addr`: Set to true to disable legacy alpha annotations and rely solely on CIDR logic.

:::note

**Minimum Harvester version requirement**: The target Harvester cluster must be running **v1.9.0 or higher** to support the `--management-network` flag for LoadBalancer services, designating it as the load balancer target network. Earlier Harvester versions fall back to `first-fit` resolution to select the target network. For details, see [Guest Cluster Load Balancer Network Resolution](../networking/ippool.md#guest-cluster-load-balancer-network-resolution).

:::


The following examples demonstrate how to configure `extraArgs` for various deployment scenarios:

**Example 1: Disable LoadBalancer Controller**

Use this configuration if you deploy an alternative load balancer controller and need to disable the default LoadBalancer controller provided by `harvester-cloud-provider`:

```yaml
extraArgs:
  - "--controllers=cloud-node-controller,cloud-node-lifecycle-controller,node-route-controller"
```

:::info

Disabling embedded `kube-vip`:

Because `kube-vip` is embedded within `harvester-cloud-provider` to advertise LoadBalancer IP addresses, disabling the upstream service controller typically means you should also disable kube-vip in your Helm values:

If you plan to keep `kube-vip` enabled while using an alternative load balancer controller, that third-party controller must be capable of cooperating with `kube-vip`. Integrating third-party load balancer controllers with kube-vip is outside the scope of `harvester-cloud-provider`.

:::

**Example 2: Multi-Network / Multi-IP Configuration with Exclusions (Recommended)**

When guest cluster nodes are booted with multiple networks, dual-stack IP addresses, or multiple IPv4 addresses on a single interface, default `first-hit` selection logic can cause non-deterministic IP reporting.

The following scenarios demonstrate how to use `extraArgs` to handle complex networking setups:

**Example 2.1 : Multi-Network Environments (Network Selection)**

When cluster nodes are attached to multiple Harvester VM networks (e.g., `default/vlan-100` and `default/vlan-200`), `harvester-cloud-provider` might randomly select an interface. Setting `--management-network` forces the provider to only report node IPs from the specified network (e.g., `default/vlan-100`). Additionally, the provider will allocate LoadBalancer IPs from this designated network.

```yaml
extraArgs:
  - "--management-network=default/vlan-100"
```

**Example 2.2: Dual-Stack Interfaces in Single-Stack (IPv4-Only) Clusters**

When cluster nodes receive both IPv4 and IPv6 addresses, harvester-cloud-provider may default to reporting both of the IP addresses as the node's `InternalIP`. Setting `--node-ip-cidr` instructs the provider to select the matching IPv4 address as the primary `InternalIP` (relegating the IPv6 address to `ExternalIP`).

```yaml
extraArgs:
  - "--node-ip-cidr=192.168.1.0/24"
```

**Example 2.3: Excluding Secondary IP Ranges on the Same Network (e.g., Split Subnets)**

When cluster nodes have multiple IPv4 addresses configured on the same management network interface (`default/vlan-100`), such as `192.168.100.0/25` for node management and `192.168.100.128/25` reserved strictly for cluster-internal usage (like internal traffic or storage), the provider defaults to assigning the first IPv4 as `InternalIP` and automatically publishing the second IPv4 as `ExternalIP`.

To enforce your network design and prevent internal secondary IPs on the same interface from leaking into Kubernetes node status as `ExternalIP`, combine all three flags:

1. `--management-network`: Selects the target network interface.

1. `--node-ip-cidr`: Locks the primary InternalIP selection to the node management subnet range.

1. `--node-exclude-ip-ranges`: Excludes the secondary IP range from being reported as `ExternalIP`.


```yaml
extraArgs:
    - "--management-network=default/vlan-100"
    - "--node-ip-cidr=192.168.100.0/25"
    - "--node-exclude-ip-ranges=192.168.100.128/25"
```

Combined Production Example:

Combining these flags ensures strict, predictable InternalIP selection and prevents secondary networks or split subnets from leaking into ExternalIP status:

```yaml
extraArgs:
    - "--management-network=default/vlan-100"
    - "--node-ip-cidr=192.168.100.0/25"
    - "--node-exclude-ip-ranges=192.168.100.128/25"
    - "--disable-annotation-alpha-provided-ip-addr=true"
    - "--show-full-help-on-error=true"
```

:::note

A Known Limitation: Rancher Manager UI IP Synchronization:

`harvester-cloud-provider` correctly applies these network flags and updates the Kubernetes Node object status (`InternalIP / ExternalIP`). However, Rancher Manager UI does not dynamically re-sync node IP changes in its UI if they are updated after initial node registration (for more details, see [Harvester Issue 10381](https://github.com/harvester/harvester/issues/10381#issuecomment-5264412173)).

- **Example Scenario**: On an IPv4-only cluster where nodes initially report both IPv4 and IPv6 addresses as InternalIP, specifying --node-ip-cidr enables harvester-cloud-provider to successfully filter the Kubernetes Node status down to IPv4 only. However, the Rancher UI may continue displaying the unsynced IP information in its dashboard.

- **Workaround**: Set these network parameters in `extraArgs` during initial cluster bootstrapping. If applying these flags to an existing cluster, a cluster redeployment is required for Rancher UI to reflect the updated node metadata.

:::

#### 4. **Embedded Kube-vip Integration**

`harvester-cloud-provider` integrates with `kube-vip` to provision and manage Virtual IPs for Kubernetes `LoadBalancer` services.

1. **Disabling embedded kube-vip**

If you want `harvester-cloud-provider` to retain its LoadBalancer IP allocation and management logic (such as pool-based IP assignment), but prefer using another LoadBalancer tool or external BGP/ARP speaker to handle VIP traffic routing, you can disable the embedded `kube-vip` sub-chart:

```yaml
kube-vip:
  enabled: false
```

2. **Support service `externalTrafficPolicy: Local`**

By default, kube-vip runs exclusively on control-plane nodes. To support `externalTrafficPolicy: Local` for LoadBalancer services, traffic must be routed directly to nodes hosting workload pods. This requires two configuration changes:

1. Enable service leader election by setting `svc_election: "true"`.

1. Expand `kube-vip.affinity` rules so kube-vip pods run on worker nodes in addition to control-plane nodes.

```yaml
kube-vip:
  env:
    svc_election: "true"
  affinity:
    nodeAffinity:
      requiredDuringSchedulingIgnoredDuringExecution:
        nodeSelectorTerms:
        - matchExpressions:
          - key: node-role.kubernetes.io/control-plane
            operator: Exists
        - matchExpressions:
          - key: node-role.kubernetes.io/worker
            operator: Exists
```

:::important

Best Practice: Ensure the node coverage for `externalTrafficPolicy: Local`.

Deploying `kube-vip` across all nodes in the guest cluster is strongly recommended when using `externalTrafficPolicy: Local`.

Because `kube-vip` requires a co-located workload pod on the same node to elect a leader and advertise the VIP:

- **No common nodes**: If `kube-vip` runs only on `control-plane` nodes while workload pods run exclusively on `worker` nodes, `kube-vip` cannot elect a leader and will not advertise the VIP for that service.

- **Partial overlap**: If `kube-vip` runs on a subset of worker nodes (e.g., `node1`, `node2`) while workload pods run on `node2` and `node3`, only the overlapping node (`node2`) can be elected to advertise the VIP.

In both cases, the `high availability (HA)` of the LoadBalancer service is significantly compromised or lost entirely.

:::

### Prerequisites

- The guest Kubernetes cluster is built on top of Harvester virtual machines.
- The Harvester virtual machines run as guest Kubernetes nodes are in the same namespace.

:::info important

If `harvester-cloud-provider` `kube-vip` is not disabled explicitly, each Harvester VM must have the `macvlan` kernel module, which is required for the `LoadBalancer` services of the **DHCP** IPAM mode.

To check if the kernel module is available, access the VM and run the following commands:

```shell
lsmod | grep macvlan
sudo modprobe macvlan
```

The kernel module is likely to be missing if the following occur:

- `$ lsmod | grep macvlan` does not produce output.
- `$ sudo modprobe macvlan` displays an error message similar to `modprobe: FATAL: Module macvlan not found in directory /lib/modules/5.14.21-150400.22-default`.

By default, the `macvlan` kernel module is not included in SUSE Linux Enterprise 15 Service Pack 4/5/6 minimal cloud images (see [Issue #6418](https://github.com/harvester/harvester/issues/6418)). Those images contain the [`kernel-default-base`](https://software.opensuse.org/package/kernel-default-base) package, which includes only the base modules. However, the `macvlan` kernel driver becomes available when you install the `kernel-default` package.

To eliminate the need for manual intervention after the guest cluster is provisioned, build your own cloud images using the openSUSE Build Service (OBS). You must remove the `kernel-default-base` package and add the `kernel-default` package in the `Minimal.kiwi` file to ensure that the resulting cloud image includes the `macvlan` kernel module. For more information, see [Custom SUSE VM Images](../advanced/customsuseimages.md).

:::

### Deploying to the RKE2 Cluster with Harvester Node Driver

When spinning up an RKE2 cluster using the Harvester node driver, select the `Harvester` cloud provider. The node driver will then help deploy both the CSI driver and CCM automatically.

  ![](/img/v1.2/rancher/rke2-cloud-provider.png)

Starting with Rancher v2.9.0, you can configure a specific folder for cloud config data using the **Data directory configuration path** field.

  ![](/img/v1.4/rancher/rke2-cloud-provider-custom-data-dir.png)

### Manually Deploying to the RKE2 Cluster

1. [Generate the cloud-config for the Harvester Cloud Provider](#generate-the-cloud-config-for-harvester-cloud-provider).

1. On the RKE2 cluster creation page, go to the **Cluster Configuration** screen and set the value of **Cloud Provider** to **External**.

    ![](/img/v1.4/rancher/external-harvester-cloud-provider.png)

1. Copy and paste the `cloud-init user data` content to **Machine Pools** > **Show Advanced** > **User Data**.

    ![](/img/v1.2/rancher/cloud-config-userdata.png)

1. Add the `HelmChart` CRD for `harvester-cloud-provider` to **Cluster Configuration** > **Add-On Config** > **Additional Manifest**.

    You must replace `<cluster-name>` with the name of your cluster.

    ```
    apiVersion: helm.cattle.io/v1
    kind: HelmChart
    metadata:
      name: harvester-cloud-provider
      namespace: kube-system
    spec:
      targetNamespace: kube-system
      bootstrap: true
      repo: https://raw.githubusercontent.com/rancher/charts/dev-v2.9
      chart: harvester-cloud-provider
      version:  104.0.2+up0.2.6
      helmVersion: v3
      valuesContent: |-
        global:
          cattle:
            clusterName: <cluster-name>
    ```

    ![](/img/v1.2/rancher/external-cloud-provider-addon.png)

1. To create the load balancer, add the annotation `cloudprovider.harvesterhci.io/ipam: <dhcp|pool>`.

    ![](/img/v1.4/rancher/harvester-cloud-provider-loadbalancer-annotation.png)


### Deploying to the RKE2 custom cluster (experimental)

In the Rancher UI, you can create a `Custom` RKE2 cluster with **Harvester Cloud Provider**.

![](/img/v1.9/rancher/guest-cluster-custom.png)

1. [Generate the cloud-config for the Harvester Cloud Provider](#generate-the-cloud-config-for-harvester-cloud-provider).

1. Create a VM in the Harvester cluster with the following settings:

    - **Basics** tab: The minimum requirements are 2 CPUs and 4 GiB of RAM. The required disk space depends on the VM image.

      ![](/img/v1.9/rancher/custom-cluster-vm-cpu-and-ram.png)

    - **Networks** tab: Specify a network name with the format `nic-<number>`.

      ![](/img/v1.9/rancher/custom-cluster-vm-network.png)

    - **Instance Labels** tab: Add two required labels: `guestcluster.harvesterhci.io/name: <cluster-name>` and `harvesterhci.io/creator: docker-machine-driver-harvester`.

      ![](/img/v1.9/rancher/guest-cluster-vm-instance-labels.png)

    - **Advanced Options** tab: Copy and paste the content of the **Cloud Config User Data** screen.

      ![](/img/v1.9/rancher/custom-cluster-vm-user-data.png)

    :::note

    **Instance Labels** are critical for Harvester to manage resource allocation and deallocation for guest clusters. If these labels are missing, features like the guest cluster LoadBalancer in `Pool` mode may not work, as the Harvester node driver cannot identify the guest cluster.

    :::

1. On the **Basics** tab of the **Cluster Configuration** screen, select **Harvester** as the **Cloud Provider** and then select **Create** to spin up the cluster.

    ![](/img/v1.9/rancher/create-custom-rke2.png)

    Click **Add-on: Harvester Cloud Provider** to verify the `Cloud config file path`. On newer versions, this defaults to `/var/lib/rancher/rke2/etc/config-files/cloud-provider-config`. Ensure this value matches the `path` you set under `write_files:` in the previous step.

    ![](/img/v1.9/rancher/create-custom-rke2-cloud-config.png)

1. On the **Registration** tab, perform the steps required to run the RKE2 registration command on the VM.

    ![](/img/v1.9/rancher/custom-cluster-registration.png)

1. (Optional) Verify the customized cluster YAML to ensure the following fields are correctly set:
    - `.spec.rkeConfig.chartValues.harvester-cloud-provider.global.cattle.clusterName`
    - `.spec.rkeConfig.chartValues.harvester-cloud-provider.cloudConfigPath`
    If either field is missing or incorrect, update it in the YAML file.

    ![](/img/v1.9/rancher/guest-cluster-yaml.png)

### Deploying to the K3s cluster with Harvester node driver (experimental)

When spinning up a K3s cluster using the Harvester node driver, you can perform the following steps to deploy the harvester cloud provider:

1. [Generate the cloud-config for the Harvester Cloud Provider](#generate-the-cloud-config-for-harvester-cloud-provider).

2. Copy and paste the `cloud-init user data` content to **Machine Pools >Show Advanced > User Data**.
   ![](/img/v1.2/rancher/cloud-config-userdata.png)

3. Add the following `HelmChart` yaml of `harvester-cloud-provider` to **Cluster Configuration > Add-On Config > Additional Manifest**.

    ```
    apiVersion: helm.cattle.io/v1
    kind: HelmChart
    metadata:
      name: harvester-cloud-provider
      namespace: kube-system
    spec:
      targetNamespace: kube-system
      bootstrap: true
      repo: https://charts.harvesterhci.io/
      chart: harvester-cloud-provider
      version: 0.2.15
      helmVersion: v3
    ```

    ![](/img/v1.2/rancher/external-cloud-provider-addon.png)

4. Disable the `in-tree` cloud provider in the following ways:

    - Click the `Edit as YAML` button.

    ![](/img/v1.2/rancher/edit-k3s-cluster-yaml.png)
    - Disable `servicelb` and set `disable-cloud-controller: true` to disable the default K3s cloud controller.
    ```yaml
        machineGlobalConfig:
          disable:
            - servicelb
          disable-cloud-controller: true
    ```

    - Add `cloud-provider=external` to use the Harvester cloud provider.
    ```yaml
        machineSelectorConfig:
          - config:
              kubelet-arg:
              - cloud-provider=external
              protect-kernel-defaults: false
    ```

    ![](/img/v1.2/rancher/k3s-cluster-yaml-content-for-harvester-cloud-provider.png)

With these settings in place a K3s cluster should provision successfully while using the external cloud provider.


### Generate the cloud-config for Harvester Cloud Provider

The **Harvester Cloud Provider** requires a cloud-config file to connect to the remote Harvester cluster (for example, to query virtual machine information or allocate load balancers). You can generate this file using either the API endpoint or a bash script.

:::info important

Support for the bash script method will be deprecated in a future release. Use the API endpoint to ensure long-term compatibility.

:::

<Tabs>
<TabItem value="ui" label="API" default>

_Available as of v1.9.0_

You can send `POST` and `GET` requests to the Harvester API endpoint `/v1/harvester/kubeconfig` using an admin bearer token.

#### Request Parameters

| Parameter | Type | Description | Example |
| :--- | :--- | :--- | :--- |
| `namespace` | String | Target Kubernetes namespace | `gc-test` |
| `serviceAccountName` | String | Service account name | `gc4` |
| `clusterRoleName` | String | ClusterRole to bind to the service account (optional) | `harvesterhci.io:cloudprovider` (only supported value) |
| `outputFormat` | String | Output format | `yaml` (only supported value) |

:::note

- `clusterRoleName`: Harvester uses `harvesterhci.io:cloudprovider` by default if this field is left empty.
- `outputFormat`: Setting this to `yaml` retrieves the cloud-init user data. Specifying any other value or leaving the field empty returns the raw kubeconfig file.

:::

#### `POST` Request

Add `-k`/`--insecure` to the `curl` command only if your Harvester endpoint uses a self-signed certificate.

```bash
 curl -X POST \
  -H "Authorization: Bearer token-abcde:..." \
  -H "Content-Type: application/json" \
  -d '{"namespace": "gc-test", "serviceAccountName": "gc4", "outputFormat": "yaml"}' \
  "https://<vip>/v1/harvester/kubeconfig"
```

#### `POST` Response

```yaml
########## cloud-init user data ############
write_files:
- encoding: b64
  content: <BASE64_CONTENT>
  owner: root:root
  path: /etc/kubernetes/cloud-config
  permissions: '0644'
- encoding: b64
  content: <BASE64_CONTENT>
  owner: root:root
  path: /var/lib/rancher/rke2/etc/config-files/cloud-provider-config
  permissions: '0644'
```

#### `GET` Request

Use a single ampersand (`&`) to separate query parameters.

```bash
curl -X GET \
  -H "Authorization: Bearer token-abcde:..." \
  "https://<vip>/v1/harvester/kubeconfig?namespace=gc-test&serviceAccountName=gc4&outputFormat=yaml"
```

#### `GET` Response

The API response automatically includes cloud-init configurations for both legacy and new paths. Before applying this configuration, remove the block that does not apply to your environment.

```yaml
########## cloud-init user data ############
write_files:
- encoding: b64
  content: <BASE64_CONTENT>
  owner: root:root
  path: /etc/kubernetes/cloud-config
  permissions: '0644'
- encoding: b64
  content: <BASE64_CONTENT>
  owner: root:root
  path: /var/lib/rancher/rke2/etc/config-files/cloud-provider-config
  permissions: '0644'
```

</TabItem>
<TabItem value="api" label="Bash Script">

1. Generate the cloud-config data using the `generate_addon.sh` script.

    ```bash
    curl -sfL https://raw.githubusercontent.com/harvester/cloud-provider-harvester/master/deploy/generate_addon.sh | bash -s <serviceaccount name> <namespace>
    ```

1. Copy the generated data to every node.

    - Legacy path: `/etc/kubernetes/cloud-config`
    - RKE2 default path (v1.9.0 and later): `/var/lib/rancher/rke2/etc/config-files/cloud-provider-config`

:::note

The script requires `kubectl` and `jq` to interact with the Harvester cluster, and functions only when given access to the Harvester cluster's kubeconfig file.

You can find the kubeconfig file on any Harvester management node at the following path: `/etc/rancher/rke2/rke2.yaml`. Before using the kubeconfig file, you must replace the IP address in the `server: field` with your cluster's VIP address.

Example of content:

```yaml
apiVersion: v1
clusters:
- cluster:
    certificate-authority-data: <redacted>
    server: https://127.0.0.1:6443
  name: default
# ...
```

You must specify the namespace in which the guest cluster will be created.

:::

Example of output:

```yaml
########## cloud config ############
apiVersion: v1
clusters:
- cluster:
    certificate-authority-data: <CACERT>
    server: https://HARVESTER-ENDPOINT/k8s/clusters/local
  name: local
contexts:
- context:
    cluster: local
    namespace: default
    user: harvester-cloud-provider-default-local
  name: harvester-cloud-provider-default-local
current-context: harvester-cloud-provider-default-local
kind: Config
preferences: {}
users:
- name: harvester-cloud-provider-default-local
  user:
    token: <TOKEN>

########## cloud-init user data ############
write_files:
- encoding: b64
  content: <CONTENT>
  owner: root:root
  path: /etc/kubernetes/cloud-config
  permissions: '0644'
```

:::note

In newer RKE2 versions (such as v1.33.11), the default cloud-config path is `/var/lib/rancher/rke2/etc/config-files/cloud-provider-config`. You must ensure that the `cloudConfigPath` value matches the exact file location you write to.

Depending on your setup, choose one of the following approaches:

- **Use the RKE2 default path**: In the `write_files` entry in your cloud-init configuration, change the value of `path` to `/var/lib/rancher/rke2/etc/config-files/cloud-provider-config`.

- **Keep the legacy path**: In the Rancher UI, set `.spec.rkeConfig.chartValues.harvester-cloud-provider.cloudConfigPath` to `/etc/kubernetes/cloud-config`.

:::

</TabItem>
</Tabs>

## Upgrade Cloud Provider

### Upgrade RKE2
The cloud provider can be upgraded by upgrading the RKE2 version. You can upgrade the RKE2 cluster via the Rancher UI as follows:
1. Click **☰ > Cluster Management**.
2. Find the guest cluster that you want to upgrade and select ⋮ **> Edit Config**.
3. Select **Kubernetes Version**.
4. Click **Save**.

### Upgrade K3s
K3s upgrade cloud provider via the Rancher UI, as follows:
1. Click **☰ > K3s Cluster > Apps > Installed Apps**.
2. Find the cloud provider chart and select ⋮ **> Edit/Upgrade**.
3. Select **Version**.
4. Click **Next > Update**.

:::info

The upgrade process for a [single-node guest cluster](../advanced/singlenodeclusters) may stall when the new `harvester-cloud-provider` pod is stuck in the *Pending* state. This issue is caused by a section in the `harvester-cloud-provider` deployment that describes the rolling update strategy. Specifically, the default value conflicts with the `podAntiAffinity` configuration in single-node clusters.

For more information, see [this GitHub issue comment](https://github.com/harvester/harvester/issues/5348#issuecomment-2055453709). To address the issue, manually delete the old `harvester-cloud-provider` pod. You might need to do this multiple times until the new pod can be successfully scheduled.

:::

## Node Instance Metadata Support

When registering and updating guest nodes, `harvester-cloud-provider` queries the Harvester API server to inspect the underlying `VirtualMachine` (VM) and `VirtualMachineInstance` (VMI) objects. It constructs the standard `cloudprovider.InstanceMetadata` struct by targeting three key metadata elements from the VMI:

### 1. Provider Identifier (`ProviderID`)

Sets a globally unique identifier for the guest node based on the underlying Harvester VM's UID:

* **Format**: `harvester://<vm.UID>`
* **Purpose**: Allows Kubernetes to deterministically map the guest `Node` object back to its physical Harvester VM resource.

### 2. Topology Metadata (`Region` & `Zone`)

Reads topology annotations set on the `VMI` object to establish placement context for Kubernetes scheduling:

* **Region**: Extracted from the `topology.kubernetes.io/region` annotation.
* **Zone**: Extracted from the `topology.kubernetes.io/zone` annotation.
* **Fallback**: If the VMI lacks topology annotations, `ProviderID` is still reported while region/zone fields remain unset.

### 3. Node Addresses (`NodeAddresses`)

Constructs the complete address list (`[]v1.NodeAddress`) for the guest node by combining hostname mapping with VMI status discovery:

- **Host Name (`NodeHostName`)**:
    Sets `v1.NodeHostName` directly using the target `node.Name`.

- **IP Discovery (`InternalIP` & `ExternalIP`)**:
    Evaluates active network interface IPs reported directly in the VMI status alongside provider configuration—eliminating the need for host-level probes or hardcoded NIC assumptions.

- **Deterministic Mapping**:
    Assigns detected IPs to `InternalIP` and `ExternalIP` types, providing a consistent source of truth for downstream intra-cluster networking and load balancer traffic routing.

:::note
To customize or filter which VM network interfaces and IP ranges are used when reporting node addresses, see [#### 3. Extra Arguments (extraArgs)](#3-extra-arguments).
:::

## Load Balancer Support
Once you've deployed the Harvester cloud provider, you can leverage the Kubernetes `LoadBalancer` service to expose a microservice within the guest cluster to the external world. Creating a Kubernetes `LoadBalancer` service assigns a dedicated Harvester load balancer to the service, and you can make adjustments through the `Add-on Config` within the Rancher UI.

![](/img/v1.2/rancher/lb-svc.png)


### IPAM
Harvester's built-in load balancer offers both **DHCP** and **Pool** modes, and you can configure it by adding the annotation `cloudprovider.harvesterhci.io/ipam: $mode` to its corresponding service. Starting from Harvester cloud provider >= v0.2.0, it also introduces a unique **Share IP** mode. A service shares its load balancer IP with other services in this mode.

- **DHCP:** A DHCP server is required. The Harvester load balancer will request an IP address from the DHCP server.

    Starting with **Rancher v2.15.1**, you can select a VM network when creating a `LoadBalancer` service using the UI. This enables explicit binding of the virtual IP to the correct network interface. If you do not select a VM network, the load balancer uses the default interface.

    On earlier Rancher versions (v2.12.x, v2.13.x, and v2.14.x), you can achieve the same result by adding the following annotations to the `Service` manifest:

    - `cloudprovider.harvesterhci.io/ipam: "dhcp"`
    - `cloudprovider.harvesterhci.io/network: "default/mgmt-vlan1"`

    ![](../../static/img/v1.9/rancher/guest-cluster-load-balancer-dhcp.png)

- **Pool:** A pre-configured [IP pool](../networking/ippool.md) is required. The Harvester load balancer controller allocates an IP for the load balancer service according to the [IP pool selection policy](../networking/ippool.md#selection-policy). You can create IP pools using either the [Harvester UI](../networking/ippool.md#how-to-create) or the [Rancher UI](../networking/ippool.md#create-ip-pool-from-rancher-manager-ui). For more information, see [Best Practices](../networking/ippool.md#best-practice).

    Starting with **Rancher v2.15.1**, you can select a VM network when creating a `LoadBalancer` service using the UI. This enables explicit binding of the load balancer to the correct network interface. If you do not select a VM network(specifically, the `cloudprovider.harvesterhci.io/network` is empty), the load balancer controller automatically determines the network to be used.

    On earlier Rancher versions (v2.12.x, v2.13.x, and v2.14.x), you can achieve the same result by adding the following annotations to the `Service` manifest:

    - `cloudprovider.harvesterhci.io/ipam: "ippool"`
    - `cloudprovider.harvesterhci.io/network: "default/mgmt-vlan1"`

    :::note

    The remote Harvester version needs to be v1.9.0 or higher to support the customized `cloudprovider.harvesterhci.io/network` usage on Harvester-cloud-provider.

    :::

    When a guest cluster uses multiple networks, or when multiple guest clusters with distinct networks share a single namespace, configuring the correct network parameters is critical. For details on how the system automatically determines the network, refer to [Guest Cluster Load Balancer Network Resolution](../networking/ippool.md#guest-cluster-load-balancer-network-resolution).

    ![](../../static/img/v1.9/rancher/guest-cluster-load-balancer-pool.png)

- **Share IP:** When creating a new load balancer service, you can re-utilize an existing load balancer service IP. The new service is referred to as a secondary service, while the currently chosen service is the primary one. To specify the primary service in the secondary service, you can add the annotation `cloudprovider.harvesterhci.io/primary-service: $primary-service-name`.  However, there are two known limitations:
  - Services that share the same IP address can't use the same port.
  - Secondary services cannot share their IP with additional services.

:::note

- Modifying the `IPAM` mode isn't allowed. You must create a new service if you intend to change the `IPAM` mode.

- Refer to [Guest Cluster Loadbalancer IP is not reachable](../troubleshooting/rancher.md#guest-cluster-loadbalancer-ip-is-not-reachable).

:::

#### Asymmetric Network Topology

The network dropdown list on the UI displays only networks assigned to the _exact same interface position across all cluster nodes_.

Example:

| Network-Interface Mapping | UI Behavior | Node A | Node B | Displayed Networks |
| :--- | :--- | :--- | :--- | :--- |
| Identical mapping across all nodes | All networks are displayed | `enp1s0` → `mgmt`<br/>`enp2s0` → `net-101` | `enp1s0` → `mgmt`<br/>`enp2s0` → `net-101` | `mgmt` and `net-101` |
| Network in different interface positions across nodes | Network is hidden | `enp1s0` → `mgmt`<br/>`enp2s0` → `net-101` | `enp1s0` → `mgmt`<br/>`enp2s0` → `net-102`<br/>`enp3s0` → `net-101` | `mgmt` |
| Network absent on some nodes | Network is hidden | `enp1s0` → `mgmt` | `enp1s0` → `mgmt`<br/>`enp2s0` → `net-101` | `mgmt` |
| Swapped interface mapping order | Only matching networks are displayed | `enp1s0` → `mgmt`<br/>`enp2s0` → `net-101`<br/>`enp3s0` → `net-102` | `enp1s0` → `mgmt`<br/>`enp2s0` → `net-102`<br/>`enp3s0` → `net-101` | `mgmt` |

:::tip

If VM network interfaces are attached in different orders across nodes, reconfigure the network interface order in the machine pool settings to allow Rancher and RKE2 to reprovision the guest cluster virtual machines.

:::

### Limitations

- **Default load balancer provider**: `kube-vip` is selected by default on the UI. If you disable `kube-vip` and use an alternative provider, refer to that provider's documentation for configuration instructions.

- **Pre-condition for secondary network load balancing**: The secondary network interface of each guest cluster node must have a valid IP address and route. Otherwise, the load balancer cannot route traffic. Verifying this interface configuration should be the first step when troubleshooting issues related to secondary network load balancers.

- **Load balancer network changes**: Delete and recreate the load balancer service if you require changes to the load balancer network. Modifying the network annotation on an existing service may cause unexpected behavior and is not supported.

- **Incorrect network annotation**: The load balancer may fail to obtain an IP address or become unreachable if you directly configure the `cloudprovider.harvesterhci.io/network` annotation and specify a network that is either invalid or exhibits an [asymmetric topology](#asymmetric-network-topology). Because webhook validation is not performed on this annotation, select the target network on the UI instead.

**Secondary network load balancer traffic isolation**: Incoming traffic arrives on the secondary network interface and undergoes NAT to the pod network. Consequently, only workloads listening on the pod network can receive load balancer traffic. Workloads configured to listen exclusively on the secondary network interface cannot. Full traffic isolation is currently unsupported.

### Health checks

Beginning with Harvester cloud provider v0.2.0, additional health checks of the `LoadBalancer` service within the guest Kubernetes cluster are no longer necessary. Instead, you can configure [liveness](https://kubernetes.io/docs/tasks/configure-pod-container/configure-liveness-readiness-startup-probes/#define-a-tcp-liveness-probe) and [readiness](https://kubernetes.io/docs/tasks/configure-pod-container/configure-liveness-readiness-startup-probes/#define-readiness-probes) probes for your workloads. Consequently, any unavailable pods will be automatically removed from the load balancer endpoints to achieve the same desired outcome.

### Automatic Cleanup

_Available as of Harvester v1.8.0_

When a guest cluster with the `harvester-cloud-provider` enabled is deleted, Harvester automatically performs a cleanup of all associated `LoadBalancer` resources on the host cluster.

Key benefits:

- Resource Management: Prevents "orphaned" LoadBalancers from consuming IP addresses after a guest cluster is gone.

- Zero Manual Intervention: The lifecycle of the LoadBalancer is tied directly to the lifecycle of the guest Kubernetes cluster.

## Known Issue: Stale Harvester CloudCredentials after re-registering cluster

If a Harvester cluster is removed from Rancher and later re-registered, Rancher may retain stale Harvester CloudCredentials that reference the previous management cluster ID.

This can cause downstream cluster provisioning (for example, RKE2 or K3s clusters) to fail with errors such as:

  ```bash
    clusters.management.cattle.io "<old-cluster-id>" not found
  ```

![](/img/v1.5/rancher/provisioning-cluster-after-removing-harvester-failure.png)

The existing CloudCredential still references the old Harvester cluster ID, which no longer exists after re-registration. 

### Workaround

1. Go to **Rancher > Cluster Management > Cloud Credentials**.
2. Delete the old Harvester CloudCredential associated with the removed cluster.
3. Create a new Harvester CloudCredential.
4. Retry provisioning the downstream cluster.

Related issue: [#53642](https://github.com/rancher/rancher/issues/53642)