const API_HOST = 'eu.i.posthog.com'; // Change to "eu.i.posthog.com" for the EU region
const ASSET_HOST = 'eu-assets.i.posthog.com'; // Change to "eu-assets.i.posthog.com" for the EU region

export const onRequest: PagesFunction = async ({ request, waitUntil }) => {
  const url = new URL(request.url);
  const pathname = url.pathname.replace(/^\/api\/ph\//, '/');
  const search = url.search;
  const pathWithParams = pathname + search;

  if (pathname.startsWith('/static/')) {
    return retrieveStatic(request, pathWithParams, { waitUntil });
  }
  else {
    return forwardRequest(request, pathWithParams);
  }
};

async function retrieveStatic(request, pathname, ctx) {
  let response = await caches.default.match(request);
  if (!response) {
    response = await fetch(`https://${ASSET_HOST}${pathname}`);
    ctx.waitUntil(caches.default.put(request, response.clone()));
  }
  return response;
}

async function forwardRequest(request, pathWithSearch) {
  const originRequest = new Request(request);
  originRequest.headers.delete('cookie');
  return await fetch(`https://${API_HOST}${pathWithSearch}`, originRequest);
}
