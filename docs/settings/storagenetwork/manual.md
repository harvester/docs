---
sidebar_position: 1
sidebar_label: Configuring Storage Network Manually
title: ""
---

# Configuring Storage Network Manually 

This page describes how to manually configure Longhorn Storage Network in Harvester.

## Prerequisites

1. Make sure that Harvester version is v1.1.0 or above.
2. Prepare physical interface networks for the storage network, and ensure the VLAN configuration on the external switch side is correct.
3. Create Network Config in Web UI with the physical interfaces that you expected for the storage network, and remember the `Cluster Network` field for the next step.
4. Prepare an IPv4 subnet range in the CIDR format. **IP Range** should be in IPv4 CIDR format and 4 times the number of your cluster nodes. In addition, this IP range should not overlap with Kubernetes Cluster IPs or Pods IPs.

### Example Configuration

In the following steps, we will use the configurations below as an example.

**Network Config**:
- **ClusterNetwork**: test
- **NICs**:
  - eth2
  - eth3

**VLANs:**
- **Namespace**: default
- **Name**: storagenetwork-1
- **VLAN ID**: 100

**IP Range**:
- 192.168.0.0/24

## Configuration

### Step 1: Create VLANs

- Create Cluster Networks/Configs in Web UI.
    - Choose **Networks > Cluster Networks/Configs** in the left sidebar.
- Create VLANs via kubectl command below with the desired namespace, name, and VLAN ID, and take note of the namespace and name for further configurations.
- Specify the name in the **Name** field.
- Specify the namespace in the **Namespace** field.
- Set **Bridge** to the ClusterNetwork name with the `-br` suffix.
- Set **IP Range** to `ipam.range`.

:::caution

Don't remove the VLAN if Longhorn storage-network is still using that VLAN.

:::

```yaml
cat <<EOF | kubectl apply -f -
apiVersion: k8s.cni.cncf.io/v1
kind: NetworkAttachmentDefinition
metadata:
  annotations:
    storage-network.settings.harvesterhci.io: "true"
  name: storagenetwork-1
  namespace: default
spec:
  config: '{"cniVersion":"0.3.1","type":"bridge","dns":{},"bridge":"test-br","promiscMode":true,"vlan":100,"ipam":{"type":"whereabouts","range":"192.168.0.0/24"}}'
EOF
```

### Step 2: Shut Down All VMs

- Stop all VMs.
- Check if all VMs are off.
    - `kubectl get -A vmi`
- You should not see any existing VMI.

### Step 3: Shutdown All Pods with Longhorn Volumes

:::caution

Please stop pods by order.

:::

#### Stop Rancher Monitoring

- Stop Rancher Monitoring.

```bash
kubectl patch -n fleet-local managedchart rancher-monitoring --type merge -p '{"spec":{"paused": true}}'
```

- Check if Rancher Monitoring `paused` is true.

```bash
kubectl get -n fleet-local managedchart rancher-monitoring -o=jsonpath='{.spec.paused}'
```

#### Stop Grafana

- Stop Grafana.

```bash
kubectl patch -n cattle-monitoring-system deployments rancher-monitoring-grafana --type merge -p '{"spec":{"replicas": 0}}'
```

- Check if Deployment `replicas` is 0.

```bash
kubectl get -n cattle-monitoring-system deployments rancher-monitoring-grafana -o=jsonpath='{.spec.replicas}'
```

#### Stop Prometheus

- Stop Prometheus.

```bash
kubectl patch -n cattle-monitoring-system prometheuses rancher-monitoring-prometheus --type merge -p '{"spec":{"replicas": 0}}'
```

- Check if Prometheus `replicas` is 0.

```bash
kubectl get -n cattle-monitoring-system prometheuses rancher-monitoring-prometheus -o=jsonpath='{.spec.replicas}'
```

#### Stop Harvester VM Import Controller

- Check if VM Import Controller exists.
- If not, skip this step.

```bash
kubectl get -n harvester-system deployments harvester-harvester-vm-import-controller
```

- If VM Import Controller exists, please stop Harvester VM Import Controller.

```bash
kubectl patch -n harvester-system deployments harvester-harvester-vm-import-controller --type merge -p '{"spec":{"replicas": 0}}'
```

- Check if Deployment `replicas` is 0.

```bash
kubectl get -n harvester-system deployments harvester-harvester-vm-import-controller -o=jsonpath='{.spec.replicas}'
```

#### Stop Alertmanager

- Check if Alertmanager exists.
- If not, skip this step.

