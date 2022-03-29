咱喵有很多东西都是存在服务器里的，要是这些服务器哪天炸了就不太妙了。rclone 有挂载网盘和加密数据的功能，也可以差量传输新增内容。于是我希望定期通过 rclone 自动加密备份服务器里的数据到网盘里。咱用的是世纪互联的 onedrive。

# 在服务器上安装 rclone 和 crontab

rclone 相信大家都能在本地使用吧，配置啥的就不想说了，毕竟是一份配置文件到处复制，导入导出的。

crontab 是一个经典的自动任务工具。以现在的 Arch Linux 为例，系统甚至没有自带 crontab，因为有 systemd 的定时器可以用。不过咱还是更习惯 crontab 一点呢。所以我们安装 [systemd-cron](https://aur.archlinux.org/packages/systemd-cron/) 这个包，它提供了 `crontab` 这个命令，转换传统的 crontab 配置文件来生成 systemd 的 timer/service 文件。

# 配置 rclone

至于网盘连接，就把本机的 `~/.config/rclone/rclone.conf` 复制过去就行啦。其实只要复制需要用到的连接就好了

然后就是创建一个 crypt 类型的存储，它的作用是加密一个已有的存储

```bash
rclone config
```

新建一个 remote，类型选择 11: crypt，remote 就输入 `之前那个网盘名称:路径` 。路径我都选择的是加密，密码和盐就都自动生成了。记得要把生成的密码保存在一个安全的地方。

# 创建 cron 任务

由于需要备份的东西普通用户不一定有权限，所以得以 root 身份创建任务。所以，我们还得把 rclone 的配置文件链接到 root 目录下

```bash
sudo mkdir /root/.config/rclone
sudo ln -s .config/rclone/rclone.conf /root/.config/rclone/rclone.conf
```

```bash
sudo crontab -u root -e
```

在最后加上

```crontab
0 */12 * * * rclone sync /要备份的全路径 你创建的那个crypt的名字:路径
```

这边第二个 */12 指的是 12 小时备份一次。

完成后就自动创建好了 `cron-root-root-0` 这个 service 和对应的 timer，可以通过 `sudo systemctl list-timers` 这个命令查看。也可以通过 `sudo systemctl status cron-root-root-0` 来查看运行结果

