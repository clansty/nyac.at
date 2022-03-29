从咱喵把系统换成 openSUSE 以来一直都没有找到在这个系统上像在 Arch 上一样使用 Deepin Wine 微信的体验。咱尝试了以下各种版本的微信：

- 各种基于 electron 的版本，太简陋了
- [DoChat 盒装微信](https://github.com/huan/docker-wechat)，版本低到不能登录
- [Docker Deepin](https://github.com/ygcaicn/docker-deepin)，版本也太低了

好像没有一个是满意的。所以自己倒腾出了一个能在任意发行版上用 Deepin Wine 运行最新微信的方法。

受到后两个基于 Docker 的项目的启发，咱一开始想着 Docker Deepin 的微信版本低是因为使用了 Deepin 15 的源，更新版本的包在应用商店源里有，就花了半个下午着手给 Docker Deepin 添加社区源和应用商店源安装新版微信。最后也是装上去了，但是 Wine 初始化之后微信的窗口死活不出来，最后放弃了。

然后我想到了之前在 Arch 里面用的 [deepin-wine-wechat-arch](https://github.com/countstarlight/deepin-wine-wechat-arch)。我就开了一个 Arch 的容器，装上 yay 以及一步步安装 deepin-wine-wechat。最后很成功，能用了。

安装的过程参考了 Docker Deepin 的 Dockerfile，涉及到创建用户啥的，还把创建的用户添加到了 `audio` 和 `video` 两个用户组。咱喵也没有试不这样会发生什么，反正最后做到了。

后来我就把安装好的容器 commit 成了一个新的 docker 镜像，你们可以直接用下面的命令来直接拉取我的镜像，然后创建一个桌面图标啥的就能直接用了

## 使用~~（白嫖）~~

```bash
docker run -dit --name wechat \
    --device /dev/snd --ipc="host"\
    -v "$HOME/Documents/WeChat Files":'/home/user/WeChat Files' \
    -v /tmp/.X11-unix:/tmp/.X11-unix \
    -e XMODIFIERS=@im=fcitx \
    -e QT_IM_MODULE=fcitx \
    -e GTK_IM_MODULE=fcitx \
    -e DISPLAY=unix$DISPLAY \
    -e AUDIO_GID=`getent group audio | cut -d: -f3` \
    -e VIDEO_GID=`getent group video | cut -d: -f3` \
    -e GID=`id -g` \
    -e UID=`id -u` \
    -e TZ=Asia/Shanghai \
    --net host \
    --restart unless-stopped \
    registry.cn-shanghai.aliyuncs.com/clansty/deepin-wine-wechat:latest
```

启动参数也是参考了 Docker Deepin，以及我加了 `--restart unless-stopped` 开机启动，为了直接使用桌面图标打开微信，以及 `--net host` 为了使微信能和局域网里的手机连接（聊天记录传输要用）`-it` 的意思是交互模式以及模拟一个 tty，这样容器里的 bash 可以以交互模式运行，可以直接通过 `docker attach wechat` 来访问容器的 shell 了

如果想要把数据存储在别的位置，那么就改掉第一个 `-v` 行

如果不能启动，那就在终端运行一个 `xhost +` 允许其他设备访问 X Server

然后我们下载这个 deepin wechat 里面提取的 [svg 图标](https://cdn.lwqwq.com/dl/wechat.svg)放在一个地方，进入 `~/.local/share/applications/` 创建一个 .desktop 结尾的应用启动器文件，内容如下

```ini
#!/usr/bin/env xdg-open
[Desktop Entry]
Encoding=UTF-8
Type=Application
Categories=chat;Network;
Icon=刚刚保存那个 svg 图标的路径
Name=WeChat
Name[zh_CN]=微信
Comment=Tencent WeChat Client on Deepin Wine
StartupWMClass=WeChat.exe
Exec=docker exec wechat runuser -u user /opt/apps/com.qq.weixin.deepin/files/run.sh
```

然后就可以直接在启动器里启动微信了

当然也有一些缺点，比如说镜像比较大，而且暂时还不能打开主机的浏览器以及发送 docker volume 路径以外的文件。感觉浏览器这个应该可以有办法解决吧

## 参考资料

- 在Archlinux及衍生发行版上运行微信(WeChat) <https://github.com/countstarlight/deepin-wine-wechat-arch>
- Run deepin application(qq/TIM/WeChat) anywhere <https://github.com/ygcaicn/docker-deepin>
- Docker 时区调整方案 <https://cloud.tencent.com/developer/article/1626811>
- docker: 四种网络模式 <https://www.huaweicloud.com/articles/5bb8f4efe7aaca9d4332750d73876db8.html>
- ubuntu21.04安装deepin版微信3.2.1方法 <https://forum.ubuntu.org.cn/viewtopic.php?f=73&t=492128>

