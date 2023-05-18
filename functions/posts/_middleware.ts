export const onRequest: PagesFunction = async (context) => {
  if (!context.request.url.endsWith('.json') && context.request.headers.get('accept') === 'application/activity+json') {
    return await context.env.ASSETS.fetch(context.request.url + '.json', context.request);
  }
  return await context.next();
};
