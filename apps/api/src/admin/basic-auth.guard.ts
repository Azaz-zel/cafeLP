import { CanActivate, ExecutionContext, Inject, Injectable, Logger, UnauthorizedException } from '@nestjs/common';
import type { Request, Response } from 'express';
import { createHash, timingSafeEqual } from 'node:crypto';
import { AppConfig, CONFIG } from '../config.js';

const digest = (s: string) => createHash('sha256').update(s).digest();

@Injectable()
export class BasicAuthGuard implements CanActivate {
  private readonly logger = new Logger(BasicAuthGuard.name);

  constructor(@Inject(CONFIG) private readonly config: AppConfig) {}

  canActivate(ctx: ExecutionContext): boolean {
    const req = ctx.switchToHttp().getRequest<Request>();
    const expected = this.config.adminPassword;
    const given = this.passwordFrom(req);
    // Compare fixed-length digests so neither length nor content leaks through timing.
    if (expected && given !== null && timingSafeEqual(digest(given), digest(expected))) return true;
    if (!expected) this.logger.warn('ADMIN_PASSWORD belum di-set, /admin selalu ditolak');
    ctx.switchToHttp().getResponse<Response>().set('WWW-Authenticate', 'Basic realm="admin", charset="UTF-8"');
    throw new UnauthorizedException();
  }

  private passwordFrom(req: Request): string | null {
    const header = req.headers.authorization ?? '';
    if (!header.startsWith('Basic ')) return null;
    const decoded = Buffer.from(header.slice(6), 'base64').toString('utf8');
    const sep = decoded.indexOf(':');
    return sep === -1 ? null : decoded.slice(sep + 1);
  }
}
