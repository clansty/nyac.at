import path from 'path';
import { defineConfig } from 'vite';
import Pages from 'vite-plugin-pages';
import generateSitemap from 'vite-ssg-sitemap';
import AutoImport from 'unplugin-auto-import/vite';
import { VitePWA } from 'vite-plugin-pwa';
import Inspect from 'vite-plugin-inspect';
import VueJsx from '@vitejs/plugin-vue-jsx';
import Content from '@originjs/vite-plugin-content';
import { XdmMod } from './rollup/xdm-mod';
import * as fs from 'fs';
import remarkGfm from 'remark-gfm';
import rehypePrism from '@mapbox/rehype-prism';
import autoprefixer from 'autoprefixer';
import SvgLoader from 'vite-svg-loader';

export default defineConfig({
  resolve: {
    alias: {
      '~/': `${path.resolve(__dirname, 'src')}/`,
    },
    dedupe: ['vue'],
  },
  css: {
    postcss: {
      plugins: [autoprefixer()],
    },
  },
  plugins: [
    VueJsx({
      include: [/\.tsx$/],
    }),

    SvgLoader(),

    // https://github.com/hannoeru/vite-plugin-pages
    Pages({
      extensions: ['tsx'],
      caseSensitive: true,
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
      manifest: {
        name: '凌莞的个人主页喵～',
        short_name: '凌莞喵～',
        theme_color: '#EDF8F6',
        background_color: '#EDF8F6',
        orientation: 'portrait-primary',
        lang: 'zh',
        icons: [
          {
            src: '/pwa/favicon.webp',
            sizes: '538x538',
            type: 'image/webp',
          },
          {
            src: '/pwa/icon512.webp',
            sizes: '512x512',
            type: 'image/webp',
          },
          {
            src: '/pwa/icon512.png',
            sizes: '512x512',
            type: 'image/png',
          },
          {
            src: '/pwa/icon192.webp',
            sizes: '192x192',
            type: 'image/webp',
          },
          {
            src: '/pwa/icon192.png',
            sizes: '192x192',
            type: 'image/png',
          },
        ],
      },
      workbox: {
        globPatterns: [
          'assets/*.*.*',
        ],
        globIgnores: [
          '*.html',
        ],
        cleanupOutdatedCaches: true,
        skipWaiting: true,
        clientsClaim: true,
        navigateFallback: null,
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
      format: 'mdx',
      mdxExtensions: ['.mdx', '.md'],
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
      generateSitemap({
        hostname: 'https://nyac.at',
      });
    },
    includedRoutes(paths, routes) {
      // use original route records
      const pathsRet = routes.flatMap((route) => {
        return route.path === '/posts/:slug'
          ? fs.readdirSync('./data/posts').filter(dir => !dir.startsWith('.')).map(slug => `/posts/${slug}`)
          : route.path;
      });
      return pathsRet.filter(path => !path.startsWith('/files'));
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
