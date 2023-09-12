---
sidebar_position: 4
sidebar_label: Harvester Cloud Provider
title: "Harvester Cloud Provider"
keywords:
  - Harvester
  - harvester
  - RKE 
  - rke
  - RKE2
  - rke2
  - Harvester Cloud Provider
Description: The Harvester cloud provider used by the guest cluster in Harvester provides a CSI interface and cloud controller manager (CCM) which implements a built-in load balancer.
---

<head>
  <link rel="canonical" href="https://docs.harvesterhci.io/v1.1/rancher/cloud-provider"/>
</head>

[RKE1](./node/rke1-cluster.md) and [RKE2](./node/rke2-cluster.md) clusters can be provisioned in Rancher using the built-in Harvester Node Driver. Harvester provides [load balancer](#load-balancer-support) and Harvester cluster [storage passthrough](./csi-driver.md) support to the guest Kubernetes cluster.

In this page we will learn:

- How to deploy the Harvester cloud provider in both RKE1 and RKE2.
- How to use the [Harvester load balancer](#load-balancer-support).

## Deploying

### Prerequisites
- The Kubernetes cluster is built on top of Harvester virtual machines.
- The Harvester virtual machines run as guest Kubernetes nodes are in the same namespace.

### Deploying to the RKE1 Cluster with Harvester Node Driver
When spinning up an RKE cluster using the Harvester node driver, you can perform two steps to deploy the `Harvester` cloud provider:

1. Select `Harvester (Out-of-tree)` option.

    ![](/img/v1.1/rancher/rke-cloud-provider.png)
  
2. Install `Harvester Cloud Provider` from the Rancher marketplace.

    ![](/img/v1.1/rancher/install-harvester-cloud-provider.png)

  
### Deploying to the RKE2 Cluster with Harvester Node Driver

When spinning up an RKE2 cluster using the Harvester node driver, select the `Harvester` cloud provider. The node driver will then help deploy both the CSI driver and CCM automatically.

  ![](/img/v1.1/rancher/rke2-cloud-provider.png)

### Deploying to the K3s Cluster with Harvester Node Driver [Experimental]

When spinning up a K3s cluster using the Harvester node driver, you can perform the following steps to deploy the harvester cloud provider:

1. Generate and inject cloud config for `harvester-cloud-provider`

The cloud provider needs a kubeconfig file to work, a limited scoped one can be generated using the [generate_addon.sh](https://raw.githubusercontent.com/harvester/cloud-provider-harvester/master/deploy/generate_addon.sh) script available in the [harvester/cloud-provider-harvester](https://github.com/harvester/cloud-provider-harvester) repo.

:::note

The script depends on `kubectl` and `jq` to operate the Harvester cluster

The script needs access to the `Harvester Cluster` kubeconfig to work.

The namespace needs to be the namespace in which the guest cluster will be created.

:::

```
./deploy/generate_addon.sh <serviceaccount name> <namespace>
```

The output will look as follows:

```
# ./deploy/generate_addon.sh harvester-cloud-provider default
Creating target directory to hold files in ./tmp/kube...done
Creating a service account in default namespace: harvester-cloud-provider
W1104 16:10:21.234417    4319 helpers.go:663] --dry-run is deprecated and can be replaced with --dry-run=client.
serviceaccount/harvester-cloud-provider configured

Creating a role in default namespace: harvester-cloud-provider
role.rbac.authorization.k8s.io/harvester-cloud-provider unchanged

Creating a rolebinding in default namespace: harvester-cloud-provider
W1104 16:10:21.986771    4369 helpers.go:663] --dry-run is deprecated and can be replaced with --dry-run=client.
rolebinding.rbac.authorization.k8s.io/harvester-cloud-provider configured

Getting uid of service account harvester-cloud-provider on default
Service Account uid: ea951643-53d2-4ea8-a4aa-e1e72a9edc91

Creating a user token secret in default namespace: harvester-cloud-provider-token
Secret name: harvester-cloud-provider-token

Extracting ca.crt from secret...done
Getting user token from secret...done
Setting current context to: local
Cluster name: local
Endpoint: https://HARVESTER_ENDPOINT/k8s/clusters/local

Preparing k8s-harvester-cloud-provider-default-conf
Setting a cluster entry in kubeconfig...Cluster "local" set.
Setting token credentials entry in kubeconfig...User "harvester-cloud-provider-default-local" set.
Setting a context entry in kubeconfig...Context "harvester-cloud-provider-default-local" created.
Setting the current-context in the kubeconfig file...Switched to context "harvester-cloud-provider-default-local".
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

Copy and paste the output below `cloud-init user data` to **Machine Pools >Show Advanced > User Data**.

![](/img/v1.1/rancher/cloud-config-userdata.png)

3. Add the following `HelmChart` yaml of `harvester-cloud-provider` to **Cluster Configuration > Add-On Config > Additional Manifest**

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
  version: 0.1.13
  helmVersion: v3
```

![](/img/v1.1/rancher/external-cloud-provider-addon.png)

4. Disable the in-tree cloud provider by

- Click the `Edit as YAML` button

![](/img/v1.1/rancher/edit-k3s-cluster-yaml.png)
- Disable `servicelb` and Set `disable-cloud-controller: true` to disable default k3s cloud controller.
```yaml
    machineGlobalConfig:
      disable:
        - servicelb
      disable-cloud-controller: true
```

- Add `cloud-provider=external` to use harvester cloud provider.
```yaml
    machineSelectorConfig:
      - config:
          kubelet-arg:
          - cloud-provider=external
          protect-kernel-defaults: false
```

![](/img/v1.1/rancher/k3s-cluster-yaml-content-for-harvester-cloud-provider.png)

With these settings in place a K3s cluster should provision successfully while using the external cloud provider.

## Upgrade Cloud Provider

### Upgrade RKE2
The cloud provider can be upgraded by upgrading the RKE2 version. You can upgrade the RKE2 cluster via the Rancher UI as follows:
1. Click **☰ > Cluster Management**.
2. Find the guest cluster that you want to upgrade and select ⋮ **> Edit Config**.
3. Select **Kubernetes Version**.
4. Click **Save**.

### Upgrade RKE/K3s
RKE/K3s upgrade cloud provider via the Rancher UI, as follows:
1. Click **☰ > RKE/K3s Cluster > Apps > Installed Apps**.
2. Find the cloud provider chart and select ⋮ **> Edit/Upgrade**.
3. Select **Version**. 
4. Click **Next > Update**.

## Load Balancer Support
After deploying the `Harvester Cloud provider`, you can use the Kubernetes `LoadBalancer` service to expose a microservice inside the guest cluster to the external world. When you create a Kubernetes `LoadBalancer` service, a Harvester load balancer is assigned to the service and you can edit it through the `Add-on Config` in the Rancher UI.

  ![](/img/v1.1/rancher/lb-svc.png)
  

### IPAM
Harvester's built-in load balancer supports both `pool` and `dhcp` modes. You can select the mode in the Rancher UI. Harvester adds the annotation `cloudprovider.harvesterhci.io/ipam` to the service behind.

- pool: You should configure an IP address pool in Harvester's `Settings` in advance. The Harvester LoadBalancer controller will allocate an IP address from the IP address pool for the load balancer.
  
  ![](/img/v1.1/rancher/vip-pool.png) 
  
- dhcp:  A DHCP server is required. The Harvester LoadBalancer controller will request an IP address from the DHCP server.

:::note

It is not allowed to modify the IPAM mode. You need to create a new service if you want to modify the IPAM mode.

:::

### Health Checks
The Harvester load balancer supports TCP health checks. You can specify the parameters in the Rancher UI if you enable the `Health Check` option.

  ![](/img/v1.1/rancher/health-check.png)

Alternatively, you can specify the parameters by adding annotations to the service manually. The following annotations are supported:

| Annotation Key | Value Type | Required | Description |
|:---|:---|:---|:---|
| `cloudprovider.harvesterhci.io/healthcheck-port` | string | true | Specifies the port. The prober will access the address composed of the backend server IP and the port.
| `cloudprovider.harvesterhci.io/healthcheck-success-threshold` | string | false | Specifies the health check success threshold. The default value is 1. The backend server will start forwarding traffic if the number of times the prober continuously detects an address successfully reaches the threshold.
| `cloudprovider.harvesterhci.io/healthcheck-failure-threshold` | string | false | Specifies the health check failure threshold. The default value is 3. The backend server will stop forwarding traffic if the number of health check failures reaches the threshold.
| `cloudprovider.harvesterhci.io/healthcheck-periodseconds` | string | false |  Specifies the health check period. The default value is 5 seconds.
| `cloudprovider.harvesterhci.io/healthcheck-timeoutseconds` | string | false | Specifies the timeout of every health check. The default value is 3 seconds.
