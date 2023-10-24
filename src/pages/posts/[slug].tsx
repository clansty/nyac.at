import { formatDate } from '@vueuse/core';
import { Suspense } from 'vue';
import '~/styles/blog.scss';
import 'prism-themes/themes/prism-one-dark.min.css';
import Comments from '~/components/Comments';
import BlogLayout from '~/layouts/BlogLayout';
import { RouterLink } from 'vue-router';
import allPosts from '~/utils/allPosts';
import postAsset from '~/utils/postAsset';
import type { TrackedImage } from 'tg-blog/dist/types/views/ImageViewer.vue';
import 'tg-blog/dist/style.css';

const postData = import.meta.glob('../../../data/posts/*/content.md');
const Component = defineComponent({
  props: {
    slug: { type: String, required: true },
  },
  async setup({ slug }) {
    const meta = allPosts.find(e => e.slug === slug);
    const allImages = ref<TrackedImage[]>([]);
    const imgIndex = ref(-1);

    let ImageViewer;

    if (!import.meta.env.SSR) {
      ImageViewer = (await import('tg-blog')).ImageViewer;
    }

    const imageSrc = (src: string) => {
      if (src.startsWith('https://'))
        return src;
      return postAsset(slug, src);
    };
    const markdownComponents = {
      h1: 'h2',
      a({ href }, { slots }) {
        if (/^https?:\/\//.test(href))
          return (
            <a href={href} target="_blank" style={{ ['--href' as any]: `'${href}'` }}>
              {slots.default()}
            </a>
          );
        return (
          <RouterLink to={href} class="inSiteLink"
                      style={{ ['--href' as any]: `'${href.includes('/') ? href : allPosts.find(e => e.slug === href).title}'` }}>
            {slots.default()}
          </RouterLink>
        );
      },
      img: defineComponent({
        props: {
          src: String,
          alt: String,
          title: String,
        },
        setup({ src, alt, title }) {
          allImages.value.push({
            url: imageSrc(src),
            text: alt,
            postIndex: 0,
          });
          const index = allImages.value.length - 1;
          return () => (
            <figure>
              <img src={imageSrc(src)} alt={alt} title={title} onClick={() => imgIndex.value = index}/>
              <figcaption>{alt}</figcaption>
            </figure>
          );
        },
      }),
    };

    useHead({
      title: `${meta.title} — 凌莞咕噜咕噜～`,
      link: [
        { rel: 'canonical', href: `https://nyac.at/posts/${slug}` },
      ],
      meta: [
        { name: 'description', content: meta.desc },
        { property: 'og:title', content: meta.title },
        { property: 'og:type', content: 'article' },
        { property: 'og:description', content: meta.desc },
        { property: 'og:image', content: postAsset(slug, 'banner.webp') },
        { property: 'og:url', content: `https://nyac.at/posts/${slug}` },
        { name: 'created', content: new Date(meta.date).toISOString() },
        { name: 'modified', content: new Date(meta.date).toISOString() },
        { property: 'article:published_time', content: new Date(meta.date).toISOString() },
        { property: 'article:modified_time', content: new Date(meta.date).toISOString() },
        { property: 'twitter:card', content: 'summary_large_image' },
        { property: 'twitter:title', content: meta.title },
        { property: 'twitter:description', content: meta.desc },
        { property: 'twitter:image', content: postAsset(slug, 'banner.webp') },
        { property: 'twitter:url', content: `https://nyac.at/posts/${slug}` },
      ],
    });

    const { default: Content } = await postData[postContentPath(slug)]() as any;
    // console.log('qwq',Content)

    return () => <>
      <BlogLayout postInfo={meta}>
        <div class={`postContent ${postAsset(slug, 'banner.webp') && 'withBanner'}`}>
          <div class="date">
            {formatDate(new Date(meta.date), 'YYYY/M/D')}
          </div>
          <Content
            components={markdownComponents}
          />
          <Comments slug={slug}/>
        </div>
      </BlogLayout>
      {!import.meta.env.SSR && <ImageViewer imgs={allImages.value} v-model:index={imgIndex.value}/>}
    </>;
  },
});

export default defineComponent({
  props: {
    slug: { type: String, required: true },
  },
  setup(props) {
    return () => (
      <div>
        <Suspense>
          <Component slug={props.slug}/>
        </Suspense>
      </div>
    );
  },
});

const postContentPath = (slug: string) => `../../../data/posts/${slug}/content.md`;
