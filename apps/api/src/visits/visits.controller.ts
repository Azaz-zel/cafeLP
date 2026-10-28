import {
  BadRequestException,
  Body,
  Controller,
  ForbiddenException,
  HttpCode,
  Inject,
  NotFoundException,
  Post,
  Req,
} from '@nestjs/common';
import { Throttle } from '@nestjs/throttler';
import type { Request } from 'express';
import { existsSync } from 'node:fs';
import { join } from 'node:path';
import { z } from 'zod';
import { cafesDir, isValidSlug } from '../cafes/cafe-store.js';
import { AppConfig, CONFIG } from '../config.js';
import { VisitsService } from './visits.service.js';

const visitBody = z.strictObject({ slug: z.string().max(60) });
export const OWNER_COOKIE = 'cl_owner';

export const isOwner = (req: Request) =>
  new RegExp(`(?:^|;\\s*)${OWNER_COOKIE}=1(?:;|$)`).test(req.headers.cookie ?? '');

// Browsers send Origin on POST; a mismatch means another site is posting visits.
const isCrossSite = (req: Request) => {
  const origin = req.headers.origin;
  if (!origin) return false;
  try {
    return new URL(origin).host !== req.get('host');
  } catch {
    return true;
  }
};

@Controller('api/visits')
export class VisitsController {
  constructor(
    @Inject(CONFIG) private readonly config: AppConfig,
    private readonly visits: VisitsService,
  ) {}

  @Post()
  @HttpCode(204)
  @Throttle({ default: { limit: 30, ttl: 60_000 } })
  record(@Body() body: unknown, @Req() req: Request) {
    if (isCrossSite(req)) throw new ForbiddenException();
    const parsed = visitBody.safeParse(body);
    if (!parsed.success || !isValidSlug(parsed.data.slug)) throw new BadRequestException();
    const { slug } = parsed.data;
    if (!existsSync(join(cafesDir(this.config.contentDir), slug, 'cafe.json'))) throw new NotFoundException();
    // The owner checking their own demo is not a prospect opening it.
    if (isOwner(req)) return;
    const device = /Mobi|Android|iPhone|iPad/i.test(req.get('user-agent') ?? '') ? 'mobile' : 'desktop';
    this.visits.record(slug, device);
  }
}
