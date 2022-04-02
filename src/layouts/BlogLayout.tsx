import styles from './BlogLayout.module.sass';
import BlogHeader from '~/components/BlogHeader';
import PostInfo from '~/types/PostInfo';
import { PropType } from 'vue';

export default defineComponent({
  props: {
    postInfo: { type: Object as PropType<PostInfo>, required: false },
  },
  setup({ postInfo }, { slots }) {
    const contentBox = ref<HTMLDivElement>();

    return () => (
      <div class={`${styles.blogLayout} ${postInfo ? styles.postLayoutContent : styles.postLayoutList}`}>
        <BlogHeader postTitle={postInfo?.title} scrollUp={scrollUp} class={styles.blogHeader}/>
        <div class={`${styles.body} ${postInfo && 'blogBody'}`} ref={contentBox}>
          {slots.default()}
        </div>
      </div>
    );

    function scrollUp() {
      contentBox.value?.scrollTo(0, 0);
    }
  },
});
