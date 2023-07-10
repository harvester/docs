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
![harvester-kubeconfig.png](/img/v1.1/harvester-kubeconfig.png)

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

As of Harvester v1.0.2, we no longer support adding additional partitioned disks, so be sure to delete all partitions first (e.g., using `fdisk`).

### Why are there some Harvester pods that become ErrImagePull/ImagePullBackOff?

This is likely because your Harvester cluster is an air-gapped setup, and some pre-loaded container images are missing. Kubernetes has a mechanism that does garbage collection against bloated image stores. When the partition which stores container images is over 85% full, `kubelet` will try to prune some least used images to save disk space until the occupancy is lower than 80%. These numbers (85% and 80%) are default High/Low thresholds that come with Kubernetes.

To recover from this state, do one of the following depending on the cluster's configuration:
- Pull the missing images from sources outside of the cluster (if it's an air-gapped environment, you might need to set up an HTTP proxy beforehand)
- Manually import the images from the Harvester ISO image
- Find the missing images on one node on the other nodes, and then export the images from the node still with them and import them on the missing one

To prevent this from happening, we recommend cleaning up unused container images from the previous version after each successful Harvester upgrade if the image store disk space is stressed. We provided a [harv-purge-images script](https://github.com/harvester/upgrade-helpers/blob/main/bin/harv-purge-images.sh) that makes cleaning up disk space easy, especially for container image storage. The script has to be executed on each Harvester node. For example, if the cluster was originally in v1.1.1, and now it gets upgraded to v1.1.2, you can do the following to discard the container images that are only used in v1.1.1 but no longer needed in v1.1.2:

```shell
# on each node
$ ./harv-purge-images.sh v1.1.1 v1.1.2
```

:::caution

- The script only downloads the image lists and compares the two to calculate the difference between the two versions. It does not communicate with the cluster and, as a result, does not know what version the cluster was upgraded from.
- We published image lists for each version released since v1.1.0. For clusters older than v1.1.0, users have to clean up the old images manually.

:::
