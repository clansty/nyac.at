// @ts-ignore
import friendsRaw from '../../data/friends.yaml';
import random from '~/utils/random';
import FriendLink from '~/types/FriendLink';
import styles from './friends.module.sass';
import FriendLinkBox from '~/components/FriendLinkBox';
import BackButton from '~/components/BackButton';

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
      ],
    });

    const friends = ref<FriendLink[]>(friendsRaw);
    friends.value = [...random.shuffle(friends.value)];
    return () => (
      <div class={styles.friendContainer}>
        <div class={styles.scrollBox}>
          <div class={styles.groupBox}>
            <div class={styles.title}>
              好朋友们～
            </div>
            {friends.value.map(f => <FriendLinkBox item={f} key={f.name}/>)}
          </div>
          {/*<div class={styles.groupBox}>*/}
          {/*  <div class={styles.title}>*/}
          {/*    致敬！*/}
          {/*  </div>*/}
          {/*  <MtfWikiLinkBox/>*/}
          {/*</div>*/}
        </div>
        <BackButton to="/"/>
      </div>
    );
  },
});
