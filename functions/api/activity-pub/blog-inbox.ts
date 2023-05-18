export const onRequestPost: PagesFunction<{
  DATA_STORE: KVNamespace;
  LINK_STORE: KVNamespace;
  BOT_TOKEN: string;
}> = async ({ request, env }) => {
  const data = await request.json();
  console.log(data);
};
