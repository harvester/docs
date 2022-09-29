---
sidebar_position: 1
sidebar_label: Manual Storage Network Configuration
title: ""
---

# Manual Storage Network Configuration 

This page describe the maunal method to configure Longhorn Storage Network in Harvester. 

## Prerequisite

1. Make sure that Harvester version is v1.1.0 or above.
2. Prepare phyical interfaces networks for the storage network, and make sure the VLAN configuration in the external switch side.
3. Create Network Config in Web UI with the phyical interfaces that you expected for the storage network, and remember the `Cluster Network` field for the next step.
4. Prepare a IPv4 subnet range in the CIDR format. IP Range should be IPv4 CIDR format and 4 times the number of your cluster nodes. This IP range should not overlap with Kubernetes Cluster IPs and Pods IPs.

### Example Configuration

In the following configuration steps, we will use below configurations for example.

Network Config:
- ClusterNetwork: test
- NICs
  - eth2
  - eth3

VLANs:
- Namespace: default
- Name: storagenetwork-1
- VLAN ID: 100

IP Range:
- 192.168.0.0/24

## Configuration

### Step 1: Create VLANs

- Create VLANs in Web UI with desired namespace, name, VLAN ID, Cluster Network, and keep the namespace and name for the further configurations
- Put Name in name field
- Put Namespace in namespace field
- Put ClusterNetwork name with `-br` suffix in "bridge" field
- Put IP Range into `ipam.range` field

:::caution

Don't remove the VLAN if Longhorn storage-network is still using that VLAN

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

### Step 2: Shutdown All VMs

- Stop all VMs
- Check all VMs are off

```bash
kubectl get -A vmi
```

- You should not see any existing VMI

### Step 3: Shutdown All Pods with Longhorn Volumes

:::caution

Please stop pods by order

:::

#### Stop Rancher Monitoring

- Stop Rancher Monitoting

```bash
kubectl patch -n fleet-local managedchart rancher-monitoring --type merge -p '{"spec":{"paused": true}}'
```

- Check Rancher Monitoring paused is true

```bash
kubectl get -n fleet-local managedchart rancher-monitoring -o=jsonpath='{.spec.paused}'
```

#### Stop Grafana

- Stop Grafana

```bash
kubectl patch -n cattle-monitoring-system deployments rancher-monitoring-grafana --type merge -p '{"spec":{"replicas": 0}}'
```

- Check Deployment replicas is 0

```bash
kubectl get -n cattle-monitoring-system deployments rancher-monitoring-grafana -o=jsonpath='{.spec.replicas}'
```

#### Stop Prometheus

- Stop Prometheus

```bash
kubectl patch -n cattle-monitoring-system prometheuses rancher-monitoring-prometheus --type merge -p '{"spec":{"replicas": 0}}'
```

- Check Prometheus replicas is 0

```bash
kubectl get -n cattle-monitoring-system prometheuses rancher-monitoring-prometheus -o=jsonpath='{.spec.replicas}'
```

#### Stop Harvester VM Import Controller

- Check VM Import Controller is existing
- If no, skip this step

```bash
kubectl get -n harvester-system deployments harvester-harvester-vm-import-controller
```

- If VM Import Controller is existing, please stop Harvester VM Import Controller

```bash
kubectl patch -n harvester-system deployments harvester-harvester-vm-import-controller --type merge -p '{"spec":{"replicas": 0}}'
```

- Check Deployment replicas is 0

```bash
kubectl get -n harvester-system deployments harvester-harvester-vm-import-controller -o=jsonpath='{.spec.replicas}'
```

#### Stop Alertmanager

- Check VM Import Controller is existing
- If no, skip this step

```bash
kubectl get -n cattle-monitoring-system alertmanager rancher-monitoring-alertmanager
```

- If Alertmanager is existing, please stop Alertmanager

```bash
kubectl patch -n cattle-monitoring-system alertmanager rancher-monitoring-alertmanager --type merge -p '{"spec":{"replicas": 0}}'
```

- Check alertmanager replicas is 0

