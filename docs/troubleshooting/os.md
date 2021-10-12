# Operating System

Harvester runs on a OpenSUSE-based OS. The OS is a derivative of [cOS toolkit](https://github.com/rancher-sandbox/cOS-toolkit).
We provide information and tips to help users troubleshoot OS-related issues in this guide.

## How can I install packages? Why are some paths read-only?

The OS file system is image-based (just like a container image!) and immutable except for some directories. To temporarily enable the read-write mode, please following these steps:

!!! warning
    Enabling read-write mode might break your system if files are modified. Please use it at your own risk.

- Boot the system to GRUB menu. Press ESC to stay on the menu.
    ![](./assets/os-stop-on-first-menuentry.png)

- Press `e` on first menuentry. Append `rd.cos.debugrw` to the `linux (loop0)$kernel $kernelcmd` line. Press `Ctrl + x` to boot the system.
    ![](./assets/os-edit-first-menuentry-add-debugrw.png)


## How to debug system crash or hang

### Collect crash log

If kernel panic traces are not recorded in the system log when a system crashes, one reliable way is to use a serial console.

To enable outputting kernel messages to a serial console, please following these steps:

- Boot the system to GRUB menu. Press ESC to stay on the menu.
    ![](./assets/os-stop-on-first-menuentry.png)
- Press `e` on first menuentry. Append `console=ttyS0,115200n8` to the `linux (loop0)$kernel $kernelcmd` line. Press `Ctrl + x` to boot the system.

    ![](./assets/os-edit-first-menuentry-add-console.png)

    !!! note
        Adjust the [console options](https://www.kernel.org/doc/html/latest/admin-guide/serial-console.html) according to your environment. **Make sure** append the `console=` string at the end of the line.
- Connect to the serial port to capture logs.

### Collect crash dumps
For kernel panic crashes, we can use kdump to collect crash dumps.

By default, the OS is booted without kdump feature enabled. Users can enable the feature by selecting the `debug` menuentry when booting. For example:

![](./assets/os-enable-kdump.png)

When a system crashes, a crash dump will be store in `/var/crash/<time>` directory. Providing the crash dump to developers helps troubleshooting issues.
