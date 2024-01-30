import random from '~/utils/random';
import slice1 from '~/assets/pusheen-slice/1.webp';
import slice2 from '~/assets/pusheen-slice/2.webp';
import slice3 from '~/assets/pusheen-slice/3.webp';
import slice4 from '~/assets/pusheen-slice/4.webp';
import slice5 from '~/assets/pusheen-slice/5.webp';

const style = { height: '1.2em', marginTop: '0.1em' };
export default defineComponent({
  setup() {
    if (Math.random() < .5) {
      const desc = random.choose(['炖鸽子', '红烧鸽子', '清蒸鸽子', '蒜蓉鸽子', 'sliced']);
      return () => <>{desc}</>;
    }

    return () => <>
      鸽子：
      <img src={slice1} alt="鸽子切片" style={style}/>
      <img src={slice2} alt="鸽子切片" style={style}/>
      {new Array(random.choose([1, 2, 3, 4, 5]))
        .fill(<img src={slice3} alt="鸽子切片" style={style}/>)}
      <img src={slice4} alt="鸽子切片" style={style}/>
      <img src={slice5} alt="鸽子切片" style={style}/>
    </>;
  },
});
