import styles from './about.module.sass';
import { RouterLink } from 'vue-router';
import languageIcon from '@iconify-icons/cil/language.js';
import Icon from '~/components/Icon';
import BackButton from '~/components/BackButton';
import AboutContentZh from '~/components/AboutContentZh';
import AboutContentEn from '~/components/AboutContentEn';

export default defineComponent({
  setup() {
    useHead({
      title: '关于我',
      link: [
        { rel: 'canonical', href: 'https://nyac.at/about' },
      ],
      meta: [
        { property: 'og:url', content: 'https://nyac.at/about' },
        { name: 'description', content: '这里可能有一些你想了解的信息' },
        { property: 'og:title', content: '关于我' },
        { property: 'og:description', content: '这里可能有一些你想了解的信息' },
        { property: 'twitter:title', content: '关于我' },
        { property: 'twitter:description', content: '这里可能有一些你想了解的信息' },
      ],
    });

    const route = useRoute();
    const preferredLanguage = ref('en');
    const browserLanguages = usePreferredLanguages();
    for (const language of browserLanguages.value) {
      if (language === 'en' || /en-\w+/.test(language)) {
        preferredLanguage.value = 'en';
        break;
      }
      if (language === 'zh' || /zh-\w+/.test(language)) {
        preferredLanguage.value = 'zh';
        break;
      }
    }
    const language = computed(() => route.query.lang as string || preferredLanguage.value);

    return () => {
      return (
        <div class={styles.aboutContainer}>
          <div class={styles.content}>
            <div class={styles.title}>
              {language.value === 'en' ? 'About' : '关于我'}
            </div>
            <div class={styles.subContainer}>
              <div>
                {language.value === 'en' ?
                  <AboutContentEn/> :
                  <AboutContentZh/>}
              </div>
            </div>
          </div>
          <BackButton to="/"/>
          <div class={styles.languageSwitchMobile}>
            <RouterLink to={{ query: { lang: language.value === 'en' ? 'zh' : 'en' } }}
                        aria-label="切换语言 Switch language">
              <Icon icon={languageIcon}/>
            </RouterLink>
          </div>
          <div class={styles.languageSwitch}>
            <RouterLink to={{ query: { lang: 'zh' } }}>
              中文
            </RouterLink>
            <RouterLink to={{ query: { lang: 'en' } }}>
              English
            </RouterLink>
          </div>
        </div>
      );
    };
  },
});
