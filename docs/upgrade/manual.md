# Upgrading Harvester manually

## Manual Upgrade from v0.3.0 to v1.0.0

!!!warning
    Upgrading Harvester from v0.3.0 to v1.0.0 is **not supported**. Please use at your own risk.

### Overview

The manual upgrade process consists of the following steps:

- Upgrade OS on each nodes.
- Create Harvester cluster repo.
- Upgrade the embedded Rancher service.
- Upgrade the RKE2 runtime.
- Upgrade the Harvester service.

### Preparation

- Backup your VMs.

#### Get the new release

Download the Harvester ISO image of a newer release from the [Harvester GithHub release page](https://github.com/harvester/harvester/releases) and verify the checksum of the ISO.


#### Select a controller node

Some operations need to be run from a `controller` node which contains the cluster credentials. You can use the first node of the cluster or any node with the `control-plane` role:

```
ssh rancher@<ip_of_the_first_node>
sudo -i kubectl get nodes
```

Example output:
```
NAME    STATUS   ROLES                       AGE    VERSION
node1   Ready    control-plane,etcd,master   116m   v1.21.5+rke2r1
node2   Ready    control-plane,etcd,master   112m   v1.21.5+rke2r1
node3   Ready    control-plane,etcd,master   112m   v1.21.5+rke2r1
node4   Ready    <none>                      112m   v1.21.5+rke2r1
```

Download the `upgrade-helpers` scripts to the controller node:

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

You need to upgrade nodes one by one. Only proceed to the next node once the current node is done.

- For **each node** in the cluster:
    - Download the `upgrade-helpers` scripts:

        ```bash
        sudo mkdir -p /usr/local/harvester-upgrade
        sudo chown rancher:rancher /usr/local/harvester-upgrade
        cd /usr/local/harvester-upgrade
        curl --proto '=https' --tlsv1.2 -sSfL https://github.com/harvester/upgrade-helpers/releases/latest/download/upgrade-helpers.tar.gz | tar xzvf -
        ```

    - Upload the ISO to the node:
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

    - Once the upgrade is complete, the node will reboot. Verify if the node is successfully upgraded:

        ```bash
        sudo -i /usr/local/harvester-upgrade/upgrade-helpers/bin/harv-node-post-check.sh
        ```

### Create Harvester cluster repo

<span style="color:#DE3163">**On the controller node:**</span>

Check if all nodes are ready:

```bash
sudo -i kubectl get nodes
```

Create the Harvester cluster repo:

```
sudo -i /usr/local/harvester-upgrade/upgrade-helpers/bin/harv-create-harvester-cluster-repo.sh
```

Check if the Harvester cluster repo is ready:
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

- Check the new Rancher version:

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

- Verify if Rancher is successfully upgraded:

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

- Check the new RKE2 version:

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

- Wait for RKE2 to be upgraded in all nodes and make sure all nodes are ready (this will take some time to complete):

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
