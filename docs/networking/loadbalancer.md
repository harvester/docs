---
sidebar_position: 4
sidebar_label: Load Balancer
title: "Load Balancer"
keywords:
- Load Balancer
---
_Available as of v1.2.0_

The Harvester load balancer (LB) is a built-in Layer 4 load balancer that distributes incoming traffic across workloads deployed on Harvester virtual machines (VMs) or guest Kubernetes clusters.

## VM load balancer

### Features
Harvester VM load balancer supports the following features:

- **Address assignment:** Get the LB IP address from a DHCP server or a pre-defined IP pool.
- **Protocol support:** Supports both TCP and UDP protocols for load balancing.
- **Multiple listeners:** Create multiple listeners to handle incoming traffic on different ports or with other protocols.
- **Label selector:** The LB uses label selectors to match the backend servers. Therefore, you must configure the corresponding labels for the backend VMs you want to add to the LB.
- **Health check:** Only send traffic to healthy backend instances.
 
### Limitations
Harvester VM load balancer has the following limitations:

- **Namespace restriction:** This restriction facilitates permission management and ensures the LB only uses VMs in the same namespace as the backend servers.
- **IPv4-only:** The LB is only compatible with IPv4 addresses for VMs.
- **Guest agent installation:** Installing the guest agent on each backend VM is required to obtain IP addresses. 
- **Connectivity Requirement:** Network connectivity must be established between backend VMs and Harvester hosts. When a VM has multiple IP addresses, the LB will select the first one as the backend address.
- **Access Restriction:** The VM LB address is exposed only within the same network as the Harvester hosts. To access the LB from outside the network, you must provide a route from outside to the LB address.

:::note

Harvester VM load balancer doesn't support Windows VMs because the guest agent is not available for Windows VMs.

:::

### How to create 
To create a new Harvester VM load balancer:
1. Go to the **Networks > Load Balancer** page and select **Create**.
1. Select the **Namespace** and specify the **Name**.
1. Go to the **Basic** tab to choose the IPAM mode, which can be **DHCP** or **IP Pool**. If you select **IP Pool**, prepare an IP pool first, specify the IP pool name, or choose **auto**. If you choose **auto**, the LB automatically selects an IP pool according to [the IP pool selection policy](./ippool.md#selection-policy).
   ![](/img/v1.2/networking/create-lb-01.png)
1. Go to the **Listeners** tab to add listeners. You must specify the **Port**, **Protocol**, and **Backend Port** for each listener.
   ![](/img/v1.2/networking/create-lb-02.png)
1. Go to the **Backend Server Selector** tab to add label selectors. To add the VM to the LB, go to the **Virtual Machine > Instance Labels** tab to add the corresponding labels to the VM.
   ![](/img/v1.2/networking/create-lb-03.png)
1. Go to the **Health Check** tab to enable health check and specify the parameters, including the **Port**, **Success Threshold**, **Failure Threshold**, **Interval**, and **Timeout** if the backend service supports health check. Refer to [Health Checks](#health-checks) for more details.
   ![](/img/v1.2/networking/create-lb-04.png)

### Health Checks
The Harvester load balancer supports TCP health checks. You can specify the parameters in the Harvester UI if you've enabled the `Health Check` option.

![](/img/v1.2/networking/health-check.png)

| Name                           | Value Type | Required | Default | Description |
|:-------------------------------|:-----------|:---|:--------|:---|
| Health Check Port              | int        | true | N/A     | Specifies the port. The prober will access the address composed of the backend server IP and the port.
| Health Check Success Threshold | int     | false | 1       | Specifies the health check success threshold. Disabled by default. The backend server will start forwarding traffic if the number of times the prober continuously detects an address successfully reaches the threshold.
| Health Check Failure Threshold | int     | false | 3       | Specifies the health check failure threshold. Disabled by default. The backend server will stop forwarding traffic if the number of health check failures reaches the threshold.
| Health Check Period            | int     | false | 5       |  Specifies the health check period in seconds. Disabled by default.
| Health Check Timeout           | int     | false | 3       | Specifies the timeout of every health check in seconds. Disabled by default.

## Guest Kubernetes cluster load balancer
In conjunction with Harvester Cloud Provider, the Harvester load balancer provides load balancing for LB services in the guest cluster.
   ![](/img/v1.2/networking/guest-kubernetes-cluster-lb.png)
When you create, update, or delete an LB service on a guest cluster with Harvester Cloud Provider, the Harvester Cloud Provider will create a Harvester LB automatically.

For more details, refer to [Harvester Cloud Provider](../rancher/cloud-provider.md).
