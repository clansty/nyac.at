最近换了 openSUSE 嘛，就打算用 KVM 来换掉一直使用的 VMware。就在 KVM 里面装了一台 Win10 的虚拟机（咱喵没有 Windows 实体机），踩了无数的坑

## 安装 KVM 软件

因为是 openSUSE 嘛，自带了一个 YaST 控制中心，在里面一键安装 KVM 工具非常方便。别的系统那就查资料安装吧，接下来的操作应该大同小异

## 创建虚拟机

因为我不想要 Win10 更新嘛（用的老毛子精简系统），我整个系统都是断网装的。创建起来挺方便的。选好安装介质操作系统之后得调整一下配置。比如说固件那里自带了那么多的镜像我也不知道有什么区别，就选了个带 ms 的，感觉应该是微软的意思吧 0.0

![虚拟机固件设置](https://cdn.lwqwq.com/pic/image-20210715230936332.png#vwid=750&vhei=221)

还有就是为了达到最佳性能，硬盘，网卡和显卡都选择 VirtIO 的，因为那个最快

既然 VirtIO 了自然 Windows 不能直接驱动，还得准备一张[驱动盘](https://fedorapeople.org/groups/virt/virtio-win/direct-downloads/latest-virtio/virtio-win.iso)放进第二个虚拟光驱里面

然后差不多就可以进入安装了

## 安装系统

进入安装界面之后就是无法检测磁盘，然后加载驱动。坑从这里就开始了。像我一开始选择的就是 `/vioscsi/w10` 里面的那个，看着就像是 VirtIO SCSI 的驱动。然而并不是。真正安装时候加载的驱动直接就在根目录的 `amd64` 文件夹里面。装了那个直接就能正常安装了。

装完重启直接进入恢复界面，因为没法验证驱动程序签名。然后按 F8，选 7 跳过。每次启动都这么选择，然后就进系统嘞

进去之后再装驱动盘里面两个安装包，再启动几次之后就不用再 F8 了

## 快照

根据我的习惯装完系统立马快照一次。坑又来了。它会说使用 pflash 固件的虚拟机无法快照。解决方法简单，在 XML 里面把 `<loader readonly="yes" type="pflash">` 这边的 `pflash` 改成 `rom` 就成了

## 联网

这个就是巨坑了，咱喵整整搞了大半个下午加一个晚上

窝寻找了无数教程，大部分都是基于 `ifconfig` 的。我花了大半个下午尝试在 NetworkManager 里面创建 bridge。虽然是创建出来了，但是虚拟机始终无法上网，甚至主机有时候也无法上网了。

看别人在 YaST 里面用 Wicked 管理程序创建 bridge 成功了，我就把我的 NetworkManager 换成了 Wicked。换一下挺简单，安装之后 YaST 里面切换一下就成

然后在概览里面创建一个 bridge。只要把 IP 设置成动态地址，桥接设备里面选上网卡就可以

完成之后你的本机 IP 就会分配到 bridge 上，很正常，看起来好了

然后去虚拟机设置里面把网络改成桥接设备，接口换成 `br0`，进入虚拟机

然后，然后**死都获取不到 IP 地址，手动配置也 ping 不通网关**

于是又查了各种资料，折腾了一个晚上，开关 IPv4 转发以及 STP 都没有用

然后看到了一条命令

```bash
iptables -A FORWARD -j ACCEPT
```

sudo 执行之后立马见效，是防火墙的问题（就算防火墙是关着的）

成了

好耶

## 参考资料

- How to Install and Configure KVM on OpenSUSE Leap 15 <https://www.linuxtechi.com/install-configure-kvm-opensuse-leap-15/>
- 上手 Linux 原生的虚拟机工具 QEMU/KVM | 水景一页 <https://cnzhx.net/blog/try-to-use-qemu-kvm-on-opensuse-tumbleweed/>
- ubuntu18安装kvm虚拟机-桥接模式 - 知乎 <https://zhuanlan.zhihu.com/p/54628342>

