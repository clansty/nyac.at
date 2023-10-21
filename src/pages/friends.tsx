// @ts-ignore
import friendsRaw from '../../data/friends.yaml';
import random from '~/utils/random';
import FriendLink from '~/types/FriendLink';
import styles from './friends.module.sass';
import FriendLinkBox from '~/components/FriendLinkBox';
import BackButton from '~/components/BackButton';
import ScrollContainer from '~/components/ScrollContainer';

export default defineComponent({
  setup() {
    useHead({
      title: '友情链接',
      link: [
        { rel: 'canonical', href: 'https://clansty.com/friends' },
      ],
      meta: [
        { property: 'og:url', content: 'https://clansty.com/friends' },
        { name: 'description', content: '这里是凌莞的好朋友们' },
        { property: 'og:title', content: '友情链接' },
        { property: 'og:description', content: '这里是凌莞的好朋友们' },
        { property: 'twitter:title', content: '友情链接' },
        { property: 'twitter:description', content: '这里是凌莞的好朋友们' },
      ],
    });

    const friends = ref<FriendLink[]>(friendsRaw);
    friends.value = [...random.shuffle(friends.value)];
    return () => (
      <div class={styles.friendContainer}>
        <ScrollContainer>
          <div class={styles.scrollBox}>
            <div class={styles.groupBox}>
              <div class={styles.title}>
                好朋友们～
              </div>
              <div class={styles.links}>
                {friends.value.map(f => <FriendLinkBox item={f} key={f.name}/>)}
              </div>
            </div>
          </div>
        </ScrollContainer>
        <BackButton to="/"/>
      </div>
    );
  },
});
