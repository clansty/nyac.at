const assets = import.meta.globEager('../../data/posts/*/*.{webp,png,jpg,jpeg,gif}');

export default (slug: string, name: string) => {
  const asset = assets[`../../data/posts/${slug}/${name}`];
  if (!asset) return null;
  return asset.default as string;
}
