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

1. Select `Harvester(Out-of-tree)` option.

    ![](/img/v1.2/rancher/rke-cloud-provider.png)
  
2. Install `Harvester Cloud Provider` from the Rancher marketplace.

    ![](/img/v1.2/rancher/install-harvester-cloud-provider.png)

  
### Deploying to the RKE2 Cluster with Harvester Node Driver

When spinning up an RKE2 cluster using the Harvester node driver, select the `Harvester` cloud provider. The node driver will then help deploy both the CSI driver and CCM automatically.

  ![](/img/v1.2/rancher/rke2-cloud-provider.png)

### Deploying to the RKE2 Custom Cluster [Experimental]

1. Use `generate_addon.sh` to generate cloud config and place it into directory `/var/lib/rancher/rke2/etc/config-files/cloud-provider-config` on every node.

   ```
   curl -sfL https://raw.githubusercontent.com/harvester/cloud-provider-harvester/master/deploy/generate_addon.sh | bash -s <serviceaccount name> <namespace> 
   ```

  :::note

  The `generate_addon.sh` script depends on `kubectl` and `jq` to operate the Harvester cluster

  The script needs access to the `Harvester Cluster` kubeconfig to work.

  The namespace needs to be the namespace in which the guest cluster will be created.

  :::


2. Select the `Harvester` cloud provider.
     ![](/img/v1.2/rancher/custom.png)
     ![](/img/v1.2/rancher/create-custom-rke2.png)

### Deploying to the K3s Cluster with Harvester Node Driver [Experimental]

When spinning up a K3s cluster using the Harvester node driver, you can perform the following steps to deploy the harvester cloud provider:

1. Generate and inject cloud config for `harvester-cloud-provider`

```
curl -sfL https://raw.githubusercontent.com/harvester/cloud-provider-harvester/master/deploy/generate_addon.sh | bash -s <serviceaccount name> <namespace>
```

The output will look as follows:

```
# curl -sfL https://raw.githubusercontent.com/harvester/cloud-provider-harvester/master/deploy/generate_addon.sh | bash -s harvester-cloud-provider default
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

![](/img/v1.2/rancher/cloud-config-userdata.png)

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
  version: 0.2.2
  helmVersion: v3
```

![](/img/v1.2/rancher/external-cloud-provider-addon.png)

4. Disable the in-tree cloud provider by

- Click the `Edit as YAML` button

![](/img/v1.2/rancher/edit-k3s-cluster-yaml.png)
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

![](/img/v1.2/rancher/k3s-cluster-yaml-content-for-harvester-cloud-provider.png)

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

  ![](/img/v1.2/rancher/lb-svc.png)
  

### IPAM
Harvester's built-in load balancer supports both **DHCP** and **Pool** modes, and you can select the mode in the Rancher UI. Harvester adds the annotation `cloudprovider.harvesterhci.io/ipam` to the service. Additionally, Harvester cloud provider provides a special **Share IP** mode where a service will share its load balancer IP with other services.

- **DCHP:** A DHCP server is required. The Harvester load balancer controller will request an IP address from the DHCP server.

- **Pool:** You need an IP pool configured in the Harvester UI. The Harvester load balancer controller will allocate an IP for the load balancer service following [the IP pool selection policy](/networking/ippool.md/#selection-policy).

- **Share IP:** When creating a new load balancer service, you can re-utilize an existing load balancer service IP. The new service is called a secondary service, while the presently chosen service is considered the primary service. To specify the primary service in the secondary service, you can add the annotation `cloudprovider.harvesterhci.io/primary-service: $primary-service-name`.  However, there are two known limitations
  - Secondary services cannot share their IP with additional services.
  - Services sharing the same IP address must not possess duplicated ports.

:::note

It is not allowed to modify the IPAM mode. You need to create a new service if you want to modify the IPAM mode.

:::

### Health Checks
Starting with the Harvester cloud provider 0.2.2, The Harvester cloud provider doesn't provide additional parameters to support health checks because you can configure health checks in the Kubernetes service.
