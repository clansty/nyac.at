import sharp from 'sharp'
import fsP from 'fs/promises'
import path from 'path'

// 转换出来的文件是给 Telegram 用的，所以不需要给浏览器缓存之类的
// 然后每张 webp 都会有一个 webp.jpg

for (const file of await fsP.readdir(path.join('./dist', 'x_assets_x'))) {
  if (!file.endsWith('.webp')) continue;
  await sharp(path.join('./dist', 'x_assets_x', file)).jpeg().toFile(path.join('./dist', 'x_assets_x', file + '.jpg'));
}
