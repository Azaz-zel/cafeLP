import type { NestExpressApplication } from '@nestjs/platform-express';
import helmet from 'helmet';
import { join } from 'node:path';
import type { AppConfig } from './config.js';

/** Everything main.ts and the e2e tests must apply identically. */
export function configureApp(app: NestExpressApplication, config: AppConfig) {
  // Requests come through cloudflared on the Docker network; trust it for protocol/ip only.
  app.set('trust proxy', 'loopback, linklocal, uniquelocal');
  app.use(
    helmet({
      contentSecurityPolicy: {
        // HTTPS is terminated by Cloudflare; upgrading here would break plain-http local runs.
        directives: { 'upgrade-insecure-requests': null },
      },
    }),
  );
  app.useBodyParser('json', { limit: '2kb' });
  app.useStaticAssets(join(config.webDist, 'assets'), {
    prefix: '/assets',
    index: false,
    immutable: true,
    maxAge: '1y',
  });
  app.enableShutdownHooks();
  return app;
}
