import Mdx, { Options } from '@mdx-js/rollup';
import { Plugin } from 'rollup';

export function MdxMod(options?: Options | undefined): Plugin {
  const origin = Mdx(options);

  return {
    name: 'mdx-mod',
    async transform(value, path) {
      // @ts-ignore
      const originRes = await origin.transform(value, path);

      if (originRes) {
        return {
          ...originRes,
          code: originRes.code.replace(/^import Vue from /m, 'import * as Vue from '),
        };
      }
    },
  };
}
