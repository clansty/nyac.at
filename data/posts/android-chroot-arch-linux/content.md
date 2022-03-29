窝前些日子就在想了，我是不是可以不带树莓派，在手机上通过 chroot 来运行一个 Linux 桌面来给 iPad 用，同时也可以在手机上干一些别的事情。这样手机只要开热点给 iPad，iPad 可以直接 vnc 得到手机上容器的桌面。

之前看到有人用 Termux 搞 Arch 容器，我试了一下，有奇怪的 SELinux 问题，而且容器在后台还会被系统自动杀掉（因为是运行在用户层的）。于是我换成了 Linux Deploy 这个直接用 chroot 来运行容器的工具

![最终效果](https://i.loli.net/2021/05/13/ZlUnjghy7rksPuD.png#vwid=1730&vhei=1367)

~~当然是遇到了很多的坑的~~

## 安装

整个安装过程其实非常顺利。我把安装路径设置成了文件夹并放在了 `/data` 目录下，这样可以使用完整的 POSIX 特性（安卓的 `/sdcard` 目录是 fuse 挂载的，无法设置权限，也没有符号链接），也不用担心做成镜像容量不够了

然后下面可以勾选 ssh 和桌面环境，ssh 会自动配置，但是 vnc 会启不出来，不过会帮你把需要的东西装好。我安装的是 xfce 桌面环境，因为它比较轻量

[完整配置](https://cdn.lwqwq.com/pic/Screenshot_2021-05-13-20-41-12-42.jpg)

~~安装完了之后可以去把图形界面那边取消勾选了，不是每次使用都需要桌面的，而且（最本质的）这个勾了也没法正常自动启动桌面~~ 修正：勾选了之后能自动启动 DBus，方便在桌面中查看手机电量以及像通知之类基于 DBus 功能的工作，所以最好还是勾着

![image-20210513223232802](https://i.loli.net/2021/05/13/O7UcmCALI6TDFtj.png#vwid=625&vhei=159)

点启动就能启动并通过 SSH 连接了

## 更换国内源

```bash
sudo nano /etc/pacman.d/mirrorlist
```

将未被注释的 Server 行改成

```ini
Server = https://mirrors.ustc.edu.cn/archlinuxarm/$arch/$repo
```

## 换 shell

默认的 sh 用这不太舒服，你可以装一个自己喜欢的 shell，比如 zsh，fish 之类的

然后通过 chsh 更换 shell

## 装软件

Linux Deploy 有时候在初始化软件包的时候有点奇怪，包管理器数据库没有配置好。如果出现装软件提示某文件已经存在的话就加个 `--overwrite '*'` 就可以了

```
sudo: /usr/share/man/man8/visudo.8.gz exists in filesystem
which: /usr/bin/which exists in filesystem
which: /usr/share/info/which.info.gz exists in filesystem
which: /usr/share/man/man1/which.1.gz exists in filesystem
Errors occurred, no packages were upgraded.
```

```bash
sudo pacman -S base-devel --overwrite '*'
```

## 解决 fakeroot 错误

当你通过 makepkg 打包一个软件包（比如说 AUR 包）时，会因为这个系统不是由 systemd 启动，没有 SYSV 管道和消息队列而无法进入 fakeroot 环境

```
==> Entering fakeroot environment...
fakeroot, while creating message channels: Function not implemented
This may be due to a lack of SYSV IPC support.
fakeroot: error while starting the `faked' daemon.
```

网上的解决方案是安装 AUR 中的 `fakeroot-tcp` 包，它使用 TCP 来代替 SYSV 管道通信。然而，安装 AUR 包又需要依赖 fakeroot 的编译环境，所以....

所以，~~解决方法是临时在本地编译一个启用 tcp 的 fakeroot 添加到 path 里，再制作安装 AUR 里的包。然后我倒腾了半天，1.25 和 1.24 的包愣是编译不起来，1.23 的能编译运行，但是每次运行都是一堆报错，不过这不影响我制作 AUR 里的 `fakeroot-tcp`。最后终于是做好包了。~~这里我发一下[我打包好的包](https://downloads.lwqwq.com/%E5%BA%94%E7%94%A8/%E7%B3%BB%E7%BB%9F/fakeroot-tcp-1.25.3-2-aarch64.pkg.tar.xz)，妳们直接把它下载到机器里 `sudo pacman -U` 安装一下就成

然后就可以正常的构建安装 AUR 包啦

## 完善桌面环境

Linux Deploy 只为我们安装好了基本的 `xfce` 程序组，我们还需要安装 [xfce4-goodies](https://archlinux.org/groups/x86_64/xfce4-goodies/) 组里的应用才够我们用（比如说回收站，记事本，看图之类的软件都在这个组里）

```bash
# 这里默认你上一步已经装好 yay 了
yay -S xfce4-goodies
```

## 启动桌面

最好要安装一个 screen，这样终端关闭了桌面也能在后台运行

```bash
yay -S screen
```

先要设置 vnc 的密码，不然到时候没法连接

```bash
vncpassed
```

然后通过 screen 来运行 vncserver

```bash
screen vncserver :0
```

通过 VNC 连接就可以看到桌面了

[前往 limelight 专栏](https://limelight.moe/t/topic/6548)

# 参考资料

- 解决chroot/proot/wsl容器安装archlinux不能使用fakeroot的问题 <https://zsxwz.com/2021/02/08/%E8%A7%A3%E5%86%B3chroot-proot-wsl%E5%AE%B9%E5%99%A8%E5%AE%89%E8%A3%85archlinux%E4%B8%8D%E8%83%BD%E4%BD%BF%E7%94%A8fakeroot%E7%9A%84%E9%97%AE%E9%A2%98/>
