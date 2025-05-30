---
id: index
sidebar_position: 1
sidebar_label: Settings
title: "Settings"
---

<head>
  <link rel="canonical" href="https://docs.harvesterhci.io/v1.1/advanced/settings"/>
</head>

This page contains a list of advanced settings which can be used in Harvester.
You can modify the custom resource `settings.harvesterhci.io` from the Dashboard UI or with the `kubectl` command.

## `additional-ca`

This setting allows you to configure additional trusted CA certificates for Harvester to access external services.

Default: none

#### Example

```
-----BEGIN CERTIFICATE-----
SOME-CA-CERTIFICATES
-----END CERTIFICATE-----
```

:::caution

Changing this setting might cause a short downtime for single-node clusters.

:::

## `auto-disk-provision-paths` [Experimental]

This setting allows Harvester to automatically add disks that match the given glob pattern as VM storage.
It's possible to provide multiple patterns by separating them with a comma.

:::note

This setting only adds formatted disks mounted to the system.

:::

:::caution

- This setting is applied to **every Node** in the cluster.
- All the data in these storage devices **will be destroyed**. Use at your own risk.

:::

Default: none

#### Example

The following example will add disks matching the glob pattern `/dev/sd*` or `/dev/hd*`:

```
/dev/sd*,/dev/hd*
```

## `backup-target`

This setting allows you to set a custom backup target to store VM backups. It supports NFS and S3.
For further information, please refer to the [Longhorn documentation][longhorn-backup-target].

Default: none

[longhorn-backup-target]: https://longhorn.io/docs/1.2.2/snapshots-and-backups/backup-and-restore/set-backup-target/#set-up-aws-s3-backupstore

#### Example

```json
{
  "type": "s3",
  "endpoint": "https://s3.endpoint.svc",
  "accessKeyId": "test-access-key-id",
  "secretAccessKey": "test-access-key",
  "bucketName": "test-bup",
  "bucketRegion": "us‑east‑2",
  "cert": "",
  "virtualHostedStyle": false
}
```

## `cluster-registration-url`

This setting allows you to import the Harvester cluster to Rancher for multi-cluster management.

Default: none

#### Example

```
https://172.16.0.1/v3/import/w6tp7dgwjj549l88pr7xmxb4x6m54v5kcplvhbp9vv2wzqrrjhrc7c_c-m-zxbbbck9.yaml
```

:::note

