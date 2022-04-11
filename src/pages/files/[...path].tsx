import FileView from '~/components/FileView';
import styles from './files.module.sass';
import { KeepAlive, Transition } from 'vue';

export default defineComponent({
  props: {
    path: { type: String, required: true },
  },
  setup(props) {
    useHead({
      title: '凌莞的共享文件',
    });
    const paths = computed(() => {
      const out = [''];
      for (const part of props.path.split('/')) {
        if (part) {
          out.push(out[out.length - 1] + '/' + part);
        }
      }
      return out;
    });
    return () => (
      <div class={styles.filesContainer}>
        {paths.value.map(
          path => (
            <Transition name="animation" duration={300} mode="out-in">
              <KeepAlive>
                <FileView path={path} key={path}/>
              </KeepAlive>
            </Transition>
          ),
        )}
      </div>
    );
  },
});