```bash
kubectl get -n cattle-monitoring-system alertmanager rancher-monitoring-alertmanager
```

- If Alertmanager exists, please stop Alertmanager.

```bash
kubectl patch -n cattle-monitoring-system alertmanager rancher-monitoring-alertmanager --type merge -p '{"spec":{"replicas": 0}}'
```

- Check if alertmanager `replicas` is 0.

```bash
kubectl get -n cattle-monitoring-system alertmanager rancher-monitoring-alertmanager -o=jsonpath='{.spec.replicas}'
```

### Step 4: Check if All Longhorn Volumes are Detached

- Check if Longhorn Volumes states are detached.
- If there is still any attached volume, please wait for a while and re-check it again before performing the next step.

```bash
kubectl get -A volume
```

- You can check with the following command, and should get an empty output.

```bash
kubectl get -A volume | grep attached
```

### Step 5: Setup Longhorn Storage Network Setting

- Set Longhorn storage-network settings.

```bash
kubectl patch -n longhorn-system settings.longhorn.io storage-network --type merge -p '{"value": "default/storagenetwork-1"}'
```

- Check Longhorn storage-network settings.

```bash
kubectl get -n longhorn-system settings.longhorn.io storage-network -o=jsonpath='{.value}'
```

### Step 6: Wait and Check Longhorn Pods

- Wait for longhorn Pods.
- Check Longhorn Pods.

```bash
kubectl get -n longhorn-system pods -l longhorn.io/component=instance-manager -o=jsonpath='{range .items[*]}{.metadata.annotations.k8s\.v1\.cni\.cncf\.io/networks}{"\n"}{end}'
```

- Check if all "interface" is "lhnet1".

### Step 7: Restart Pods


:::caution

Please start pods by order.

:::

#### Start Alertmanager

- Check if Alertmanager exists.
- If not, skip this step.

```bash
kubectl get -n cattle-monitoring-system alertmanager rancher-monitoring-alertmanager
```

- If Alertmanager exists, please start Alertmanager.

```bash
kubectl patch -n cattle-monitoring-system alertmanager rancher-monitoring-alertmanager --type merge -p '{"spec":{"replicas": 1}}'
```

- Check if Alertmanager `replicas` is 1.

```bash
kubectl get -n cattle-monitoring-system alertmanager rancher-monitoring-alertmanager -o=jsonpath='{.spec.replicas}'
```

#### Start Harvester VM Import Controller

- Check if VM Import Controller exists.
- If not, skip this step.

```bash
kubectl get -n harvester-system deployments harvester-harvester-vm-import-controller
```

- If VM Import Controller exists, please start Harvester VM Import Controller.

```bash
kubectl patch -n harvester-system deployments harvester-harvester-vm-import-controller --type merge -p '{"spec":{"replicas": 1}}'
```

- Check if Deployment `replicas` is 1.

```bash
kubectl get -n harvester-system deployments harvester-harvester-vm-import-controller -o=jsonpath='{.spec.replicas}'
```
#### Start Prometheus

- Start Prometheus.

```bash
kubectl patch -n cattle-monitoring-system prometheuses rancher-monitoring-prometheus --type merge -p '{"spec":{"replicas": 1}}'
```

- Check if Prometheus `replicas` is 1.

```bash
kubectl get -n cattle-monitoring-system prometheuses rancher-monitoring-prometheus -o=jsonpath='{.spec.replicas}'
```


#### Start Grafana

- Stop Grafana.

```bash
kubectl patch -n cattle-monitoring-system deployments rancher-monitoring-grafana --type merge -p '{"spec":{"replicas": 1}}'
```

- Check if Deployment `replicas` is 1.

```bash
kubectl get -n cattle-monitoring-system deployments rancher-monitoring-grafana -o=jsonpath='{.spec.replicas}'
```

#### Start Rancher Monitoring

- Stop Rancher Monitoring.

```bash
kubectl patch -n fleet-local managedchart rancher-monitoring --type merge -p '{"spec":{"paused": false}}'
```

- Check if Rancher Monitoring `paused` is true.

```bash
kubectl get -n fleet-local managedchart rancher-monitoring -o=jsonpath='{.spec.paused}'
```

### Step 8: Restart all VMs

- Restart all your VMs.

### Step 9: Reset to Default (Optional)

- Follow Step 1 to 4.
- Follow Step 5, but set the value to `""` in Longhorn storage-network setting.
- Follow Step 6 to 8.
- Remove VLAN `default/storagenetwork-1`.
