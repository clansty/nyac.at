import Icon from '~/components/Icon';
import maimai from '~/icons/maimai';
import node from '@iconify-icons/logos/nodejs-icon.js';
import python from '@iconify-icons/logos/python.js';
import vue from '@iconify-icons/logos/vue.js';
import reactFill from '@iconify-icons/akar-icons/react-fill.js';
import twemoji from '~/icons/twemoji';
import appleFilled from '@iconify-icons/ant-design/apple-filled.js';
import DxRating from '~/components/DxRating';

export default defineComponent({
  render() {
    return (
      <>
        <p>
          嗨
          <Icon icon={twemoji.wave}/>
          这里是
          <b>凌莞 / Clansty</b>
        </p>
        <p>
          目前自由职业，欢迎找我干散活qwq
          <Icon icon={twemoji.coder}/>
        </p>
        <p>
          苏州小娘鱼
          <Icon icon={twemoji.girl}/>
        </p>
        <p>
          喜欢各种
          <del>奇奇怪怪</del>
          可可爱爱的东西
        </p>
        <p>
          喜欢猫咪！
          <Icon icon={twemoji.cat}/>
        </p>
        <p>
          打 Maimai！
          <Icon icon={maimai}/>{' '}
          <DxRating/>
        </p>
        <p>平时喜欢干的事情是折腾各种奇奇怪怪的技术</p>
        <p>
          比较喜欢用 JavaScript 写东西，后端和小工具一般用
          <Icon icon={node}/>
          Node.JS
        </p>
        <p>
          偶尔写写
          <Icon icon={python}/>
          Python
        </p>
        <p>
          前端现在比较喜欢用
          <Icon icon={reactFill} color="#3DD8FF"/>
          React，现在在学
          <Icon icon={vue}/>
          Vue 3
        </p>
        <p>Vue 3 似乎也很好用的样子</p>
        <p>
          这个主站是曾经是用 React (Next.JS) 写的，但是你现在看到的这个是用 Vue 3 重构的
        </p>
        <p>
          托管在 Cloudflare Pages 上
        </p>
        <p>大概是会一点 Python，也会一点 C# 和 Java</p>
        <p>学过 C++，但是现在大概不会了</p>
        <p>
          目前使用的操作系统是
          <Icon icon={appleFilled}/>
          macOS
        </p>
      </>
    );
  },
});
