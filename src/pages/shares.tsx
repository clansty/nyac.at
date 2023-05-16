import styles from './shares.module.sass';
import BackButton from '~/components/BackButton';
import { TgBlog } from 'tg-blog';
import tgExport from '~/../data/tg/posts.json?url';
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

    return () => (
      <div class={styles.sharesContainer}>
        <BackButton to="/" class={styles.back}/>
        <div class={styles.main}>
          {/* @ts-ignore */}
          <TgBlog postsUrl={tgExport} class="tgblogContainer"/>
        </div>
      </div>
    );
  },
});
