import styles from './index.module.sass';
import PostsIndexItem from '~/components/PostsIndexItem';
import allPosts from '~/utils/allPosts';

export default defineComponent({
  setup() {
    useHead({
      title: '凌莞咕噜咕噜～',
      link: [
        { ref: 'canonical', href: 'https://clansty.com/posts' },
      ],
      meta: [
        { property: 'og:url', content: 'https://clansty.com/posts' },
        { name: 'description', content: '一个奇奇怪怪的地方' },
      ],
    });

    return () => (
      <div class={styles.postList}>
        {allPosts.filter(post => !post.hidden).map(post => <PostsIndexItem post={post} key={post.slug}/>)}
      </div>
    );
  },
});
