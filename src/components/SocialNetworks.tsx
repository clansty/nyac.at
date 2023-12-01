import { PropType } from 'vue';
import mailOutlined from '@iconify-icons/ant-design/mail-outlined.js';
import githubFill from '@iconify-icons/akar-icons/github-fill.js';
import telegramFill from '@iconify-icons/akar-icons/telegram-fill.js';
import { RouterLink } from 'vue-router';
import gpg from '~/icons/gpg';
import Icon from '~/components/Icon';
import brandMatrix from '@iconify-icons/tabler/brand-matrix.js';
import MisskeyIcon from '../icons/misskey.svg';
import steamIcon from '@iconify-icons/bi/steam.js';
import gravatarIcon from '@iconify-icons/simple-icons/gravatar.js';

export default defineComponent({
  props: {
    hoverHandler: { type: Function as PropType<(payload: Event) => void>, required: true },
  },
  setup(props) {
    return () => (
      <>
        <a href="mailto:i@0w.al" aria-label="电子邮件" onMouseenter={props.hoverHandler} onFocus={props.hoverHandler} target="_blank">
          <Icon icon={mailOutlined}/>
        </a>
        <a href="https://github.com/Clansty" rel="me" aria-label="GitHub" onMouseenter={props.hoverHandler} onFocus={props.hoverHandler} target="_blank">
          <Icon icon={githubFill}/>
        </a>
        <a href="https://nya.one/@Clansty" rel="me" aria-label="Misskey / Fediverse" onMouseenter={props.hoverHandler} onFocus={props.hoverHandler} target="_blank">
          <MisskeyIcon/>
        </a>
        <a href="https://steamcommunity.com/id/Clansty/" rel="me" aria-label="Steam" onMouseenter={props.hoverHandler} onFocus={props.hoverHandler}
           target="_blank">
          <Icon icon={steamIcon}/>
        </a>
        <a href="https://t.me/clanstty/6" rel="me" aria-label="Telegram" onMouseenter={props.hoverHandler} onFocus={props.hoverHandler} target="_blank">
          <Icon icon={telegramFill}/>
        </a>
        <a href="https://matrix.to/#/@clansty:0w.al" rel="me" aria-label="Matrix" onMouseenter={props.hoverHandler} onFocus={props.hoverHandler} target="_blank">
          <Icon icon={brandMatrix}/>
        </a>
        <a href="https://gravatar.com/clansty" rel="me" aria-label="Gravatar" onMouseenter={props.hoverHandler} onFocus={props.hoverHandler} target="_blank">
          <Icon icon={gravatarIcon}/>
        </a>
        {/* @ts-ignore */}
        <RouterLink to="/gpg" aria-label="GPG 公钥" onMouseenter={props.hoverHandler} onFocus={props.hoverHandler}>
          <Icon icon={gpg}/>
        </RouterLink>
      </>
    );
  },
});
