import { callTgFunc } from '../webhookEndpoint';

export const onRequestGet: PagesFunction<{
  LINK_STORE: KVNamespace;
  BOT_TOKEN: string;
}, 'id'> = async ({ env, params }) => {
  const cache = await env.LINK_STORE.get(params.id as string);
  if (!cache) return Response.redirect('https://cdn.v2ex.com/gravatar/0?s=200&d=mp');
  return new Response(cache);
};
