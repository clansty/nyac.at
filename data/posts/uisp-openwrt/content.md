## 前情提要

由于[小蓝莓](https://rvo.li)搬来了苏州，我们在装宽带的时候多次提到了那个 [UISP Console](uisp-console-chuang)，于是我从吃灰柜子里面把这个设备又拿了出来。去年年底的时候本来打算适配 OpenWRT 的，于是现在就来做

我这次是第一次给没有支持的设备适配 OpenWRT，并且是 backport 了 OpenWRT 原本没有的内核版本的，也给 OpenWRT 制作了新的软件包。希望能给同样希望适配 OpenWRT 给未支持的设备的人一些参考

## 准备源码

首先我们需要下载 OpenWRT 的源码

```bash
git clone https://git.openwrt.org/openwrt/openwrt.git
```

下载到的源码会是最新的 master 分支，是还没发布的不稳定代码。我们需要切换到一个最新的 tag。使用 `git tag` 查看 tag 的列表，并切换到最新的 tag

```bash
git checkout v22.03.5
```

由于 OpenWRT 的大多数 Packages 是托管在另一个 repo 中的，我们需要用内置的脚本初始化它们

```bash
./scripts/feeds update -a
./scripts/feeds install -a
```

## 测试编译

运行 `make nconfig`，对 OpenWRT 的编译进行定制。首先将 Target 设置为 QEMU ARM，Target Profile 设为 ARM v8，针对虚拟机编译

```bash
make -j$(nproc)
```

如果出现错误的话，可以切换到单线程，并启动 verbose 模式编译单个项目

其它地方可能介绍了直接执行 `make -j1 V=s` 但是这样的话会重复检查并单线程编译能正常编译的项目，需要浪费很多时间。其实可以重新编译单个项目

如果出错的内容是某个包，比如说 `ERROR: package/kernel/linux failed to build` 的话，我们可以这样编译单个项目

```bash
make -j1 V=s package/kernel/linux/compile
```

然而如果出错的是类似于进行整合的操作，没有 `ERROR:` 开头的提示，比如说

```plain
 make[2] package/install
make -r world: build failed. Please re-run make with -j1 V=s or V=sc for a higher verbosity level to see what's going on
```

那么不需要在后面加 `/compile`，就像

```bash
make -j1 V=s package/install
```

编译成功之后，把输出的 ext4 img 文件 dd 到一个分区里，并且通过 kexec 启动原先的内核，设置 root 为新的分区，init 为 `/sbin/init` 启动新的 rootfs

OpenWRT 算是能启动，但是有一大堆报错，通过一番手动配置之后，能通过网线和手动设置的 IP 访问到 OpenWRT 的网页面板

接下来我们就要开始进行内核和机型的适配了

## 适配新的机型

根据 [OpenWRT 官方的 Wiki](https://openwrt.org/docs/guide-developer/adding_new_device)，需要在 `/target/linux` 中创建一个新的文件夹来包含我们这个机型的文件夹，包含一些必要的文件。

更好的了解需要适配的文件，更应该查看 target 目录中的其它文件夹。

首先，我们应该在这个机型文件夹里创建一个 [Makefile](https://github.com/Clansty/OpenWRT-UISP-Console/blob/master/target/linux/uispconsole/Makefile)。里面包含机型的名称，支持的镜像类型，内核版本号，CPU 类型之类的信息

然后，需要创建 [base-files/etc/board.d](https://github.com/Clansty/OpenWRT-UISP-Console/tree/master/target/linux/uispconsole/base-files/etc/board.d) 文件夹，里面存放了设备信息和网络接口配置信息。查看示例文件就可以发现。

UISP Console 的 8 个连在一起的 RJ45 是一个内置的交换机，通过 CPU 口和主机连接，显示为一个接口。根据之前 swconfig 中的信息，可以发现它叫做 `switch0`，它的 9 号口是 CPU 口，连接到主机的 eth3 上，剩余的接口都是 LAN 口，于是在 `02_network` 中写上

```bash
ucidef_add_switch "switch0" "0:lan" "1:lan" "2:lan" "3:lan" "4:lan" "5:lan" "6:lan" "7:lan" "9@eth3"
```

由于这是支持 VLAN 的交换机，默认会使用 VLAN1 作为 LAN，所以下面定义接口的时候不能写 `eth3`，必须写成 `eth3.1`

这样在 LuCI 中，会多出一个「交换机」设置界面，并且 eth3 这个接口会换成交换机的图标

![交换机设置界面](image-20230528001709705.png)

然后需要创建 `image` 这个目录，里面的 [Makefile](https://github.com/Clansty/OpenWRT-UISP-Console/blob/master/target/linux/uispconsole/image/Makefile) 规定了如何打包 rootfs 为可刷写的镜像，这个可以直接复制 armvirt 的

由于我们在设备的 Makefile 中定义了内核版本为 4.19，然而 OpenWRT 已经去掉了对 5.10 以外内核的支持，我们还需要增加内核支持的文件。

## 适配内核

照着 [include/kernel-5.10](https://github.com/Clansty/OpenWRT-UISP-Console/blob/master/include/kernel-5.10)，我们写出 [include/kernel-4.19](https://github.com/Clansty/OpenWRT-UISP-Console/blob/master/include/kernel-4.19)

```ini
LINUX_VERSION-4.19 = .269
LINUX_KERNEL_HASH-4.19.269 = 6e0ba5d224ab216b7b938cc9ff2478be7882a884bbdf15374149bade4d58b20a
```

其中，HASH 为内核 tar.xz 的 SHA256

接下来我们还要找出最后一个支持 4.19 的 OpenWRT commit

通过搜索 git log，我们可以知道它的 commit id 是 `d503492857be14925ac3f48fc0c2964835b59ecb`。我们把这个 commit 对应的内容放到另一个目录中备用

```bash
git worktree add ../openwrt-4.19 d503492857be14925ac3f48fc0c2964835b59ecb
```

然后我们需要提取出 UBNT 对内核的修改。由于 OpenWRT 会把 files 目录中的文件复制到内核源码目录中，我们可以把完全是新的文件放入 [files-4.19](https://github.com/Clansty/OpenWRT-UISP-Console/tree/master/target/linux/uispconsole/files-4.19) 这个目录里。对于修改的文件，做成一个 [patch](https://github.com/Clansty/OpenWRT-UISP-Console/blob/master/target/linux/uispconsole/patches-4.19/uisp.patch) 放入 [patches-4.19](https://github.com/Clansty/OpenWRT-UISP-Console/tree/master/target/linux/uispconsole/patches-4.19) 这个目录里

由于 `target/linux/generic/files` 这个目录存在，这个目录中的内容也会被合并到内核源码中。但是这个目录是对于 Linux 5.10 的，并且做的很多更改我们自己的 patch 也做过了，会导致内核 patch 应用失败。所以我们把这个文件夹重命名为 `files-5.10` 让它不会在内核 4.19 中生效

我们把之前找到的最后一个支持 4.19 版本中的 [target/linux/generic/config-4.19](https://github.com/Clansty/OpenWRT-UISP-Console/blob/master/target/linux/generic/config-4.19) 这个文件拿回来，同时找出 [UBNT 的 config](https://github.com/fabianishere/udm-kernel/blob/flavour/edge-v4.19/.github/config/config.stock.udm) 放入 [target/linux/uispconsole/config-4.19](https://github.com/Clansty/OpenWRT-UISP-Console/blob/master/target/linux/uispconsole/config-4.19)。修改后面的这个文件，它应该只保留跟硬件相关的配置，所以删掉与网络相关的配置和与 generic 的 config 重复的内容。

接下来调整一下 nconfig 的参数，就可以开始测试编译了

## 修复一些小问题

### procd

一个问题是引入的头文件出现了一些问题，通过在支持 4.19 的 tree 中搜索那个出错的变量，可以发现有一个内核 patch 文件修复了工具链中的头文件，我们要把 [target/linux/generic/backport-4.19/210-arm64-sve-Disentangle-uapi-asm-ptrace.h-from-uapi-as.patch](https://github.com/Clansty/OpenWRT-UISP-Console/blob/master/target/linux/generic/backport-4.19/210-arm64-sve-Disentangle-uapi-asm-ptrace.h-from-uapi-as.patch) 这个文件拿回来

还有就是找不到 `ptrace_syscall_info` 这个结构体。通过搜索头文件可以发现，`ptrace_syscall_info` 在以前叫 `__ptrace_syscall_info`，内容和调用的方式看起来一样。那我们需要个 procd 加一个 [patch](https://github.com/Clansty/OpenWRT-UISP-Console/blob/master/package/system/procd/patches/fix-ptrace_syscall_info.patch) 来修复它

### libsha256.ko

在编译内核模块时，提示找不到 `libsha256.ko` 这个产物。通过搜索源码定位编译这个模块的 Makefile，发现最新的 commit 叫做「kernel: remove obsolete kernel version switches for 4.19」，原先的代码指示只有 5.4 以上版本的内核需要这个文件。所以我们应该 revert 掉这个 commit

修复完这些问题之后，OpenWRT 就能正常编译了。上传内核，刷入 rootfs 之后能正常用 kexec 引导启动 OpenWRT 了

（这里只是一个简略，上面写的文件都是最终的版本，表示上面这些做完之后就能正常启动了。当然在这个过程中前面是有很多试错和小修改的）

## 集成 HyFetch

虽然这个步骤不是必须的，但是我想在我的 OpenWRT 里集成一个 [HyFetch](https://github.com/hykilpikonna/hyfetch)

首先我们随便找一个 Python 相关的包，把它的 Makefile 复制下来，[修改相关的信息](https://github.com/Clansty/OpenWRT-UISP-Console/blob/master/package/hyfetch/Makefile)

然而 HyFetch 在构建的时候需要本地有 typing-extensions 这个包，添加到 DEPENDS 并不能在 Python 构建时在本地环境中包含这个包。

查看[官方文档](https://github.com/openwrt/packages/blob/master/lang/python/README.md#installing-host-side-python-packages)，我们需要添加 `HOST_PYTHON3_PACKAGE_BUILD_DEPENDS` 这个变量

```makefile
HOST_PYTHON3_PACKAGE_BUILD_DEPENDS:=typing-extensions
```

然后创建 `feeds/packages/lang/python/host-pip-requirements/typing-extensions.txt` 这个文件，像 requirements.txt 一样写它

```
typing-extensions==3.10.0.0 --hash=sha256:50b6f157849174217d0656f99dc82fe932884fb250826c18350e159ec6cdf342
```

其实这样不太清真，因为需要修改 feeds 管理的目录，但这个 txt 文件又只能放在这里

## 加入一些第三方软件包

所有添加包的操作都是 cd 到 package 这个目录中，把相关包的 Git 仓库 clone 下来，然后在 nconfig 中就会出现新的选项。下面举例一些常用的包

### Argon 主题

```bash
git clone https://github.com/jerrykuku/luci-theme-argon.git
```

### PassWall

由于 PassWall 的依赖组件和本体在不同的分支里，所以我们需要将两个分支同时下载下来

```bash
git clone git@github.com:xiaorouji/openwrt-passwall.git
cd openwrt-passwall
git worktree add ../luci-passwall luci
```

### Zerotier

```bash
git clone git@github.com:rufengsuixing/luci-app-zerotier.git
```

### vlmcsd

这是一个 KMS 服务器，程序本体和 LuCI 配置界面分别在两个不同的仓库里

```bash
git clone git@github.com:cokebar/openwrt-vlmcsd.git
git clone git@github.com:cokebar/luci-app-vlmcsd.git
```

### ddns-go

```bash
git clone git@github.com:sirpdboy/luci-app-ddns-go.git
```

## 修复 WireGuard

在 OpenWRT 正式上线使用的过程中，发现 WireGuard 接口无法启动。发现原因是无法 modprobe wireguard

原来 WireGuard 是 [Linux 5.6](https://www.google.com/search?q=in+which+linux+version+does+wireguard+come+into+mainline) 才加入主线的，所以源码中针对 5.10 的编译方式就不管用了

我们找到定义 `KernelPackage/wireguard` 的位置删掉，把支持 4.19 的版本中的 `package/network/services/wireguard/Makefile` 这个文件放回来，顺便升级一下版本

重新执行 `make package/kernel/linux/compile -j$(nproc)` 编译出 `kmod-wireguard` 安装就可以正常启动 WireGuard 了
