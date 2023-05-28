import fs from 'fs'
import path from 'path'

const file = fs.readdirSync('./dist').find(it => it.startsWith('meow-activityPubMeta'));

(async () => {
  const { default: fun } = await import('../dist/' + file);
  fun(fs, path);
})();
