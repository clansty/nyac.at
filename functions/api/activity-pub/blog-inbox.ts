import context from '../../../apContext.json';
import sendSignedRequest from '../../utils/sendSignedRequest';
import fetchFediverse from '../../utils/fetchFediverse';

export const onRequestPost: PagesFunction<{
  DATA_STORE: KVNamespace;
  LINK_STORE: KVNamespace;
  BOT_TOKEN: string;
  PRIVATE_KEY: string
}> = async ({ request, env }) => {
  const data = await request.json() as any;
  console.log(data);
  switch (data.type) {
    case 'Follow': {
      const followers: string[] = await env.DATA_STORE.get('ap:blog-followers', 'json') || [];
      followers.push(data.actor);
      await env.DATA_STORE.put('ap:blog-followers', JSON.stringify(followers));
      const actor = await fetchFediverse(data.actor);
      await sendSignedRequest({
        '@context': context,
        id: `https://nyac.at/followAccept/${data.id}`,
        type: 'Accept',
        object: data,
        actor: 'https://nyac.at/blog.json',
        published: new Date().toISOString(),
        to: [data.actor],
      }, actor.inbox, env.PRIVATE_KEY);
      return new Response(null, {
        status: 202,
      });
    }
    default:
      return new Response(null, {
        status: 501,
      });
  }
};
