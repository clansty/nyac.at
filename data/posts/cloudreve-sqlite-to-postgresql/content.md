我的 Cloudreve 自建网盘刚开始搭建的时候使用的是 SQLite 数据库。随着数据增加，SQLite 据说性能不足，我觉得应该迁移到有服务器的数据库了。于是我选择了 PostgreSQL

## 配置文件设置

配置文件 `conf.ini` 中增加这样一节：

```ini
[Database]
Type = postgres
Port = 端口号
User = 数据库用户名
Password = 数据库用户名的密码
Host = 数据库地址
Name = 数据库名称
Charset = utf8
```

## 错误的尝试

由于 SQLite 和 PostgreSQL 的表结构和数据格式都不同，所以无论是导出成 SQL 还是通过 Navicat 直接迁移都失败了

## 正确方法

首先，指定一个空的 PostgreSQL 让 Cloudreve 来初始化一下

然后，关闭 Cloudreve，清空所有数据表的数据

用 Navicat 的「工具 - 数据传输」导出原有的 SQLite 为 SQL 文件，然后，用文本编辑器打开它

![image-20220114114251673](https://cdn.lwqwq.com/pic/image-20220114114251673.png)

将所有 Records of xxx表的内容复制下来，进入 PostgreSQL 的 SQL 界面执行。不过在执行之前，要把那些属于 boolean 字段的值从 0 和 1 改成 TRUE 和 FALSE！

![image-20220114114457291](https://cdn.lwqwq.com/pic/image-20220114114457291.png)

至于哪些字段是 boolean 的话QAQ，可以根据字段名称判断，也可以打开 SQLite 的结构看看。

所有表都导入成功的话就迁移好了

以及，由于 `BEGIN` 和 `COMMIT` 的存在，就不会出现一张表导入了一半的情况，要是导入失败的话会回退事务的。

## 小知识

在 pgAdmin4 里面怎么看 PostgreSQL 的数据表呢

答案是进入 Schemas -> public

（（我是第一次用 PostgreSQL 所以比较菜（
