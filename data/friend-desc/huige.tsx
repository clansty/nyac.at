import random from '~/utils/random';

export default defineComponent({
  setup() {
    const desc = random.choose(['炖鸽子', '红烧鸽子', '清蒸鸽子', '蒜蓉鸽子']);
    return () => <>{desc}</>;
  },
});
