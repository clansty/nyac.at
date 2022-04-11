import { PropType } from 'vue';
import { AlistFile } from '~/types/Alist';
import { CustomFileInfo } from '~/types/FolderInfo';
import styles from './FileEntry.module.sass';
import { RouterLink } from 'vue-router';
import FileIcon from '~/components/FileView/FileIcon';

export default defineComponent({
  props: {
    path: { type: String, required: true },
    file: Object as PropType<AlistFile>,
    extra: Object as PropType<CustomFileInfo>,
  },
  setup({ file, extra, path }) {
    const inner = <>
      <div class={styles.icon}>
        <FileIcon path={path} isFolder={file?.type === 1 || extra?.isFolder}/>
      </div>
      <div class={styles.title}>
        {extra?.title || extra?.name || file?.name}
      </div>
    </>;
    if (extra?.url) {
      return () => (
        <a href={extra.url} class={styles.fileEntry} target="_blank">
          {inner}
        </a>
      );
    }
    return () => (
      <RouterLink to={`/files${path}`} class={styles.fileEntry}>
        {inner}
      </RouterLink>
    );
  },
});
