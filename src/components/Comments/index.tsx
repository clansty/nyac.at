import type Comment from '~/types/Comment';
import styles from './CommentBox.module.sass';
import CommentBox from './CommentBox';
import SingleComment from '~/components/Comments/SingleComment';

export default defineComponent({
  props: {
    slug: { type: String, required: true },
  },
  setup(props) {
    const comments = ref<Comment[]>([]);
    const error = ref('');

    watch(() => props.slug, async () => {
      const res = await fetch('/api/comments/' + props.slug, {
        redirect: 'error',
      });
      comments.value = await res.json();
    }, { immediate: true });

    return () => {
      if (error.value) {
        return <div class={styles.commentBox}>
          评论系统暂时不可用⁄(⁄ ⁄•⁄-⁄•⁄ ⁄)⁄
          <p>{error}</p>
        </div>;
      }
      return <div>
        <CommentBox slug={props.slug} addComment={addComment}/>
        {comments.value.map(e => <SingleComment comment={e} key={e.date}/>)}
      </div>;
    };

    function addComment(comment: Comment) {
      comments.value = [...comments.value, comment];
    }
  },
});
