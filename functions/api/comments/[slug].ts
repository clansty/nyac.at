import Comment from '~/types/Comment';
import { sendTgMessage } from '../telegram/webhookEndpoint';

export const onRequestGet: PagesFunction<{
  DATA_STORE: KVNamespace;
}, 'slug'> = async ({ env, params }) => {
  const data = await env.DATA_STORE.get(params.slug as string);

  if (data) {
    const comments = JSON.parse(data) as Comment[];
    for (const comment of comments) {
      delete comment.email;
    }
    return new Response(JSON.stringify(comments, undefined, 0), {
      headers: {
        'Content-Type': 'application/json',
      },
    });
  }
  else {
    return new Response('[]');
  }
};

export const onRequestPost: PagesFunction<{
  DATA_STORE: KVNamespace;
  BOT_TOKEN: string;
}, 'slug'> = async ({ request, env, params }) => {
  const data = await request.json() as Comment;
  const { username, email, url, content } = data;

  if (!username || !content || !/\w[-\w.+]*@([A-Za-z0-9][-A-Za-z0-9]+\.)+[A-Za-z]{2,14}/.test(email)) {
    return new Response('', {
      status: 400,
    });
  }

  const postCommentsString = await env.DATA_STORE.get(params.slug as string);
  let postComments: Comment[] = [];
  if (postCommentsString) {
    postComments = JSON.parse(postCommentsString);
  }

  const avatar = await getAvatarUrl(email);
  const commentObj = {
    username, content, email, url, avatar,
    date: Date.now(),
  } as Comment;
  postComments.push(commentObj);

  await env.DATA_STORE.put(params.slug as string, JSON.stringify(postComments, undefined, 0));

  await sendTgMessage(351768429, `<b>有新评论</b>\n` +
    `<a href="https://nyac.at/posts/${params.slug}">${params.slug}</a>\n` +
    (url ? `<a href="${url}">${htmlEscape(`${username} <${email}>`)}</a>` : htmlEscape(`${username} <${email}>`)) +
    `\n${content}`, env.BOT_TOKEN);

  return new Response(JSON.stringify(commentObj, undefined, 0), {
    status: 201,
    headers: {
      'Content-Type': 'application/json',
    },
  });
};

async function md5(message) {
  const msgUint8 = new TextEncoder().encode(message);
  const hashBuffer = await crypto.subtle.digest('MD5', msgUint8);
  const hashArray = Array.from(new Uint8Array(hashBuffer));
  return hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
}

const getAvatarUrl = async (email: string) => {
  if (/([1-9]([0-9]{5,11}))@qq\.com/.test(email)) {
    const uin = /([1-9]([0-9]{5,11}))@qq\.com/.exec(email)[1];
    return `https://q1.qlogo.cn/g?b=qq&nk=${uin}&s=640`;
  }
  const hash = await md5(email.trim().toLowerCase());
  return `https://cdn.v2ex.com/gravatar/${hash}?s=200&d=mp`;
};

const htmlEscape = (text: string) =>
  text.replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;');
