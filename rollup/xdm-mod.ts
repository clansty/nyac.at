import { Plugin, ProcessorAndRollupOptions } from 'xdm/lib/integration/rollup';
import { VFile } from 'vfile';
import { createFilter } from '@rollup/pluginutils';
import { createFormatAwareProcessors } from 'xdm/lib/util/create-format-aware-processors.js';
import { SourceMapGenerator } from 'source-map';

export function XdmMod(options?: ProcessorAndRollupOptions | undefined): Plugin {
  const { include, exclude, ...rest } = options;
  const { extnames, process } = createFormatAwareProcessors({
    SourceMapGenerator,
    ...rest,
  });
  const filter = createFilter(include, exclude);

  return {
    name: 'xdm-mod',
    async transform(value, path) {
      // @ts-ignore
      const file = new VFile({ value, path });

      if (
        file.extname &&
        filter(file.path) &&
        extnames.includes(file.extname)
      ) {
        const compiled = await process(file);

        const codeRemovedImport = String(compiled.value).replace(/^import Vue from /m, 'import * as Vue from ');
        return { code: codeRemovedImport, map: compiled.map };
        // V8 on Erbium.
        /* c8 ignore next 2 */
      }
    },
  };
}
