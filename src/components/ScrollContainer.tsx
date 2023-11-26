import styles from './ScrollContainer.module.sass';
import { Teleport } from 'vue';

export default defineComponent({
  setup(props, { slots, expose }) {
    const dummy = ref<HTMLDivElement>();
    const scroll = ref<HTMLDivElement>();
    const content = ref<HTMLDivElement>();

    const inScrollTop = ref(false);
    const isMobileSafari = ref(false);

    expose({
      scrollUp() {
        if (!content.value) return;
        inScrollTop.value = true;
        content.value.scrollTo({ top: 0, left: 0, behavior: 'smooth' });
        isMobileSafari.value || scroll.value.scrollTo({ top: 0, left: 0, behavior: 'smooth' });

        setTimeout(() => inScrollTop.value = false, 1000);
      },
    });

    if (navigator.userAgent.toLowerCase().includes('mobile') && navigator.userAgent.toLowerCase().includes('safari')) {
      isMobileSafari.value = true;
      return () => <>
        {h(slots.default()[0], {
          ref: content,
        })}
      </>
    }

    useIntervalFn(() => {
      if (!dummy.value) return;
      dummy.value.style.height = content.value?.scrollHeight + 'px';
    }, 200, { immediate: true, immediateCallback: true });

    return () => <>
      <Teleport to="body">
        <div class={styles.scroll} ref={scroll} onScroll={() => {
          if (inScrollTop.value) return;
          content.value.scrollTop = scroll.value.scrollTop;
        }}>
          <div ref={dummy}/>
        </div>
      </Teleport>
      {h(slots.default()[0], {
        ref: content,
        onScroll() {
          if (inScrollTop.value) return;
          scroll.value.scrollTop = content.value.scrollTop;
        },
      })}
    </>;
  },
});
