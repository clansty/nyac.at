## 起因

入手了一台 Rift S 来改善玩节奏光剑时候的延迟和丢追问题。要驱动 Rift S，电脑上需要安装 Oculus Link（或者说是 Quest Link）。然而，在安装的过程中，安装程序提示我磁盘空间不足无法安装，但是我磁盘空间明明是充足的。

于是我就觉得，是不是因为我的最新最热全 ReFS 导致的。查找了一下网页，网上确实有说到这个东西有 NTFS 检查

![ReFS 格式 C 盘](Pasted%20image%2020250223011324.png)

## 安装

首先我得搞定安装程序。首先下载到的是一个📦图标的 `OculusSetup.exe`，它会从资源区中提取一个 Meta 图标的 `OculusSetup.exe` 并执行。通过 7-Zip 的 # 模式可以轻松从资源区提取这个内层 Exe

然后我的想法是追踪它的系统 API 调用，找类似于 `GetVolumeInformationW` 的调用。然而在追踪的时候，我发现它加载了 `clr.dll`。一看确实是一个 C# 程序，那就简单了。直接通过 dnSpy 打开就可以看到源代码，然后通过字符串找到 NTFS 相关检查删除就可以了

![C# 安装程序中的 NTFS 检查](Pasted%20image%2020250223011827.png)

在 dnSpy 中修改代码时需要加载那个类所使用的依赖 DLL，而依赖 DLL 在安装程序的资源区了，都提取之后拖入 dnSpy 就可以正常加载了

修改完之后就可以正常走完安装过程。我以为这就结束了，然而这只是开始

## Electron 客户端

登录了两个被停用的 Meta 账号之后，终于成功注册了一个新的一次性 Meta 账号

![新的账号会在什么时候被停用呢](Pasted%20image%2020250223012219.png)

然而在这之后我们走到了下一关

![无法选择的下载内容文件夹](Pasted%20image%2020250223012335.png)

首先这个客户端是 Electron 做的。通过 `--inspect 端口号` 可以通过 Chromium 内核浏览器连接进行主进程调试，然后取得所有 `BrowserWindow` 并且打开渲染进程的 DevTools。删掉按钮的 `disabled` 之后点击发现并不工作

然后解包 app.asar，搜索字符串并没有发现任何 NTFS 字样。两个原生模块很小，UTF-8 和 UTF-16 的 strings 也没法从中获取到线索

注入 [bakyrd/ipcman: Electron IPC Hook/Devtools](https://github.com/bakyrd/ipcman)，发现错误提示的文字是 IPC 从主进程传过来的，Electron 附近也找不到 Locale 相关内容

于是我想，去找找日志吧。就在 %LocalAppData% 里找到了日志，并且相关错误字样出现在 Service 开头的日志文件里面。除了 Electron 的进程就是一个 Windows 服务 `OVRServiceLauncher.exe` 和它拉起来的两个进程。看着像 Service 主进程的是 `OVRServer_x64.exe`。因为 Windows 服务是特殊的 EXE，里面需要有服务相关的入口点。一般普通的程序想要服务运行，需要一个能作为服务运行的程序来拉它。

## 修改 NTFS 检查

`OVRServer_x64.exe` 位于 `oculus-runtime` 目录里面，里面有很多 OVR 相关的 DLL。通过 strings 查找 NTFS 发现，相关字样都在 `OculusAppFramework.dll` 里面，其中有一个 UTF-16 格式的 `NTFS` 和一些 UTF-8 格式的报错信息。通过 IDA 打开它就可以找到检查 NTFS 的相关代码

![DLL 中 NTFS 相关检查](Pasted%20image%2020250223013416.png)

简单一点的话就通过十六进制编辑把 NTFS 在常量池中的字节 `4e 00 54 00 46 00 53 00` 修改成 ReFS 对应的 `52 00 65 00 46 00 53 00` 就可以了

## 不太成功的 Hook 实现

然而把改完的东西放进去，发现服务并没有正常启动

这个 `OVRServer_x64.exe` 其实是可以直接在控制台里运行的。运行一下就会发现，是 DLL 无法通过校验

```log
{!ERROR!} [OAF] Failed to validate OculusAppFramework.dll (err 15)
```

尝试通过 IDA 在输出部分进行修改绕过一下 IF 的执行，发现并没有用。而且当修改了 `OVRServer_x64.exe`，服务启动器也会拒绝启动它。于是我就想能不能通过 Hook 或者别的什么方法解决这个问题

在 IDA 里进行了一些寻找，我找到了实际进行 DLL 校验的函数 `sub_7FF660D4CD30`

![](Pasted%20image%2020250223014219.png)

其中进行了一些 `WinVerifyTrust` 和 `CertGetNameStringW` 的调用，并且常量池里也找到了对应检查的证书名字和颁发者名字之类的

![WinVerifyTrust 和 CertGetNameStringW](Pasted%20image%2020250223014442.png)

然后我就想，我不动它的证书，然后做一个假的 Wintrust.dll 放进去，发现不会被调用。但是写一个 version.dll 就可以被调用到。于是通过 Rust 写一个 version.dll，Hook 真实的 `WinVerifyTrust` 方法

```rust
use windows::core::GUID;
use windows::Win32::Foundation::HWND;
use std::ffi::c_void;
use winapi::shared::minwindef::HINSTANCE;
use retour::GenericDetour;
use windows::{
    core::PCSTR,
    Win32::System::LibraryLoader::{GetProcAddress, LoadLibraryA},
};
use winapi::um::errhandlingapi::SetLastError;


type WvtFunction = extern "system" fn(HWND, *mut GUID, *mut c_void) -> i64;
extern "system" fn WinVerifyTrust(
    _hWnd: HWND, 
    _pgActionID: *mut GUID, 
    _pWVTData: *mut c_void
) -> i64 {
    println!("🐱 WinVerifyTrust called");
    unsafe { SetLastError(0) };
    0
}

#[no_mangle]
#[allow(non_snake_case, unused_variables)]
extern "system" fn DllMain(dll_module: HINSTANCE, call_reason: u32, _: *mut ()) -> bool {
    let hooker: GenericDetour<WvtFunction> = {
        let library_handle = unsafe { LoadLibraryA(PCSTR(b"wintrust.dll\0".as_ptr() as _)) }.unwrap();
        let address = unsafe { GetProcAddress(library_handle, PCSTR(b"WinVerifyTrust\0".as_ptr() as _)) };
        let ori: WvtFunction = unsafe { std::mem::transmute(address) };
        unsafe { GenericDetour::new(ori, WinVerifyTrust).unwrap() }
    };

    match call_reason {
        DLL_PROCESS_ATTACH => unsafe {
            hooker.enable().unwrap();
        },
        _ => {}
    };
    println!("喵喵喵");

    true
}
```

放进去之后，发现错误代码变了，从原先的 15 变成了 1

![返回值变成了 1](Pasted%20image%2020250223020136.png)

## 还是直接修改了 EXE

通过 IDA 看到后面有一坨分支代码，决定了这个函数的返回值

![确定返回值的代码](Pasted%20image%2020250223015337.png)

但是，我感觉很难在这里面找到一个返回值为 0 的路径。但是通过修改 `WinVerifyTrust` 的返回值，确实可以让程序显示出不同的错误代码，而错误代码就是这个函数的返回值

大多数影响返回值的变量都是静态赋值，而 `returnCode` 初值为 0，应该只有没赋值就返回的情况可以让它返回 0。然而没赋值就返回的大概也许可能就只有这里

![上面的 while](Pasted%20image%2020250223015733.png)

懒得去分析循环里面的东西和那几个函数了。但是，根据所有的静态赋值，返回值 1 只可能来源于 `v7` 的初值 1。所以最简单的方法应该是在汇编里把 v7 的初值改成 0，不需要动任何的指令

不过这样也还是改了 EXE，服务启动器会拒绝启动它。但是我们可以先手动启动试试，改了 v7 的初值并带上 `WinVerifyTrust` 的 Hook 确实可以正常启动了。打开 Electron 的主程序，也可以正常进入下一步了

![选择下载位置不再报错](Pasted%20image%2020250223020205.png)

## 结束

不过看起来 NTFS 的检查只会在设置的过程中。这一步确认了之后，就算把所有文件全都换成了原版，也可以正常使用，只是没法更改下载文件夹而已。所以我也就懒得继续分析和修复服务启动器了，这个分析也到此为止

至于为什么不搞一个虚拟的 NTFS 磁盘来作为下载位置，而是要花大半天搞这些呢，因为确实挺好玩的，我自己玩的开心，我不觉得这是在浪费时间，而且有学到东西。安装器是很快就搞出来了的，大多数时间都花在了搞 DLL 校验上，安装器都搞了，我也不愿意就这么放弃了