---
sidebar_position: 8
sidebar_label: Import Existing Cluster built on Harvester VM
title: "Import Existing Cluster built on Harvester VM"
keywords:
  - Harvester
  - harvester
  - Rancher
  - rancher
---

<head>
  <link rel="canonical" href="https://docs.harvesterhci.io/v1.4/rancher/import-existing-vm"/>
</head>

Rancher allows you to import existing Harvester VMs in which you installed Kubernetes.

## Deployment

### Prerequisites

- The Kubernetes cluster is built on top of Harvester VMs.

### Deploy Guest Clusters on Harvester VMs

1. Generate the csi-driver cloud-config file using the [generate_addon_csi.sh](https://raw.githubusercontent.com/harvester/harvester-csi-driver/master/deploy/generate_addon_csi.sh) script, which is available in the [harvester/harvester-csi-driver](https://github.com/harvester/harvester-csi-driver) repository.

    Example:

    ```shell
    ./generate_addon_csi.sh <serviceaccount name> <namespace> RKE2
    ```

    The generated output will be similar to the following one:
    ```yaml
    ########## cloud-config ############
    apiVersion: v1
    clusters:
    - cluster: <token>
        server: https://<YOUR HOST HARVESTER VIP>:6443
      name: default
    contexts:
    - context:
        cluster: default
        namespace: default
        user: rke2-guest-01-default-default
      name: rke2-guest-01-default-default
    current-context: rke2-guest-01-default-default
    kind: Config
    preferences: {}
    users:
    - name: rke2-guest-01-default-default
      user:
        token: <token>

    ########## cloud-init user data ############
    write_files:
      - encoding: b64
        content: YXBpVmVyc2lvbjogdjEKY2x1c3RlcnM6Ci0gY2x1c3RlcjoKICAgIGNlcnRpZmljYXRlLWF1dGhvcml0eS1kYXRhOiBMUzB0TFMxQ1JVZEpUaUJEUlZKVVNVWkpRMEZVUlMwdExTMHRDazFKU1VKbFZFTkRRVklyWjBGM1NVSkJaMGxDUVVSQlMwSm5aM0ZvYTJwUFVGRlJSRUZxUVd0TlUwbDNTVUZaUkZaUlVVUkVRbXg1WVRKVmVVeFlUbXdLWTI1YWJHTnBNV3BaVlVGNFRtcG5NVTE2VlhoT1JGRjNUVUkwV0VSVVNYcE5SRlY1VDFSQk5VMVVRVEJOUm05WVJGUk5lazFFVlhsT2FrRTFUVlJCTUFwTlJtOTNTa1JGYVUxRFFVZEJNVlZGUVhkM1dtTnRkR3hOYVRGNldsaEtNbHBZU1hSWk1rWkJUVlJaTkU1VVRURk5WRkV3VFVSQ1drMUNUVWRDZVhGSENsTk5ORGxCWjBWSFEwTnhSMU5OTkRsQmQwVklRVEJKUVVKSmQzRmFZMDVTVjBWU2FsQlVkalJsTUhFMk0ySmxTSEZEZDFWelducGtRa3BsU0VWbFpHTUtOVEJaUTNKTFNISklhbWdyTDJab2VXUklNME5ZVURNeFZXMWxTM1ZaVDBsVGRIVnZVbGx4YVdJMGFFZE5aekpxVVdwQ1FVMUJORWRCTVZWa1JIZEZRZ292ZDFGRlFYZEpRM0JFUVZCQ1owNVdTRkpOUWtGbU9FVkNWRUZFUVZGSUwwMUNNRWRCTVZWa1JHZFJWMEpDVWpaRGEzbEJOSEZqYldKSlVESlFWVW81Q2xacWJWVTNVV2R2WjJwQlMwSm5aM0ZvYTJwUFVGRlJSRUZuVGtsQlJFSkdRV2xCZUZKNU4xUTNRMVpEYVZWTVdFMDRZazVaVWtWek1HSnBZbWxVSzJzS1kwRnhlVmt5Tm5CaGMwcHpMM2RKYUVGTVNsQnFVVzVxZEcwMVptNTZWR3AxUVVsblRuTkdibFozWkZRMldXWXpieTg0ZFRsS05tMWhSR2RXQ2kwdExTMHRSVTVFSUVORlVsUkpSa2xEUVZSRkxTMHRMUzBLCiAgICBzZXJ2ZXI6IGh0dHBzOi8vMTkyLjE2OC4wLjEzMTo2NDQzCiAgbmFtZTogZGVmYXVsdApjb250ZXh0czoKLSBjb250ZXh0OgogICAgY2x1c3RlcjogZGVmYXVsdAogICAgbmFtZXNwYWNlOiBkZWZhdWx0CiAgICB1c2VyOiBya2UyLWd1ZXN0LTAxLWRlZmF1bHQtZGVmYXVsdAogIG5hbWU6IHJrZTItZ3Vlc3QtMDEtZGVmYXVsdC1kZWZhdWx0CmN1cnJlbnQtY29udGV4dDogcmtlMi1ndWVzdC0wMS1kZWZhdWx0LWRlZmF1bHQKa2luZDogQ29uZmlnCnByZWZlcmVuY2VzOiB7fQp1c2VyczoKLSBuYW1lOiBya2UyLWd1ZXN0LTAxLWRlZmF1bHQtZGVmYXVsdAogIHVzZXI6CiAgICB0b2tlbjogZXlKaGJHY2lPaUpTVXpJMU5pSXNJbXRwWkNJNklreGhUazQxUTBsMWFsTnRORE5TVFZKS00waE9UbGszTkV0amNVeEtjM1JSV1RoYVpUbGZVazA0YW1zaWZRLmV5SnBjM01pT2lKcmRXSmxjbTVsZEdWekwzTmxjblpwWTJWaFkyTnZkVzUwSWl3aWEzVmlaWEp1WlhSbGN5NXBieTl6WlhKMmFXTmxZV05qYjNWdWRDOXVZVzFsYzNCaFkyVWlPaUprWldaaGRXeDBJaXdpYTNWaVpYSnVaWFJsY3k1cGJ5OXpaWEoyYVdObFlXTmpiM1Z1ZEM5elpXTnlaWFF1Ym1GdFpTSTZJbkpyWlRJdFozVmxjM1F0TURFdGRHOXJaVzRpTENKcmRXSmxjbTVsZEdWekxtbHZMM05sY25acFkyVmhZMk52ZFc1MEwzTmxjblpwWTJVdFlXTmpiM1Z1ZEM1dVlXMWxJam9pY210bE1pMW5kV1Z6ZEMwd01TSXNJbXQxWW1WeWJtVjBaWE11YVc4dmMyVnlkbWxqWldGalkyOTFiblF2YzJWeWRtbGpaUzFoWTJOdmRXNTBMblZwWkNJNkltTXlZak5sTldGaExUWTBNMlF0TkRkbU1pMDROemt3TFRjeU5qWXpNbVl4Wm1aaU5pSXNJbk4xWWlJNkluTjVjM1JsYlRwelpYSjJhV05sWVdOamIzVnVkRHBrWldaaGRXeDBPbkpyWlRJdFozVmxjM1F0TURFaWZRLmFRZmU1d19ERFRsSWJMYnUzWUVFY3hmR29INGY1VnhVdmpaajJDaWlhcXB6VWI0dUYwLUR0cnRsa3JUM19ZemdXbENRVVVUNzNja1BuQmdTZ2FWNDhhdmlfSjJvdUFVZC04djN5d3M0eXpjLVFsTVV0MV9ScGJkUURzXzd6SDVYeUVIREJ1dVNkaTVrRWMweHk0X0tDQ2IwRHQ0OGFoSVhnNlMwRDdJUzFfVkR3MmdEa24wcDVXUnFFd0xmSjdEbHJDOFEzRkNUdGhpUkVHZkUzcmJGYUdOMjdfamR2cUo4WXlJQVd4RHAtVHVNT1pKZUNObXRtUzVvQXpIN3hOZlhRTlZ2ZU05X29tX3FaVnhuTzFEanllbWdvNG9OSEpzekp1VWliRGxxTVZiMS1oQUxYSjZXR1Z2RURxSTlna1JlSWtkX3JqS2tyY3lYaGhaN3lTZ3o3QQo=
        owner: root:root
        path: /var/lib/rancher/rke2/etc/config-files/cloud-provider-config
        permissions: '0644'
    ```

1. Generate the cloud-provider cloud-config using the [generate_addon.sh](https://raw.githubusercontent.com/harvester/cloud-provider-harvester/master/deploy/generate_addon.sh) script, which is available in the [harvester/cloud-provider-harvester](https://github.com/harvester/cloud-provider-harvester) repository.

    Example:

    ```shell
    ./generate_addon.sh <serviceaccount name> <namespace>
    ```

    The generated output will be similar to the following one:
    The output will look as follows:

    ```yaml
    ########## cloud config ############
    apiVersion: v1
    clusters:
    - cluster:
        certificate-authority-data: <CACERT>
        server: https://HARVESTER-ENDPOINT/k8s/clusters/local
      name: local
    contexts:
    - context:
        cluster: local
        namespace: default
        user: harvester-cloud-provider-default-local
      name: harvester-cloud-provider-default-local
    current-context: harvester-cloud-provider-default-local
    kind: Config
    preferences: {}
    users:
    - name: harvester-cloud-provider-default-local
      user:
        token: <TOKEN>

    ########## cloud-init user data ############
    write_files:
    - encoding: b64
      content: <CONTENT>
      owner: root:root
      path: /etc/kubernetes/cloud-config
      permissions: '0644'
    ```

1. Create VM with two cloud-config files.

    ![VM with cloud-config](/img/v1.4/rancher/vm-with-cloud-config.png)

1. Install RKE2 in the VM.

    ```shell
    sudo mkdir -p /etc/rancher/rke2
    echo "cni: calico
    disable-kube-proxy: false
    etcd-expose-metrics: false" | sudo tee /etc/rancher/rke2/config.yaml
    curl -sfL https://get.rke2.io | sudo sh -
    sudo systemctl enable rke2-server.service
    sudo systemctl start rke2-server.service
    ```

1. Verify that RKE2 is running in the VM.

    ```shell
    sudo /var/lib/rancher/rke2/bin/kubectl --kubeconfig /etc/rancher/rke2/rke2.yaml get nodes
    ```

1. Import the VM into Rancher.

    On the Rancher UI, go to **Cluster Management** > **Clusters** > **Import Existing** > **Generic** > **Create**.

    ![Import Exisging Cluster](/img/v1.4/rancher/import-existing-cluster.png)

    ```shell
    # Run the command in the VM
    curl --insecure -sfL https://192.168.0.181:6443/v3/import/g5p2g2gtxw4564nktdl4nr5cwwvtwqp9zxd6dmhm5nc7vpnxmr9cfk_c-m-mzf28skd.yaml | sudo /var/lib/rancher/rke2/bin/kubectl --kubeconfig /etc/rancher/rke2/rke2.yaml apply -f -
    ```

1. Install the Harvester Cloud Provider.

    On the RKE2 Cluster Dashboard, go to **Apps** > **Charts** > **Harvester Cloud Provider** > **Install**.

1. Install the Harvester CSI Driver.

    On the RKE2 Cluster Dashboard, go to **Apps** > **Charts** > **Harvester CSI Driver** > **Install**.

