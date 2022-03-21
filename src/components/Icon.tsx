import { Icon, IconifyIcon } from '@iconify/vue';
import { PropType } from 'vue';

export default defineComponent({
  props: {
    icon: { type: Object as PropType<IconifyIcon>, required: true },
    color: { type: String },
  },
  setup(props) {
    // @ts-ignore 糟糕的类型定义
    return () => <Icon icon={props.icon} color={props.color}/>;
  },
});
