import { formatDate } from '@vueuse/core';
import { PropType, Suspense } from 'vue';
import '~/styles/blog.scss';
import 'prism-themes/themes/prism-one-dark.min.css';
import Comments from '~/components/Comments';
import PostInfo from '~/types/PostInfo';

const postData = import.meta.glob('../../../data/posts/*/*');

const Component = defineComponent({
  props: {
    slug: { type: String, required: true },
    onPostChange: { type: Function as PropType<(info: PostInfo) => any>, required: true },
  },
  async setup(props) {
    const { default: meta } = await postData[postMetaPath(props.slug)]() as { default: PostInfo };
    const { default: Content } = await postData[postContentPath(props.slug)]();
    props.onPostChange(meta);

    return () => (
      <div class="postContent">
        <div class="date">
          {formatDate(new Date(meta.date), 'YYYY/M/D')}
        </div>
        <Content
          components={{
            h1: 'h2',
          }}
        />
        <Comments slug={props.slug}/>
      </div>
    );
  },
});

export default defineComponent({
  props: {
    slug: { type: String, required: true },
    onPostChange: { type: Function as PropType<(info: PostInfo) => any>, required: true },
  },
  setup(props) {
    return () => (
      <Suspense>
        <Component slug={props.slug} onPostChange={props.onPostChange}/>
      </Suspense>
    );
  },
});

const postMetaPath = (slug: string) => `../../../data/posts/${slug}/meta.yaml`;
const postContentPath = (slug: string) => `../../../data/posts/${slug}/content.md`;
