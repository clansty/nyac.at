import allPosts from '~/utils/allPosts';
import type Fs from 'node:fs';
import type Path from 'node:path';
import context from '../apContext.json';

const banners = import.meta.globEager('../data/posts/*/banner.webp') as any;

const blogNotesActivities = allPosts.filter(it => !it.hidden).map(post => {
  const banner = banners[`../data/posts/${post.slug}/banner.webp`]?.default as string;
  return {
    post,
    activity: {
      id: `https://nyac.at/posts/${post.slug}.activity.json`,
      actor: 'https://nyac.at/blog.json',
      type: 'Create',
      published: new Date(post.date).toISOString(),
      to: [
        'https://www.w3.org/ns/activitystreams#Public',
      ],
      cc: [
        'https://nyac.at/activity-pub/blog-followers',
      ],
      object: {
        id: `https://nyac.at/posts/${post.slug}.json`,
        type: 'Note',
        attributedTo: 'https://nyac.at/blog.json',
        content: `<p><a href="https://nyac.at/posts/${post.slug}">${post.title}</a><br/><br/><span>${post.desc}</span></p>`,
        _misskey_content: `[${post.title}](https://nyac.at/posts/${post.slug})\n\n${post.desc}`,
        source: {
          content: `[${post.title}](https://nyac.at/posts/${post.slug})\n\n${post.desc}`,
          mediaType: 'text/x.misskeymarkdown',
        },
        published: new Date(post.date).toISOString(),
        to: [
          'https://www.w3.org/ns/activitystreams#Public',
        ],
        cc: [
          'https://nyac.at/activity-pub/blog-followers',
        ],
        'inReplyTo': null,
        attachment: banner ? [
          {
            'type': 'Document',
            'mediaType': 'image/webp',
            'url': banner.startsWith('data:') ? banner : `https://nyac.at${banner}`,
            'name': null,
          },
        ] : [],
        'sensitive': false,
        tag: [],
      },
    },
  };
});

const posts = {
  context,
  id: 'https://nyac.at/posts.json',
  type: 'OrderedCollection',
  totalItems: blogNotesActivities.length,
  orderedItems: blogNotesActivities.map(it => it.activity),
};

export default (fs: typeof Fs, path: typeof Path) => {
  for (const { post, activity } of blogNotesActivities) {
    fs.writeFileSync(path.join('dist', 'posts', `${post.slug}.activity.json`), JSON.stringify({ '@context': context, ...activity }));
    fs.writeFileSync(path.join('dist', 'posts', `${post.slug}.json`), JSON.stringify({ '@context': context, ...activity.object }));
    fs.writeFileSync(path.join('dist', 'posts.json'), JSON.stringify(posts));
  }
}
