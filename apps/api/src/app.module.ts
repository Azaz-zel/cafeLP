import { DynamicModule, Injectable, Module } from '@nestjs/common';
import { APP_GUARD } from '@nestjs/core';
import { ThrottlerGuard, ThrottlerModule } from '@nestjs/throttler';
import { AdminController } from './admin/admin.controller.js';
import { AppConfig, CONFIG } from './config.js';
import { PageController } from './pages/page.controller.js';
import { VisitsController } from './visits/visits.controller.js';
import { VisitsService } from './visits/visits.service.js';

@Injectable()
class ClientIpThrottlerGuard extends ThrottlerGuard {
  // Behind Cloudflare Tunnel every request arrives from cloudflared; CF-Connecting-IP is the real client.
  // shortcut: trusts the header, fine while the app is only reachable through the tunnel (no published port).
  protected async getTracker(req: Record<string, any>): Promise<string> {
    return req.headers['cf-connecting-ip'] ?? req.ip;
  }
}

@Module({})
export class AppModule {
  static register(config: AppConfig): DynamicModule {
    return {
      module: AppModule,
      imports: [ThrottlerModule.forRoot([{ ttl: 60_000, limit: 120 }])],
      // Order matters: /admin must match before the catch-all /:slug.
      controllers: [AdminController, VisitsController, PageController],
      providers: [
        { provide: CONFIG, useValue: config },
        { provide: APP_GUARD, useClass: ClientIpThrottlerGuard },
        VisitsService,
      ],
    };
  }
}
