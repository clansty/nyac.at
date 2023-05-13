import { PropType } from 'vue';
import mailOutlined from '@iconify-icons/ant-design/mail-outlined.js';
import githubFill from '@iconify-icons/akar-icons/github-fill.js';
import telegramFill from '@iconify-icons/akar-icons/telegram-fill.js';
import { RouterLink } from 'vue-router';
import gpg from '~/icons/gpg';
import Icon from '~/components/Icon';
import brandMatrix from '@iconify-icons/tabler/brand-matrix.js';

export default defineComponent({
  props: {
    hoverHandler: { type: Function as PropType<(payload: Event) => void>, required: true },
  },
  setup(props) {
    return () => (
      <>
        <a href="mailto:i@0w.al" onMouseenter={props.hoverHandler} onFocus={props.hoverHandler}>
          <Icon icon={mailOutlined}/>
        </a>
        <a href="https://github.com/Clansty" onMouseenter={props.hoverHandler} onFocus={props.hoverHandler}>
          <Icon icon={githubFill}/>
        </a>
        <a href="https://t.me/Clansty" onMouseenter={props.hoverHandler} onFocus={props.hoverHandler}>
          <Icon icon={telegramFill}/>
        </a>
        <a href="https://matrix.to/#/@clansty:saezi.ae" onMouseenter={props.hoverHandler} onFocus={props.hoverHandler}>
          <Icon icon={brandMatrix}/>
        </a>
        {/* @ts-ignore */}
        <RouterLink to="/gpg" onMouseenter={props.hoverHandler} onFocus={props.hoverHandler}>
          <Icon icon={gpg}/>
        </RouterLink>
      </>
    );
  },
});
