export default async (url: string) => {
  const req = await fetch(url, {
    headers: {
      Accept: 'application/activity+json',
    },
  });
  console.log('fetch', url, req.status);
  return await req.json() as any;
}
