import { PropType } from 'vue';
import { AlistFile } from '~/types/Alist';
import { CustomFileInfo } from '~/types/FolderInfo';

export default defineComponent({
  props: {
    file: Object as PropType<AlistFile>,
    extra: Object as PropType<CustomFileInfo>,
  },
  setup({ file, extra }) {
    return () => (
      <div>
        {extra?.title || extra?.name || file?.name}
      </div>
    );
  },
});
