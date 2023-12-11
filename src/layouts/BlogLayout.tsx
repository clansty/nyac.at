import styles from './BlogLayout.module.sass';
import BlogHeader from '~/components/BlogHeader';
import PostInfo from '~/types/PostInfo';
import { PropType } from 'vue';
import postAsset from '~/utils/postAsset';
import ScrollContainer from '~/components/ScrollContainer';

export default defineComponent({
  props: {
    postInfo: { type: Object as PropType<PostInfo>, required: false },
  },
  setup({ postInfo }, { slots }) {
    const contentBox = ref<HTMLDivElement>();
    const bannerOpacity = ref(1);
    const { height } = useWindowSize();
    const scrollComponent = ref<typeof ScrollContainer>();

    const useDummyScroll = computed(() => postInfo && visualViewport.width > 1050)

    return () => (
      <div class={`${styles.blogLayout} ${postInfo ? styles.postLayoutContent : styles.postLayoutList}`}>
        <BlogHeader postTitle={postInfo?.title} scrollUp={scrollComponent.value?.scrollUp} class={styles.blogHeader} />
        <ScrollContainer ref={scrollComponent} showDummyScroll={useDummyScroll.value}>
          <div class={`${styles.body} ${postInfo && 'blogBody'} ${useDummyScroll.value && styles.hideScrollBar}`}
            ref={contentBox} onScroll={handleScroll}>
            {postInfo && postAsset(postInfo.slug, 'banner.webp') && (
              <div class={styles.banner}>
                <img src={postAsset(postInfo.slug, 'banner.webp')} alt={postInfo.title}
                  style={{ opacity: bannerOpacity.value }} />
              </div>
            )}
            {slots.default()}
          </div>
        </ScrollContainer>
      </div>
    );

    function handleScroll() {
      bannerOpacity.value = 1 - contentBox.value.scrollTop / (height.value * .3);
    }
  },
});
