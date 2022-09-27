---
sidebar_position: 3
sidebar_label: Air Gapped Environment
title: ""
keywords:
- Harvester
- offline
- Air-gap
- HTTP proxy
---

# Air Gapped Environment

This section describes how to use Harvester in an air gapped environment. Some use cases could be where Harvester will be installed offline, behind a firewall, or behind a proxy.

The Harvester ISO image contains all the packages to make it work in an air gapped environment.

## Working Behind an HTTP Proxy

In some environments, the connection to external services, from the servers or VMs, requires an HTTP(S) proxy.

### Configure an HTTP Proxy During Installation

You can configure the HTTP(S) proxy during the [ISO installation](./install/iso-install.md) as shown in picture below:

![iso-proxy](/img/v1.1/iso-proxy.png)

### Configure an HTTP Proxy in Harvester Settings

You can configure the HTTP(S) proxy in the settings page of the Harvester dashboard:

1. Go to the settings page of the Harvester UI.
1. Find the `http-proxy` setting, click **⋮ > Edit setting**
1. Enter the value(s) for `http-proxy`, `https-proxy` and `no-proxy`.

![proxy-setting](/img/v1.1/proxy-setting.png)

:::note

Harvester appends necessary addresses to user configured `no-proxy` to ensure the internal traffic works.
i.e., `localhost,127.0.0.1,0.0.0.0,10.0.0.0/8,longhorn-system,cattle-system,cattle-system.svc,.svc,.cluster.local`

:::
