import PostInfo from '~/types/PostInfo';

export default Object.entries(import.meta.glob('../../data/posts/*/meta.yaml', { eager: true }))
  .map(([path, module]) => ({
    ...module.default,
    slug: /..\/..\/data\/posts\/([^\/]+)\/meta.yaml/.exec(path)[1],
  } as PostInfo))
  .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
