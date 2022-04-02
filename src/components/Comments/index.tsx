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

    if (!import.meta.env.SSR) {
      fetch('/api/comments/' + props.slug, {
        redirect: 'error',
      })
        .then(res => res.json())
        .then(data => {
          comments.value = data as Comment[];
        })
        .catch(err => {
          error.value = err.message;
        });
    }

    return () => {
      if (error.value) {
        return (
          <div class={styles.commentBox}>
            评论系统暂时不可用⁄(⁄ ⁄•⁄-⁄•⁄ ⁄)⁄
            <p>{error.value}</p>
          </div>
        );
      }
      return (
        <div>
          <CommentBox slug={props.slug} addComment={addComment}/>
          {comments.value.map(e => <SingleComment comment={e} key={e.date}/>)}
        </div>
      );
    };

    function addComment(comment: Comment) {
      comments.value = [...comments.value, comment];
    }
  },
});
