---
sidebar_position: 5
sidebar_label: VM Import
title: "VM Import"
---

<head>
  <link rel="canonical" href="https://docs.harvesterhci.io/v1.1/advanced/vmimport"/>
</head>

_Available as of v1.1.0_

With the vm-import-controller addon users can import their virtual machines from VMware and OpenStack into Harvester.

To use the VM import feature, users need to enable the vm-import-controller addon.

![](/img/v1.1/vm-import-controller/EnableAddon.png)

By default, vm-import-controller leverages ephemeral storage, which is mounted from /var/lib/kubelet.  

During the migration, a large VM's node could run out of space on this mount, resulting in subsequent scheduling failures. 

To avoid this, users are advised to enable PVC-backed storage and customize the amount of storage needed. According to the best practice, the PVC size should be twice the size of the largest VM being migrated. This is essential as the PVC is used as scratch space to download the VM, and convert the disks into raw image files.

![](/img/v1.1/vm-import-controller/ConfigureAddon.png)

## Overview

Currently, the following source providers are supported:
* VMware
* OpenStack

## API
The vm-import-controller introduces two CRDs.

### Sources
Sources allow users to define valid source clusters.

For example:

```yaml
apiVersion: migration.harvesterhci.io/v1beta1
kind: VmwareSource
metadata:
  name: vcsim
  namespace: default
spec:
  endpoint: "https://vscim/sdk"
  dc: "DCO"
  credentials:
    name: vsphere-credentials
    namespace: default
```

The secret contains the credentials for the vCenter endpoint:

```yaml
apiVersion: v1
kind: Secret
metadata: 
  name: vsphere-credentials
  namespace: default
stringData:
  "username": "user"
  "password": "password"
```

As part of the reconciliation process, the controller will log into vCenter and verify whether the `dc` specified in the source spec is valid.

Once this check is passed, the source is marked as ready and can be used for VM migrations.

```shell
$ kubectl get vmwaresource.migration 
NAME      STATUS
vcsim   clusterReady
```

For OpenStack-based source clusters, an example definition is as follows:

```yaml
apiVersion: migration.harvesterhci.io/v1beta1
kind: OpenstackSource
metadata:
  name: devstack
  namespace: default
spec:
  endpoint: "https://devstack/identity"
  region: "RegionOne"
  credentials:
    name: devstack-credentials
    namespace: default
```

The secret contains the credentials for the OpenStack endpoint:

```yaml
apiVersion: v1
kind: Secret
metadata: 
  name: devstack-credentials
  namespace: default
stringData:
  "username": "user"
  "password": "password"
  "project_name": "admin"
  "domain_name": "default"
  "ca_cert": "pem-encoded-ca-cert"
```

As part of the reconciliation process, the controller attempts to list VMs in the project and marks the source as ready.

```shell
$ kubectl get openstacksource.migration
NAME       STATUS
devstack   clusterReady
```

### VirtualMachineImport
The VirtualMachineImport CRD provides a way for users to define a source VM and map to the actual source cluster to perform VM export/import.

A sample VirtualMachineImport looks like this:

```yaml
apiVersion: migration.harvesterhci.io/v1beta1
kind: VirtualMachineImport
metadata:
  name: alpine-export-test
  namespace: default
spec: 
  virtualMachineName: "alpine-export-test"
  networkMapping:
  - sourceNetwork: "dvSwitch 1"
    destinationNetwork: "default/vlan1"
  - sourceNetwork: "dvSwitch 2"
    destinationNetwork: "default/vlan2"
  sourceCluster: 
    name: vcsim
    namespace: default
    kind: VmwareSource
    apiVersion: migration.harvesterhci.io/v1beta1
```

This will trigger the controller to export the VM named "alpine-export-test" on the VMware source cluster to be exported, processed and recreated into the Harvester cluster.

This can take a while based on the size of the virtual machine, but users should see `VirtualMachineImages` created for each disk in the defined virtual machine.

The list of items in `networkMapping` will define how the source network interfaces are mapped to the Harvester Networks.

If a match is not found, each unmatched network interface is attached to the default `managementNetwork`.

Once the virtual machine has been imported successfully, the object will reflect the status:

```shell
$ kubectl get virtualmachineimport.migration
NAME                    STATUS
alpine-export-test      virtualMachineRunning
openstack-cirros-test   virtualMachineRunning

```

Similarly, users can define a VirtualMachineImport for an OpenStack source as well:

```yaml
apiVersion: migration.harvesterhci.io/v1beta1
kind: VirtualMachineImport
metadata:
  name: openstack-demo
  namespace: default
spec: 
  virtualMachineName: "openstack-demo" #Name or UUID for instance
  networkMapping:
  - sourceNetwork: "shared"
    destinationNetwork: "default/vlan1"
  - sourceNetwork: "public"
    destinationNetwork: "default/vlan2"
  sourceCluster: 
    name: devstack
    namespace: default
    kind: OpenstackSource
    apiVersion: migration.harvesterhci.io/v1beta1
```

:::note 
OpenStack allows users to have multiple instances with the same name. In such a scenario, users are advised to use the Instance ID. The reconciliation logic tries to perform a name-to-ID lookup when a name is used.
:::