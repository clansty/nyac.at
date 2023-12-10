## 起因

最近比较无聊，想折腾软路由。于是就把我那台双网口的小主机刷了 OpenWRT。可是这 OpenWRT 的包管理器可太灵车了，动不动就 break。[Menci](friend:menci) 跟我说，可以用 Arch Linux 做软路由。于是我就试了一下，发现其实并没有想象中的复杂。

## 安装基本系统

我们现在暂且将现有的路由器正常配置连接外网，并且将电脑和将来软路由的主机都连接到路由器 LAN 口

### 安装系统

像我的[上一篇 Blog](arch-linux-install-notes)一样正常安装 Arch Linux。不过，先跳过「设置网络管理器」这一步

### 设置网络管理器

这次，我们使用 [systemd-networkd](https://wiki.archlinux.org/title/Systemd-networkd_(简体中文))。

设备是双网口的，将会一个口做 WAN 口接外网，另一个口做 LAN 口（接交换机，接电脑，接 AP，接支持桥接的路由器 WAN 口，或者接关了 DHCP 的不支持桥接的路由器 LAN 口都可以）我们需要配置两个网络设置，并且支持不能用 `en*` 了

我们先 `ip addr` 看一下现在连接着的接口，就把它当作 WAN 口好了

首先是 WAN 口的配置：

```bash
sudo vim /etc/systemd/network/20-ext-dhcp.network
```

```ini
[Match]
Name=enp4s0

[Network]
DHCP=ipv4
IPv6AcceptRA=yes # 接收 IPv6 的路由通告

[DHCPv4]
UseHostname=true
```

然后来设置 LAN 口：

```bash
sudo vim 21-int.network
```

```ini
[Match]
Name=enp3s0

[Link]
Multicast=yes

[Network]
Address=10.0.0.1/16
MulticastDNS=yes
IPMasquerade=both
IPv6SendRA=yes
DHCPv6PrefixDelegation=yes

[IPv6SendRA]
Managed=yes
OtherInformation=yes
```

`10.0.0.1/16` 是将来软路由 LAN 口的 IP 地址和子网（如果看不懂 `xx.xx.xx.xx/xx` 这样的表示方式，了解一下 [IP-CIDR](https://zh.wikipedia.org/wiki/%E6%97%A0%E7%B1%BB%E5%88%AB%E5%9F%9F%E9%97%B4%E8%B7%AF%E7%94%B1)）

### 开启 DNS 服务器

我们暂且使用 [systemd-resolved](https://wiki.archlinux.org/title/Systemd-resolved) 的 DNS 服务器。开启的方法非常简单，只要创建一个文件

```bash
sudo vim /etc/systemd/resolved.conf.d/listen-on-internal.conf
```

```ini
[Resolve]
DNSStubListenerExtra=10.0.0.1
```

然后，得确定 `systemd-networkd` 的两个服务启用

```bash
systemctl enable systemd-networkd
systemctl enable systemd-resolved
```

### 设置 DHCP 服务器

我们要用的 dhcpd 服务位于 `dhcp` 这个包

（dhcpcd 时 DHCP 客户端，c 代表 client，d 代表 daemon，后台服务）

```bash
sudo pacman -S dhcp
```

然后创建文件

```bash
sudo vim /etc/dhcpd.conf
```

在这里可以配置分配 IP 的范围，以及固定 IP 分配

```c++
option domain-name-servers 10.0.0.1;
option subnet-mask 255.255.0.0;
option routers 10.0.0.1;
subnet 10.0.0.0 netmask 255.255.0.0 {
    range 10.0.1.4 10.0.1.250;
    host clansty-mac {
        hardware ethernet f8:e4:3b:77:c1:b7;
        fixed-address 10.0.0.2;
    }
    host ap {
        hardware ethernet 28:d1:27:99:5b:26;
        fixed-address 10.0.2.1;
    }
}
```

另外，dhcpd 默认会在所有的接口上运行，我们需要稍微修改一下服务文件，给它加个参数

```bash
sudo cp /usr/lib/systemd/system/dhcpd4.service /etc/systemd/system/dhcpd4@.service
sudo vim /etc/systemd/system/dhcpd4@.service
```

```diff
  ...
  [Service]
  Type=forking
- ExecStart=/usr/bin/dhcpd -4 -q -cf /etc/dhcpd.conf -pf /run/dhcpd4/dhcpd.pid
+ ExecStart=/usr/bin/dhcpd -4 -q -cf /etc/dhcpd.conf -pf /run/dhcpd4/dhcpd.pid %I
  ...
```

然后我们启用服务就可以了

```bash
systemctl enable dhcpd4@enp3s0.service
```

### 开启内核网络转发

```bash
sudo vi /etc/sysctl.d/30-ipforward.conf
```

```bash
net.ipv4.ip_forward=1
net.ipv6.ip_forward=1
```

现在，重启进入系统，然后把电脑接到软路由刚才定义的 LAN 口上，电脑应该就能获取到 IP 地址，并且能上网了

## 安装 Clash

首先是安装软件包。`clash-premium-bin` 包在 [Clansty 源](https://pacman.ltd)里

```bash
sudo pacman -S clash-premium-bin
```

然后将你的 clash 配置文件放置在 `/etc/clash` 中。由于包里的服务文件是用户级别的，我们现在创建一个系统级别服务

```bash
sudo vim /etc/systemd/system/clash.service
```

```ini
[Unit]
Description=A rule based proxy in Go for neko.
After=network.target

[Service]
Type=exec
Restart=on-abort
ExecStart=/usr/bin/clash -d /etc/clash

[Install]
WantedBy=multi-user.target
```

然后，我们可以禁用 systemd-resolved 了。我们接下来要用 clash 自带的 DNS 服务器，实现 DOT，DOH 或是 FakeIP

```bash
sudo systemctl disable --now systemd-resolved
sudo rm /etc/resolv.conf
echo 'nameserver 127.0.0.1' | sudo tee /etc/resolv.conf
```

Clash 的配置文件中要有以下内容

```yaml
tun:
  enable: true
  stack: system
  dns-hijack:
   - tcp://8.8.8.8:53
   - udp://8.8.8.8:53

dns:
  enable: true
  enhanced-mode: 是什么呢
  fake-ip-range: 198.19.0.1/16 # 将会是 tun 的子网
  listen: 0.0.0.0:53
  default-nameserver:
    # 用来找那些 DOH 域名的 IP 的 DNS 服务器
    - 223.5.5.5
    - 8.8.8.8
  nameserver:
    # 默认用这些服务器来查询
    - https://doh.pub/dns-query
    - https://dns.alidns.com/dns-query
  fallback:
  	# 符合下一节的条件时，使用以下 DNS 服务器查询
    - https://dns.google/dns-query
    - https://1.1.1.1/dns-query
  fallback-filter:
    geoip: true
    ipcidr:
      - 240.0.0.0/4
      - 127.0.0.1/8
      - 0.0.0.0/32
    domain:
      - +.google.com
      - +.twitter.com
      - +.google.com.hk
      - +.googleapis.com
  ipv6: true
```

### 一种不太对的配置方法

这是我刚开始的时候用的方法。用完之后感觉，怎么这么快就好了，不过好像有哪里不对。

这是基于 FakeIP 的方法，让 clash 的 DNS 返回虚拟的 IP 地址。而虚拟 IP 恰好在 Clash Tun 的子网下，请求会自动路由到 clash 中。

```yaml
dns:
  enable: true
  enhanced-mode: fake-ip
```

```bash
sudo systemctl enable --now clash
```

这样之后，在电脑上打开一个浏览器，诶 网都能上了！

不过，后面转圈圈的 Telegram 还在转圈圈，需要指定代理为 `10.0.0.1:7890` 这样才能连上

出现这样的问题也就是因为 FakeIP 的原理，必须是经过 clash DNS 服务器进行解析的，通过域名的连接才会通过 clash

这么做其实应该说只是不推荐，不是不行。所以我写在这里

### 比较好（但是复杂）的配置方法

我们现在把 DNS 改为 `redir-host`，这时候 clash DNS 就会做一个普通 DNS 服务器的事，将安全的 DOT 或者 DOH 协议转换为 UDP53 的 DNS 协议

```yaml
dns:
  enable: true
  enhanced-mode: fake-ip
```

这样之后，再启动 clash，我们的流量并没有经过 clash。

查看 `ip route` 发现，我们默认的流量路由还是 WAN 口的网卡。我们需要手动编辑路由表，把 LAN 口传入的到外网的流量传递给 tun 的网卡。

如果编辑主路由表的话，会导致 clash 自己连接服务器的流量也传递给自己，然后就造成循环了，这不好。所以我们编辑一张新的路由表，并且只用来处理 LAN 口流量

这里的 `198.19.0.1` 和 `198.19.0.0/16` 就对应配置文件中的 `dns.fake-ip-range`。如果没有设置 clash 的 DNS 服务器的话，默认将会是 `198.18.0.1/16`

```bash
sudo ip route add default via 198.19.0.1 dev utun table 233
sudo ip route add 198.19.0.0/16 dev utun table 233
sudo ip route add 10.0.0.0/16 dev enp3s0 table 233

sudo ip rule add from 10.0.0.0/16 table 233
```

这几行命令出了之后，后面的 Telegram 立即连上了，并且网页什么的也全都正常了。现在客户端获取到的 IP 也是真实的 IP（但这样会比 FakeIP 性能差一些）

然后，我们把这些写到脚本里面，并在 clash 启动之后就自动运行

```bash
sudo mkdir /etc/clash/scripts
sudo vi /etc/clash/scripts/setup.sh
```

```bash
#!/bin/bash

#wait for TUN device
while ! ip address show utun > /dev/null; do
    sleep 0.2
done

ip route flush table 233
ip route add default via 198.19.0.1 dev utun table 233
ip route add 198.19.0.0/16 dev utun table 233
ip route add 10.0.0.0/16 dev enp3s0 table 233

ip rule add from 10.0.0.0/16 table 233
```

再写一个在 clash 退出的时候还原配置的脚本

```bash
sudo vi /etc/clash/scripts/unsetup.sh
```

```bash
#!/bin/bash

ip rule delete from all table 233
ip route flush table 233
```

稍微改一下 clash 的 systemd 服务，就是我们刚才创建的那个

```diff
  [Service]
  Type=exec
  Restart=on-abort
  ExecStart=/usr/bin/clash -d /etc/clash
+ ExecStartPost=+/etc/clash/scripts/setup.sh
+ ExecStopPost=+/etc/clash/scripts/unsetup.sh
```

这样之后，就算再重启，我们的服务也能正常了

## 参考资料

[Router (简体中文)](https://wiki.archlinux.org/title/Router_(%E7%AE%80%E4%BD%93%E4%B8%AD%E6%96%87))

[dhcpd (简体中文)](https://wiki.archlinux.org/title/Dhcpd_(%E7%AE%80%E4%BD%93%E4%B8%AD%E6%96%87))

[最好的軟路由 Powered By Arch Linux（其一：基本網路設定）](https://yhndnzj.com/2021/08/13/arch-is-the-best-router/)

[将你的Archlinux打造成路由器](https://www.cnblogs.com/wendster/p/make-your-archlinux-server-to-a-home-router.html)

[How to Setup Clash Premium on Linux](https://blog.icpz.dev/articles/tools/setup-clash-premium-on-linux/)

[systemd.network 中文手册](http://www.jinbuguo.com/systemd/systemd.network.html)
