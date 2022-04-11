import styles from './index.module.sass';
import { FolderInfo } from '~/types/FolderInfo';
import alist from '~/utils/alist';
import { Suspense } from 'vue';
import FolderView from './FolderView';
import FileView from './FileView';

const metas = import.meta.globEager('../../../data/files/**/folder.yaml');

const Component = defineComponent({
  props: {
    // 当前的 path
    path: { type: String, required: true },
  },
  async setup({ path }) {
    // 在这个文件里，会进行找 folder.yaml 的操作
    // 先拆分 path
    const paths: string[] = [];
    for (const part of path.split('/')) {
      if (paths.length) {
        paths.push(paths[paths.length - 1] + '/' + part);
      }
      else {
        paths.push(part);
      }
    }
    let meta: FolderInfo;
    let pathAfter = path;
    for (let i = paths.length - 1; i >= 0; i--) {
      const metaPath = `../../../data/files${paths[i]}/folder.yaml`;
      if (metas[metaPath]) {
        meta = metas[metaPath].default;
        pathAfter = path.substring(paths[i].length + 1);
        break
      }
    }
    if (!meta) {
      // 根目录
      meta = metas['../../../data/files/folder.yaml'].default;
    }
    // 请求 alist
    const alistData = await alist.getPath(meta.path + pathAfter, meta.server);

    return () => (
      <div class={`${styles.fileViewContainerAfterLoad} fileView`}>
        <div class={styles.fileViewContainerInner}>
          {alistData.type === 'folder' ?
            <FolderView files={alistData.files} extraFiles={pathAfter ? null : meta.files} path={path}/> :
            <FileView file={alistData.files[0]}
                      extra={pathAfter ? null : meta.files.find(it => it.name === alistData.files[0].name)}
                      path={path}/>
          }
        </div>
      </div>
    );
  },
});

export default defineComponent({
  props: {
    // 当前的 path
    path: { type: String, required: true },
  },
  setup({ path }) {
    return () => (
      <div class={`${styles.fileViewContainer}`}>
        <Suspense>
          <Component path={path}/>
        </Suspense>
      </div>
    );
  },
});
