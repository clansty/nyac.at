import { PropType } from 'vue';
import { AlistFile } from '~/types/Alist';
import { CustomFileInfo } from '~/types/FolderInfo';
import FileEntry from '~/components/FileView/FileEntry';

export default defineComponent({
  props: {
    files: { type: Array as PropType<AlistFile[]>, required: true },
    extraFiles: Array as PropType<CustomFileInfo[]>,
  },
  setup({ files, extraFiles }) {
    // 整合文件列表
    const finalFiles: [AlistFile?, CustomFileInfo?][] = [];
    for (const file of files) {
      const fileExtra = extraFiles && extraFiles.find(it => it.name === file.name);
      finalFiles.push([file, fileExtra]);
    }
    if (extraFiles) {
      for (const extraFile of extraFiles.filter(extraFile => !files.some(file => file.name === extraFile.name))) {
        finalFiles.push([null, extraFile]);
      }
    }

    console.log(finalFiles);
    return () => (
      <div>
        {finalFiles.map(([file, extra]) => <FileEntry file={file} extra={extra}/>)}
      </div>
    );
  },
});
