import { RouterView } from 'vue-router';
import styles from './App.module.sass';
import random from './utils/random';

const BACKGROUNDS = [styles.background1, styles.background2, styles.background3, styles.background4, styles.background5];

export default defineComponent({
  setup() {
    useHead({
      title: '凌莞喵～',
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
