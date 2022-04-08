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
      meta: [
        { name: 'author', content: 'Clansty' },
        { property: 'og:site_name', content: '凌莞喵～' },
        { property: 'og:type', content: 'website' },
        { name: 'keywords', content: '凌莞,Clansty' },
      ],
    });

    const route = useRoute();

    const randomBackground = ref('');
    const isBeianShown = ref(false);
    if (!import.meta.env.SSR) {
      isBeianShown.value = location.host.includes('lwqwq.com');
      randomBackground.value = random.choose(BACKGROUNDS);
    }
    return () => (
      <div class={`${styles.background} ${randomBackground.value}`}>
        <RouterView>
          {{
            default: ({ Component }: any) => (
              <Transition name="animation" duration={600} mode="out-in">
                <div key={route.path.startsWith('/files') ? 'fileBrowser' : route.path}
                     class={`${styles.container} ${route.path.startsWith('/posts') ? '' : 'base'}`}>
                  <Component/>
                </div>
              </Transition>
            ),
          }}
        </RouterView>
        {isBeianShown.value && <footer class={styles.footer}>
          <a href="https://beian.miit.gov.cn/" target="_blank" class={styles.beian}>
            苏ICP备2020048816号-1
          </a>
        </footer>}
      </div>
    );
  },
});
