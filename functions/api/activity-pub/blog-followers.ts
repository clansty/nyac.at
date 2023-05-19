import context from '../../../apContext.json';

export const onRequestGet: PagesFunction<{
  DATA_STORE: KVNamespace;
  LINK_STORE: KVNamespace;
  BOT_TOKEN: string;
  PRIVATE_KEY: string
}> = async ({ request, env }) => {
  const followers: string[] = await env.DATA_STORE.get('ap:blog-followers', 'json') || [];
  return new Response(JSON.stringify({
    '@context': context,
    id: 'https://nyac.at/api/activity-pub/blog-followers',
    type: 'OrderedCollection',
    totalItems: followers.length,
    orderedItems: followers,
    actor: 'https://nyac.at/blog.json'
  }), {
    headers: {
      'Content-Type': 'application/activity+json',
    },
  });
};
