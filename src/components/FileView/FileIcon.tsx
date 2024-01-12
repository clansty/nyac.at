import diskImage from '~/assets/icons/diskimage.webp';
import genericDocument from '~/assets/icons/GenericDocumentIcon.webp';
import execBinary from '~/assets/icons/ExecutableBinaryIcon.webp';
import genericFolder from '~/assets/icons/GenericFolderIcon.webp';
import packageIcon from '~/assets/icons/package.webp';
import jar from '~/assets/icons/jar.webp';
import torrent from '~/assets/icons/TorrentIcon.webp';
import font from '~/assets/icons/font.webp';
import Icon from '~/components/Icon';
import mime from '~/icons/mime';

const metas = import.meta.glob('../../../data/files/**/*.{webp,svg}', { eager: true });

const exts: [string, () => JSX.Element][] = [
  ['.iso', () => <img src={diskImage} alt="光盘镜像"/>],
  ['.cdr', () => <img src={diskImage} alt="光盘镜像"/>],
  ['.dmg', () => <img src={diskImage} alt="磁盘镜像"/>],
  ['.img', () => <img src={diskImage} alt="磁盘镜像"/>],
  ['.qcow2', () => <img src={diskImage} alt="磁盘镜像"/>],
  ['.exe', () => <Icon icon={mime.exe}/>],
  ['.sh', () => <img src={execBinary} alt="Shell 脚本"/>],
  ['.bash', () => <img src={execBinary} alt="BASH 脚本"/>],
  ['.zsh', () => <img src={execBinary} alt="ZSH 脚本"/>],
  ['.jar', () => <img src={jar} alt="Java 程序"/>],
  ['.torrent', () => <img src={torrent} alt="种子"/>],
  ['.ttf', () => <img src={font} alt="字体"/>],
  ['.ttc', () => <img src={font} alt="字体"/>],
  ['.wim', () => <img src={packageIcon} alt="Windows 系统镜像"/>],
  ['.msi', () => <img src={packageIcon} alt="Windows 应用包"/>],
  ['.appx', () => <img src={packageIcon} alt="Windows 应用包"/>],
  ['.msix', () => <img src={packageIcon} alt="Windows 应用包"/>],
  ['.appxbundle', () => <img src={packageIcon} alt="Windows 应用包"/>],
  ['.msixbundle', () => <img src={packageIcon} alt="Windows 应用包"/>],
  ['.pkg', () => <img src={packageIcon} alt="macOS 应用包"/>],
  ['.apk', () => <img src={packageIcon} alt="Android 应用包"/>],
  ['.pkg.tar.zst', () => <img src={packageIcon} alt="ALPM 应用包"/>],
  ['.pkg.tar.gz', () => <img src={packageIcon} alt="ALPM 应用包"/>],
  ['.pkg.tar.xz', () => <img src={packageIcon} alt="ALPM 应用包"/>],
  ['.pkg.tar', () => <img src={packageIcon} alt="ALPM 应用包"/>],
  ['.zip', () => <Icon icon={mime.zip}/>],
  ['.rar', () => <Icon icon={mime.rar}/>],
  ['.tar', () => <Icon icon={mime.tar}/>],
  ['.tar.gz', () => <Icon icon={mime.tgz}/>],
  ['.tgz', () => <Icon icon={mime.tgz}/>],
  ['.tar.bz', () => <Icon icon={mime.tbz}/>],
  ['.tbz', () => <Icon icon={mime.tbz}/>],
  ['.tar.bz2', () => <Icon icon={mime.tbz}/>],
  ['.tbz2', () => <Icon icon={mime.tbz}/>],
  ['.tar.zst', () => <Icon icon={mime.tarzst}/>],
  ['.tzst', () => <Icon icon={mime.tarzst}/>],
  ['.tar.zstd', () => <Icon icon={mime.tarzst}/>],
  ['.tar.xz', () => <Icon icon={mime.txz}/>],
  ['.txz', () => <Icon icon={mime.txz}/>],
  ['.xz', () => <Icon icon={mime.xz}/>],
  ['.bz2', () => <Icon icon={mime.bz2}/>],
  ['.bz', () => <Icon icon={mime.bz2}/>],
  ['.gz', () => <Icon icon={mime.gz}/>],
  ['.zst', () => <Icon icon={mime.zstd}/>],
  ['.zstd', () => <Icon icon={mime.zstd}/>],
  ['.7z', () => <Icon icon={mime['7z']}/>],
];

export default defineComponent({
  props: {
    path: { type: String, required: true },
    isFolder: Boolean,
  },
  setup({ path, isFolder }) {
    path = decodeURIComponent(path).toLowerCase();
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
