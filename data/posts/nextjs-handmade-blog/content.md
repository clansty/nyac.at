自从主站完善了之后咱一直想把博客系统整合到主站系统里面，并且感觉我好像用不到那些博客系统的高级功能，就在原先的 Next.JS 项目里面手搓了一个博客系统

今天大概是想总结一下这是怎么写出来的（流水帐

## 类型定义与文章信息获取

首先咱喵是准备在项目根目录创建 [`posts` 文件夹](https://github.com/Clansty/Clansty/tree/main/posts)存储文章的信息，里面创建 `slug` 为名的子文件夹，再里面是 `meta.yaml` 存放元数据以及 `content.md` 存放内容信息。然后文章对应的访问位置就是 `/posts/[slug]` 啦。以前用 typecho 的时候是直接 `/数字 ID` 这种形式，现在改成和文章有关系的文字了

然后就是扫描文件夹整理文章信息的[代码](https://github.com/Clansty/Clansty/blob/main/utils/allPosts.ts)了，这个应该还是比较简单的，但是有个坑，就是我把原先自己写的时间信息传递给浏览器解析的，而 iOS 的 safari 的 `new Date()` 构造方法比较刁钻，只认特定格式的日期。于是只能在构建的时候先用 NodeJS 解析一遍再发送给客户端啦

## 文章列表和内页

文章列表就是在服务器端构建的时候调用刚刚写的方法扫描文件夹了，内页里面使用 [ReactMarkdown](https://github.com/remarkjs/react-markdown) 这个组件来解析 Markdown 文章的，不过最新的 Markdown 需要对 ES Module 的支持，而 Next 似乎没有这个支持，我搞了半天都不行，于是就只能换成了旧版本

我写前端大概擅长的就是堆砌 CSS 嘛，所以前端效果啥的就都是做在 CSS 里面的

数据读取的话就用了 Next 的 [`getStaticPaths` `getStaticProps`](https://nextjs.org/docs/basic-features/data-fetching) 功能呢，然后生成出来的页面就都是静态的，可以放在 CloudFlare Pages，对象存储之类的地方托管

## 评论系统

评论系统是简单的写了一个运行在[腾讯云开发](https://cloudbase.net/)的云函数上的后端，数据也就存在云开发的数据库里面，就不需要用到服务器了~~（腾讯云一分钱也没有给我，我倒是要给腾讯云钱~~

后端暂时没有开源出来，不过会的，等我把一键部署的配置文件搞出来~~（咕咕咕）~~这个评论系统我现在命名为 RinMent

前端是做了一个评论框的 React 组件，就只支持简单的评论功能，楼中楼的功能并没有做，也不需要。头像是默认获取 Gravatar，如果是 QQ 邮箱的话会获取 QQ 头像



整个主站的源码都在 [Clansty/Clansty](https://github.com/Clansty/Clansty) 里面，如果发现有什么 bug 或者其他可以改进的地方也可以在这篇文章下面留言呢QAQ
