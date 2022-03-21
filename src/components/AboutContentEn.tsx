import Icon from '~/components/Icon';
import maimai from '~/icons/maimai';
import node from '@iconify-icons/logos/nodejs-icon.js';
import python from '@iconify-icons/logos/python.js';
import vue from '@iconify-icons/logos/vue.js';
import archLinux from '@iconify-icons/logos/archlinux.js';
import appleFilled from '@iconify-icons/ant-design/apple-filled.js';
import reactFill from '@iconify-icons/akar-icons/react-fill.js';
import twemoji from '~/icons/twemoji';

export default defineComponent({
  render(){
    return (
      <>
        <p>
          Hello&nbsp;
          <Icon icon={twemoji.wave}/>
          <b>Clansty</b> here!
        </p>
        <p>
          Software Engineering Sophomore.&nbsp;
          <Icon icon={twemoji.coder}/>
        </p>
        <p>
          Normal girl
          <Icon icon={twemoji.girl}/>
        </p>
        <p>
          Like all kinds of <del>weird</del> kawaii things
        </p>
        <p>
          Like cats!&nbsp;
          <Icon icon={twemoji.cat}/>
        </p>
        <p>
          Play Maimai！
          <Icon icon={maimai}/>
        </p>
        <p>Tossing weird techniques</p>
        <p>
          Usually use JavaScript,&nbsp;
          <Icon icon={node}/>
          Node.JS for backend and utilities
        </p>
        <p>
          Seldom use&nbsp;
          <Icon icon={python}/>
          Python
        </p>
        <p>
          Used&nbsp;
          <Icon icon={reactFill} color="#3DD8FF"/>
          React now and learning&nbsp;
          <Icon icon={vue}/>
          Vue 3
        </p>
        <p>
          Vue 3 seems to be nice
        </p>
        <p>
          This site used to be written in React but now in Vue 3
        </p>
        <p>
          hosted on Cloudflare Pages
        </p>
        <p>Learnt some Python, C# and Java</p>
        <p>Once learnt C++, but forgot now</p>
        <p>
          Now using&nbsp;
          <Icon icon={archLinux}/>
          Arch Linux and&nbsp;
          <Icon icon={appleFilled}/>
          macOS
        </p>
      </>
    )
  }
})
