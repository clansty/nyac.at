import { ViteSSG } from 'vite-ssg';
import routes from 'virtual:generated-pages';
import App from './App';

import './styles/global.sass';

// https://github.com/antfu/vite-ssg
export const createApp = ViteSSG(
  App,
  { routes, base: import.meta.env.BASE_URL },
  (ctx) => {
    // install all modules under `modules/`
    Object.values(import.meta.glob('./modules/*.ts', { eager: true })).forEach((i: any) => i.install?.(ctx));
  },
);
