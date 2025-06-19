import Icon from '~/components/Icon';
import maimai from '~/icons/maimai';
import node from '@iconify-icons/logos/nodejs-icon.js';
import python from '@iconify-icons/logos/python.js';
import vue from '@iconify-icons/logos/vue.js';
import reactFill from '@iconify-icons/akar-icons/react-fill.js';
import twemoji from '~/icons/twemoji';
import DxRating from '~/components/DxRating';

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
          Software Engineering, Freelance&nbsp;
          <Icon icon={twemoji.coder}/>
        </p>
        <p>
          Nyan fish
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
          <Icon icon={maimai}/>{' '}
          <DxRating/>
        </p>
        <p>Tossing weird techniques</p>
        <p>
          Usually use JavaScript,&nbsp;
          <Icon icon={node}/>
          Node.JS and C# for backend and utilities
        </p>
        <p>
          Used&nbsp;
          <Icon icon={vue}/>
          Vue 3
        </p>
        <p>
          This site used to be written in React but now in Vue 3
        </p>
        <p>
          hosted on Cloudflare Pages
        </p>
        <p>Learnt some Python, C# and Java</p>
        <p>Once learnt C++, but forgot now</p>
      </>
    )
  }
})
