---
sidebar_position: 2
sidebar_label: Harvester
title: ""
---

## Generate a support bundle

Users can generate a support bundle in the Harvester GUI with the following steps:

- Click the `Support` link at the bottom-left of Harvester Web UI.
    ![](/img/v1.1/troubleshooting/harvester-sb-support-link.png)

- Click `Generate Support Bundle` button.
    ![](/img/v1.1/troubleshooting/harvester-sb-support-button.png)

- Enter a useful description for the support bundle and click `Create` to generate and download a support bundle.
    ![](/img/v1.1/troubleshooting/harvester-sb-support-modal.png)

## Access Embedded Rancher

You can access the embedded Rancher dashboard via `https://{{HARVESTER_IP}}/dashboard/c/local/explorer`.

:::note

We only support to use the embedded Rancher dashboard for debugging and validation purpose.
For Rancher's multi-cluster and multi-tenant integration, please refer to the docs [here](../rancher/rancher-integration.md).

:::

## Access Embedded Longhorn

You can access the embedded Longhorn UI via `https://{{HARVESTER_IP}}/dashboard/c/local/longhorn`.

:::note

We only support to use the embedded Longhorn UI for debugging and validation purpose .

:::

## I can't access Harvester after I changed SSL/TLS enabled protocols and ciphers

If you changed
[SSL/TLS enabled protocols and ciphers settings](../settings/settings.md#ssl-parameters)
and you no longer have access to Harvester GUI and API,
it's highly possible that NGINX Ingress Controller has stopped working due to the misconfigured SSL/TLS protocols and ciphers.
Follow these steps to reset the setting:

1. Following [FAQ](../faq.md) to SSH into Harvester node and switch to `root` user.
```
$ sudo -s
```
2. Editing setting `ssl-parameters` manually using `kubectl`:
```
# kubectl edit settings ssl-parameters
```
3. Deleting the line `value: ...` so that NGINX Ingress Controller
will use the default protocols and ciphers.
```
apiVersion: harvesterhci.io/v1beta1
default: '{}'
kind: Setting
metadata:
  name: ssl-parameters
...
value: '{"protocols":"TLS99","ciphers":"WRONG_CIPHER"}' # <- Delete this line
```
4. Save the change and you should see the following response after exit from the editor:
```
setting.harvesterhci.io/ssl-parameters edited
```

You can further check the logs of Pod `rke2-ingress-nginx-controller` to see if NGINX Ingress Controller is working correctly.
