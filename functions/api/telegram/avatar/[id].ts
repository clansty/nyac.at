import { callTgFunc } from '../webhookEndpoint';

export const onRequestGet: PagesFunction<{
  LINK_STORE: KVNamespace;
  BOT_TOKEN: string;
}, 'id'> = async ({ env, params }) => {
  let cache = await env.LINK_STORE.get(`avatar:${params.id}`);
  if (!cache) {
    const avatars = await callTgFunc('getUserProfilePhotos', {
      user_id: Number(params.id),
      limit: 1,
    }, env.BOT_TOKEN);
    const avatar = avatars[0][avatars[0].length - 1];
    const download: any = await callTgFunc('getFile', {
      file_id: avatar.file_id,
    }, env.BOT_TOKEN);
    cache = `https://api.telegram.org/file/bot${env.BOT_TOKEN}/${download.file_path}`;
    await env.LINK_STORE.put(`avatar:${params.id}`, cache, {
      expirationTtl: 60 * 60,
    });
  }
  return await fetch(cache);
};
