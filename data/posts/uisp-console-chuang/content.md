本文由 [小草莓](https://rvo.li) 友情提供的 [Ubiquiti UISP Console EA Sample](https://eu.store.ui.com/products/uisp-console-ea) 支持

## 介绍

UISP Console 有九个电口两个光口，是一台路由器。同时它还有 4 核 A57，4GB RAM，16G eMMC 和 128G SSD。[Geekbench](https://browser.geekbench.com/v5/cpu/19248748)。刚拿到这个设备的时候我还不知道用来干什么，因为我的各个常居地都有了配好 [Menci](https://men.ci) 路由方案的路由器。于是就拿来折腾了。

小草莓表示这个设备和 [Unifi Dream Machine Pro](https://store.ui.com/products/udm-pro) 硬件配置是一样的，可能可以刷 UDM Pro 的固件，但是自己没刷成功。

UISP 和 Unifi 是不同的产品线，UISP 大概是给 ISP 用的，Unifi 是面向家用，功能不一样，管理系统也不互通。而且我尝试了 UISP 的管理界面挺难用的

## 拆机

直接用 TFTP 刷 UDM Pro 的固件当然没刷上，然后就准备拆机看看有没有 TTL 了。

拆开之后发现果然是有的。接上之后就可以查看 uboot 的日志和进入 [uboot 命令行](https://0w.al/FKyi)。先把 [uboot 变量](https://0w.al/Zrhy)导出来备用。

## 尝试 Arch Linux

和尝试运行 UDM Pro 固件比起来，Arch Linux 并不难。只要拿一个 RootFS 来就能运行。我准备把 Arch 装在 SSD 里面。

在原版系统里面下载 ArchARM 官方的 RootFS，然后解压到 `/mnt/ssd`。重启之后中断 uboot 启动，参考原始的 uboot 变量构建出启动命令，用原系统的内核启动。它的 eMMC 走的是 USB 通道

```shell
setenv rootargs root=/dev/sda1 rw rootwait
setenv bootargs $rootargs pci=pcie_bus_perf console=ttyS0,115200 panic=3 init=/usr/lib/systemd/systemd
ext4load usb 0 0x08000004 uImage.1
bootm 0x08000004
```

我这里 eMMC 的第一个分区包含两个内核，一个新的一个旧的。因为第一次正常开机设置之后进行了一次升级，这个设备又是 AB 分区设计，就有两个内核了。版本分别是 `4.19.152-al-linux-v10.2.0-v3.0.0.27930-80c69eb` 和 `4.19.152-al-linux-v10.2.0-v2.4.0-rc.4.27740-f0d69df`。这里选择旧内核，不然下面会遇到问题。

我也尝试了让它加载 Arch 的 initramfs，但是试了各种办法没成功。不过 initramfs 不重要，直接内核启动也能正常进系统。

如果要固化启动变量，开机自动启动直接进 Arch 的话，可以这样

```shell
setenv rootargs root=/dev/sda1 rw rootwait
setenv bootargs $rootargs pci=pcie_bus_perf console=ttyS0,115200 panic=3 init=/usr/lib/systemd/systemd
setenv bootcmd 'ext4load usb 0 0x08000004 uImage.1; bootm 0x08000004'
saveenv
```

进系统之后会发现有个问题就是交换机（连在一起的 1 到 8 号口）不工作，不管是连到主机还是端口之间。经过了一上午的研究，[ubios-init.sh](https://0w.al/Py27) 中包含了交换机初始化相关的操作，使用了 OpenWRT 的 [swconfig](https://openwrt.org/docs/techref/swconfig) 工具。然而 [AUR 的 swconfig](https://aur.archlinux.org/packages/swconfig) 早就 break 了。于是从原系统中提取 `/usr/bin/swconfig` 和 `/usr/lib/libsw.so` 到 Arch Linux 里运行。一开始我使用的是新内核，结果 swconfig 不工作，输出的全是 ???。研究了一段时间后重启进入老内核，发现它直接就能工作了。然后我们执行一些 vlan 设置就可以了（现在假如 1 2 号口连了设备，并且现在只希望它们简单交换）

```bash
swconfig dev switch0 port 0 set pvid 1
swconfig dev switch0 port 1 set pvid 1
# 主机连接的端口是 9 号口
swconfig dev switch0 port 9 set pvid 1
swconfig dev switch0 port 9 set enable_vlan 1
swconfig dev switch0 vlan 1 set ports '0 1 9'
swconfig dev switch0 set apply
```

然后现在，我们有了一个基本能用的 Arch Linux。为什么是基本能用呢，因为现在的内核还不健全，比如说 WireGuard 之类的组件也都没有。我们还没实现内核自由。

## 尝试启动 UDM-Pro 固件

首先来看一下 [UDM-Pro 固件的 binwalk](https://0w.al/h3eJ) 和 [UISP Console 固件的 binwalk](https://0w.al/8DRt)。它们的结构根本不一样。

现在有两种思路，旧内核新系统和新内核新系统。先来试试新内核新系统。

首先从固件里面提取内核和系统镜像，根据 [binwalk 的结果](https://0w.al/h3eJ)和 uImage 的结构，可以得到以下 dd 命令：

```bash
dd if=b329-udmpro-1.12.33-13536c2d84784f5aa8d93e6aa228aff0.bin of=uImage-test skip=699 count=5999110 bs=1 status=progress
```

还需要解出 squashfs 格式的系统镜像

```bash
binwalk -e b329-udmpro-1.12.33-13536c2d84784f5aa8d93e6aa228aff0.bin
```

然后直接 dd 系统进 eMMC 里的分区，并且使用新内核启动。这时候应该拔下装有 Arch 的 SSD，否则有可能 Arch 会被格式化掉

```bash
dd if=root.squashfs of=/dev/sdb2 bs=4M status=progress
mount /dev/sda1 /mnt
cp uImage-test /mnt
```

```shell
setenv rootargs root=/dev/sda2 rootfstype=squashfs rootwait
setenv bootargs $rootargs pci=pcie_bus_perf console=ttyS0,115200 panic=3
ext4load usb 0 0x08000004 uImage-test
bootm 0x08000004
```

寄喽～它有内核签名校验

```plain
Verifying Hash Integrity ... sha1,rsa2048:udm_al324- Failed to verify required signature 'key-unmsr_generic'
 error!
Unable to verify required signature for '' hash node in 'kernel@1' image node
Bad Data Hash
ERROR: can't get kernel image!
```

## UISP Console 内核 + UDM-Pro 系统

然后我们来尝试使用旧内核+新系统启动。迎来了一堆错误

先来看第一个错误

```plain
modprobe: can't change directory to '4.19.152-al-linux-v10.2.0-v3.0.0.27930-80c69eb': No such file or directory
```

找不到内核模块了。简单，将内核模块复制进去，然后重打包 squashfs 刷入

```bash
sudo unsquashfs 5B8CC1.squashfs
cp 4.19.152-al-linux-v10.2.0-v3.0.0.27930-80c69eb squashfs-root/lib/modules
sudo mksquashfs squashfs-root with-modules.squashfs
```

然后是找不到配置文件

```plain
error: a fatal exception during initialization: Failed to find a file matching .*-ee6a\.default filter in /usr/share/ubios-udapi-server
```

可以看到 `/usr/share/ubios-udapi-server` 里面有各种机型的配置文件

```plain
udm-ea11.default udm-pro-ea15.default udm-se-ea13.default
```

UISP Console 的系统里有

```plain
uispr-cherry-ee6a.default uispr-damson-ee6d.default
```

看起来 UISP Console 应该有一个代号叫 `cherry`

然后 `config-board` 和 `/etc` 里面也有类似的文件。而 `/etc` 里那个找不到对应的文件，就直接复制 UDM-Pro 的好了

启动之后会有几个服务一直无法启动，进不了 shell。我们把这几个服务禁用掉。分别是 [`S99wait-ubios-udapi-server`](https://0w.al/HTTB) `S95unifios` [`S45ubios-udapi-server`](https://0w.al/teYr)。

根据 `/etc/inittab` 和 [`/etc/init.d/rcS`](https://0w.al/C3HB)，只要把它们改成不以 S 开头就可以了。然后进了 shell 慢慢调试

`ubios-udapi-server` 的一个错误如下

```plain
ERROR: /sys/fs/cgroup/uus/memory.high does not exist
ERROR: /sys/fs/cgroup/uus/memory.max does not exist
ERROR: /sys/fs/cgroup/uus/memory.swap.max does not exist
```

这是 CGroup 有问题。在 [`S30cgroupv2`](https://0w.al/YDsY) 中，会尝试启动 `memory cpu io pids` 这些控制单元，而我们的内核看起来只支持 `memory cpu`。我们可以在 `S45ubios-udapi-server` 中把 CGroup 相关的内容注释掉，但是还是不能启动。

`S95unifios` 是在 podman 里面运行一个子系统。所以这个可以最后搞。运行系统的关键就是 `ubios-udapi-server`

`ubios-udapi-server` 的启动文件是 `/usr/bin/ubios-udapi-server`。使用 v3.0.0 的时候会出现无法读取交换机数据的问题，这个问题在之后研究 Arch Linux 的时候已经发现了。换 v2.4.0 内核之后解决了这个问题，但是缺少某个 UDM Pro 有的内核模块。我又尝试了替换原来的 `/usr/bin/ubios-udapi-server`，但是会出现 GLIBC 不兼容。已经试过 LD_PRELOAD。

旧内核新系统的分析暂时就到这里。

## kexec

然后，我发现了 [fabianishere/udm-kernel-tools](https://github.com/fabianishere/udm-kernel-tools) 和 [fabianishere/kexec-mod](https://github.com/fabianishere/kexec-mod) 这两个项目。于是编译内核模块

```bash
git clone git@github.com:fabianishere/kexec-mod.git
cd kexec-mod
scp alarm@machine:/proc/config.gz .
gunzip config.gz
git clone git@github.com:fabianishere/udm-kernel.git
cd udm-kernel
git checkout 977c11883bd3fb422f6c0f68f86d2df92e7bb37c
cp ../config .config
nix-shell -p stdenv bison flex bc
make olddefconfig LOCALVERSION=
make modules_prepare LOCALVERSION=
cd ../kernel
make KDIR=/home/clansty/Projects/kexec-mod/udm-kernel
cp arch/arm64/kexec_mod_arm64.ko .
scp *.ko alarm@machine:
cd ../user
make
scp redir.so alarm@machine:
```

```bash
insmod kexec_mod_arm64.ko shim_hyp=1
insmod kexec_mod.ko
export LD_PRELOAD=./redir.so
kexec -l /boot/Image --reuse-cmdline
kexec -e
```

算是能启动，但是 Arch 内核有点问题，不能读取到启动分区。但是现在算是可以 kexec 了
