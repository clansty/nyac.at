> 提示：我发现我这台 Windows 的服务器是有扣费的（扣那免费 100 刀里面的钱）。我也不知道是创建 Windows 的时候没有创建好还是重装导致的问题。我觉得也想这么做的人最好注意一下？

## 起因

事情是这样的，微软 Azure 提供的学生[免费套餐](https://azure.microsoft.com/en-us/free/students/)中有免费的一台 Windows 虚拟机和一台 Linux 虚拟机，都是 1 核 1G 的。对于 Linux 来说，这差不多正好，但是对于 Windows，这怎么用啊QAQ

![这怎么用呀](https://cdn.lwqwq.com/pic/image-20220106121037879.png)

所以，我要把它重装成 Linux。这样的话，名义上我是一台 Windows 一台 Linux，实际上是两台 Linux。嘻嘻嘻

然而，这个机器并没有 VNC，不过可以每分钟获取一次屏幕的界面。以及有一个**串行控制台**可以用

## 第一次的错误尝试

试了一下[网络上的 dd 脚本](https://hostzg.com/1965.html)

![image-20220106121228571](https://cdn.lwqwq.com/pic/image-20220106121228571.png)

原来 Azure 的机器是 UEFI 启动的！诶 坏诶 那岂不是有安全启动QAQ

去看一眼，好耶！那没事了（

![image-20220106130710745](https://cdn.lwqwq.com/pic/image-20220106130710745.png)

## 第二次失败的尝试

[沐子](https://moozae.cn)跟我说，现在有人维护了一个[支持 UEFI 的 Wubi](https://github.com/hakuna-m/wubiuefi)（以前，大概一几年的时候在 Windows 里面直接安装 Ubuntu 的工具），于是我试了一下

![image-20220106130957897](https://cdn.lwqwq.com/pic/image-20220106130957897.png)

倒是成功安装了 Xubuntu，不过启动的时候……

![image-20220106131038166](https://cdn.lwqwq.com/pic/image-20220106131038166.png)

Two thousand years later……

![image-20220106131101021](https://cdn.lwqwq.com/pic/image-20220106131101021.png)

## 思路

一个思路是搞一个像 mfsLinux 差不多的东西，这个我[之前介绍过](cloud-server-freebsd)，打开 SSH 然后直接装系统

还有就是使用像 Debian 一样直接在控制台里面安装的系统，将安装界面的输出重定向到串行控制台

最后我选择了第二种

## 启动 Debian 安装程序

首先是下载 Debian 官网上的[网络安装镜像](https://cdimage.debian.org/debian-cd/current/amd64/iso-cd/debian-11.2.0-amd64-netinst.iso)。由于 Azure 给我们提供了 4GB 的临时存储盘，我们可以直接把镜像用 [Refus](https://github.com/pbatard/rufus/releases/download/v3.17/rufus-3.17p.exe) 写到那个盘里面。参数设置最好像下图那样，弹出的确认框里面选第一个就可以了

> PS. 可能有页面文件在那个盘里面。我第一次写入的时候系统好像自己重启了，第二次再写入才成功。以及以下步骤如果有失败的也可以多试几次呢w

![img](https://cdn.lwqwq.com/pic/refus-write-debian-image)

然后，由于我们需要让输出显示在串行控制台里面，我们需要修改一下 `grub.cfg`

有好多个 `grub.cfg`，我们要修改 `/boot/grub/grub.cfg`

在开头的地方，有一段：

```bash
if loadfont $prefix/font.pf2 ; then
  set gfxmode=800x600
  set gfxpayload=keep
  insmod efi_gop
  insmod efi_uga
  insmod video_bochs
  insmod video_cirrus
  insmod gfxterm
  insmod png
  terminal_output gfxterm
fi
```

需要修改成

```bash
serial --unit=0 --speed=115200
terminal_input serial; terminal_output serial
```

根据[微软官方的文档](https://docs.microsoft.com/en-us/troubleshoot/azure/virtual-machines/serial-console-windows)，串行控制台的波特率是 115200

下面有一段关于启动 Linux 内核的部分，注意我们要使用的是 Install，也就是无图形界面安装的选项，所以我们要修改它。大概在 32 行附近：

```bash
menuentry --hotkey=i 'Install' {
    set background_color=black
    linux    /install.amd/vmlinuz vga=788 --- quiet
    initrd   /install.amd/initrd.gz
}
```

修改 `linux` 那一行：

```bash
	linux    /install.amd/vmlinuz vga=788 console=ttyS0,115200n8
```

然后，我们需要使用 Diskgenius 自带的 UEFI 管理工具添加 `/EFI/boot/grubx64.efi` 这个文件为启动项，以及勾选下次从此项启动。

![Diskgenius](https://cdn.lwqwq.com/pic/clipboard_20220106_014919.png)

然后我们就可以重启机器，然后就能在串行控制台里看到 GRUB 的界面了。选择 Install 那一项，Debian 的安装界面就能启动了。

![Debian 安装界面](https://cdn.lwqwq.com/pic/clipboard_20220106_015359.png)

## 安装时可能会遇到的问题

在「扫描和挂载安装介质」的那一步，由于我们的设备不是光盘，所以很可能会出问题。这时候我们需要在菜单里选择开启一个终端，并在终端中输入

```bash
mount /dev/sdb1 /cdrom
```

就可以解决这个问题了

以及 在「选择和安装软件」这一步，可能会闪一下进度条就回到主菜单，可能是源有问题吧，我也不知道怎么搞的能打开到切换软件源的界面，换个源就可以了。然后选择的时候取消勾选桌面环境并勾选下方的 SSH 服务。这样装完之后直接就可以 SSH 上了

## 小知识

关于 su

由于 Debian 装完是没有 sudo 的，需要先 su 到 root 账户来安装 sudo。然而 `su` 之后 `$PATH` 里面是没有 `/usr/sbin` 的（Debian 的 `bin` 和 `sbin` 不是软链接好像），没法运行管理需要的命令。于是我在网上查到有 `su -` 这个命令，它们的区别是 su 之后 `$PATH` 不一样！

![image-20220106140038508](https://cdn.lwqwq.com/pic/image-20220106140038508.png)

![image-20220106140051560](https://cdn.lwqwq.com/pic/image-20220106140051560.png)

![image-20220106140107824](https://cdn.lwqwq.com/pic/image-20220106140107824.png)

## 参考资料

- [Using GRUB via a serial line](https://www.gnu.org/software/grub/manual/grub/html_node/Serial-terminal.html)

- [Booting the Installer on 64-bit ARM](https://www.debian.org/releases/stretch/arm64/ch05s01.html.en)
