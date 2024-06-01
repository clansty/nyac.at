import posthog from "posthog-js";
import type { UserModule } from '~/types'

export const install: UserModule = ({ app }) => {
  if (import.meta.env.SSR) return;
  app.config.globalProperties.$posthog = posthog.init(
    'phc_4BFetd09h1ClEounK6MrswNPNxvCTyjbFFFyIH8BkY6',
    {
      api_host: 'https://eu.i.posthog.com',
    }
  );
}