```bash
kubectl get -n cattle-monitoring-system alertmanager rancher-monitoring-alertmanager -o=jsonpath='{.spec.replicas}'
```

### Step 4: Check all Longhorn Volumes are detached

- Please check Longhorn Volumes states are detached
- If there is still any attached volume, please wait for some monents and re-check it again before do next step

```bash
kubectl get -A volume
```

- You could check with the following command, should get empty result.

```bash
kubectl get -A volume | grep attached
```

### Step 5: Setup Longhorn Storage Network Setting

- Set Longhorn storage-network settings

```bash
kubectl patch -n longhorn-system settings.longhorn.io storage-network --type merge -p '{"value": "default/storagenetwork-1"}'
```

- Check Longhorn storage-network settings

```bash
kubectl get -n longhorn-system settings.longhorn.io storage-network -o=jsonpath='{.value}'
```

### Step 6: Wait and Check Longhorn Pods

- Wait for longhorn Pods 
- Check Longhorn Pods

```bash
kubectl get -n longhorn-system pods -l longhorn.io/component=instance-manager -o=jsonpath='{range .items[*]}{.metadata.annotations.k8s\.v1\.cni\.cncf\.io/networks}{"\n"}{end}'
```

- Check all "interface" is "lhnet1"

### Step 7: Restart Pods


:::caution

Please start pods by order

:::

#### Start Alertmanager

- Check VM Import Controller is existing
- If no, skip this step

```bash
kubectl get -n cattle-monitoring-system alertmanager rancher-monitoring-alertmanager
```

- If Alertmanager is existing, please start Alertmanager

```bash
kubectl patch -n cattle-monitoring-system alertmanager rancher-monitoring-alertmanager --type merge -p '{"spec":{"replicas": 1}}'
```

- Check alertmanager replicas is 1

```bash
kubectl get -n cattle-monitoring-system alertmanager rancher-monitoring-alertmanager -o=jsonpath='{.spec.replicas}'
```

#### Start Harvester VM Import Controller

- Check VM Import Controller is existing
- If no, skip this step

```bash
kubectl get -n harvester-system deployments harvester-harvester-vm-import-controller
```

- If VM Import Controller is existing, please start Harvester VM Import Controller

```bash
kubectl patch -n harvester-system deployments harvester-harvester-vm-import-controller --type merge -p '{"spec":{"replicas": 1}}'
```

- Check Deployment replicas is 1

```bash
kubectl get -n harvester-system deployments harvester-harvester-vm-import-controller -o=jsonpath='{.spec.replicas}'
```
#### Start Prometheus

- Start Prometheus

```bash
kubectl patch -n cattle-monitoring-system prometheuses rancher-monitoring-prometheus --type merge -p '{"spec":{"replicas": 1}}'
```

- Check Prometheus replicas is 1

```bash
kubectl get -n cattle-monitoring-system prometheuses rancher-monitoring-prometheus -o=jsonpath='{.spec.replicas}'
```


#### Start Grafana

- Stop Grafana

```bash
kubectl patch -n cattle-monitoring-system deployments rancher-monitoring-grafana --type merge -p '{"spec":{"replicas": 1}}'
```

- Check Deployment replicas is 1

```bash
kubectl get -n cattle-monitoring-system deployments rancher-monitoring-grafana -o=jsonpath='{.spec.replicas}'
```

#### Start Rancher Monitoring

- Stop Rancher Monitoting

```bash
kubectl patch -n fleet-local managedchart rancher-monitoring --type merge -p '{"spec":{"paused": false}}'
```

- Check Rancher Monitoring paused is true

```bash
kubectl get -n fleet-local managedchart rancher-monitoring -o=jsonpath='{.spec.paused}'
```

### Step 8: Restart all VMs

- Restart all your VMs

### Step 9: Reset to Default (Optional)

- Follow Step 1 to 4
- Follow Step 5, and set the value to empty string `""` in Longhorn storage-network setting
- Follow Step 6 to 8
- Remove VLAN `default/storagenetwork-1`
