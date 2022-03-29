在一些时候，我们可以用一些高阶函数，也就是返回一个函数的函数，来实现一些比较高级的操作，比如说使某个方法只执行一次，或者限制执行的频率

## Once 只执行一次

```js
function once(fn) {
    return function (...args) {
        if (fn) {
            const ret = fn.apply(this, args);
            fn = null;
            return ret;
        }
    }
}
```

## [Throttle](https://code.h5jun.com/gale/1/edit?js,output) 限流函数

执行一次之后必须等待一段时间才能再执行

```js
function throttle(fn, time = 500) {
    let timer;
    return function (...args) {
        if (timer == null) {
            fn.apply(this, args);
            timer = setTimeout(() => {
                timer = null;
            }, time)
        }
    }
}
```

## [Debounce](https://code.h5jun.com/wik/edit?js,output) 去抖

防止在指定时间段内多次触发函数，等待稳定（最后一次触发之后一定时间内没有再触发）才执行

```js
function debounce(fn, dur) {
    dur = dur || 100;
    var timer;
    return function () {
        clearTimeout(timer);
        timer = setTimeout(() => {
            fn.apply(this, arguments);
        }, dur);
    }
}
```

## [Consumer](https://code.h5jun.com/bucu/3/edit?js,output) 执行之间的最小间隔

方法每次调用必须至少间隔指定的时间，要是提前调用了，就先存起来，等到时间到了再调用。

与 Debounce 的区别就是，Debounce 在多次调用时会把多出来的舍弃掉，而 Consumer 会存起来慢慢调用

```js
function consumer(fn, time) {
    let tasks = [],
        timer;

    return function (...args) {
        tasks.push(fn.bind(this, ...args));
        if (timer == null) {
            timer = setInterval(() => {
                tasks.shift().call(this)
                if (tasks.length <= 0) {
                    clearInterval(timer);
                    timer = null;
                }
            }, time)
        }
    }
}
```

## [Iterative](https://code.h5jun.com/kapef/edit?js,output)

可以把一个普通的函数变成批量的，可以遍历第一个参数来执行

```js
const isIterable = obj => obj != null
    && typeof obj[Symbol.iterator] === 'function';

function iterative(fn) {
    return function (subject, ...rest) {
        if (isIterable(subject)) {
            const ret = [];
            for (let obj of subject) {
                ret.push(fn.apply(this, [obj, ...rest]));
            }
            return ret;
        }
        return fn.apply(this, [subject, ...rest]);
    }
}
```

## Toggle

可以循环执行多个函数，切换状态

```js
function toggle(...actions) {
    return function (...args) {
        // 先将第一个操作取出，然后再将其 push 到列表的末尾，因此可以实现循环
        const action = actions.shift();
        actions.push(action);
        return action.apply(this, args);
    }
}
```



Code credits to [月影](https://github.com/akira-cn)（[blog](https://h5jun.com/) 好像炸了qwq）
