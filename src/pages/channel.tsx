import styles from './channel.module.sass';
import BackButton from '~/components/BackButton';
import { Post, TgBlog } from 'tg-blog';
import 'tg-blog/dist/style.css';
import './tgblogContainer.sass';

export default defineComponent({
  setup() {
    useHead({
      title: '凌莞的喵喵喵碎碎念',
      link: [
        { rel: 'canonical', href: 'https://clansty.com/shares' },
      ],
      meta: [
        { property: 'og:url', content: 'https://clansty.com/shares' },
        { name: 'description', content: '凌莞的喵喵喵碎碎念和奇奇怪怪的分享' },
        { property: 'og:title', content: '凌莞的喵喵喵碎碎念' },
        { property: 'og:description', content: '凌莞的喵喵喵碎碎念和奇奇怪怪的分享' },
        { property: 'twitter:title', content: '凌莞的喵喵喵碎碎念' },
        { property: 'twitter:description', content: '凌莞的喵喵喵碎碎念和奇奇怪怪的分享' },
        { name: 'robots', content: 'noindex' },
      ],
    });

    const files = Object.fromEntries(Object.entries(import.meta.globEager('~/../data/tg/**/*')).map(([k, v]: any) => [k, v.default]));
    const postsData = structuredClone(files['/data/tg/posts.json'] as Post[]);
    for (const post of postsData) {
      post.images?.forEach?.(img => img.url = files['/data/tg/' + img.url] as string);
      if (post.reply?.thumb) post.reply.thumb = files['/data/tg/' + post.reply.thumb] as string;
      if (post.reply?.thumb) post.reply.thumb = files['/data/tg/' + post.reply.thumb] as string;
      post.files?.forEach(f => {
        f.url = files['/data/tg/' + f.url] as string;
        if (f.thumb) f.thumb = files['/data/tg/' + f.thumb] as string;
      });
    }

    console.log(postsData);

    return () => (
      <div class={styles.sharesContainer}>
        <BackButton to="/" class={styles.back}/>
        <div class={styles.main}>
          {/* @ts-ignore */}
          <TgBlog postsData={postsData} class="tgblogContainer"/>
        </div>
      </div>
    );
  },
});
