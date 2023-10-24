import fs from 'fs'
import path from 'path'

const file = fs.readdirSync('./dist').find(it => it.startsWith('x_activityPubMeta'));

(async () => {
  const { default: fun } = await import('../dist/' + file);
  const posts = fun(fs, path);

  const pushReq = await fetch('https://nyac.at/api/activity-pub/pushToBlogFollowers', {
    headers: {
      auth: process.env.BUILDER_SECRET,
    },
    method: 'POST',
    body: JSON.stringify(posts),
  });
  console.log('pushToBlogFollowers:', await pushReq.text());
})();
