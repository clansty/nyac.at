import styles from './index.module.sass';
import PostsIndexItem from '~/components/PostsIndexItem';
import allPosts from '~/utils/allPosts';
import BlogLayout from '~/layouts/BlogLayout';

const banners = import.meta.globEager('../../../data/posts/*/banner.webp');

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
      <BlogLayout>
        <div class={styles.postList}>
          {allPosts.filter(post => !post.hidden)
            .map((post, index) => <PostsIndexItem post={post} key={index} index={index}
                                                  // @ts-ignore
                                                  banner={banners[`../../../data/posts/${post.slug}/banner.webp`]}/>)}
        </div>
      </BlogLayout>
    );
  },
});
