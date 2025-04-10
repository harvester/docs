---
sidebar_position: 3
sidebar_label: VM Import
title: "VM Import"
---

<head>
  <link rel="canonical" href="https://docs.harvesterhci.io/v1.4/advanced/addons/vmimport"/>
</head>

_Available as of v1.1.0_

Beginning with v1.1.0, users can import their virtual machines from VMWare and
OpenStack into Harvester.

This is accomplished using the vm-import-controller addon.

To use the VM Import feature, users need to enable the vm-import-controller
addon.

![](/img/v1.2/vm-import-controller/EnableAddon.png)

By default, vm-import-controller leverages ephemeral storage, which is mounted
from /var/lib/kubelet.

During the migration, a large VM's node could run out of space on this mount,
resulting in subsequent scheduling failures.

To avoid this, users are advised to enable PVC-backed storage and customize the
amount of storage needed. According to the best practice, the PVC size should be
twice the size of the largest VM being migrated. This is essential as the PVC is
used as scratch space to download the VM, and convert the disks into raw image
files.

![](/img/v1.2/vm-import-controller/ConfigureAddon.png)

## vm-import-controller

Currently, the following source providers are supported:

* VMWare
* OpenStack

## API

The vm-import-controller introduces two CRDs.

### Sources

Sources allow users to define valid source clusters.

For example:

<Tabs>
<TabItem value="vmware" label="VMWare" default>

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

As part of the reconciliation process, the controller will log into vCenter and
verify whether the `dc` specified in the source spec is valid.

Once this check is passed, the source is marked as ready and can be used for VM
migrations.

```shell
$ kubectl get vmwaresource.migration
NAME      STATUS
vcsim   clusterReady
```
</TabItem>
<TabItem value="openstack" label="OpenStack">
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

The OpenStack source reconciliation process attempts to list VMs in the project
and marks the source as ready.

```shell
$ kubectl get opestacksource.migration
NAME       STATUS
devstack   clusterReady
```
</TabItem>
</Tabs>

### VirtualMachineImport

The VirtualMachineImport CRD provides a way for users to define a source VM and
map to the actual source cluster to perform VM export/import.

A sample VirtualMachineImport looks like this:

<Tabs>
<TabItem value="vmware" label="VMWare" default>

```yaml
apiVersion: migration.harvesterhci.io/v1beta1
kind: VirtualMachineImport
metadata:
  name: alpine-export-test
  namespace: default
spec:
  virtualMachineName: "alpine-export-test"
  folder: "/vm-foler"
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
  storageClass: "harvester-longhorn"
```

This CRD prompts the controller to export the VM named "alpine-export-test"
from the folder "/vm-folder", which is on the source VMWare cluster.
The virtual machine is expored, processed, and recreated into the Harvester
cluster.
</TabItem>
<TabItem value="openstack" label="OpenStack">

```yaml
apiVersion: migration.harvesterhci.io/v1beta1
kind: VirtualMachineImport
metadata:
  name: openstack-demo
  namespace: default
spec:
  virtualMachineName: "openstack-demo"  # Instance name or UUID
  folder: "/vm-folder"
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
  storageClass: "harvester-longhorn"
```

:::note
The reconciliation logic attempts to perform a name-to-uuid lookup when an
instance name is used.
OpenStack allows the creation of multiple virtual machines with the same
instance name. In this scenario, you are advised to use the UUID.
:::
</TabItem>
</Tabs>

This process can take a while depending on the virtual machine size, but you
should see `VirtualMachineImages` created for each disk in the defined virtual
machine.

The entries listed under `networkMapping` determine how the source network
interfaces are mapped to the Harvester networks. If no matches are found, each
unmatched network interface is attached to the default `managementNetwork`.

Once the virtual machine is imported successfully, the status of the object
changes to `virtualMachineRunning`.

Example:
```shell
$ kubectl get virtualmachineimport.migration
NAME                    STATUS
alpine-export-test      virtualMachineRunning
openstack-cirros-test   virtualMachineRunning
```
