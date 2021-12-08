# Settings

This page contains a list of advanced settings which can be used in Harvester.
You can modify the custom resource `settings.harvesterhci.io` from the Dashboard UI or with the `kubectl` command.

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

## `http-proxy`

This setting allows you to configure an HTTP proxy to access external services, including the download of images and backup to s3 services.
Default: `{}`

The following options and values can be set:

- Proxy URL for HTTP requests: `"httpProxy": "http://<username>:<pswd>@<ip>:<port>"`
- Proxy URL for HTTPS requests: `"httpsProxy": "https://<username>:<pswd>@<ip>:<port>"`
- Comma-separated list of hostnames and/or CIDRs: `"noProxy": "<hostname | CIDR>"`

#### Example

```json
{
  "httpProxy": "http://my.proxy",
  "httpsProxy": "https://my.proxy",
  "noProxy": "some.internal.svc"
}
```

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

## `server-url`

This setting displays the Harvester server URL, used for the Harvester management endpoint and GUI URL. If a [virtual IP (VIP)][harvester-vip] has been set, then the value displayed will be the VIP address instead of the host IP.

[harvester-vip]: ../install/harvester-configuration.md#installvip

#### Example

```
https://192.168.122.11
```

## `server-version`

This setting displays the version of Harvester server.

#### Example

```
v1.0.0-abcdef-head
```

## `ui-index`

This setting allows you to configure HTML index location for the UI.

Default: `https://releases.rancher.com/harvester-ui/dashboard/latest/index.html`

#### Example

```
https://your.static.dashboard-ui/index.html
```

## `ui-source`

This setting allows you to configure how to load the UI source.

The following values can be set:

- `auto`: The default. Auto-detect whether to use bundled UI or not.
- `external`: Use external UI source.
- `bundled`: Use the bundled UI source.

#### Example

```
external
```

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

## `vlan`

This setting allows you to configure the default physical NIC name of the VLAN network.

Default: none

#### Example

```
ens3
```

## `auto-disk-provision-paths`

This setting allows Harvester to automatically add disks that match the given glob pattern as VM storages.
It's possible to provide multiple patterns by separating them with comma.

!!! warning
    - This setting is applied to **every Node** in the cluster.
    - All the data in these storage devices **will be destroyed**. Use at your own risk.

Default: none

#### Example

Add disks matches glob pattern `/dev/sd*` or `/dev/hd*`:

```
/dev/sd*,/dev/hd*
```

## `ssl-parameters`

This setting allows you to change the enabled SSL/TLS protocols and ciphers of Harvester GUI and API.

The following options and values can be set:

- `protocols`: Enabled protocols. See NGINX Ingress Controller's configs [`ssl-protocols`](https://kubernetes.github.io/ingress-nginx/user-guide/nginx-configuration/configmap/#ssl-protocols) for supported input.

- `ciphers`: Enabled ciphers. See NGINX Ingress Controller's configs [`ssl-ciphers`](https://kubernetes.github.io/ingress-nginx/user-guide/nginx-configuration/configmap/#ssl-ciphers) for supported input.

If no value is provided, default protocols are set to `TLSv1.2` only and ciphers are
`ECDHE-ECDSA-AES128-GCM-SHA256:ECDHE-ECDSA-AES256-GCM-SHA384:ECDHE-ECDSA-CHACHA20-POLY1305`.

Default: none

#### Example

Set SSL/TLS enabled protocols to `TLSv1.2` and `TLSv1.3` and enabled ciphers to
`ECDHE-ECDSA-AES128-GCM-SHA256` and `ECDHE-ECDSA-CHACHA20-POLY1305`.

```
{
  "protocols": "TLSv1.2 TLSv1.3",
  "ciphers": "ECDHE-ECDSA-AES128-GCM-SHA256:ECDHE-ECDSA-CHACHA20-POLY1305"
}
```
