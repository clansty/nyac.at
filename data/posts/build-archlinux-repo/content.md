最近一直想要自己搭建一个 Arch Linux 的源，一是可以在 GitHub 构建出测试版 Icalingua 的时候直接推送到我的源里，二是可以收录一些别的源里没收录的小众软件和自己打包的软件

## 思路

首先是源的存储位置，我有一个世纪互联的 OneDrive，并且搭建了 [OneManager](https://dl.lwqwq.com)，源就打算存那上面，并且通过 OneManager 来共享出来，效果大概就像[竹林里有冰大佬的源](https://mirror.zhullyb.top/)那样

然后咱就去研究了一下 Arch 源的组成方式。一个源的数据库文件大概有一下四个，分别是以源的名字命名的 `.db`, `.db.tar.gz`, `.files`, `.files.tar.gz`。有没有 `.tar.gz` 的文件其实是一样的，可能是为了兼容旧版吧。`db` 保存每个包的元信息，带 `files` 的多了每个包的文件列表

这些文件是由一个叫做 `repo-add` 的命令生成的，这个命令是 `pacman` 的一部分，使用参数 `源名称.db.tar.gz` `要添加的包.pkg.tar.xxx` 来把一个包添加到源数据库里

源可以兼容多个架构，也可以不兼容。在源的地址里面会用 `$arch` 来表示架构。兼容多个架构的话，就在源的文件夹里面按照架构建立文件夹，然后每个架构相当于一个独立的源

于是我需要实现的大概就是首先在服务器上 Rclone 把 OneDrive 挂载，然后在 GitHub 的 Action 生成完 ALPM 包之后通过 SFTP 把包传送到服务器上，并通知服务器更新源数据库

## 写个辅助程序

首先是我拿自己最擅长的 Node.JS 写了一下向源数据库添加包的逻辑。是准备先把包上传到一个临时的地方，然后通过正则提取架构信息之后复制到架构对应的文件夹里面，再调用 `repo-add` 命令更新数据库

这个过程核心的代码大概是这个样子，完整的代码已经开源到 [GitHub](https://github.com/clansty/arch-repo-builder) 上面了

```js
const addPackage = (pkgFileName) => {
    // 从文件名中获取架构名称
    //            [----1名称版本----]-[---2架构---] .pkg .tar .zst/.gz/.xz?
    const exec = /^([A-Za-z0-9\-._]+)-([a-z0-9._]+)\.pkg\.tar(\.[a-z0-9]+)?$/.exec(pkgFileName)
    const archName = exec[2]

    // 创建架构目录，如果不存在
    const archPath = path.join(REPO_PATH, archName)
    if (!fs.existsSync(archPath)) {
        fs.mkdirSync(archPath)
    }

    // 将文件移动到架构目录
    const dest = path.join(archPath, pkgFileName)
    fs.renameSync(path.join(TMP_PACKAGE_STORE, pkgFileName), dest)

    // 执行添加命令
    execSync(`repo-add ${path.join(archPath, `${REPO_NAME}.db.tar.gz`)} ${dest}`)
}
```

然后就是通过 Express 把它封装成了一个 HTTP 接口，Caddy 反代，记得设置上 basicauth 来防止接口被别人调用呢

由于我的服务器现在不是 FreeBSD 就是 CentOS 嘛，~~它们都没有 pacman 的~~（刚刚搜索了一下，其实 [FreeBSD 是有的](https://www.freshports.org/sysutils/pacman/)，所以我其实可以用 FreeBSD 来创建软件源呢），所以我把接口封装成了一个基于 Arch Linux 的 Docker 镜像

## 服务器端的配置

和本地一样，也是安装好 `rclone` 这个包，然后在 `~/.config/rclone/` 里面复制上 Rclone 的配置文件，然后创建一个 Systemd 的 Unit 来负责守护 `rclone mount` 进程就好啦

附上 Rclone 的 systemd 配置

```bash
cat /usr/lib/systemd/system/rclone-repo@.service
```

```ini
[Unit]
Description=rclone-repo
After=network-online.target
Wants=network-online.target

[Service]
ExecStart=/usr/bin/rclone mount 21cn:repo /home/clansty/repo-builder --umask 0000 --default-permissions --allow-non-empty --allow-other --transfers 1 --buffer-size 64M --low-level-retries 200 --dir-cache-time 12h --vfs-read-chunk-size 32M --vfs-read-chunk-size-limit 1G --vfs-cache-mode writes --config /home/clansty/.config/rclone/rclone.conf
Restart=on-failure
RestartSec=3
RestartPreventExitStatus=3
User=%i

[Install]
WantedBy=multi-user.target
```

然后启用的方式就是

```bash
sudo systemctl enable --now rclone-repo@你的用户名
```

由于 Node 的 `fs.renameSync` 并不能跨分区移动文件，只能做真的重命名移动操作（你会发现在同一个分区/挂载点移动文件是秒完成的，其实它在文件系统看起来真的只是重命名嘛，是真的移动，而跨分区/挂载点就是复制过去再把老的删掉啦），我的 `tmp` 和 `repo` 目录必须都在 OneDrive 里面，然后把它们共同的父目录就直接挂载到 Docker Volume 了（不然单独挂载 Docker 容器里面看起来还是两个挂载点）。

然后现在把一个构建好的包复制到 `tmp` 目录里面，调用一下 Docker 里面的 API 就完成包的入库了

以及 为了安全，我希望 SFTP 上传包的用户只拥有访问 `tmp` 目录的权限，并且一定别有 Root 权限，于是就新建了一个用户，并且把 `tmp` 目录 bind mount 到那个用户目录里面（Rclone 挂载的目录全都是 `777` 这种全员读写权限），创建一个单独的私钥给那个用户。

> 小小的提示，`.ssh` 的权限 `700`，`.ssh/authorized_keys` 权限 `600`，以及 `/etc/shadow` 里面那个用户密码区域的 `!!` 要改成 `*`，否则都是没法 SSH 上的

## GitHub Actions 文件修改

这个非常的简单，不过首先需要将 beta 的包独立出来，以及在 `PKGBUILD` 里面把 `provides` `conflicts` 之类的参数写好。

然后 Action 要多做一下几件事

比如说找到包完整的名字

```bash
echo ::set-output name=pkgname::$(ls *-x86_64.pkg.*)
```

上传 SFTP，这里用了 [wlixcc/SFTP-Deploy-Action@v1.0](https://github.com/marketplace/actions/sftp-deploy) 这个 Action 模板。

以及通过 cURL 调用服务器上的 API

记得密码 私钥 地址啥的全都放在 Secret 里面，不要直接写在代码里呢

## 第一次使用的结果

我首先用的是国内服务器嘛，毕竟我国内服务器资源比较宽裕

然而：

![传送构建好的包花费了 32m 1s](https://cdn.lwqwq.com/pic/image-20211121230410177.png)

这个 Actions 的编译机和我北京腾讯云轻量应用服务器通信的速度太慢了，大概只有 10~20KB/s。

然后我想了好多解决方法，比如先在 Actions 里面把文件传到 OneDrive 里，再服务器内更新仓库元数据，以及直接在 Actions 里面更新元数据之类，但是由于可能存在的同时操作问题似乎都不太好做（`repo-add` 在执行中的时候会给 `db` 加锁的

> 写到这里我突然想到前面的代码应该先 `repo-add` 执行成功之后再移动文件，毕竟 `repo-add` 不强制包在源目录里面，这样源目录里面一定就都是正确添加的包了

于是我测试了一下国外服务器和世纪互联 OneDrive 的连接速度，好几个 MB/s 呢，国内服务器其实由于带宽问题也就只能上传达到 1MB/s（8Mbp/s）

然后我直接就把整套系统搬到了国外的服务器上，这是解决了一个问题附赠一个优化呢

## 添加凌莞源

最后给出这个源的添加方式吧

特别简单，因为我还没有做 GPG 签名

只要往 `/etc/pacman.conf` 添加以下内容就可以啦

```ini
[Clansty]
SigLevel = Never
Server = https://dl.lwqwq.com/repo/$arch
```

提供 x86_64，i686，aarch64 三个架构的包呢，`$arch` 就是自动选择架构的
