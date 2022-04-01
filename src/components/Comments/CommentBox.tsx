import styles from './CommentBox.module.sass';
import { PropType } from 'vue';
import type Comment from '~/types/Comment';

export default defineComponent({
  props: {
    slug: { type: String, required: true },
    addComment: { type: Function as PropType<(Comment) => any>, required: true },
  },
  setup(props) {
    const username = ref('');
    const email = ref('');
    const url = ref('');
    const content = ref('');
    const isDisabled = ref(false);


    if (!import.meta.env.SSR) {
      const userInfoToken = localStorage.getItem('commentUserInfo');
      if (userInfoToken) {
        const userInfo = JSON.parse(userInfoToken) as [string, string, string];
        if (userInfo.length === 3) {
          username.value = userInfo[0];
          email.value = userInfo[1];
          url.value = userInfo[2];
        }
      }
    }
    return () => (
      <form class={styles.commentBox} onSubmit={sendComment}>
        来评论叭～
        <fieldset disabled={isDisabled.value}>
          <legend>评论输入区域</legend>
          <div>
            {/* @ts-ignore */}
            <input type="text" vModel={username.value}
                   placeholder="称呼" required/>
            {/* @ts-ignore */}
            <input type="email" vModel={email.value}
                   placeholder="邮箱（将保密）" required/>
            {/* @ts-ignore */}
            <input type="url" vModel={url.value}
                   placeholder="网站（选填）"/>
          </div>
          {/* @ts-ignore */}
          <textarea vModel={content.value} onKeypress={handleKeyPress}
                    placeholder="正文！" required/>
          <div>
            <button aria-label="发布评论">发射～</button>
          </div>
        </fieldset>
      </form>
    );

    async function handleKeyPress(e: KeyboardEvent) {
      console.log(e);
      if (e.key === 'Enter' && e.ctrlKey) {
        await sendComment(e);
      }
    }

    async function sendComment(e: Event) {
      e.preventDefault();
      isDisabled.value = true;
      localStorage.setItem('commentUserInfo', JSON.stringify([username.value, email.value, url.value]));
      const res = await fetch('/api/comments/' + props.slug, {
        method: 'POST',
        body: JSON.stringify({
          username: username.value,
          email: email.value,
          url: url.value,
          content: content.value,
        }, undefined, 0),
        redirect: 'error',
        headers: {
          'Content-Type': 'application/json',
        },
      });
      const resData = await res.json() as Comment;
      content.value = '';
      props.addComment(resData);
      isDisabled.value = false;
    }
  },
});
