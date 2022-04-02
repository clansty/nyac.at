import PostInfo from '~/types/PostInfo';
import { PropType } from 'vue';
import { RouterLink } from 'vue-router';
import { formatDate } from '@vueuse/core';
import styles from './PostsIndexItem.module.sass';

export default defineComponent({
  props: {
    post: { type: Object as PropType<PostInfo>, required: true },
    index: { type: Number, required: true },
  },
  setup({ post, index }) {
    return () => (
      <RouterLink to={`/posts/${post.slug}`}>
        <div class={`${styles.postItem} postItem`} style={{transitionDelay: `${index * 0.1}s`}}>
          <div class={styles.title}>
            <span>{post.title}</span>
          </div>
          {post.banner && <img src={post.banner} alt={post.title} class={styles.banner}/>}
          <div class={styles.date}>
            {formatDate(new Date(post.date), 'YYYY/M/D')}
          </div>
          <div class={styles.desc}>
            {post.desc}
          </div>
          <div class={styles.hf}/>
        </div>
      </RouterLink>
    );
  },
});
