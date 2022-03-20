import { PropType } from 'vue';
import mailOutlined from '@iconify-icons/ant-design/mail-outlined';
import githubFill from '@iconify-icons/akar-icons/github-fill';
import telegramFill from '@iconify-icons/akar-icons/telegram-fill';
import { RouterLink } from 'vue-router';
import gpg from '~/icons/gpg';
import Icon from '~/components/Icon';

export default defineComponent({
  props: {
    hoverHandler: { type: Function as PropType<(payload: Event) => void>, required: true },
  },
  setup(props) {
    return () => (
      <>
        <a onClick={sendMail} tabindex={0} onMouseenter={props.hoverHandler} onFocus={props.hoverHandler}>
          <Icon icon={mailOutlined}/>
        </a>
        <a href="https://github.com/Clansty" onMouseenter={props.hoverHandler} onFocus={props.hoverHandler}>
          <Icon icon={githubFill}/>
        </a>
        <a href="https://t.me/Clansty" onMouseenter={props.hoverHandler} onFocus={props.hoverHandler}>
          <Icon icon={telegramFill}/>
        </a>
        {/* @ts-ignore */}
        <RouterLink to="/pgp" onMouseenter={props.hoverHandler} onFocus={props.hoverHandler}>
          <Icon icon={gpg}/>
        </RouterLink>
      </>
    );
  },
});

function sendMail() {
  const emptyObj = {};
  // @ts-ignore
  const part1 = `${emptyObj.nonExist}`[5];
  const part2 = String.fromCharCode(Math.pow(2, 6));
  const part3 = atob('Z2FvNC5wdw==');
  const proto = atob('bWFpbHRvOg==');
  const adr = `${proto}${part1}${part2}${part3}`;
  const link = document.createElement('a');
  link.href = adr;
  link.click();
}
