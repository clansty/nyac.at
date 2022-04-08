import { AlistFile } from '~/types/Alist';

export default {
  async getPath(path: string, server: string) {
    const res = await fetch(`${server}/api/public/path`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ path }),
    });
    // AnyScript 开始了
    const json: any = await res.json();
    return json.data as { type: 'file' | 'folder', files: AlistFile[] };
  },
};
