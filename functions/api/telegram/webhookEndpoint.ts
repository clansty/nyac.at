const CLANSTIES = [351768429, 1783812610, 5053529413];
const CHANNEL = -1001768973132;
const GROUP = -1001691454442;
const POST_SLUG_REGEX = /^[a-z0-9\-]+$/;
const POST_URL_REGEX = /https:\/\/nyac\.at\/posts\/([a-z0-9\-]+)/;

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
      await sendTgMessage(CHANNEL,
        `<a href="https://t.me/iv?url=https%3A%2F%2Fnyac.at%2Fposts%2F${slug}&rhash=1d1387df1c4a21">\u200e</a>` +
        `https://nyac.at/${slug}`,
        env.BOT_TOKEN);
    }
    else if (body.message.chat?.id === GROUP) {

    }
  }
  return new Response();
};

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

export async function sendTgMessage(chat_id: number, text: string, token: string) {
  return await callTgFunc('sendMessage', {
    chat_id, text,
    parse_mode: 'HTML',
  }, token);
}
