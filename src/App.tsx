import { RouterView } from 'vue-router';
import styles from './App.module.sass';
import random from './utils/random';
import favicon from './assets/favicon.webp';
import { Transition } from 'vue';

const BACKGROUNDS = [styles.background1, styles.background2, styles.background3, styles.background4, styles.background5];

export default defineComponent({
  setup() {
    useHead({
      title: '凌莞喵～',
      link: [
        { rel: 'icon', href: favicon, type: 'image/webp' },
      ],
    });

    const route = useRoute();

    const randomBackground = ref('');
    if (!import.meta.env.SSR) {
      randomBackground.value = random.choose(BACKGROUNDS);
    }
    return () => (
      <div class={`${styles.background} ${randomBackground.value}`}>
        <RouterView>
          {{
            default: ({ Component }: any) => (
              <Transition name="animation" duration={600} mode="out-in">
                <div key={route.path}
                     class={`${styles.container} ${route.path.startsWith('/posts') ? '' : 'base'}`}>
                  <Component/>
                </div>
              </Transition>
            ),
          }}
        </RouterView>
      </div>
    );
  },
});
