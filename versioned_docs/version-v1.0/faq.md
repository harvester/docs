---
sidebar_position: 17
sidebar_label: FAQ
title: ""
---

# FAQ

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
![harvester-kubeconfig.png](/img/v1.0/harvester-kubeconfig.png)

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
[https://cloudinit.readthedocs.io/en/latest/topics/cli.html#clean](https://cloudinit.readthedocs.io/en/latest/topics/cli.html#clean)

### How can I reset the administrator password?

In case you forget the administrator password, you can reset it via the command line. SSH to one of the management node and run the following command:
```shell
# switch to root and run
$ kubectl  -n cattle-system exec $(kubectl --kubeconfig $KUBECONFIG -n cattle-system get pods -l app=rancher --no-headers | head -1 | awk '{ print $1 }') -c rancher -- reset-password
New password for default administrator (user-xxxxx):
<new_password>
```
