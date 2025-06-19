import styles from './index.module.sass';
import { RouterLink } from 'vue-router';
import SocialNetworks from '~/components/SocialNetworks';

export default defineComponent({
  setup() {
    useHead({
      meta: [
        { name: 'description', content: '这里是凌莞的主页喵' },
        { name: 'og:url', content: 'https://nyac.at/' },
        { name: 'og:type', content: 'website' },
        { property: 'og:title', content: '凌莞喵～' },
        { property: 'og:description', content: '这里是凌莞的主页喵' },
        { property: 'twitter:title', content: '凌莞喵～' },
        { property: 'twitter:description', content: '这里是凌莞的主页喵' },
      ],
      link: [
        { rel: 'canonical', href: 'https://nyac.at/' },
      ],
    });
    const highlightRef = ref<HTMLDivElement>();

    let timeOutId: any;

    function hoverHandler(e: any) {
      timeOutId && clearTimeout(timeOutId);
      if (highlightRef.value) {
        highlightRef.value.style.transform =
          `translateX(${e.currentTarget.offsetLeft}px) translateY(${e.currentTarget.offsetTop}px)`;
        highlightRef.value.style.height = `${e.currentTarget.clientHeight}px`;
        highlightRef.value.style.width = `${e.currentTarget.clientWidth}px`;
        highlightRef.value.style.display = 'block';
      }
      timeOutId = setTimeout(() => highlightRef.value!.style.opacity = '1', 0);
    }

    function leave() {
      timeOutId && clearTimeout(timeOutId);
      if (highlightRef.value) {
        highlightRef.value.style.opacity = '0';
      }
      timeOutId = setTimeout(() => highlightRef.value! && (highlightRef.value!.style.display = 'none'), 500);
    }

    const links = [
      ['博客', 'Blog', '/posts'],
      ['资源', 'Downloads', '/files/'],
      ['好朋友们', 'Friends', '/friends'],
      ['投喂', 'Donate', '/donate'],
      ['关于我', 'About', '/about'],
    ];

    return () => (
      <div class={styles.linkContainer} onMouseleave={leave}>
        <div class={styles.title} onMouseenter={leave}>
          你好，这里是凌莞
        </div>
        <div class={styles.highlight} aria-hidden={true} ref={highlightRef}/>
        {links.map(([ch, en, href]) =>
          // @ts-ignore
          <RouterLink to={href} onMouseenter={hoverHandler} onFocus={hoverHandler}>
            {ch}
            <span aria-hidden={true}>{en}</span>
          </RouterLink>)}
        <div class={styles.footer} onMouseenter={leave}>
          <div class={styles.space} onMouseenter={leave}/>
          <SocialNetworks hoverHandler={hoverHandler}/>
          <div class={styles.space} onMouseenter={leave}/>
        </div>
      </div>
    );
  },
});
