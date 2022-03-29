自从我搭建完软件源之后准备做一个自动从 AUR 构建指定的包并更新到软件源的东西。我希望它包含以下几个功能：

- 能对接我现在的软件源系统
- 构建时候没有依赖之类的问题
- 如果软件源里面已经有了相同版本，那就不重复构建了。就算重复构建了也不重复上传到服务器
- 不仅能构建 x86_64 的包，还要支持 aarch64

首先呢我是找了一些现成的解决方案，有的使用 yay 来构建软件包，有的直接使用 makepkg。但是大体上都是基于以下这两个仓库派生出的

- [DuckSoft / build-aur-action](https://github.com/DuckSoft/build-aur-action) 提供 Action 里面那个「构建」的动作模板
- [vifly / arch-build](https://github.com/vifly/arch-build) 提供整个 Action YAML 模板，还包含了 [DuckSoft / build-aur-action](https://github.com/DuckSoft/build-aur-action) 的修改版，使用 yay 构建软件包

于是我也 fork 了这两个仓库，直接在这之上修改。

## 制作 build-aur-action 的 Docker 模板

我是基于 [vifly / arch-build](https://github.com/vifly/arch-build) 中的修改版 Action 来修改的。这里面的 Docker 镜像大概做以下几件事：镜像构建时，安装 `git` 和 `base-devel`。镜像每次运行时，添加 ArchLinuxCN 源并且从里面安装 yay，再创建非 Root 用户并用 yay 安装指定的包，最后拿 yay 安装之前的那个构建包。

然后我发现这个 Docker 有一些问题，比如说安装 yay 以及之前的步骤都可以在 Dockerfile 里面做，没必要等到构建完。以及 yay 如果 -S 一个源里有的包会直接从源安装，而不是从 AUR 构建了。这个可以用 -a 开关解决。

我在 pacman.conf 中添加了[竹林里有冰大佬的源](https://mirror.zhullyb.top/)以及我自己的源，以便提供一些类似于 `deepin-wine` 之类的依赖包。然后构建还是通过 yay，但是现在加上了 -a 开关来指定只从 AUR 获取

## 编写 Action 的 YAML

YAML 也是基于 [vifly / arch-build](https://github.com/vifly/arch-build) 的修改的。这里使用了 matrix 来实现并行构建。为了实现检查包是否存在，我给 [arch-repo-builder](https://github.com/Clansty/arch-repo-builder) 添加了一个检查文件存在的接口。然后首先下载 PKGBUILD 并且 source 它，使用里面的变量以及默认的 x86_64 架构生成一个大概的包将来会是的文件名，并且询问服务器这个文件是否存在。要是存在的话，就不继续构建了。

然后就是调用刚才的方法在 Docker 里面构建安装并且拿包，然后通过 ls 获取包真实的名字，存入 step 的 output 里面，再向服务器请求一次是否存在。不存在的话再继续上传和调用接口。

如果你们的源有不一样的方法来提交包，那就把下面这三个步骤改了就可以。当然判断包是否存在的接口也需要改呢

```yaml
      - name: deploy file
        if: ${{ steps.isNeed.outputs.isNeed == 'false' && steps.isNeed2.outputs.isNeed == 'false' }}
        uses: wlixcc/SFTP-Deploy-Action@v1.0
        with:
          username: 'repo-builder'
          server: ${{ secrets.REPO_BUILDER_HOST }}
          ssh_private_key: ${{ secrets.REPO_BUILDER_PRIVKEY }}
          local_path: ${{ matrix.repos }}/${{ steps.pkgname.outputs.pkgname }}
          remote_path: '/home/repo-builder/tmp'

      - run: curl -u ${{ secrets.REPO_BUILDER_AUTH }} ${{ secrets.REPO_BUILDER_API }}/api/add-package/${{ steps.pkgname.outputs.pkgname }}
        if: ${{ steps.isNeed.outputs.isNeed == 'false' && steps.isNeed2.outputs.isNeed == 'false' }}

      - run: curl -u ${{ secrets.REPO_BUILDER_AUTH }} ${{ secrets.REPO_BUILDER_API }}/api/queue
```

其实最后一步请求队列信息是可选的啦

## 增加构建 aarch64 源的包的支持

因为我手机上也有一个 [chroot 的 Arch Linux](android-chroot-arch-linux) 嘛，我希望这个 Actions 可以顺便帮我构建 aarch64 架构的一些包。

首先因为架构不一样，不能直接用 yay 直接安装的方式了，需要先手动 clone AUR 的 git，然后可以先 source 一下 PKGBUILD，然后通过下面的命令把所有的依赖都通过 yay 来解决

```bash
yay -S --noconfirm --needed --asdeps "${makedepends[@]}" "${depends[@]}"
```

然后打包的命令需要改成

```bash
CARCH=aarch64 makepkg -sfA
```

这样差不多就好了

## 处理一个 pkgbase 多个包的情况

之前通过 `$(ls *-*.pkg.tar.*)` 获取包的名字的方法，如果有多个包会得到空白字符隔开的值。所以我们可以通过把通配符变得更详细一些来只获取我们需要的包。

我们可以在「生成一个大概的包将来会是的文件名」那个步骤，把 PKGBUILD 中 `pkgname` `pkgver` `pkgrel` 之类的都存在输出里

```bash
source PKGBUILD
echo ::set-output name=pkgname::$pkgname
echo ::set-output name=pkgver::$pkgver
echo ::set-output name=pkgrel::$pkgrel
```

哦对，在 GitHub Actions 里面可以通过在控制台中输出 `::set-output name=<key>::<value>` 这样的字符串来指定 step 的输出，这个输出可以在下面的步骤里直接使用

然后我们的 ls 命令可以改成

```bash
echo ::set-output name=pkgname::$(ls ${{ steps.isNeed.outputs.pkgname }}-${{ steps.isNeed.outputs.pkgver }}-${{ steps.isNeed.outputs.pkgrel }}-*.pkg.tar.*)
```

这样就解决了

## 关于这个源

我的电脑上大概是有以下三个个人源：[竹林里有冰源](https://mirror.zhullyb.top/)，[光量子源](https://repo.lightquantum.me/)和[我自己的源](https://dl.lwqwq.com/repo)。我的源应该是准备作为前两个源的补充，作为 `icalingua-beta` 包的发布源，以及放一些在 aarch64 架构上用到的包。

可以通过在 `/etc/pacman.conf` 中写入以下内容来添加

```ini
[Clansty]
SigLevel = Never
Server = https://dl.lwqwq.com/repo/$arch
```

## 最终成品

[Clansty / arch-build](https://github.com/Clansty/arch-build) 可以直接 fork 这个下来修改

[Clansty / build-aur-action](https://github.com/Clansty/build-aur-action) 这是使用的 Actions 构建 step 模板

如果想要搭建和我一样的 OneDrive 仓库元数据构建服务器，那么可以使用这里的 [docker-compose.yaml](https://github.com/Clansty/arch-repo-builder/blob/main/docker-compose.yaml)，详见上一篇文章。

Arch-build 仓库需要设置以下 Secrets：

```yaml
REPO_BUILDER_API: 应该是一个 https://部署好的 API 访问地址，不带末尾 / 的
REPO_BUILDER_AUTH: 应该是一个 `用户名:密码`，不过如果你没有设置 basicauth，可以修改 Actions 的 YAML，把 curl 中的 -u 参数删除
REPO_BUILDER_HOST: 可以直接 SSH 上的地址
REPO_BUILDER_PRIVKEY: SSH 使用的私钥。用户名和上传的位置写在 Actions YAML 中
```
