openSUSE 的各种 OBS 源里面似乎都没有见到有移植的向日葵包，网上搜索也没有找到能用的在 openSUSE 中安装向日葵的方法。最近我有需要用到向日葵，于是去官方[下载页面](https://sunlogin.oray.com/download/)看了一下，官方发布了许多新的支持系统，但是还是没有 openSUSE。所以我把这些包都下载下来看了一下区别，找到了在 openSUSE 下正常安装向日葵的方法。

## 下载安装

我们选择适配「中科方德」这个系统的包，它是 RPM 格式的，而且安装起来没有依赖问题。直接用 YaST 来安装就可以了。别的包我尝试过解压还是安装都没能正常使用。

安装完成之后当然是没完，启动器里也看不到图标，执行命令也是不能运行的。

## 配置

因为向日葵的 postinstall 配置脚本中检测系统的代码并不支持 openSUSE，所以我们需要手动配置它。这些命令都是从 rpm 解包中的 `rpmlinstal.sh` 文件中找到的，需要以 Root 身份执行（可以先 `sudo -s`）：

```bash
chmod 766 /usr/local/sunlogin/sunlogin.desktop
cp /usr/local/sunlogin/sunlogin.desktop /usr/share/applications/
chmod 766 /usr/local/sunlogin/res/skin/*.skin
chmod 766 /usr/share/applications/sunlogin.desktop
chmod 644 /usr/local/sunlogin/res/icon/*
cp /usr/local/sunlogin/scripts/runsunloginclient.service /etc/systemd/system/runsunloginclient.service
systemctl enable --now runsunloginclient.service
```

然后，就可以通过 `/usr/local/sunlogin/bin/sunloginclient` 或者直接在启动器里点击图标来打开向日葵啦
