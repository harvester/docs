---
sidebar_position: 17
sidebar_label: FAQ
title: "FAQ"
---

This FAQ is a work in progress designed to answer the questions our users most frequently ask about Harvester.

### How can I ssh login to the Harvester node?
```shell
$ ssh rancher@node-ip
```

### What is the default login username and password of the Harvester dashboard?
```shell
username: admin
password: # you will be promoted to set the default password when logging in for the first time
```

### How can I access the kubeconfig file of the Harvester cluster?

Option 1. You can download the kubeconfig file from the support page of the Harvester dashboard.
![harvester-kubeconfig.png](/img/v1.2/harvester-kubeconfig.png)

Option 2. You can get the kubeconfig file from one of the Harvester management nodes. E.g.,
```shell
$ sudo su
$ cat /etc/rancher/rke2/rke2.yaml
```

### How to install the qemu-guest-agent of a running VM?
```shell
# cloud-init will only be executed once, reboot it after add the cloud-init config with the following command.
$ cloud-init clean --logs --reboot
```
[https://cloudinit.readthedocs.io/en/latest/reference/cli.html#clean](https://cloudinit.readthedocs.io/en/latest/reference/cli.html#clean)

### How can I reset the administrator password?

In case you forget the administrator password, you can reset it via the command line. SSH to one of the management node and run the following command:
```shell
# switch to root and run
$ kubectl  -n cattle-system exec $(kubectl --kubeconfig $KUBECONFIG -n cattle-system get pods -l app=rancher --no-headers | head -1 | awk '{ print $1 }') -c rancher -- reset-password
New password for default administrator (user-xxxxx):
<new_password>
```

### I added an additional disk with partitions. Why is it not getting detected?

As of Harvester v1.0.2, adding additional partitioned disks is no longer supported, be sure to delete all partitions first (e.g., using `fdisk`).

### How to add ssh authorized keys to a Harvester node using a modified config file?

Option 1. Non Persistent (Temporary)
To dynamically add users in the runtime without rebooting, add ssh authorized keys to /home/rancher/.ssh/authorized_keys. These changes are not persistent between reboots.

Option 2. Persistent
After you ssh login to Harvester, add ssh authorized keys to your /oem/99_custom.yaml or 90_custom.yaml. These changes are persistent between reboots.
After you modify your cloud-init script, reboot the node to see the changes take effect. 
See [Cloud-init support - stages.STAGE_ID.STEP_NAME.authorized_keys](https://rancher.github.io/elemental-toolkit/docs/reference/cloud_init/#stagesstage_idstep_nameauthorized_keys) for details on adding ssh authorized keys to a config file.
