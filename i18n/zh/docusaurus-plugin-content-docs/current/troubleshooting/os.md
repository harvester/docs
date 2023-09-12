---
sidebar_position: 3
sidebar_label: 操作系统
title: "操作系统"
---

Harvester 在基于 OpenSUSE 的操作系统上运行。这个操作系统是 [elemental-toolkit](https://github.com/rancher/elemental-toolkit) 的项目。本文介绍如何对操作系统相关问题进行故障排除。

## 如何登录到 Harvester 节点

你可以使用用户名 `rancher` 和密码或安装时提供的 SSH 密钥对登录到 Harvester 节点。
`rancher` 用户可以不输入密码就执行特权命令：

```
# 运行特权命令
rancher@node1:~> sudo blkid

# 或成为 root 用户
rancher@node1:~> sudo -i
node1:~ # blkid
```
## 如何安装包？为什么有些路径是只读的？

操作系统文件系统，就像容器镜像一样，是基于镜像并且不可变的（除了某些目录）。

我们建议使用 **toolbox 容器**来运行未打包在 Harvester OS 中的程序以进行调试。请参阅[本文](https://harvesterhci.io/kb/package_your_own_toolbox_image/)了解如何构建和运行 toolbox 容器。

Harvester OS 还提供了一种临时启用读写模式的方法。请按照以下步骤操作：

:::caution

读写模式下，文件被修改可能会破坏你的系统，请谨慎使用。

:::

- 对于版本 `v0.3.0`，你需要在启用读写模式后先应用解决方法，来[使某些目录不重叠](https://github.com/harvester/harvester/issues/1388)。在正在运行的 Harvester 节点上，以 root 用户运行以下命令：

   ```
   cat > /oem/91_hack.yaml <<'EOF'
   name: "Rootfs Layout Settings for debugrw"
   stages:
     rootfs:
       - if: 'grep -q root=LABEL=COS_STATE /proc/cmdline && grep -q rd.cos.debugrw /proc/cmdline'
         name: "Layout configuration for debugrw"
         environment_file: /run/cos/cos-layout.env
         environment:
           RW_PATHS: " "
   EOF
   ```

- 重新启动系统到 GRUB 菜单。按 ESC 停留在菜单上。

   ![](/img/v1.2/troubleshooting/grub-menu.png)

- 在第一个菜单项上按 `e`。将 `rd.cos.debugrw` 尾附到 `linux (loop0)$kernel $kernelcmd` 行。按 `Ctrl + x` 启动系统。

   ![](/img/v1.2/troubleshooting/edit-boot-parameter.png)

## 如何永久编辑内核参数

:::note

以下步骤是一种解决方法。如果我们有了永久的解决方案，我们将通知社区。

:::

- 在 rw 模式重新挂载状态目录：
   ```
   # blkid -L COS_STATE
   /dev/vda2
   # mount -o remount,rw /dev/vda2 /run/initramfs/cos-state
   ```
- 编辑 grub 配置文件并将参数尾附到 `linux (loop0)$kernel $kernelcmd` 行。以下示例添加一个 `nomodeset` 参数：
   ```
   # vim /run/initramfs/cos-state/grub2/grub.cfg
   menuentry "${display_name}" --id cos {
     # label is kept around for backward compatibility
     set label=${active_label}
     set img=/cOS/active.img
     loopback $loopdev /$img
     source ($loopdev)/etc/cos/bootargs.cfg
     linux ($loopdev)$kernel $kernelcmd ${extra_cmdline} ${extra_active_cmdline} nomodeset
     initrd ($loopdev)$initramfs
   }
   ```
- 重新启动以使更改生效。
## 如何更改默认的 GRUB 引导菜单入口

如果需要更改默认的入口，先检查菜单入口的 `--id` 属性，如下：

```
# cat /run/initramfs/cos-state/grub2/grub.cfg

<...>
menuentry "${display_name} (debug)" --id cos-debug {
  search --no-floppy --set=root --label COS_STATE
  set img=/cOS/active.img
  set label=COS_ACTIVE
  loopback loop0 /$img
  set root=($root)
  source (loop0)/etc/cos/bootargs.cfg
  linux (loop0)$kernel $kernelcmd ${extra_cmdline} ${extra_passive_cmdline} ${crash_kernel_params}
  initrd (loop0)$initramfs
}
```

以上入口的 id 是 `cos-debug`。然后通过以下方式设置默认入口：

```
# grub2-editenv /oem/grubenv set saved_entry=cos-debug
```
## 如何调试系统崩溃或挂起

### 收集崩溃日志

如果系统崩溃时，系统日志中没有记录内核恐慌跟踪，你可以使用串行控制台找到崩溃日志。

要将内核消息输出到串行控制台，请按照以下步骤操作：

- 将系统启动到 GRUB 菜单。按 ESC 停留在菜单上。
   ![](/img/v1.2/troubleshooting/grub-menu.png)
- 在第一个菜单项上按 `e`。将 `console=ttyS0,115200n8` 尾附到 `linux (loop0)$kernel $kernelcmd` 行。按 `Ctrl + x` 启动系统。

   ![](/img/v1.2/troubleshooting/edit-boot-parameter-serial.png)

:::note

根据你的环境调整[控制台选项](https://www.kernel.org/doc/html/latest/admin-guide/serial-console.html)。**确保**将 `console=` 字符串尾附到行后。

:::

- 连接到串行端口来捕获日志。
### 收集故障转储
对于内核恐慌崩溃，你可以使用 kdump 来收集崩溃转储。

默认情况下，操作系统会在未启用 kdump 功能的情况下启动。你可以通过在启动时选择 `debug` 菜单项来启用该功能，如下例所示：

![](/img/v1.2/troubleshooting/grub-menu-debug.png)

系统崩溃时，崩溃转储将存储在 `/var/crash/<time>` 目录中。你可以将崩溃转储提供给开发人员，从而帮助他们排查故障和解决问题。
