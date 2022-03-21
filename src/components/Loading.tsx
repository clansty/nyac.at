import styles from './Loading.module.scss';

export default defineComponent({
  props: {
    color: { type: String, required: true },
  },
  setup() {
    return (props) => (
      <div style={{ ['--color' as any]: props.color }}>
        <div class={styles.spinner} style={{ animationDelay: '0.07s' }}/>
        <div class={styles.spinner} style={{ animationDelay: '0.14s' }}/>
        <div class={styles.spinner} style={{ animationDelay: '0.21s' }}/>
      </div>
    );
  },
});
