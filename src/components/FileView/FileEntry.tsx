import { PropType } from 'vue';
import { AlistFile } from '~/types/Alist';
import { CustomFileInfo } from '~/types/FolderInfo';
import styles from './FileEntry.module.sass';
import { RouterLink } from 'vue-router';
import FileIcon from '~/components/FileView/FileIcon';
import chevronRight from '@iconify-icons/akar-icons/chevron-right.js';
import Icon from '~/components/Icon';

export default defineComponent({
  props: {
    path: { type: String, required: true },
    file: Object as PropType<AlistFile>,
    extra: Object as PropType<CustomFileInfo>,
  },
  setup({ file, extra, path }) {
    const route = useRoute();
    const isFolder = file?.type === 1 || extra?.isFolder;
    const inner = <>
      <div class={styles.icon}>
        <FileIcon path={path} isFolder={isFolder}/>
      </div>
      <div class={styles.title}>
        {extra?.title || extra?.name || file?.name}
      </div>
      {isFolder && (
        <div class={styles.folderArrow}>
          <Icon icon={chevronRight}/>
        </div>
      )}
    </>;
    if (extra?.url) {
      return () => (
        <a href={extra.url} class={styles.fileEntry} target="_blank">
          {inner}
        </a>
      );
    }
    return () => (
      <RouterLink to={`/files${path.replace(/#/g, '%23')}`}
                  class={`${styles.fileEntry} ${`/${route.params.path}`.startsWith(path) && styles.selected}`}>
        {inner}
      </RouterLink>
    );
  },
});