When you configure this setting, a new pod called `cattle-cluster-agent-*` is created in the namespace `cattle-system` for registration purposes. This pod uses the container image `rancher/rancher-agent:related-version`, which is not packed into the Harvester ISO and is instead determined by Rancher. The `related-version` is usually the same as the Rancher version. For example, when you register Harvester to Rancher v2.7.9, the image is `rancher/rancher-agent:v2.7.9`. For more information, see [Find the required assets for your Rancher version](https://ranchermanager.docs.rancher.com/getting-started/installation-and-upgrade/other-installation-methods/air-gapped-helm-cli-install/publish-images#1-find-the-required-assets-for-your-rancher-version) in the Rancher documentation.

Depending on your Harvester settings, the image is downloaded from either of the following locations:

 - Harvester containerd-registry: You can configure a [private registry for the Harvester cluster](#containerd-registry).

 - Docker Hub (docker.io): This is the default option when you do not configure a private registry in Rancher.

Alternatively, you can obtain a copy of the image and manually upload it to all Harvester nodes.

:::

## `containerd-registry`

This setting allows you to configure a private registry for the Harvester cluster. The value will be set in `/etc/rancher/rke2/registries.yaml` of each node. You can read [RKE2 - Containerd Registry Configuration](https://docs.rke2.io/install/private_registry) for more information.

:::note

If you set a username and password for a private registry, the system will automatically remove it to protect the credential after the system saves it in `registries.yaml`.

:::

#### Example

![containerd-registry](/img/v1.2/advanced/containerd-registry.png)

```json
{
  "Mirrors": {
    "docker.io": {
      "Endpoints": ["https://myregistry.local:5000"],
      "Rewrites": null
    }
  },
  "Configs": {
    "myregistry.local:5000": {
      "Auth": {
        "Username": "testuser",
        "Password": "testpassword"
      },
      "TLS": {
        "InsecureSkipVerify": false
      }
    }
  }
}
```

## `csi-driver-config`

_Available as of v1.2.0_

If you install third-party CSI drivers in the Harvester cluster, you must configure some necessary information through this setting before using **Backup & Snapshot** related features.

Default:
```
{
  "driver.longhorn.io": {
    "volumeSnapshotClassName": "longhorn-snapshot",
    "backupVolumeSnapshotClassName": "longhorn"
  }
}
```

1. Add the provisioner for the newly added CSI driver.
1. Configure **Volume Snapshot Class Name**, which refers to the name of the `VolumeSnapshotClass` used to create volume snapshots or VM snapshots.
1. Configure **Backup Volume Snapshot Class Name**, which refers to the name of the `VolumeSnapshotClass` used to create VM backups.

## `default-vm-termination-grace-period-seconds`

_Available as of v1.2.0_

This setting allows you to specify a default termination grace period for stopping a virtual machine in seconds.

Default: `120`

## `http-proxy`

This setting allows you to configure an HTTP proxy to access external services, including the download of images and backup to s3 services.

Default: `{}`

The following options and values can be set:

- Proxy URL for HTTP requests: `"httpProxy": "http://<username>:<pswd>@<ip>:<port>"`
- Proxy URL for HTTPS requests: `"httpsProxy": "https://<username>:<pswd>@<ip>:<port>"`
- Comma-separated list of hostnames and/or CIDRs: `"noProxy": "<hostname | CIDR>"`

:::caution

If you configure `httpProxy` and `httpsProxy`, you must also put Harvester node's CIDR into `noProxy`, otherwise the Harvester cluster will be broken.
If you also configure `cluster-registration-url`, you usually need to add the host of `cluster-registration-url` to `noProxy` as well, otherwise you cannot access the Harvester cluster from Rancher.

:::

#### Example

```json
{
  "httpProxy": "http://my.proxy",
  "httpsProxy": "https://my.proxy",
  "noProxy": "some.internal.svc,172.16.0.0/16"
}
```

:::note

Harvester appends necessary addresses to user configured `noProxy` to ensure the internal traffic works.
i.e., `localhost,127.0.0.1,0.0.0.0,10.0.0.0/8,longhorn-system,cattle-system,cattle-system.svc,harvester-system,.svc,.cluster.local`. The `harvester-system` was added into the list since v1.1.2.

:::

:::caution

Changing this setting might cause a short downtime for single-node clusters.

:::

## `log-level`

This setting allows you to configure the log level for the Harvester server.

Default: `info`

The following values can be set. The list goes from the least to most verbose log level:

- `panic`
- `fatal`
- `error`
- `warn`, `warning`
- `info`
- `debug`
- `trace`

#### Example

```
debug
```

## `ntp-servers`

_Available as of v1.2.0_

This setting allows you to configure NTP servers for time synchronization on the Harvester nodes.

Using this setting, you can define NTP servers during [installation](../install/harvester-configuration.md#osntp_servers) or update NTP servers after installation.

:::caution

Modifying the NTP servers will replace the previous values for all nodes.

:::

Default: ""

#### Example

```
{
  "ntpServers": [
    "0.suse.pool.ntp.org",
    "1.suse.pool.ntp.org"
  ]
}
```

## `overcommit-config`

This setting allows you to configure the percentage for resources overcommit on CPU, memory, and storage. By setting resources overcommit, this will permit to schedule additional virtual machines even if the the physical resources are already fully utilized.

Default: `{ "cpu":1600, "memory":150, "storage":200 }`

The default CPU overcommit with 1600% means, for example, if the CPU resources
limit of a virtual machine is `1600m` core, Harvester would only request `100m`
CPU for it from Kubernetes scheduler.

#### Example

```json
{
  "cpu": 1000,
  "memory": 200,
  "storage": 300
}
```

## `release-download-url`

_Available as of v1.0.1_

This setting allows you to configure the `upgrade release download` URL address. Harvester will get the ISO URL and checksum value from the `${URL}/${VERSION}/version.yaml` file hosted by the configured URL.

Default: `https://releases.rancher.com/harvester`

#### Example of the version.yaml

```
apiVersion: harvesterhci.io/v1beta1
kind: Version
metadata:
  name: ${VERSION}
  namespace: harvester-system
spec:
  isoChecksum: ${ISO_CHECKSUM}
  isoURL: ${ISO_URL}
```

## `server-version`

This setting displays the version of Harvester server.

#### Example

```
v1.0.0-abcdef-head
```

## `ssl-certificates`

This setting allows you to configure serving certificates for Harvester UI/API.

Default: `{}`

#### Example

```json
{
  "ca": "-----BEGIN CERTIFICATE-----\nSOME-CERTIFICATE-ENCODED-IN-PEM-FORMAT\n-----END CERTIFICATE-----",
  "publicCertificate": "-----BEGIN CERTIFICATE-----\nSOME-CERTIFICATE-ENCODED-IN-PEM-FORMAT\n-----END CERTIFICATE-----",
  "privateKey": "-----BEGIN RSA PRIVATE KEY-----\nSOME-PRIVATE-KEY-ENCODED-IN-PEM-FORMAT\n-----END RSA PRIVATE KEY-----"
}
```

:::caution

Changing this setting might cause a short downtime on single-node clusters.

:::

## `ssl-parameters`

This setting allows you to change the enabled SSL/TLS protocols and ciphers of Harvester GUI and API.

The following options and values can be set:

- `protocols`: Enabled protocols. See NGINX Ingress Controller's configs [`ssl-protocols`](https://kubernetes.github.io/ingress-nginx/user-guide/nginx-configuration/configmap/#ssl-protocols) for supported input.

- `ciphers`: Enabled ciphers. See NGINX Ingress Controller's configs [`ssl-ciphers`](https://kubernetes.github.io/ingress-nginx/user-guide/nginx-configuration/configmap/#ssl-ciphers) for supported input.

If no value is provided, `protocols` is set to `TLSv1.2` only and the `ciphers` list is
`ECDHE-ECDSA-AES128-GCM-SHA256:ECDHE-ECDSA-AES256-GCM-SHA384:ECDHE-ECDSA-CHACHA20-POLY1305`.

Default: none

:::note

See [Troubleshooting](../troubleshooting/harvester.md#i-cant-access-harvester-after-i-changed-ssltls-enabled-protocols-and-ciphers) if you have misconfigured this setting and no longer have access to Harvester GUI and API.

:::

#### Example

The following example sets the enabled SSL/TLS protocols to `TLSv1.2` and `TLSv1.3` and the ciphers list to
`ECDHE-ECDSA-AES128-GCM-SHA256` and `ECDHE-ECDSA-CHACHA20-POLY1305`.

```
{
  "protocols": "TLSv1.2 TLSv1.3",
  "ciphers": "ECDHE-ECDSA-AES128-GCM-SHA256:ECDHE-ECDSA-CHACHA20-POLY1305"
}
```

## `storage-network`

By default, Longhorn uses the default management network in the Harvester cluster that is limited to a single interface and shared with other workloads cluster-wide. This setting allows you to configure a segregated storage network when network isolation is preferred.

For details, please refer to the [Harvester Storage Network](./storagenetwork.md)

:::caution

Any change to storage-network requires shutting down all VMs before applying this setting.
IP Range should be IPv4 CIDR format and 4 times the number of your cluster nodes.

:::

Default: ""

#### Example

```
{
  "vlan": 100,
  "clusterNetwork": "storage",
  "range": "192.168.0.0/24"
}
```

## `support-bundle-image`

_Available as of v1.2.0_

This setting allows you to configure the support bundle image, with various versions available in [rancher/support-bundle-kit](https://hub.docker.com/r/rancher/support-bundle-kit/tags).

Default:
```
{
  "repository": "rancher/support-bundle-kit",
  "tag": "v0.0.25",
  "imagePullPolicy": "IfNotPresent"
}
```

**Supported options and values**:

The value is a JSON object literal that contains the following key-value pairs:

- `repository`: Name of the repository that stores the support bundle image.
- `tag`:  Tag assigned to the support bundle image.
- `imagePullPolicy`: Pull policy of the support bundle image. The supported values are `IfNotPresent`, `Always`, and `Never`. For more information, see [Image pull policy](https://kubernetes.io/docs/concepts/containers/images/#image-pull-policy) in the Kubernetes documentation.

## `support-bundle-namespaces`

_Available as of v1.2.0_

This setting allows you to specify additional namespaces when [collecting a support bundle](../troubleshooting/harvester.md#generate-a-support-bundle). The support bundle will only capture resources from pre-defined namespaces by default.

Here is the pre-defined namespaces list:
- cattle-dashboards
- cattle-fleet-local-system
- cattle-fleet-system
- cattle-fleet-clusters-system
- cattle-monitoring-system
- fleet-local
- harvester-system
- local
- longhorn-system
- cattle-logging-system

If you select more namespaces, it will append to the pre-defined namespaces list.

Default: none

## `support-bundle-timeout`

_Available as of v1.2.0_

This setting allows you to define the number of minutes Harvester allows for the completion of the support bundle generation process. The process is considered to have failed when the data collection and file packing tasks are not completed within the configured number of minutes. Harvester will not continue or retry support bundle generation processes that have timed out. When the value is "0", the timeout feature is disabled.

Default: `10`

## `upgrade-checker-enabled`

This setting allows you to automatically check if there's an upgrade available for Harvester.

Default: `true`

#### Example

```
false
```

## `upgrade-checker-url`

This setting allows you to configure the URL for the upgrade check of Harvester. Can only be used if the `upgrade-checker-enabled` setting is set to true.

Default: `https://harvester-upgrade-responder.rancher.io/v1/checkupgrade`

#### Example

```
https://your.upgrade.checker-url/v99/checkupgrade
```

## `vip-pools`

_Deprecated as of v1.2.0, use [IP Pool](../networking/ippool.md) instead_

This setting allows you to configure the global or namespace IP address pools of the VIP by CIDR or IP range.

Default: `{}`

:::note
Configuring multi-CIDR or IP range from UI is only available from Harvester v1.1.1.
:::

#### Example

```json
{
  "default": "172.16.0.0/24,172.16.1.0/24",
  "demo": "172.16.2.50-172.16.2.100,172.16.2.150-172.16.3.200"
}
```

## `vm-force-reset-policy`

This setting allows you to force reschedule VMs when a node is unavailable. When a node turns to be `Not Ready`, it will force delete the VM on that node and reschedule it to another available node after a period of seconds.

Default: `{"enable":true, "period":300}`

:::note
When a host is unavailable or is powered off, the VM only reboots and does not migrate.
:::

#### Example

```json
{
  "enable": "true",
  "period": 300
}
```

## UI Settings

### `branding`

_Available as of v1.2.0_

This setting allows you to globally re-brand the UI by customizing the Harvester product name, logos, and color scheme.

Default: **Harvester**

:::caution

Because this setting is part of the `settings.management.cattle.io` custom resource, you cannot configure any of the supported options (for example, `Logo` and `Primary Color`) using a [Harvester configuration](../install/harvester-configuration.md#system_settings) file.

:::

![containerd-registry](/img/v1.2/advanced/branding.png)

You can set the following options and values:

- **Private Label:** This option replaces "Harvester" with the value you provide in most places.
- **Logo:** Upload light and dark logos to replace the Harvester logo in the top-level navigation header.
- **Favicon:** Upload an icon to replace the Harvester favicon in the browser tab.
- **Primary Color:** You can override the primary color used throughout the UI with a custom color of your choice.
- **Link Color:** You can override the link color used throughout the UI with a custom color of your choice.

### `ui-index`

This setting allows you to configure the HTML index location for the UI.

Default: `https://releases.rancher.com/harvester-ui/dashboard/latest/index.html`

#### Example

```
https://your.static.dashboard-ui/index.html
```

### `ui-plugin-index`

This setting allows you to configure the JS address for the Harvester plugin (when accessing Harvester from Rancher).

Default: `https://releases.rancher.com/harvester-ui/plugin/harvester-latest/harvester-latest.umd.min.js`

#### Example

```
https://your.static.dashboard-ui/*.umd.min.js
```

### `ui-source`

This setting allows you to configure how to load the UI source.

You can set the following values:

- `auto`: The default. Auto-detect whether to use bundled UI or not.
- `external`: Use external UI source.
- `bundled`: Use the bundled UI source.

#### Example

```
external
```
