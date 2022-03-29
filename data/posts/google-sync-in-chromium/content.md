# 起因

在 3 月份的某一次更新之后，[Google 限制了基于 Chromium 浏览器对 Chrome 私有 API 的访问](https://www.cnbeta.com/articles/tech/1078655.htm)，包括登录帐号及同步的一些功能。这意味着 Chrome 的开源版本 Chromium 已经没法正常登录 Google 帐号了，Arch 仓库中的 Chromium 更新后甚至连登录入口都关闭了。

![image-20210512130829973](https://i.loli.net/2021/05/12/orSXeT5BEKxM7sL.png#vwid=349&vhei=391)

但 Google Chrome 只提供了 Linux 下 x86_64 架构的版本，基于 ARM 的架构现在只能用 Chromium。所以我还需要在 Chromium 上使用同步功能

# 尝试在 Chromium 中恢复同步功能

事实上，Google 只是限制了 Chromium 默认的 API key 对私有 API 的访问，以及 Chromium 中登录的帐号。所以我们可以通过自己申请的 Google API key 来实现登录 Chromium

## 0x00 加入 Chromium dev 用户组

要获得用于 Chromium 的 API 权限以及登录 Chromium 的权限，只需要加入这两个 Google 用户群组

- [Chromium-dev](https://groups.google.com/a/chromium.org/forum/?fromgroups#!forum/chromium-dev)
- [Google browser sign-in test account](https://groups.google.com/u/1/a/chromium.org/g/google-browser-signin-testaccounts)

## 0x01 创建项目

首先打开 [Google 开发者中心](https://cloud.google.com/console)，创建一个新的项目，然后选择它

![image-20210512132417922](https://i.loli.net/2021/05/12/uH1FjUPAGw4pEV9.png#vwid=855&vhei=628)

进入左边的 API 和服务 > OAuth 同意屏幕先初始化配置自己的应用

User Type 选择外部

接下来的名称啥的都可以随意填写

在 测试用户 页面，添加自己的账户

## 0x02 添加 API 角色

进入左边的「库」，搜索并添加以下的 API

- Cloud Search API
- Google Drive API
- Safe Browsing API
- Time Zone API
- Admin SDK
- Chrome Sync API
- Chrome Web Store API
- Chrome Spelling API

## 0x03 获取 API 密钥

进入「凭据」页面，首先创建一个 API 密钥

然后创建 OAuth 客户端 ID，应用类型选择桌面应用

## 0x04 添加密钥到环境变量

打开 `~/.xprofile` 文件，这是进入桌面时会执行的配置文件。桌面端的环境变量在这里配置

加入以下代码，使用你刚刚申请的密钥

```bash
export GOOGLE_API_KEY=API 密钥的「键」
export GOOGLE_DEFAULT_CLIENT_ID=客户端 ID
export GOOGLE_DEFAULT_CLIENT_SECRET=客户端密钥
```

最后注销以下机器，重新登录桌面，使得配置文件生效

Chromium 的登录入口就回来啦，然后正常登录就可以了

![image-20210512134916640](https://i.loli.net/2021/05/12/gur7UcV5FLX6bqZ.png#vwid=441&vhei=655)

[前往 limelight 专栏](https://limelight.moe/t/topic/6533)

# 参考资料

- API Keys - The Chromium Projects <https://www.chromium.org/developers/how-tos/api-keys>
