---
sidebar_position: 30
keywords:
  - Harvester
  - harvester
  - Rancher
  - rancher
  - Harvester Upgrade
Description: Harvester provides two ways to upgrade. Users can either upgrade using the ISO image or upgrade through the UI.
---

# Upgrading Harvester

!!!note
    Upgrade is not supported from previous versions to v0.3.0 version.

    - One-click upgrade will be supported starting with the v1.0.0 release.


## Manual Upgrade

!!!warning
    The steps to perform a manual upgrade is only recommended for experienced users. Use it at your own risk.

### Overview

The manual upgrade process consists these steps:

- Upgrade OS on each nodes.
- Create Harvester cluster repo.
- Upgrade the embedded Rancher service.
- Upgrade the RKE2 runtime.
- Upgrade the Harvester service.

### Preparation

- Backup your VMs.

#### Get the new release

Download the ISO of a new release from Harvester release page and verify the checksum of ISO first.


#### Select a controller node

Some operations need to be run on a controller node that has a cluster credential. You can use the first node of cluster or any nodes with `control-plane` role. Make sure the credential works:

```
$ ssh rancher@<ip_of_the_first_node>

rancher@node1:~> sudo -i kubectl get nodes
NAME    STATUS   ROLES                       AGE    VERSION
node1   Ready    control-plane,etcd,master   116m   v1.21.5+rke2r1
node2   Ready    control-plane,etcd,master   112m   v1.21.5+rke2r1
node3   Ready    control-plane,etcd,master   112m   v1.21.5+rke2r1
node4   Ready    <none>                      112m   v1.21.5+rke2r1
```

Download the helpers to the controller node:

```bash
sudo mkdir -p /usr/local/harvester-upgrade
sudo chown rancher:rancher /usr/local/harvester-upgrade
cd /usr/local/harvester-upgrade
curl --proto '=https' --tlsv1.2 -sSfL https://github.com/harvester/upgrade-helpers/releases/latest/download/upgrade-helpers.tar.gz | tar xzvf -
```

Shutdown all VMs:

```bash
sudo -i /usr/local/harvester-upgrade/upgrade-helpers/bin/harv-stop-vms.sh
```

### Upgrade node OS

Please upgrade nodes one by one. Proceed to next node until one node is done.

- For **each node** in the cluster:
    - Download the helper scripts:

        ```bash
        sudo mkdir -p /usr/local/harvester-upgrade
        sudo chown rancher:rancher /usr/local/harvester-upgrade
        cd /usr/local/harvester-upgrade
        curl --proto '=https' --tlsv1.2 -sSfL https://github.com/harvester/upgrade-helpers/releases/latest/download/upgrade-helpers.tar.gz | tar xzvf -
        ```

    - Upload the ISO to the node and mount it.
        - Send ISO file to the upgrading node:

            ```bash
            $ scp <new-harvester-release-iso> rancher@<ip_of_node>:/usr/local/harvester-upgrade/harvester.iso
            ```
        
        - Upgrade the node:
            ```bash
            sudo -i /usr/local/harvester-upgrade/upgrade-helpers/bin/harv-upgrade-node.sh /usr/local/harvester-upgrade/harvester.iso
            ```
        
    - Reboot:
        ```bash
        sudo reboot
        ```

    - After the upgrading node is rebooted, verify the node is succesfully upgraded:

        ```bash
        sudo -i /usr/local/harvester-upgrade/upgrade-helpers/bin/harv-node-post-check.sh
        ```

### Create Harvester cluster repo

<span style="color:#DE3163">**On the controller node:**</span>

Check all nodes are ready:

```bash
sudo -i kubectl get nodes
```

Create the harvester-cluster-repo:

```
sudo -i /usr/local/harvester-upgrade/upgrade-helpers/bin/harv-create-harvester-cluster-repo.sh
```

Check harvester-cluster-repo is ready:
```
sudo -i kubectl get deployment harvester-cluster-repo -n cattle-system
```

Example output:

```
NAME                     READY   UP-TO-DATE   AVAILABLE   AGE
harvester-cluster-repo   1/1     1            1           59s
```

### Upgrade Rancher

<span style="color:#DE3163">**On the controller node**:</span>

- Get new Rancher version:

    ```bash
    yq -e e '.rancher' /etc/harvester-release.yaml
    ```
    
    Example output:
    ```
    v2.6.3-harvester1
    ```

- Upgrade Rancher:

    ```bash
    sudo -i /usr/local/harvester-upgrade/upgrade-helpers/bin/harv-upgrade-rancher.sh
    ```

- Check Rancher version changes:

    ```bash
    sudo -i kubectl get settings.management.cattle.io server-version
    ```

    An example output:
    ```
    NAME             VALUE
    server-version   v2.6.3-harvester1
    ```

### Upgrade RKE2

<span style="color:#DE3163">**On the controller node**:</span>

- Get new RKE2 version:

    ```bash
    yq -e e '.kubernetes' /etc/harvester-release.yaml
    ```
    
    Example output:
    ```
    v1.21.7+rke2r1
    ```

- Upgrade RKE2:

    ```bash
    sudo -i /usr/local/harvester-upgrade/upgrade-helpers/bin/harv-upgrade-rke2.sh
    ```

- Wait for RKE2 to be upgraded in all nodes and make sure all nodes are ready (This will take a while):

    ```bash
    sudo -i watch kubectl get nodes
    ```

    Example output:
    ```
    NAME    STATUS   ROLES                       AGE    VERSION
    node1   Ready    control-plane,etcd,master   3h6m   v1.21.7+rke2r2
    node2   Ready    control-plane,etcd,master   3h3m   v1.21.7+rke2r2
    node3   Ready    control-plane,etcd,master   3h3m   v1.21.5+rke2r1 <--- not upgrade yet
    node4   Ready    <none>                      3h3m   v1.21.5+rke2r1 <--- not upgrade yet
    ```

### Upgrade Harvester and Monitoring services

<span style="color:#DE3163">**On the controller node**:</span>

```bash
sudo -i /usr/local/harvester-upgrade/upgrade-helpers/bin/harv-upgrade-harvester.sh
```
