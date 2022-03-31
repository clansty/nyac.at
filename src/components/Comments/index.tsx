import type Comment from '~/types/Comment';
import styles from './CommentBox.module.sass';
import CommentBox from './CommentBox';

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
      console.log(await res.text());
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
        {/*{comments.map(e => <SingleComment comment={e} key={e._id}/>)}*/}
      </div>;
    };

    function addComment(comment: Comment) {
      comments.value = [...comments.value, comment];
    }
  },
});
