import { formatDate } from '@vueuse/core';
import { Suspense } from 'vue';
import '~/styles/blog.scss';
import 'prism-themes/themes/prism-one-dark.min.css';
import Comments from '~/components/Comments';
import PostInfo from '~/types/PostInfo';
import BlogLayout from '~/layouts/BlogLayout';
import { RouterLink } from 'vue-router';
import allPosts from '~/utils/allPosts';

const postData = import.meta.glob('../../../data/posts/*/*');

const Component = defineComponent({
  props: {
    slug: { type: String, required: true },
  },
  async setup({ slug }) {
    const { default: meta } = await postData[postMetaPath(slug)]() as { default: PostInfo };
    const { default: Content } = await postData[postContentPath(slug)]();

    useHead({
      title: `${meta.title} — 凌莞咕噜咕噜～`,
      link:[
        { rel: 'canonical', href: `https://nyac.at/posts/${slug}` },
      ],
      meta:[
        { name: 'description', content: meta.desc },
        { name: 'author', content: 'Clansty' },
        { property: 'og:title', content: meta.title },
        { property: 'og:type', content: 'article' },
        { property: 'og:description', content: meta.desc },
        { property: 'og:image', content: meta.banner },
        { property: 'og:url', content: `https://nyac.at/posts/${slug}` },
        { property: 'article:published_time', content: new Date(meta.date).toISOString() },
        { property: 'article:modified_time', content: new Date(meta.date).toISOString() },
        { property: 'twitter:card', content: 'summary_large_image' },
        { property: 'twitter:title', content: meta.title },
        { property: 'twitter:description', content: meta.desc },
        { property: 'twitter:image', content: meta.banner },
        { property: 'twitter:url', content: `https://nyac.at/posts/${slug}` },
      ]
    })

    return () => (
      <BlogLayout postInfo={meta}>
        <div class="postContent">
          <div class="date">
            {formatDate(new Date(meta.date), 'YYYY/M/D')}
          </div>
          <Content
            components={{
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
            }}
          />
          <Comments slug={slug}/>
        </div>
      </BlogLayout>
    );
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

const postMetaPath = (slug: string) => `../../../data/posts/${slug}/meta.yaml`;
const postContentPath = (slug: string) => `../../../data/posts/${slug}/content.md`;
