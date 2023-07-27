---
sidebar_position: 3
sidebar_label: Air Gapped Environment
title: "Air Gapped Environment"
keywords:
- Harvester
- offline
- Air-gap
- HTTP proxy
---

This section describes how to use Harvester in an air gapped environment. Some use cases could be where Harvester will be installed offline, behind a firewall, or behind a proxy.

The Harvester ISO image contains all the packages to make it work in an air gapped environment.

## Working without HTTP Proxy

In this example, we use KVM to provision Harvester and integrate it with Rancher.

### Setup offline Harvester

1. Clone [harvester/ipxe-examples](https://github.com/harvester/ipxe-examples).
1. Select the `vagrant-pxe-harvester` folder.
1. Edit [settings.yml](https://github.com/harvester/ipxe-examples/blob/c8267b6270660255bf71149a1fef3a7a914550de/vagrant-pxe-harvester/settings.yml#L44) and set `offline: true`.
1. Execute the [setup_harvester.sh](https://github.com/harvester/ipxe-examples/blob/main/vagrant-pxe-harvester/setup_harvester.sh) script.

### Deploy Rancher on K3s and setup private registry in another VM

1. Create another KVM with two network interfaces, `harvester` and `vagrant-libvirt`.

    - `harvester` is for intranet and `vagrant-libvirt` is for internet. 
    - We need `vagrant-libvirt` to download all required resources. We will remove it before we start Rancher. 
    - Configure this VM with at least 300GB to save all required images.

1. Install [Docker](https://www.docker.com/) and [Helm](https://helm.sh/).
1. Create a `certs` folder.

    ```
    mkdir -p certs
    ```

1. Generate private registry certificate files.

    ```
    openssl req \
    -newkey rsa:4096 -nodes -sha256 -keyout certs/domain.key \
    -addext "subjectAltName = DNS:myregistry.local" \
    -x509 -days 365 -out certs/domain.crt
    ```

1. Move certificate files to `/etc/docker/certs.d`.

    ```
    sudo mkdir -p /etc/docker/certs.d/myregistry.local:5000
    sudo cp certs/domain.crt /etc/docker/certs.d/myregistry.local:5000/domain.crt
    ```

1. Start the private registry.

    ```
    docker run -d \
    -p 5000:5000 \
    --restart=always \
    --name registry \
    -v "$(pwd)"/certs:/certs \
    -v "$(pwd)"/registry:/var/lib/registry \
    -e REGISTRY_HTTP_TLS_CERTIFICATE=/certs/domain.crt \
    -e REGISTRY_HTTP_TLS_KEY=/certs/domain.key \
    registry:2
    ```

1. Add `myregistry.local` to `/etc/hosts`. Remember to change `192.168.0.50` to your private IP.

    ```
    # vim /etc/hosts
    192.168.0.50 myregistry.local
    ```

1. Create a `get-rancher` script.

    ```
    # vim get-rancher
    #!/bin/bash
    if [[ $# -eq 0 ]] ; then
        echo 'This requires you to pass a version for the url like "v2.6.4"'
        exit 1
    fi
    wget https://github.com/rancher/rancher/releases/download/$1/rancher-images.txt
    wget https://github.com/rancher/rancher/releases/download/$1/rancher-load-images.sh
    wget https://github.com/rancher/rancher/releases/download/$1/rancher-save-images.sh
    chmod +x ./rancher-save-images.sh
    chmod +x ./rancher-load-images.sh
    ```

1. Make `get-rancher` script be excutable.

    ```
    chmod +x get-rancher
    ```

1. Download `rancher-images.txt`, `rancher-load-images.sh` and `rancher-save-images.sh`.

    ```
    ./get-rancher v2.6.4
    ```

1. Add cert-manager images to `rancher-images.txt`.

    ```
    helm repo add jetstack https://charts.jetstack.io/
    helm repo update
    helm fetch jetstack/cert-manager --version v1.7.1
    helm template ./cert-manager-v1.7.1.tgz | awk '$1 ~ /image:/ {print $2}' | sed s/\"//g >> ./rancher-images.txt
    ```

1. Sort `rancher-images.txt`.

    ```
    sort -u rancher-images.txt -o rancher-images.txt
    ```

1. Get images. This step may take 1 to 2 hours depending on your network speed.

    ```
    ./rancher-save-images.sh --image-list ./rancher-images.txt
    ```

1. Load images to local registry.

    ```
    ./rancher-load-images.sh --image-list ./rancher-images.txt --registry myregistry.local:5000
    ```

1. Create a `get-k3s` script.

    ```
    # vim get-k3s
    #!/bin/bash
    if [[ $# -eq 0 ]] ; then
        echo 'This requires you to pass a version for the url like "v1.23.4+k3s1"'
        exit 1
    fi
    wget https://github.com/k3s-io/k3s/releases/download/$1/k3s-airgap-images-amd64.tar
    wget https://github.com/k3s-io/k3s/releases/download/$1/k3s
    wget https://get.k3s.io/ -O install.sh
    chmod +x ./k3s
    chmod +x ./install.sh
    ```

1. Make `get-k3s` excuteable.

    ```
    chmod +x get-k3s
    ```

1. Download `k3s-airgap-images-amd64.tar`, `k3s` and `install.sh`.

    ```
    ./get-k3s v1.23.4+k3s1
    ```

1. Download Rancher.

    ```
        helm repo add rancher-latest https://releases.rancher.com/server-charts/latest
        helm fetch rancher-latest/rancher --version=v2.6.4
    ```

1. Download `cert-manager-crds.yaml`.

    ```
    mkdir cert-manager
    curl -L -o cert-manager/cert-manager-crd.yaml https://github.com/jetstack/cert-manager/releases/download/v1.7.1/cert-manager.crds.yaml
    ```

1. Remove the `vagrant-libvirt` network interface. Once the required resources download, you can remove the network.

1. Move `k3s-airgap-images-amd64.tar` to `/var/lib/rancher/k3s/agent/images/`.

    ```
    sudo mkdir -p /var/lib/rancher/k3s/agent/images/
    sudo cp k3s-airgap-images-amd64.tar /var/lib/rancher/k3s/agent/images/
    ```

1. Create a `/etc/rancher/k3s` folder.

    ```
    mkdir -p /etc/rancher/k3s
    ```

1. Add `registries.yaml` to `/etc/rancher/k3s`.

    ```
    # vim /etc/rancher/k3s/registries.yaml
    mirrors:
    docker.io:
        endpoint:
        - "https://myregistry.local:5000/"
    configs:
    "myregistry.local:5000":
        tls:
        insecure_skip_verify: true
    ```

1. Install K3s.

    ```
    INSTALL_K3S_SKIP_DOWNLOAD=true ./install.sh
    ```

1. Generate cert-manager YAML files.

    ```
    helm template cert-manager ./cert-manager-v1.7.1.tgz --output-dir . \
        --namespace cert-manager \
        --set image.repository=myregistry.local:5000/quay.io/jetstack/cert-manager-controller \
        --set webhook.image.repository=myregistry.local:5000/quay.io/jetstack/cert-manager-webhook \
        --set cainjector.image.repository=myregistry.local:5000/quay.io/jetstack/cert-manager-cainjector \
        --set startupapicheck.image.repository=myregistry.local:5000/quay.io/jetstack/cert-manager-ctl
    ```

1. Move `/etc/rancher/k3s/k3s.yaml` to `~/.kube`.

    ```
    mkdir ~/.kube
    sudo cp /etc/rancher/k3s/k3s.yaml ~/.kube/config
    sudo chown $USER ~/.kube/config
    export KUBECONFIG=~/.kube/config
    ```

1. Install cert-manager.

    ```
    kubectl create namespace cert-manager
    kubectl apply -f cert-manager/cert-manager-crd.yaml
    kubectl apply -R -f ./cert-manager
    ```

1. Create a CA private key and a certificate file.

    ```
    openssl genrsa -out cakey.pem 2048
    openssl req -x509 -sha256 -new -nodes -key cakey.pem -days 3650 -out cacerts.pem -subj "/CN=cattle-ca"
    ```

1. Create `openssl.cnf`. Remember to change `192.168.0.50` to your private IP.

    ```
    [req]
    req_extensions = v3_req
    distinguished_name = req_distinguished_name
    [req_distinguished_name]
    [ v3_req ]
    basicConstraints = CA:FALSE
    keyUsage = nonRepudiation, digitalSignature, keyEncipherment
    extendedKeyUsage = clientAuth, serverAuth
    subjectAltName = @alt_names
    [alt_names]
    DNS.1 = myrancher.local
    IP.1 = 192.168.0.50
    ```

1. Generate s private key and a certificate file for `myrancher.local`.

    ```
    openssl genrsa -out tls.key 2048
    openssl req -sha256 -new -key tls.key -out tls.csr -subj "/CN=myrancher.local" -config openssl.cnf
    openssl x509 -sha256 -req -in tls.csr -CA cacerts.pem \
        -CAkey cakey.pem -CAcreateserial -out tls.crt \
        -days 3650 -extensions v3_req \
        -extfile openssl.cnf
    ```

1. Create a `cattle-system` namespace.

    ```
    kubectl create ns cattle-system
    ```

1. Create a `tls.sa` secret.

    ```
    kubectl -n cattle-system create secret generic tls-ca \
    --from-file=cacerts.pem=./cacerts.pem
    ```

1. Create a `tls-rancher-ingress` secret.

    ```
    kubectl -n cattle-system create secret tls tls-rancher-ingress \
    --cert=tls.crt \
    --key=tls.key
    ```

1. Generate Rancher YAML files.

    ```
    helm template rancher ./rancher-2.6.4.tgz --output-dir . \
        --no-hooks \
        --namespace cattle-system \
        --set hostname=myrancher.local \
        --set rancherImageTag=v2.6.4 \
        --set rancherImage=myregistry.local:5000/rancher/rancher \
        --set systemDefaultRegistry=myregistry.local:5000 \
        --set useBundledSystemChart=true \
        --set ingress.tls.source=secret \
        --set privateCA=true
    ```

1. Install Rancher.

    ```
    kubectl -n cattle-system apply -R -f ./rancher
    ```

1. Add `myrancher.local` to `/etc/hosts`. Remember to change `192.168.0.50` to your private IP.

    ```
    # vim /etc/hosts
    192.168.0.50 myregistry.local myrancher.local
    ```

### Integrate Harvester with Rancher in air-gapped environment

1. (Harvester VM) Add `myregistry.local` to `/etc/hosts`. Remember to change `192.168.0.50` to your private IP.

    ```
    # vim /etc/hosts
    192.168.0.50 myregistry.local
    ```

1. (Harvester VM) Add `registries.yaml` to `/etc/rancher/rke2/`.

    ```
    # vim /etc/rancher/rke2/registries.yaml
    mirrors:
    docker.io:
        endpoint:
        - "https://myregistry.local:5000"
    configs:
    "myregistry.local:5000":
        tls:
        insecure_skip_verify: true
    ```

1. (Harvester VM) Restart RKE2.

    ```
    systemctl restart rke2-server.service
    ```

1. (Harvester VM) Update the `rke2-coredns-rke2-coredns` ConfigMap. Remember to change `192.168.0.50` to your private IP.

    ```
    # replace data like following
    data:
    Corefile: ".:53 {\n    errors \n    health  {\n        lameduck 5s\n    }\n    ready
        \n    kubernetes   cluster.local  cluster.local in-addr.arpa ip6.arpa {\n        pods
        insecure\n        fallthrough in-addr.arpa ip6.arpa\n        ttl 30\n    }\n    prometheus
        \  0.0.0.0:9153\n   hosts /etc/coredns/customdomains.db myrancher.local {\n
        \   fallthrough\n    }\n forward   . /etc/resolv.conf\n    cache   30\n    loop
        \n    reload \n    loadbalance \n}"
    customdomains.db: |
        192.168.0.50 myrancher.local
    ```

1. (Harvester VM) Update the `rke2-coredns-rke2-coredns` deployment.

    ```
    # Add customdomains.db to volumes
    - key: customdomains.db
    path: customdomains.db
    ```

    ![rke2-dns-customdomains.db](/img/v1.1/rke2-dns-customdomains.db.png)

1. Follow [Rancher Integration](./rancher/rancher-integration.md) to import Harvester to Rancher.

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
    i.e., `localhost,127.0.0.1,0.0.0.0,10.0.0.0/8,longhorn-system,cattle-system,cattle-system.svc,harvester-system,.svc,.cluster.local`. `harvester-system` was added into the list since v1.1.2.

    When the nodes in the cluster do not use a proxy to communicate with each other, the CIDR needs to be added to `http-proxy.noProxy` after the first node is installed successfully. Please refer to [fail to deploy a multi-node cluster](./troubleshooting/harvester.md#fail-to-deploy-a-multi-node-cluster-due-to-incorrect-http-proxy-setting).

    :::

## Guest Cluster Images

All necessary images to install and run Harvester are conveniently packaged into the ISO, eliminating the need to pre-load images on bare-metal nodes. A Harvester cluster manages them independently and effectively behind the scenes.

However, it's essential to understand a guest K8s cluster (e.g., RKE2 cluster) created by the [Harvester node driver](./rancher/node/node-driver.md) is a distinct entity from a Harvester cluster. A guest cluster operates within VMs and requires pulling images either from the internet or a [private registry](https://ranchermanager.docs.rancher.com/how-to-guides/new-user-guides/authentication-permissions-and-global-configuration/global-default-private-registry#configure-a-private-registry-with-credentials-when-creating-a-cluster).

If the **Cloud Provider** option is configured to **Harvester** in a guest K8s cluster, it deploys the Harvester cloud provider and Container Storage Interface (CSI) driver.

![cluster-registry](/img/v1.1/cluster-registry.png)

As a result, we recommend monitoring each [RKE2 release](https://github.com/rancher/rke2/releases) in your air gapped environment and pulling the required images into your private registry. Please refer to the **Harvester CCM & CSI Driver** with RKE2 Releases section on the [Harvester support matrix page](https://www.suse.com/suse-harvester/support-matrix/all-supported-versions/harvester-v1-1-2/) for the best Harvester cloud provider and CSI driver capability support.
