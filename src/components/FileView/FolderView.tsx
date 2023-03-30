import { PropType, computed } from 'vue';
import { AlistFile } from '~/types/Alist';
import { CustomFileInfo } from '~/types/FolderInfo';
import FileEntry from '~/components/FileView/FileEntry';

export default defineComponent({
  props: {
    path: { type: String, required: true },
    files: { type: Array as PropType<AlistFile[]>, required: true },
    extraFiles: Array as PropType<CustomFileInfo[]>,
  },
  setup(props) {
    // 整合文件列表
    const finalFiles: [AlistFile?, CustomFileInfo?][] = [];
    const filesNonHidden = computed(()=>props.files.filter(it=>!it.name.startsWith('.')))

    for (const file of filesNonHidden.value) {
      const fileExtra = props.extraFiles && props.extraFiles.find(it => it.name === file.name);
      finalFiles.push([file, fileExtra]);
    }
    if (props.extraFiles) {
      for (const extraFile of props.extraFiles.filter(extraFile => !props.files.some(file => file.name === extraFile.name))) {
        finalFiles.push([null, extraFile]);
      }
    }

    return () => (
      <div>
        {finalFiles.map(([file, extra]) =>
          <FileEntry file={file} extra={extra} path={`${props.path}/${extra?.name || file?.name}`}/>)}
      </div>
    );
  },
});
