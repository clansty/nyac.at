import { RouterView } from 'vue-router';
import styles from './App.module.sass';
import random from './utils/random';
import favicon from './assets/clansty_profile_picture_clean_fix_fair.webp';
import { Transition } from 'vue';

const BACKGROUNDS = [
  styles.background2, styles.background3, styles.background4, styles.background5, styles.background6,
  styles.bgneo, styles.bgneoalt, styles.bgneo, styles.bgneoalt
];

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
    if (!import.meta.env.SSR) {
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
      </div>
    );
  },
});
