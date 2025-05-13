---
sidebar_position: 11
sidebar_label: Post-installation steps
title: "Post-Installation Steps"
keywords:
  - Harvester
  - Installation
description: Post-installation steps.
---


<head>
  <link rel="canonical" href="https://docs.harvesterhci.io/v1.6/install/post-install"/>
</head>

These optional post-installation procedures describe how to enhance Harvester security and performance.

## Disable SSH Password

By default during installation, SSH password authentication is enabled on the Harvester nodes. This allows administrator to access the nodes for installation diagnosis. 

Once the installation completed successfully, it's recommended to disable SSH password authentication.

The following command uses `kubectl` to apply a [`CloudInit`](https://docs.harvesterhci.io/v1.6/advanced/cloudinitcrd/) configuration to disable SSH password authentication on all Harvester nodes:

```sh
cat <<EOF | kubectl apply -f -
apiVersion: node.harvesterhci.io/v1beta1
kind: CloudInit
metadata:
  name: ssh-config
spec:
  matchSelector: 
    harvesterhci.io/managed: "true" # apply to all Harvester nodes
  filename: 99-ssh-config
  contents: |
    stages:
      network:
      - name: "disable password login"
        commands:
        - sed -i -E 's/^#?PasswordAuthentication .*/PasswordAuthentication no/' /etc/ssh/sshd_config
        - sed -i -E 's/^#?ChallengeResponseAuthentication .*/ChallengeResponseAuthentication no/' /etc/ssh/sshd_config
        - sed -i -E 's/^#?UsePAM .*/UsePAM no/' /etc/ssh/sshd_config
        - systemctl restart sshd
  paused: false
EOF
```

   * The `matchSelector` field is used to select Harvester nodes with specific labels.
   * All the affected nodes must be rebooted for the cloud-init configuration to take effect.

Once the configuration is applied, any attempts to access the Harvester nodes with the SSH password will be denied:

```sh
$ ssh -o PreferredAuthentications=password rancher@<node-ip>
rancher@<node-ip>: Permission denied (publickey,keyboard-interactive).
```
