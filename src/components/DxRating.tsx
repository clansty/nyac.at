import { effect } from 'vue';
import styles from './DxRating.module.sass';

const plates = import.meta.glob('../assets/dxrating/*.avif', { eager: true }) as any;

const getPlateId = (rating: number) => {
  const levels = [1000, 2000, 4000, 7000, 10000, 12000, 13000, 14000, 14500, 15000];
  if (rating < levels[0]) return '01';
  if (rating >= levels[9]) return '11';
  for (let i = 0; i < 9; i++) {
    if (rating >= levels[i] && rating < levels[i + 1]) return (i + 2).toString().padStart(2, '0');
  }
};

const getPlate = (rating: number) => plates[`../assets/dxrating/UI_CMN_DXRating_${getPlateId(rating)}.avif`].default as string;

const SeparateText = defineComponent({
  props: {
    text: { type: String, required: true },
  },
  setup(props) {
    return () => Array.from(props.text).map(char => <span>{char}</span>);
  },
});

export default defineComponent({
  setup() {
    const dxRating = ref<number>();
    effect(async () => {
      const dfReq = await fetch('https://124.220.188.199/api/v2/game/mai2/user-summary?username=clansty');
      const data = await dfReq.json() as any;
      dxRating.value = data.rating;
    });

    return () => dxRating.value && <div class={styles.container}>
      <img src={getPlate(dxRating.value)} alt="DX Rating Frame"/>
      <div>
        {Array.apply(undefined, { length: 5 - dxRating.value.toString().length }).map(() => <span/>)}
        <SeparateText text={dxRating.value.toString()}/>
      </div>
    </div>;
  },
});
