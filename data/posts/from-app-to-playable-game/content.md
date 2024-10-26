## 前提

本文假设你已经拿到了 .app 格式的文件。你需要自己取得所需的资源，本文不会直接提供所需要的文件，也不会提供任何支持。阅读本文后的操作产生的任何问题，作者不承担任何责任

## 准备解密 App 所需文件

这个步骤和下面的一些步骤需要一些工具，可以在[这里](https://gitdab.com/SEGA/sega)获取。请将这整个仓库的内容都下载下来

首先创建一个文件夹作为这次的工作区，放入你要解密的 .APP 文件，并且把刚才那个仓库里的 `tools/Filesystem/fsdecrypt.exe` 这个文件复制进去

然后，你需要找到你想解密的游戏的 AES Key。以 `SDEZ_1.45.00_20240214060142_0.app` 为例，在刚才那个仓库的 `keys/AES128_Nu_ALLS` 这个目录下，找到 `SDEZ.bin` 复制到文件夹里

## 解密 App 文件

在上一步创建的工作区目录里打开一个命令窗口，有一种简单的方式是点击地址栏然后输入 `cmd` 回车

然后使用下面的命令开始解密

```shell
fsdecrypt SDEZ.bin 0x200000 SDEZ_1.45.00_20240214060142_0.app out.vhd
```

这一步需要很长时间，这时候你可以看到有个 `out.vhd` 文件并且它的大小在增加。可以用过这个文件的大小来推断进度。可以通过十六进制编辑器打开看一下 `out.vhd`，如果出现以下内容就代表解密的结果是正确的

![NTFS 分区镜像特征](Pasted%20image%2020241026190852.png)

这个文件其实并不是一个微软 VHD 磁盘镜像，而是一个分区镜像。严格来说它应该是 `.img` 后缀的，只是很多教程里喜欢以 `out.vhd` 命名这个文件

## 提取 internal_0.vhd

因为它不是微软 VHD 镜像，所以正常双击是不能挂载它的。但是我们可以使用 [ImDisk](https://sourceforge.net/projects/imdisk-toolkit/) 挂载

![使用 ImDisk 挂载 NTFS 分区镜像](Pasted%20image%2020241026191928.png)

挂载之后打开新出现的盘符，把 `internal_0.vhd` 复制出来并解除挂载 `out.vhd`。如果不复制出来的话是没法直接挂载的

`internal_0.vhd` 是标准的 VHD 格式，所以我们可以直接双击挂载。然后把 Package 这个目录复制出来，里面是我们需要的游戏文件。游戏不可以放在 E 盘，否则会出现奇怪的问题。尽量放在 C 盘和 D 盘

千万不要手滑点到 game.bat，否则你的时间会变成日本时区并且 Y: 盘会被清空（如果有）

## 给 `amdaemon.exe` 脱壳

由于 Segatools 通过创建远程线程的方式 hook `amdaemon.exe`，然而 amdaemon 加的 HyperTech Crackproof 壳会阻止这个行为，所以我们必须先给 `amdaemon.exe` 脱壳。

脱壳非常容易，只需要把 `amdaemon.exe` 复制到第一步下载的工具仓库的 `tools\Crackproof\DecryptCrackproofExe64` 这个文件夹里面（复制进去是必须的），并且把 `amdaemon.exe` 拖放到 `DecryptCrackproofExe64.exe` 的图标上（不是双击打开再拖入）

然后你会得到一个大约 10MB 的 `amdaemon.unpack.exe`。把这个复制到游戏目录替换原先的 `amdaemon.exe`

请注意，`DecryptCrackproofExe64.exe` 只能给 `amdaemon.exe` 脱壳，而游戏中加了壳的文件包括 `Sinmai.exe` `Assembly-CSharp.dll` `Cake.dll` `amdaemon_api.dll`。其他的这些无法由这个程序脱壳，并且也不需要脱壳

## 准备 Segatools

Segatools 是一套开源的组件，用于 hook AMDaemon 提供基础的启动环境，它在[这里](https://gitea.tendokyu.moe/Dniel97/segatools)提供源码。

正常的 Segatools 只包括 `mai2hook.dll` 和外围组件 `inject.exe` `segatools.ini` 和 `start.bat`。但是很多人会把包含了 `Sinmai_Data` 下很多东西甚至包括了魔改并加了不需要的功能的 `Assembly-CSharp.dll` 的压缩包叫做 “Segatools”

Segatools 可以自己编译，非常简单。只需要在电脑上安装 [Docker](https://www.docker.com/products/docker-desktop/)，下载仓库之后点击 `docker-build.bat` 并花费一点时间就可以自动完成编译并产生 `mai2hook.dll`。如果不想自己编译，也可以去其他已有的可以运行的游戏中复制 `inject.exe` 和 `mai2hook.dll` 这两个文件

## 准备 `odd.sys`

`odd.sys` 是街机系统上用于辅助解密 HyperTech Crackproof 加壳的 exe 的内核模块。脱壳前面说的另外四个文件非常麻烦也没有必要，所以带壳运行是更高效的方法

首先[下载](https://fars.ee/0jfk.sys)并保存为 `odd.sys`，放在某个文件夹里。然后在那个文件夹中打开一个管理员 cmd，输入以下命令

```shell
sc create odd binPath="%~dp0odd.sys" type=kernel
sc start odd
```

你也可以在 create 命令后面加一个 `start=auto` 来开机自启

如果发现 odd 在这之前就已经存在了并且已经在运行了就跳过这一步吧，可能你之前运行其他版本的时候已经安装了 odd

## 安装 MelonLoader

原版的游戏程序需要进行一些修补来实现在普通电脑上运行以及连接私服之类的操作。以前很多人的做法是将 `Assembly-CSharp.dll` 反编译，修改好再编译回去。这样的话可能会导致各种人有各种不同的 `Assembly-CSharp.dll` 引发兼容性问题，还容易导致代码混乱以及对于每个版本的游戏都得重复做相同的修改。

现代化一点的方式是通过独立的 Mod 来动态修改游戏。这样同一份 Mod 可以实现所有版本的游戏通用，并且安装容易，破坏性小

MelonLoader 是对于 Unity 游戏的 Mod 加载器。前往官方 [GitHub Release](https://github.com/LavaGang/MelonLoader/releases) 下载 [MelonLoader.x64.zip](https://github.com/LavaGang/MelonLoader/releases/download/v0.6.4/MelonLoader.x64.zip)，然后将 `NOTICE.txt` 以外的文件都解压到游戏目录下，MelonLoader 就安装好了

看起来 0.6.5 版本的 MelonLoader 不太工作，最好是用 0.6.4 版本的

## 安装 AquaMai

AquaMai 是开源的 Sinmai mod，它不仅实现了游戏启动所需要的修补还提供了很多有用的功能

AquaMai 编译好的版本可以通过 [GitHub Actions](https://github.com/hykilpikonna/AquaDX/actions/workflows/aquamai.yaml) 获取。这需要一个 GitHub 账号，否则无法下载附件。打开这个页面后点击右边第一个绿色的运行结果，然后在 Artifacts 中下载

![AquaMai 构建产物](Pasted%20image%2020241026201344.png)

安装也非常简单，只需要在游戏目录中新建一个 Mods 文件夹，然后把 dll 复制进去就可以了

AquaMai 和 MelonLoader 的安装也可以通过 [MaiChartManager](https://github.com/clansty/MaiChartManager) 一键完成

## 创建配置文件

### mai2.ini

首先我们需要创建一个 `mai2.ini` 文件。在绝大多数情况下，`mai2.ini` 中配置的内容都是游戏本体自带的。我们现在在这里需要配置的是让游戏忽略错误并且以开发模式运行。同时这里还可以开启歌曲全解和自定义一 PC 的歌曲数量

```ini
[AM]
Target=0
IgnoreError=1
DummyTouchPanel=1
DummyLED=1
DummyCodeCamera=1
DummyPhotoCamera=1

[Sound]
Sound8Ch=0


[Debug]
AllOpen=1
AllMap=0
AllCollection=0
AllChara=0
MaxTrack=3
Debug=1

[DebugVersion]
DebugMajorVersion=1
DebugMinorVersion=45
DebugReleaseVersion=00
```

其中 Target 是游戏是否以生产环境运行的开关。它控制比如说开了之后游戏会把 ErrorLog 之类的文件夹放在 Y: 盘里，但是关了之后这些文件就会被放在当前目录下

Dummy 开头的那些就是假如你没有对应的硬件就开启，会加载虚拟的

AllOpen 是开启歌曲全解

DebugVersion 可以设置游戏认为自己是的版本号

### segatools.ini

新建一个 `segatools.ini`，以下是一些固定的设置，比如说 vfs 指定保存数据的位置

```ini
[vfs]
amfs=amfs
option=options
appdata=appdata

[netenv]
enable=1
```

模拟 Aime 相关的设置，如果有实体读卡器，那么就把 enable 设置为 0。设为 1 的话在游戏中按 Enter 模拟刷卡，卡号读取的是 `Device\aime.txt`。如果没有这个文件会自动生成一个

```ini
[aime]
enable=1
aimeGen=1
```

关于联网的设置，KeyChip 可在 [AquaDX](https://aquadx.net) 注册账号后获取

```ini
[dns]
default=aquadx.hydev.org
[keychip]
id=你获取的 KeyChip
```

test 和 service 键我习惯映射成 9 和 8

```ini
[io4]
; 9
test=0x39
; 8
service=0x38

[button]
enable=1
```

gpio 设置用于确定当前机台是否作为服务端。一般来说会设为服务端，否则会卡在搜索服务器界面。这个选项也可以使用 AquaMai 的强制作为服务端来设置

```ini
[gpio]
dipsw1=1
```

### AquaMai.toml

这个文件是 AquaMai Mod 的配置。在开始之前需要去[这里](https://github.com/hykilpikonna/AquaDX/blob/v1-dev/AquaMai/AquaMai.zh.toml)获取一个最新的配置文件模板。原版没修改过的游戏程序要启动需要开启以下设置项

```toml
[Fix]
RemoveEncryption=true
ForceAsServer=true
ForceFreePlay=true
```

照理说可以直接只把以上内容写入 AquaMai.toml，不过 AquaMai 还提供了很多有用的功能，比如说单人模式。这些功能可以依据你的需要开启

`ForceFreePlay` 也可以换成 `ForcePaidPlay`，游戏中会锁定 24 个币

## 修改 AMDaemon 配置

AMDaemon 会读取三个 json 格式的配置，我们需要修改一些默认的设置来确保它们符合我们的需要。打开 `config_common.json`，修改以下设置

找到 `allnet_auth`，将 `type` 修改为 `"1.0"`，因为私服使用的是 AuthV1

找到 `allnet_accounting`，将 `enable` 改为 `false`

找到 `aime`，将 `high_baudrate` 改为 `true`，如果你的配置中不是的话（例如 SDGA），因为大多数市面上的读卡器都是 115200 波特率的。同时可以把 `firmware_path` 数组清空，可以加快启动速度

## 创建 `start.bat`

新建一个文本文件，命名为 `start.bat`，写入以下内容

```shell
pushd %~dp0
start inject -d -k mai2hook.dll amdaemon.exe -f -c config_common.json config_server.json config_client.json
sinmai.exe
taskkill /f /im amdaemon.exe
```

在游戏目录里创建空的 `Device` 目录

## 启动游戏

点击 `start.bat` 就可以启动游戏了。游戏可能会卡在加载的最后一个界面，如下图

![加载卡住的界面](Pasted%20image%2020241026205143.png)

这时候只要按一下 9 进入 test 模式，按 `w` 键选择游戏设置，将店内招募设置设为关。同时也可以在这里开启续关设置

![游戏设置](Pasted%20image%2020241026205229.png)

![游戏设置界面](Pasted%20image%2020241026205351.png)

设置完成后就可以正常进入游戏了

## 常见问题解答

### 怎么解包版本内小更新（internal_1.vhd）

internal_1.vhd 是差分 VHD 文件，这需要你有 internal_0.vhd

然后，你需要在电脑上安装 Hyper-V 功能，因为我们需要用到它的管理器来修复关联。打开管理器之后，在右侧点击编辑磁盘镜像

![编辑磁盘镜像](Pasted%20image%2020241026205821.png)

浏览到 internal_1.vhd 的位置，选择修复关联，再浏览 internal_0.vhd 就可以了。完成之后可以点击 internal_1.vhd 直接挂载

### 如何解包 .opt 格式的包

opt 镜像用的是 `tools\Filesystem` 中的 `fstool.exe`，`keys\AES128_Nu_ALLS` 中的 `OPT.bin`

命令如下

```shell
fstool dec OPT.bin file.opt out.vhd
```

得到的是一个 exFAT 格式的原始镜像。提取其中的文件可以使用 [PowerISO](https://www.poweriso.com/) 来解压

### 那些不需要 `odd.sys` 的包是怎么做出来的

理论上将 `Sinmai.exe` `Assembly-CSharp.dll` `Cake.dll` `amdaemon_api.dll` 全部脱壳即可。但是这些文件脱壳都比较麻烦

`Assembly-CSharp.dll` 是这里面脱壳最简单的也是最重要的，因为它是 C# 编写的，并且它包含游戏程序代码

Sinmai.exe 只是一个普通的 Unity Player，随便从什么游戏里面抠一个过来就可以直接用。但是未加壳的 Sinmai.exe 不能和加壳的这些 dll 一起使用

`Cake.dll` 包含连接官方所需要的一些数据，我们完全不需要它。常见的做法是做一个空壳或者把相关引用从 `Assembly-CSharp.dll` 里全部剔除。空壳也是所有版本都通用的

然而 `amdaemon_api.dll` 包含和 `amdaemon.exe` 通信的接口，并且 `amdaemon_api.dll` `AMDaemon.NET.dll` 和 `amdaemon.exe` 这三个文件的版本是绑定的。它的脱壳非常麻烦，很少有人愿意做，并且也不能简单替换成旧版本脱好壳的。现在常见的做法是把 `amdaemon_api.dll` 和`amdaemon.exe` 换成老版本脱好的，然后反编译 `AMDaemon.NET.dll` 把新增的方法补上

如果有这个需求，可以尝试使用[这个](https://files.catbox.moe/yn20pq.7z)