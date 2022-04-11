import { PropType } from 'vue';
import { AlistFile } from '~/types/Alist';
import { CustomFileInfo } from '~/types/FolderInfo';
import styles from './FileView.module.sass';
import FileIcon from '~/components/FileView/FileIcon';
import hSize from '~/utils/hSize';
import { formatDate } from '@vueuse/core';
import downloadOutlined from '@iconify-icons/ant-design/download-outlined.js';
import copyOutlined from '@iconify-icons/ant-design/copy-outlined.js';
import Icon from '~/components/Icon';

export default defineComponent({
  props: {
    path: { type: String, required: true },
    file: { type: Object as PropType<AlistFile>, required: true },
    extra: Object as PropType<CustomFileInfo>,
  },
  setup({ file, extra, path }) {
    const { copy, copied } = useClipboard({ source: file.url });

    return () => (
      <div>
        <div class={styles.baseInfo}>
          <div class={styles.icon}>
            <FileIcon path={path}/>
          </div>
          <div class={styles.name}>
            {extra?.title || file.name}
          </div>
        </div>
        <div class={styles.buttons}>
          <a href={file.url} target="_blank">
            <Icon icon={downloadOutlined}/>
            下载
          </a>
          <a onClick={() => copy()}>
            <Icon icon={copyOutlined}/>
            {copied.value ? '已复制！' : '复制链接'}
          </a>
        </div>
        <table class={styles.detail}>
          <tbody>
          <tr>
            <td>大小:</td>
            <td>{hSize(file.size)}</td>
          </tr>
          <tr>
            <td>日期:</td>
            <td>{formatDate(new Date(file.updated_at), 'YYYY/M/D H:mm:ss')}</td>
          </tr>
          </tbody>
        </table>
      </div>
    );
  },
});
