## 起因

在某些场合，比如访问某些锁区的服务时，我们必须使用特定地区的 IP 地址来访问，或者至少不能用某个地区的 IP 来访问。然而，Cloudflare Workers 在大多数时候都会自动选用离用户最近的节点来运行，并且没有提供手动指定运行地区的功能。

不过手动指定 Cloudflare Workers 的出口 IP 也不是完全不可能的，不过这需要一些骚操作来实现。原理也不是特别复杂，而且你只需要用一个子域名关联这个 Worker 就可以了

## 一些基础

首先，在每个请求中都会有一个 `req.cf.colo` 属性，它表示了当前 Workers 是在哪里运行的。比如说我们不希望它用香港的 IP 请求目标服务，我们就可以先判断一下 `req.cf.colo === 'HKG'` 在执行专门的操作。在网页上选择“串流日志”时，也可以在 event 中看到这个

### Workers fetch 自己会发生什么

相信不少人应该曾经发现过，如果在 Workers 里面写上了这么一段东西

```ts
export default {
  async fetch(request, env, ctx): Promise<Response> {
    return fetch(request.url);
  },
}
```

访问一下有可能会看到一个“Welcome to Workers”之类的页面，而并没有死循环什么的。实际上是因为在 Workers 内部请求自身的域名的时候，它会请求原站而不是再调起自己。而这个请求并不会经过 Cloudflare 的代理（橙色的云），因为 Workers 自身就是 Cloudflare 的边缘节点了

### 那些神奇的 8 开头的 IP

有些时候去 dig WARP 的域名时，会获得一些 8.0.0.0/8 这个段里面的 IP 地址。它也是 Cloudflare 的地址，但是你会发现直接去访问它的 80 端口的话，它并不会响应你的请求

但是，假如你试试在 Workers 里面访问一下它，你会获得一个 `error code: 1003`（不可用直接 IP 访问），和你直接访问普通的 Cloudflare 的 IP 是一样的！

实际上，一般你在外面看到的 Cloudflare 的 IP 大多都是泛播 IP，它可以是任何地理位置的。然而这些 8 开头的 IP 不一样，它们代表的是实际存在的某个 Cloudflare 的数据中心节点

以上两点都是这些 IP 的神奇之处，下面的操作就和它有关

## 骚操作

### 首先找一个 IP

首先，我们需要先找到一个符合你地理位置预期的活着的 8 开头的 IP。能 ping 通就可以了。可以通过 nmap 扫描

```shell
sudo nmap -n -sP 8.0.0.0/8
```

扫完之后看看地理位置符不符合你的预期。获得的 IP 直接访问 80 端口应该不会响应，但是必须能 ping 通

### 然后把你想要的子域名解析上去

就拿我现在写这个的时候能用的一个 IP 举例子：`8.41.6.219`，它是“法国–普罗旺斯－阿尔卑斯－蓝色海岸–罗讷河口–马赛 Cloudflare_Warp节点”

然后假如我要用的子域名是 `demo.0w.al`，就把它 A 记录解析上去。而且必须要点亮橙色的云（代理模式）

如果这时候去访问的话，应该就会获得一个 `error code: 1000`（DNS 直接解析到了 Cloudflare 的 IP）

### 编写 Workers

我们直接上代码

```typescript
export default {
  async fetch(request, env, ctx): Promise<Response> {
    if (request.cf?.colo === 'HKG') {
      // 把请求转发到目标的位置
      return await fetch(request.url, {
        body: request.body,
        method: request.method,
        headers: request.headers,
      });
    }
    // 做你想做的事情
    // const res = await (await fetch('...')).text();
    const res = request.cf;
    return new Response(JSON.stringify(res));
  },
} satisfies ExportedHandler<Env>;
```

然后你要在 Workers 的 Routes 里面加上你的子域名。我觉得不能用 Custom Domains

### 然后就好了

访问一下你的子域名你就会发现，如果你平时访问 Cloudflare 是香港，你就会得到

```json
"colo":"MRS"
```

`fetch(request.url` 就是用了访问自身会回源的特性，而 8 开头的那些 IP 又和其他 IP 不一样。因此请求就被转发到了 Cloudflare 的另一个数据中心。

而假如你没有用 8 开头的 IP，而是用了别的什么普通的 Cloudflare 的 IP 的话，你应该会获得一个 `error code: 1000`。因为任何普通的 Cloudflare IP 都可以是当前正在运行你 Workers 的那个节点本身，而不是 IP 看起来在的那个位置。而执行你 Workers 的节点回源回到了自己身上，当然就报这个错误了，像你直接把域名解析到 Cloudflare 的 IP 那样

如果你不理解上面的内容，就不要理解好了。你只要知道这个方法可以让你的 Workers 在你指定的节点上运行

## 后记

今天遇到这个需求的时候，我首先是查到了官方论坛上的[这篇帖子](https://community.cloudflare.com/t/how-to-force-region-in-cloudflare-workers/557016)，不过它只是说明了可以以及大致的代码。代码也显得很混乱，并没有让我一下子就知道要点和核心。并且让我感觉是不是只能用来访问自己部署在同一个域名下的自己的 API。这里面给出的示例 IP 是 ping 不通的，所以我无论是尝试它的示例 IP 还是我自己找了一个普通的 Cloudflare IP 都没有成功

然后我又看的了[这个](https://community.cloudflare.com/t/how-to-run-workers-on-specific-datacenter-colos/385851)，知道了大概和 8 开头的 IP 有关，于是又试了快一个小时才成功实践

就在写这篇文章之前，我用中文搜索了一下，发现我一个[朋友](friend:lyc8503)竟然写了[思路相同的内容](https://blog.lyc8503.net/post/cloudflare-worker-region/)。不过我看了一下感觉要是我还没有成功实践大概还是不会知道该怎么做。于是就写了这篇 Blog
