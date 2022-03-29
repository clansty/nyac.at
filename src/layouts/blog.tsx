import { RouterView } from 'vue-router';
import styles from './blog.module.sass';
import BlogHeader from '~/components/BlogHeader';

export default defineComponent({
  setup() {
    const route = useRoute();
    const contentBox = ref<HTMLDivElement>();

    return () => (
      <div class={`${styles.blogLayout} ${route.meta.postTitle ? styles.postLayoutContent : styles.postLayoutList}`}>
        <BlogHeader postTitle={route.meta.postTitle as string} scrollUp={scrollUp}/>
        <div class={`${styles.body} ${route.meta.postTitle && 'blogBody'}`} ref={contentBox}>
          <RouterView/>
        </div>
      </div>
    );

    function scrollUp() {
      contentBox.value.scrollTo(0, 0);
    }
  },
});
