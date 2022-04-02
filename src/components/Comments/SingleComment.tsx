import { PropType } from 'vue';
import Comment from '~/types/Comment';
import styles from './SingleComment.module.sass';
import { formatDate } from '@vueuse/core';

export default defineComponent({
  props: {
    comment: { type: Object as PropType<Comment>, required: true },
  },
  setup({ comment }) {
    return () => (
      <div class={styles.commentEntry}>
        <img src={comment.avatar} alt="头像"/>
        <div class={styles.commentBody}>
          <div class={styles.username}>
            {comment.url ?
              <a href={comment.url} target="_blank">{comment.username}</a> :
              comment.username}
          </div>
          <div class={styles.date}>
            {formatDate(new Date(comment.date), 'YYYY/M/D H:mm')}
          </div>
          <div class={styles.content}>
            {comment.content}
          </div>
        </div>
      </div>
    );
  },
});
