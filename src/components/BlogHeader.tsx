import BackButton from '~/components/BackButton';
import { PropType } from 'vue';
import styles from './BlogHeader.module.sass';

export default defineComponent({
  props: {
    postTitle: { type: String },
    scrollUp: { type: Function as PropType<() => any>, required: true },
  },
  setup(props) {
    return () => (
      <div class={`${styles.blogHeader} blogHeader`}>
        <BackButton to={props.postTitle ? '/posts' : '/'} class={styles.back}/>
        <h1 onClick={props.scrollUp} aria-label="返回顶部" tabindex={0}>{props.postTitle}&nbsp;</h1>
      </div>
    );
  },
});
