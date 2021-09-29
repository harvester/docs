---
sidebar_position: 2
keywords:
  - Harvester
  - harvester
  - RKE 
  - rke
  - RKE2
  - rke2
  - Harvester Cloud Provider
  - Load Balancer
Description: The Harvester cloud provider used by the guest cluster in Harvester provides a CSI interface and cloud controller manager(CCM) which implements a built-in load balancer.
---
# Harvester Cloud Provider

_Available as of v0.3.0_

The Harvester cloud provider used by the guest cluster in Harvester provides a CSI driver and cloud controller manager(CCM) which implements a built-in load balancer.
In this section, you will learn about 
- how to deploy the harvester cloud provider in RKE and RKE2
- how to configure the load balancer with the annotation of services

## Deploying
### Prerequisites
- The Kubernetes cluster is built on top of Harvester virtual machines.
- The Harvester virtual machines running as guest Kubernetes nodes are in the same namespace.

### Deploying int the RKE1 with Harvester node driver
When spinning up an RKE cluster using the Harvester node driver, you can perform two steps to deploy the Harvester cloud provider.
- Select the `External` cloud provider.

  ![](assets/rke-cloud-provider.png)
  
- Generate add-on configuration and add it to the rke YAML file.
  ```
  # depend on kubectl to operate the Harvester
  curl -sfL https://raw.githubusercontent.com/harvester/cloud-provider-harvester/master/deploy/generate_addon.sh | sh -s <serviceAccount name> <namespace>
  ```
  
### Deploying in the RKE2 with Harvester node driver
When spinning up an RKE2 cluster using the Harvester node driver, select the `Harvester` cloud provider, then the node driver will help deploy both the CSI driver and CCM automatically.

  ![](assets/rke2-cloud-provider.png)

## Load Balancer Request Parameters
When setting up a Kubernetes service of load balancer type, you can configure the load balancer with the service annotations.

### IPAM
The Harvester built-in load balancer supports both `pool` and `dhcp` mode to specify the load balancer IP by the annotation key `cloudprovider.harvesterhci.io/ipam`. The value defaults to `pool`.
- pool: You should configure an IP address pool in the Harvester in advance. The Harvester LoadBalancer controller will allocate an IP address from the IP address poll for the load balancer.

   > Refer to the [guideline](https://github.com/kube-vip/kube-vip-cloud-provider#global-and-namespace-pools) about how to configure an IP address pool.
                                                                                                                                                                                                  
- dhcp: It requires a DHCP server. The Harvester LoadBalancer controller will request an IP address from the DHCP server.

### Health Checks
The Harvester load balancer supports TCP health checks. The details of the related annotations are as following.<br>
- `cloudprovider.harvesterhci.io/healthcheck-port` specifies the port. The prober will access the address composed of the backend server IP and the port. This option is required.
- `cloudprovider.harvesterhci.io/healthcheck-success-threshold` specifies the health check success threshold. The default value is 1. If the number of times that the prober continuously successfully detects an address reaches the success threshold, the backend server can start to forward traffic.
- `cloudprovider.harvesterhci.io/healthcheck-failure-threshold` specify the success and failure threshold. The default value is 3. The backend server will stop forward traffic if the number of health check failures reaches the failure threshold. 
- `cloudprovider.harvesterhci.io/healthcheck-periodseconds` specifies the health check period. The default value is 5 seconds.
- `cloudprovider.harvesterhci.io/healthcheck-timeoutseconds` specifies the timeout of every health check. The default value is 3 seconds.
