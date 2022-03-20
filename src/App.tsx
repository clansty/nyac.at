import { RouterView } from 'vue-router';
import styles from './App.module.sass';
import random from './utils/random';
import favicon from './assets/favicon.webp';

const BACKGROUNDS = [styles.background1, styles.background2, styles.background3, styles.background4, styles.background5];

export default defineComponent({
  setup() {
    useHead({
      title: '凌莞喵～',
      link: [
        { rel: 'icon', href: favicon, type: 'image/webp' },
      ],
    });
    const randomBackground = ref('');
    if (!import.meta.env.SSR) {
      randomBackground.value = random.choose(BACKGROUNDS);
    }
    return () => (
      <div class={`${styles.container} ${randomBackground.value}`}>
        <RouterView/>
      </div>
    );
  },
});
