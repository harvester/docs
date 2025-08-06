---
sidebar_position: 9
sidebar_label: Kube-OVN Operator
title: "Kubeovn Operator"
---

<head>
  <link rel="canonical" href="https://docs.harvesterhci.io/v1.6/advanced/addons/kubeovn-operator"/>
</head>

_Available as of v1.6.0_

[`kubeovn-operator`](https://github.com/harvester/kubeovn-operator) is used to manage the lifecycle of [Kube-OVN](https://github.com/kubeovn/kube-ovn) as a secondary CNI on underlying Harvester clusters.

## Enabling `kubeovn-operator`

You must enable `kubeovn-operator` to deploy Kube-OVN to a Harvester cluster for advanced SDN capabilities such as virtual private cloud (VPC) and subnets for virtual machine workloads.

1. On the Harvester UI, go to **Advanced** > **Add-ons**.

1. Select **kubeovn-operator (Experimental)**, and then select **⋮** > **Enable**.

  ![](/img/kubeovn-operator.png)

The add-on deploys `kubeovn-operator` and creates the default `Configuration` object named `configuration.kubeovn.io`, which uses sane Harvester-specific defaults for configuring the Kube-OVN CNI.

The following is an example of a `Configuration` object:

```
apiVersion: kubeovn.io/v1
kind: Configuration
metadata:
  name: kubeovn
  namespace: kube-system
spec:
  cniConf:
    cniBinDir: /opt/cni/bin
    cniConfFile: /kube-ovn/01-kube-ovn.conflist
    cniConfigDir: /etc/cni/net.d
    cniConfigPriority: "90"
    localBinDir: /usr/local/bin
  components:
    OVSDBConTimeout: 10
    OVSDBInactivityTimeout: 10
    checkGateway: true
    enableANP: false
    enableBindLocalIP: true
    enableExternalVPC: true
    enableIC: false
    enableKeepVMIP: true
    enableLB: true
    enableLBSVC: false
    enableLiveMigrationOptimize: true
    enableNATGateway:  true
    enableNP: true
    enableOVNIPSec: false
    enableTProxy: false
    hardwareOffload: false
    logicalGateway: false
    lsCtSkipOstLportIPS: true
    lsDnatModDlDst: true
    secureServing: false
    setVLANTxOff:  false
    u2oInterconnection:  false
  debug:
    mirrorInterface: mirror0
  dpdkCPU:  "0"
  dpdkMEMORY: "0"
  dpdkVersion: "19.11"
  dualStack:
    joinCIDR: fd00:100:64::/112
    pingerExternalAddress: 2606:4700:4700::1111
    pingerExternalDomain: google.com.
    podCIDR: fd00:10:16::/112
    podGateway: fd00:10:16::1
    serviceCIDR: fd00:10:96::/112
  global:
    images:
      kubeovn:
        dpdkRepository: kube-ovn-dpdk
        repository: kube-ovn
        supportArm: true
        thirdParty:  true
        vpcRepository: vpc-nat-gateway
    registry:
      address: docker.io/kubeovn
  hugePages: "0"
  hugepageSizeType:  hugepages-2Mi
  imagePullPolicy: IfNotPresent
  ipv4:
    joinCIDR: 100.64.0.0/16
    pingerExternalAddress: 1.1.1.1
    pingerExternalDomain: google.com.
    podCIDR: 10.52.0.0/16
    podGateway: 10.52.0.1
    serviceCIDR: 10.52.0.1
  ipv6:
    joinCIDR: fd00:100:64::/112
    pingerExternalAddress: 2606:4700:4700::1111
    pingerExternalDomain: google.com.
    podCIDR: fd00:10:16::/112
    podGateway: fd00:10:16::1
    serviceCIDR: fd00:10:96::/112
  kubeOvnCNI:
    requests:
      cpu: "100m"
      memory: "100Mi"
    limits:
      cpu: "1"
      memory:  "1Gi"
  kubeOvnController:
    requests:
      cpu: "200m"
      memory: "200Mi"
    limits:
      cpu: "1"
      memory: "1Gi"
  kubeOvnMonitor:
    requests:
      cpu: "200m"
      memory: "200Mi"
    limits:
      cpu: "200m"
      memory: "200Mi"
  kubeOvnPinger:
    requests:
      cpu: "100m"
      memory: "100Mi"
    limits:
      cpu: "200m"
      memory: "400Mi"
  kubeletConfig:
    kubeletDir: /var/lib/kubelet
  logConfig:
    logDir: /var/log
  masterNodesLabel: node-role.kubernetes.io/control-plane=true
  networking:
    defaultSubnet: ovn-default
    defaultVPC: ovn-cluster
    enableECMP: false
    enableEIPSNAT: true
    enableMetrics:  true
    enableSSL: false
    netStack: ipv4
    networkType: geneve
    nodeSubnet: join
    ovnLeaderProbeInterval: 5
    ovnNorthdNThreads: 1
    ovnNorthdProbeInterval: 5000
    ovnRemoteOpenflowInterval: 10
    ovnRemoteProbeInterval: 10000
    podNicType: veth-pair
    probeInterval:  180000
    tunnelType: vxlan
    nodeLocalDNSIPS: ""
    vlan:
      providerName: provider
      vlanId: 1
      vlanName: ovn-vlan
  openVSwitchDir: /var/lib/rancher/origin/openvswitch
  ovnCentral:
    requests:
      cpu: 300m
      memory: 200Mi
    limits:
      cpu: 3
      memory: 4Gi
  ovnDir: /etc/origin/ovn
  ovsOVN:
    limits:
      cpu:  2
      memory: 1000Mi
    requests:
      cpu: 200m
      memory: 200Mi
  performance:
    gcInterval: 360
    inspectInterval: 20
    ovsVSCtlConcurrency: 100
```
:::caution

This `Configuration` object has been validated against Harvester installations. You can fine-tune the object by editing the `kubeovn-operator` add-on YAML, but exercise caution when making changes to the `configurationSpec` field.

:::

## Disabling kubeovn-operator
:::info important

Ensure that no virtual machines are using VM Networks backed by Kube-OVN SDN components.

:::

You can disable `kubeovn-operator` using the following commands:

```
kubectl delete validatingwebhookconfiguration kube-ovn-webhook

kubectl delete ips --all

kubectl delete subnets join ovn-default

kubectl delete vpc ovn-cluster

kubectl delete configuration kubeovn -n kube-system

```

When the `Configuration` object is deleted, all Kube-OVN components are also deleted from the Harvester cluster. This process typically takes a few minutes. Once completed, you can disable the `kubeovn-operator` add-on from the Harvester UI.
