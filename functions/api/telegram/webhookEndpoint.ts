import Comment from '~/types/Comment';

export const CLANSTIES = [351768429, 1783812610, 5053529413];
const CHANNEL = -1001768973132;
export const GROUP = -1001691454442;
const POST_SLUG_REGEX = /^[a-z0-9\-]+$/;
const POST_URL_REGEX = /https:\/\/nyac\.at\/posts\/([a-z0-9\-]+)$/;

export const onRequestPost: PagesFunction<{
  DATA_STORE: KVNamespace;
  LINK_STORE: KVNamespace;
  BOT_TOKEN: string;
}> = async ({ request, env }) => {
  const body: any = await request.json();
  if (body.message) {
    if (CLANSTIES.includes(body.message.chat?.id)) {
      if (!POST_SLUG_REGEX.test(body.message.text)) return new Response();
      const slug = body.message.text;
      const instanceViewUrl = new URL('https://t.me/iv');
      instanceViewUrl.searchParams.set('url', `https://nyac.at/posts/${slug}`);
      instanceViewUrl.searchParams.set('rhash', '1d1387df1c4a21');
      await sendTgMessage(CHANNEL, `<a href="${instanceViewUrl}">\u200e</a>https://nyac.at/posts/${slug}`, env.BOT_TOKEN);
    }
    else if (body.message.chat?.id === GROUP) {
      if (!body.message.text) return new Response();
      if (body.message.text.startsWith('\u200e') && body.message.sender_chat?.id === CHANNEL) {
        // 建立关联
        if (!POST_URL_REGEX.test(body.message.text)) return new Response(); // 应该不可能
        const slug = POST_URL_REGEX.exec(body.message.text)[1];
        await env.LINK_STORE.put(body.message.message_id.toString(), slug);
        await env.LINK_STORE.put(slug, body.message.message_id.toString());
      }
      else if (body.message.reply_to_message) {
        // 回复消息
        const replyToSlug = await env.LINK_STORE.get(body.message.reply_to_message.message_id);
        if (!replyToSlug) return new Response();
        // 要将这条消息的 id 也添加上对应，因为可以楼中楼
        await env.LINK_STORE.put(body.message.message_id.toString(), replyToSlug);

        if (!body.message.text) return new Response();
        // 创建回复
        // 用户可以是 user 也可以是 channel
        const sender = body.message.sender_chat || body.message.from;
        const commentObj = {
          username: getUserDisplayName(sender),
          content: body.message.text,
          email: `${sender.id}@telegram-user.internal`,
          url: sender.username ? `https://t.me/${sender.username}` : '',
          avatar: `/api/telegram/avatar/${sender.id}`,
          date: Date.now(),
        } as Comment;

        const postCommentsString = await env.DATA_STORE.get(replyToSlug);
        let postComments: Comment[] = [];
        if (postCommentsString) {
          postComments = JSON.parse(postCommentsString);
        }
        postComments.push(commentObj);
        await env.DATA_STORE.put(replyToSlug, JSON.stringify(postComments, undefined, 0));
      }
    }
  }
  return new Response();
};

function getUserDisplayName(user) {
  if (!user) {
    return '未知会话';
  }
  if ('first_name' in user) {
    return user.first_name +
      (user.last_name ? ' ' + user.last_name : '');
  }
  else if ('title' in user) {
    return user.title;
  }
  else if ('id' in user) {
    return user.id.toString();
  }
  return '未知会话';
}

export async function callTgFunc(func: string, data: object, token: string) {
  try {
    const req = await fetch(`https://api.telegram.org/bot${token}/${func}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(data),
    });
    return await req.json();
  }
  catch (e) {
    console.log(e);
  }
}

export async function sendTgMessage(chat_id: number, text: string, token: string, reply_to_message_id?: number, disable_web_page_preview = false) {
  return await callTgFunc('sendMessage', {
    chat_id, text, reply_to_message_id, disable_web_page_preview,
    parse_mode: 'HTML',
  }, token);
}
