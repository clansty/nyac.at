import FileView from '~/components/FileView';
import styles from './files.module.sass';

export default defineComponent({
  props: {
    path: { type: String, required: true },
  },
  setup(props) {
    const paths = computed(() => {
      const out = [''];
      for (const part of props.path.split('/')) {
        if (out.length) {
          out.push(out[out.length - 1] + '/' + part);
        }
      }
      return out;
    });
    return () => (
      <div class={styles.filesContainer}>
        {paths.value.map(
          path => <FileView path={path} key={path}/>,
        )}
      </div>
    );
  },
});
