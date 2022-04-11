import diskImage from '~/assets/icons/diskimage.webp';
import genericDocument from '~/assets/icons/GenericDocumentIcon.webp';
import execBinary from '~/assets/icons/ExecutableBinaryIcon.webp';
import genericFolder from '~/assets/icons/GenericFolderIcon.webp';

const metas = import.meta.globEager('../../../data/files/**/*.{webp,svg}');

const exts: [string, () => JSX.Element][] = [
  ['.iso', () => <img src={diskImage} alt="光盘镜像"/>],
  ['.cdr', () => <img src={diskImage} alt="光盘镜像"/>],
  ['.dmg', () => <img src={diskImage} alt="磁盘镜像"/>],
  ['.img', () => <img src={diskImage} alt="磁盘镜像"/>],
  ['.qcow2', () => <img src={diskImage} alt="磁盘镜像"/>],
  ['.exe', () => <img src={execBinary} alt="Windows 可执行文件"/>],
];

export default defineComponent({
  props: {
    path: { type: String, required: true },
    isFolder: Boolean,
  },
  setup({ path, isFolder }) {
    path = decodeURIComponent(path);
    if (metas[`../../../data/files${path}.webp`])
      return () => <img src={metas[`../../../data/files${path}.webp`].default} alt=""/>;
    if (isFolder)
      return () => <img src={genericFolder} alt="文件夹"/>;
    for (const ext of exts) {
      if (path.endsWith(ext[0]))
        return ext[1];
    }
    return () => <img src={genericDocument} alt="文件"/>;
  },
});
