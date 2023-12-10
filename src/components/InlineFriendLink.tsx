// @ts-ignore
import friends from '../../data/friends.yaml';
import FriendLink from '~/types/FriendLink';
import FriendLinkBox from './FriendLinkBox';
import { Teleport } from 'vue';
import styles from './InlineFriendLink.module.sass';
import blogAncherStyle from '../styles/blogAnchor.module.scss'
import colorContrast from 'color-contrast'

export default defineComponent({
  props: {
    friendId: { type: String, required: true }
  },
  setup(props, { slots }) {
    const friend = computed(() => friends.find(them => them.id === props.friendId) as FriendLink);
    const linkRef = ref<HTMLAnchorElement>()
    const showBox = ref(false)
    // const boxLeft = computed(() => {
    //   if (!linkRef.value) return 0;
    //   const box = linkRef.value.getBoundingClientRect()
    //   return box.left + box.width / 2 - 250
    // })
    // const boxTop = computed(() => {
    //   if (!linkRef.value) return 0;
    //   const box = linkRef.value.getBoundingClientRect()
    //   return box.top - box.height - 80
    // })
    const linkOffset = computed(() => {
      if (!linkRef.value) return 0;
      const linkRect = linkRef.value.getBoundingClientRect()
      const center = linkRect.left + linkRect.width / 2
      if (center - 200 < 10)
        return 10 - linkRect.left
      return linkRef.value.offsetWidth / 2 - 200
    })
    const displayColor = computed(() => {
      const contrast = colorContrast(friend.value.color, '#FAFDFC')
      if (contrast < 1.5)
        return `color-mix(in srgb, #000 10%, ${friend.value.color})`
      return friend.value.color
    })


    return () => <span class={styles.container}>
      <a href={friend.value.url} target="_blank" ref={linkRef} class={blogAncherStyle.blogAncher}
        style={{
          '--linkColor': displayColor.value,
        }}
        onMouseover={() => showBox.value = true}
        onMouseout={() => showBox.value = false}
      >
        {slots.default()}
      </a>
      <div class={`${styles.friendBox} ${showBox.value && styles.show}`}
        style={{
          '--linkLeft': linkOffset.value + "px",
        }}
      >
        <FriendLinkBox item={friend.value} />
      </div>

      {/* <Teleport to="body">
        <div class={styles.tpFriendBox} style={{
          '--linkLeft': boxLeft.value + "px",
          top: boxTop.value + "px"
        }}>
          <FriendLinkBox item={friend.value} />
        </div>
      </Teleport> */}
    </span>
  }
})
