import path from 'path';
import { defineConfig } from 'vite';
import Pages from 'vite-plugin-pages';
import generateSitemap from 'vite-ssg-sitemap';
import Layouts from 'vite-plugin-vue-layouts';
import AutoImport from 'unplugin-auto-import/vite';
import { VitePWA } from 'vite-plugin-pwa';
import Inspect from 'vite-plugin-inspect';
import VueJsx from '@vitejs/plugin-vue-jsx';
import Content from '@originjs/vite-plugin-content';
import { XdmMod } from './rollup/xdm-mod';
import * as fs from 'fs';
import remarkGfm from 'remark-gfm';
import rehypePrism from '@mapbox/rehype-prism';

export default defineConfig({
  resolve: {
    alias: {
      '~/': `${path.resolve(__dirname, 'src')}/`,
    },
  },
  plugins: [
    VueJsx({
      include: [/\.tsx$/],
    }),

    // https://github.com/hannoeru/vite-plugin-pages
    Pages({
      extensions: ['tsx', 'md'],
      caseSensitive: true,
      extendRoute(route) {
        if (route.path.startsWith('/posts')) {
          return {
            ...route,
            meta: {
              layout: 'blog',
            },
          };
        }
      },
    }),

    // https://github.com/JohnCampionJr/vite-plugin-vue-layouts
    Layouts({
      extensions: ['tsx'],
    }),

    // https://github.com/antfu/unplugin-auto-import
    AutoImport({
      imports: [
        'vue',
        'vue-router',
        '@vueuse/head',
        '@vueuse/core',
      ],
      include: [/\.[tj]sx?$/],
      dts: 'src/auto-imports.d.ts',
    }),

    // https://github.com/antfu/vite-plugin-pwa
    VitePWA({
      registerType: 'autoUpdate',
      includeAssets: ['favicon.svg', 'safari-pinned-tab.svg'],
      manifest: {
        name: 'Vitesse',
        short_name: 'Vitesse',
        theme_color: '#ffffff',
        icons: [
          {
            src: '/pwa-192x192.png',
            sizes: '192x192',
            type: 'image/png',
          },
          {
            src: '/pwa-512x512.png',
            sizes: '512x512',
            type: 'image/png',
          },
          {
            src: '/pwa-512x512.png',
            sizes: '512x512',
            type: 'image/png',
            purpose: 'any maskable',
          },
        ],
      },
    }),

    // https://github.com/antfu/vite-plugin-inspect
    // Visit http://localhost:3333/__inspect/ to see the inspector
    Inspect(),

    Content.default(),

    XdmMod({
      jsxRuntime: 'classic',
      pragma: 'Vue.h',
      pragmaFrag: 'Vue.Fragment',
      pragmaImportSource: 'vue',
      remarkPlugins: [remarkGfm],
      rehypePlugins: [[rehypePrism, {
        ignoreMissing: true, alias: {
          cpp: 'c++',
          csharp: 'c#',
        },
      }]],
    }),
  ],

  // https://github.com/antfu/vite-ssg
  ssgOptions: {
    script: 'async',
    formatting: 'minify',
    onFinished() {
      // @ts-ignore
      generateSitemap.default();
    },
    includedRoutes(paths, routes) {
      // use original route records
      const pathsRet = routes.flatMap((route) => {
        return route.path === '/posts/:slug'
          ? fs.readdirSync('./data/posts').filter(dir => !dir.startsWith('.')).map(slug => `/posts/${slug}`)
          : route.path;
      });
      return pathsRet;
    },
  },

  optimizeDeps: {
    include: [
      'vue',
      'vue-router',
      '@vueuse/core',
      '@vueuse/head',
    ],
    exclude: [
      'vue-demi',
    ],
  },
});
