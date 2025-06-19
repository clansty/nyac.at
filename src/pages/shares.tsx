import styles from './shares.module.sass';
import BackButton from '~/components/BackButton';
import Loading from '~/components/Loading';

export default defineComponent({
  setup() {
    useHead({
      title: '凌莞的喵喵喵碎碎念',
      link: [
        { rel: 'canonical', href: 'https://nyac.at/shares' },
      ],
      meta: [
        { property: 'og:url', content: 'https://nyac.at/shares' },
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
        <iframe src="https://tg.0w0.wiki?emb" frameborder="0" allowtransparency/>
        <div class={styles.loading}>
          <Loading color="#60A5FA"/>
        </div>
      </div>
    );
  },
});
