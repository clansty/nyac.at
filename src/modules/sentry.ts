import type { UserModule } from '~/types';
import * as Sentry from '@sentry/vue';
import { BrowserTracing } from '@sentry/tracing';

export const install: UserModule = ({ isClient, app, router }) => {
  if (isClient) {
    Sentry.init({
      app,
      dsn: 'https://839179b3d13745a09585177f1d36ea01@o1252236.ingest.sentry.io/6418275',
      integrations: [
        new BrowserTracing({
          routingInstrumentation: Sentry.vueRouterInstrumentation(router),
        }),
      ],
      tracesSampleRate: 1.0,
    });
  }
};
