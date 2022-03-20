import FriendLink from '~/types/FriendLink';
import { PropType } from 'vue';
import styles from './FriendLinkBox.module.sass';

export default defineComponent({
  props: {
    item: { type: Object as PropType<FriendLink>, required: true },
  },
  setup({ item }) {
    return () => (
      <a href={item.url} target="_blank" style={{ ['--color' as any]: item.color }}>
        <div class={styles.friendLinkBox}>
          <div class={styles.avatar}>
            <img
              src={`/friend-avatars/${item.avatar}.webp`}
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
              {item.desc}
            </div>
          </div>
        </div>
      </a>
    );
  },
});
