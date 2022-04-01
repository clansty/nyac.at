import { RouterView } from 'vue-router';
import styles from './blog.module.sass';
import BlogHeader from '~/components/BlogHeader';
import PostInfo from '~/types/PostInfo';

export default defineComponent({
  setup() {
    const contentBox = ref<HTMLDivElement>();
    const postInfo = ref<PostInfo>();

    return () => {
      return (
        <div class={`${styles.blogLayout} ${postInfo.value ? styles.postLayoutContent : styles.postLayoutList}`}>
          <BlogHeader postTitle={postInfo.value?.title} scrollUp={scrollUp}/>
          <div class={`${styles.body} ${postInfo.value && 'blogBody'}`} ref={contentBox}>
            {/* @ts-ignore */}
            <RouterView onPostChange={handlePostChange}/>
          </div>
        </div>
      );
    };

    function handlePostChange(info: PostInfo) {
      postInfo.value = info;
      scrollUp();
    }

    function scrollUp() {
      contentBox.value?.scrollTo(0, 0);
    }
  },
});
