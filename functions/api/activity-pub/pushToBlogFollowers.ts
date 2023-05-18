import fetchFediverse from '../../utils/fetchFediverse';
import sendSignedRequest from '../../utils/sendSignedRequest';

export const onRequestPost: PagesFunction<{
  DATA_STORE: KVNamespace;
  LINK_STORE: KVNamespace;
  BOT_TOKEN: string;
  PRIVATE_KEY: string
}> = async ({ request, env }) => {
  const followers: string[] = await env.DATA_STORE.get('ap:blog-followers', 'json') || [];
  const inboxes = new Set<string>;
  const body = await request.json();
  for (const follower of followers) {
    const actor = await fetchFediverse(follower);
    inboxes.add(actor.sharedInbox || actor.inbox);
  }
  for (const inbox of inboxes) {
    if (!inbox) continue;
    console.log('Sending to', inbox);
    try {
      await sendSignedRequest(body, inbox, env.PRIVATE_KEY);
    }
    catch (e) {
      console.log(e, e.message);
    }
  }
  return new Response();
};
