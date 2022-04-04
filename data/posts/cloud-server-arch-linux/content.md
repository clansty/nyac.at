![](IMG_0111.PNG.jpg)

[图片来源](https://b23.tv/iq3jy5)

众所周知，阿里云的镜像里面是没有 Arch Linux 这个选项的，并且阿里云也不支持在控制台里面上传 ISO 挂载到虚拟机上装系统，所以我们想要安装 Arch Linux，只能通过现有的 Ubuntu 之类的系统，通过 chroot 进入一个 Arch 的临时环境，再删除原有的系统文件并安装 Arch Linux。整个过程大概用了半个小时，非常顺利

至于为什么要装 Arch 呢？好用呗，话不多说，开始装

## 下载 RootFS

首先呢我们得有一个 Arch 的 RootFS，也就是一个基本的包括 Arch Linux 根目录下所有文件的文件夹，一会儿要 chroot 进去。为了使用 chroot 这个功能

直接在 [Arch 的下载页面](https://archlinux.org/download/)找一个离服务器比较近的镜像源，复制里面 `archlinux-bootstrap` 开头的 `tar.gz` 包的地址，下载到服务器的 `/tmp` 文件夹。其实这个时候可以 cd 到 /tmp 里面把不相关的文件都删掉了

```shell
cd /tmp
wget https://mirrors.bfsu.edu.cn/archlinux/iso/2021.03.01/archlinux-bootstrap-2021.03.01-x86_64.tar.gz
```

然后自然是要解包这个文件，顺便看看里面都有些啥

```shell
tar -xzf arch*
cd root.x86_64
ls
```

```
bin  boot  dev  etc  home  lib  lib64  mnt  opt  proc  README  root  run  sbin  srv  sys  tmp  usr  var
```

这里面就像一个装好了的 Linux 的根目录一样，所以说是 RootFS 嘛

## 进入 chroot 环境

听说需要用 `mount --bind` 把 RootFS 解包的目录自己与自己链接起来，不然 pacman 会装不了软件。至于要是不知么做会发生什么，咱也没试过，妳们可以自行尝试

```shell
mount --bind /tmp/root.x86_64 /tmp/root.x86_64
```

别急，由于这个 RootFS 包是最简安装，你看它只有 140MB 是吧，它里面甚至连个文本编辑器都没有。所以咱需要在 chroot 之前编辑一下镜像源的文件，启用自己喜欢的镜像源，这样 pacman 才能正常安装系统

```shell
vim /tmp/root.x86_64/etc/pacman.d/mirrorlist
```

好啦，现在可以正式进入 chroot 环境啦。不过呢用普通的 chroot 进去之后 `/dev` 之类的目录会是空的，不可以正常安装系统。要使用 Arch 镜像中的 `arch-chroot` 脚本，这个脚本会自动执行一些 mount 命令，把设备啊之类的都映射到 chroot 容器里面，咱就可以正常安装系统啦

```shell
/tmp/root.x86_64/bin/arch-chroot /tmp/root.x86_64/
```

## 在 chroot 环境中给机器安装 Arch Linux

首先初始化 pacman 的密钥，pacman 就能正常使用啦

```shell
pacman-key --init
pacman-key --populate archlinux
```

现在我们已经进入属于 Arch 的世界了，不会再想念原先的 Linux 发行版了。所以现在应该把原先发行版的文件消灭掉。由于我们现在运行的环境就在原先的分区上，所以直接格式化肯定是不行的。需要把原先的分区挂载到现在的系统中，然后把属于原系统的文件删删删

在阿里云中，系统分区是 `/dev/vda1`

```shell
mount /dev/vda1 /mnt
```

由于 Linux 系统中“一切皆文件”，像 `/dev` `/proc` `/run` `/sys` 这些目录都是存储到硬件的映射的，所以不能删。同时，我们工作的目录在 `/tmp` 下，`swapfile` （如果有）是我们正在使用的 swap。咱们用 `rm -rf` 命令，把其余的文件都清除干净

像正常安装 Arch Linux 一样使用 `pacstrap` 向目标挂载点安装系统底层的软件包，并生成 `fstab` 挂载配置文件

```shell
pacstrap /mnt base base-devel linux linux-headers linux-firmware vim dhcpcd openssh grub
genfstab -U /mnt > /mnt/etc/fstab
```

这时候系统安装就已经完成了

## 进入新系统

再通过 `arch-chroot` 切换到安装好的系统目录下，进入最后的系统配置和必备程序包的安装

```bash
arch-chroot /mnt
```

> 注意，要是在 chroot 的时候发生与 `/etc/resolv.conf` 挂载相关的问题，可以先执行

```bash
umount /etc/resolv.conf
```

> 然后再 chroot，进去之后执行

```bash
echo 'nameserver 223.5.5.5' > /etc/resolv.conf
```

> 否则可能会无法解析 IP。如果上面 chroot 时没有出现问题可以跳过这个

首先将时区设置为北京时间

```shell
ln -sf /usr/share/zoneinfo/Asia/Shanghai /etc/localtime
```

在 `/etc/hostname` 中设置主机名，在 `/etc/hosts` 中写上

```
127.0.0.1	localhost
127.0.0.1	你刚才设置的主机名
```

开启一下必要的服务，这样重启之后就有网并且能通过 SSH 连上啦

```shell
systemctl enable dhcpcd
systemctl enable sshd
```

还需要给自己创建一个用户，Arch Linux 默认禁止以 root 身份远程登录。`-m` 的意思是为用户创建自己的主目录，`wheel` 是默认能执行 sudo 命令的用户组

```shell
useradd clansty -m -G wheel
```

然后切换到新创建的用户，并且添加自己的公钥，这样重启之后就能直接公钥登录 SSH 啦

```shell
su clansty
cd ~
mkdir .ssh
chmod 700 .ssh
cd .ssh
vim authorized_keys
chmod 600 authorized_keys
```

回到 root 用户，保险起见，给 root 以及自己的用户设置好密码，这样要是无法公钥登录还能以密码登录

```shell
passwd root
passwd clansty
```

编辑 sudo 配置文件，取消 `%wheel ALL=(ALL) NOPASSWD: ALL` 这一行的注释

```shell
visudo
```

最后创建引导文件，准备重启啦

```shell
grub-install --target=i386-pc /dev/vda
grub-mkconfig -o /boot/grub/grub.cfg
```

差不多了，进控制台重启服务器

## 重启啦

重启回来了，sudo 一下看看是否一切正常，正常的话咱就进 `/etc/shadow` 删除密码了，只保留私钥登录

然后启用一下网络时间同步

```shell
timedatectl set-ntp true
```

然后，就没有然后啦
