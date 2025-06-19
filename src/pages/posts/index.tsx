import styles from './index.module.sass';
import PostsIndexItem from '~/components/PostsIndexItem';
import allPosts from '~/utils/allPosts';
import BlogLayout from '~/layouts/BlogLayout';

export default defineComponent({
  setup() {
    useHead({
      title: '凌莞咕噜咕噜～',
      link: [
        { ref: 'canonical', href: 'https://nyac.at/posts' },
      ],
      meta: [
        { property: 'og:url', content: 'https://nyac.at/posts' },
        { name: 'description', content: '一个奇奇怪怪的地方' },
        { property: 'og:title', content: '凌莞咕噜咕噜～' },
        { property: 'og:description', content: '一个奇奇怪怪的地方' },
        { property: 'twitter:title', content: '凌莞咕噜咕噜～' },
        { property: 'twitter:description', content: '一个奇奇怪怪的地方' },
      ],
    });

    return () => (
      <BlogLayout>
        <div class={styles.postList}>
          {allPosts.filter(post => !post.hidden)
            .map((post, index) => <PostsIndexItem post={post} key={index} index={index}/>)}
        </div>
      </BlogLayout>
    );
  },
});
