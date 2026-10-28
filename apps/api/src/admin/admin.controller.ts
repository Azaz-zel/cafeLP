import { Controller, Get, Inject, Req, Res, UseGuards } from '@nestjs/common';
import { Throttle } from '@nestjs/throttler';
import type { Request, Response } from 'express';
import { listSlugs, loadCafe } from '../cafes/cafe-store.js';
import { AppConfig, CONFIG } from '../config.js';
import { requestOrigin } from '../pages/page.controller.js';
import { OWNER_COOKIE } from '../visits/visits.controller.js';
import { VisitsService } from '../visits/visits.service.js';
import { ADMIN_JS, AdminRow, renderAdmin } from './admin.view.js';
import { BasicAuthGuard } from './basic-auth.guard.js';

@Controller('admin')
@UseGuards(BasicAuthGuard)
@Throttle({ default: { limit: 30, ttl: 60_000 } })
export class AdminController {
  constructor(
    @Inject(CONFIG) private readonly config: AppConfig,
    private readonly visits: VisitsService,
  ) {}

  @Get()
  index(@Req() req: Request, @Res() res: Response) {
    const stats = this.visits.stats();
    const origin = requestOrigin(this.config, req);
    const rows: AdminRow[] = listSlugs(this.config.contentDir).map((slug) => {
      const loaded = loadCafe(this.config.contentDir, slug);
      return {
        slug,
        name: loaded?.ok ? loaded.cafe.name : null,
        errors: loaded && !loaded.ok ? loaded.errors : [],
        url: `${origin}/${slug}`,
        stats: stats.get(slug),
      };
    });
    // Most recently opened first: those are the prospects worth a follow-up today.
    rows.sort((a, b) => (b.stats?.lastAt ?? '').localeCompare(a.stats?.lastAt ?? '') || a.slug.localeCompare(b.slug));

    res
      .cookie(OWNER_COOKIE, '1', { httpOnly: true, sameSite: 'lax', secure: req.secure, maxAge: 365 * 24 * 3600 * 1000 })
      .set('Cache-Control', 'no-store')
      .type('html')
      .send(renderAdmin(rows));
  }

  @Get('admin.js')
  script(@Res() res: Response) {
    res.set('Cache-Control', 'no-store').type('application/javascript').send(ADMIN_JS);
  }
}
