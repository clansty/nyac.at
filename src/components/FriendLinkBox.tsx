import FriendLink from '~/types/FriendLink';
import { PropType } from 'vue';
import styles from './FriendLinkBox.module.sass';

const avatars = import.meta.glob('../../data/friend-avatars/*.webp', { eager: true });
const components = import.meta.glob('../../data/friend-desc/*.tsx', { eager: true });

function avatar(name: string) {
  // @ts-ignore
  return avatars[`../../data/friend-avatars/${name}.webp`].default;
}

function desc(item: FriendLink) {
  // @ts-ignore
  const Component = components[`../../data/friend-desc/${item.id}.tsx`]?.default;
  if (!Component) return item.desc;
  return <Component/>;
}

export default defineComponent({
  props: {
    item: { type: Object as PropType<FriendLink>, required: true },
  },
  setup({ item }) {
    return () => (
      <a href={item.url} target="_blank" style={{ ['--color' as any]: item.color }} class={styles.friendLinkBox}>
        <div class={styles.avatar}>
          <img
            src={avatar(item.id)}
            height={80}
            width={80}
            alt=""
          />
        </div>
        <div class={styles.text}>
          <div class={styles.name}>
            {item.name}
          </div>
          <div class={styles.desc}>
            {desc(item)}
          </div>
        </div>
      </a>
    );
  },
});
