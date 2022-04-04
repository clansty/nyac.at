import { formatDate } from '@vueuse/core';
import { Suspense } from 'vue';
import '~/styles/blog.scss';
import 'prism-themes/themes/prism-one-dark.min.css';
import Comments from '~/components/Comments';
import BlogLayout from '~/layouts/BlogLayout';
import { RouterLink } from 'vue-router';
import allPosts from '~/utils/allPosts';
import postAsset from '~/utils/postAsset';

const postData = import.meta.glob('../../../data/posts/*/content.md');
const Component = defineComponent({
  props: {
    slug: { type: String, required: true },
  },
  async setup({ slug }) {
    const meta = allPosts.find(e => e.slug === slug);

    const Image = defineComponent({
      props: {
        src: String,
        alt: String,
        title: String,
      },
      setup({ src, alt, title }) {
        if (src.startsWith('https://'))
          return () => <img src={src} alt={alt} title={title}/>;
        return () => <img src={postAsset(slug, src)} alt={alt} title={title}/>;
      },
    });
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
      img({ src, alt, title }) {
        return (
          <figure>
            <Image src={src} alt={alt} title={title}/>
            <figcaption>{alt}</figcaption>
          </figure>
        );
      },
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

    const { default: Content } = await postData[postContentPath(slug)]();

    return () => (
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

const postContentPath = (slug: string) => `../../../data/posts/${slug}/content.md`;
