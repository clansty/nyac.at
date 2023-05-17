const subjects = [
  {
    'subject': 'acct:blog@nyac.at',
    'aliases': [],
    'links': [
      {
        'rel': 'http://webfinger.net/rel/profile-page',
        'type': 'text/html',
        'href': 'https://nyac.at/posts',
      },
      {
        'rel': 'self',
        'type': 'application/activity+json',
        'href': 'https://nyac.at/posts.json',
      },
    ],
  },
  {
    'subject': 'acct:channel@nyac.at',
    'aliases': [],
    'links': [
      {
        'rel': 'http://webfinger.net/rel/profile-page',
        'type': 'text/html',
        'href': 'https://nyac.at/channel',
      },
      {
        'rel': 'self',
        'type': 'application/activity+json',
        'href': 'https://nyac.at/channel.json',
      },
    ],
  },
];

export const onRequestGet: PagesFunction = async ({ request }) => {
  const url = new URL(request.url);
  const resource = url.searchParams.get('resource');

  const subject = subjects.find(them => them.subject === resource);
  if (!subject) {
    return new Response(null, {
      status: 404,
    });
  }
  return new Response(JSON.stringify(subject), {
    headers: {
      'Content-Type': 'application/jrd+json',
    },
  });
};
