import styles from './shares.module.sass';
import BackButton from '~/components/BackButton';
import Loading from '~/components/Loading';

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
