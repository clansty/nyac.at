const assets = import.meta.glob('../../data/posts/*/*.{webp,png,jpg,jpeg,gif}', { eager: true });

export default (slug: string, name: string) => {
  const asset = assets[`../../data/posts/${slug}/${decodeURIComponent(name)}`];
  if (!asset) return null;
  return asset.default as string;
}
