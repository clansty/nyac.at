import styles from './ScrollContainer.module.sass';
import { Teleport } from 'vue';

export default defineComponent({
  setup(props, { slots, expose }) {
    const dummy = ref<HTMLDivElement>();
    const scroll = ref<HTMLDivElement>();
    const content = ref<HTMLDivElement>();

    useIntervalFn(() => {
      if (!dummy.value) return;
      dummy.value.style.height = content.value?.scrollHeight + 'px';
    }, 200, { immediate: true, immediateCallback: true });

    const inScrollTop = ref(false);

    expose({
      scrollUp() {
        console.log('scrollUp');
        if (!content.value) return;
        inScrollTop.value = true;
        content.value.scrollTo({ top: 0, left: 0, behavior: 'smooth' });
        scroll.value.scrollTo({ top: 0, left: 0, behavior: 'smooth' });

        setTimeout(() => inScrollTop.value = false, 1000);
      },
    });

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
