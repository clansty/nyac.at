## 起因

我上周在主电脑上看到一个叫做 [Karabiner Elements](https://karabiner-elements.pqrs.org/) 的软件，可以自定义键盘映射，还可以把大写键改成「如果同时按下其它键，那就是 Ctrl + Alt + Shift + Command 组合」这个样子。于是我今天在笔记本上也装了。笔记本的键盘是日版键盘，要调键盘布局才能用。装了之后之前调好的键盘布局被重置成 ANSI 了，并且通过正常的方法怎么也调不了，因为 macOS 的键盘设置助理只能调物理键盘的布局，但是我现在要改 Karabiner 生成的虚拟键盘的布局。因为物理键盘的按键已经被 Karabiner 捕捉并且映射到虚拟键盘上设定的按键上了，所以调物理键盘布局没用。网上也没有强制修改的方法

## 强制调整键盘布局的方法

我了解到，macOS 保存键盘布局的文件是 `/Library/Preferences/com.apple.keyboardtype.plist`，这是一个二进制 PList 文件，可以用 defaults 命令读写

```bash
defaults read /Library/Preferences/com.apple.keyboardtype.plist
```

```c#
{
    keyboardtype =     {
        "64096-7511-0" = 40;
        "65535-1452-0" = 42;
    };
}
```

但是 defaults write 并不能更改内层嵌套的 key。所以就先转换成 XML PList 再改好了

```bash
defaults export /Library/Preferences/com.apple.keyboardtype.plist -
```

```xml
<?xml version="1.0" encoding="UTF-8"?>
<!DOCTYPE plist PUBLIC "-//Apple//DTD PLIST 1.0//EN" "http://www.apple.com/DTDs/PropertyList-1.0.dtd">
<plist version="1.0">
<dict>
	<key>keyboardtype</key>
	<dict>
		<key>64096-7511-0</key>
		<integer>40</integer>
		<key>65535-1452-0</key>
		<integer>42</integer>
	</dict>
</dict>
</plist>
```

把 40 改成 42，然后

```bash
sudo defaults import /Library/Preferences/com.apple.keyboardtype.plist -
```

从标准输入输入改好的 XML，按 Ctrl + D 输入 EOF，然后就改好了

重启一下机器，就正常了