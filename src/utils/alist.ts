import { AlistFile } from '~/types/Alist';

export default {
  async getPath(path: string, server: string) {
    const get = await fetch(`${server}/api/fs/get`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ path }),
    });
    // AnyScript 开始了
    const getRes: any = await get.json();
    if (!getRes.data.is_dir) {
      return {
        type: 'file',
        files: [getRes.data] as AlistFile[],
      };
    }
    const list = await fetch(`${server}/api/fs/list`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ path }),
    });
    // AnyScript 开始了
    const listRes: any = await list.json();
    return { type: 'folder', files: listRes.data.content as AlistFile[] };
  },
};
