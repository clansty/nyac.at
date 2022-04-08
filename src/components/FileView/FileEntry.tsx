import { PropType } from 'vue';
import { AlistFile } from '~/types/Alist';
import { CustomFileInfo } from '~/types/FolderInfo';
import styles from './FileEntry.module.sass';
import { RouterLink } from 'vue-router';

export default defineComponent({
  props: {
    path: { type: String, required: true },
    file: Object as PropType<AlistFile>,
    extra: Object as PropType<CustomFileInfo>,
  },
  setup({ file, extra, path }) {
    return () => (
      <RouterLink to={`/files${path}`} class={styles.fileEntry}>
        <div class={styles.title}>
          {extra?.title || extra?.name || file?.name}
        </div>
      </RouterLink>
    );
  },
});
