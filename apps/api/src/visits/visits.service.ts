import { Inject, Injectable, OnModuleDestroy } from '@nestjs/common';
import { mkdirSync } from 'node:fs';
import { join } from 'node:path';
import { DatabaseSync } from 'node:sqlite';
import { AppConfig, CONFIG } from '../config.js';

export type Device = 'mobile' | 'desktop';
export interface VisitStats {
  count: number;
  lastAt: string;
  lastDevice: Device;
}

@Injectable()
export class VisitsService implements OnModuleDestroy {
  private readonly db: DatabaseSync;

  constructor(@Inject(CONFIG) config: AppConfig) {
    mkdirSync(config.dataDir, { recursive: true });
    this.db = new DatabaseSync(join(config.dataDir, 'visits.db'));
    this.db.exec(`
      PRAGMA journal_mode = WAL;
      CREATE TABLE IF NOT EXISTS visits (
        id INTEGER PRIMARY KEY,
        slug TEXT NOT NULL,
        at TEXT NOT NULL,
        device TEXT NOT NULL CHECK (device IN ('mobile', 'desktop'))
      );
      CREATE INDEX IF NOT EXISTS visits_slug_at ON visits (slug, at);
    `);
  }

  record(slug: string, device: Device, at = new Date()) {
    this.db.prepare('INSERT INTO visits (slug, at, device) VALUES (?, ?, ?)').run(slug, at.toISOString(), device);
  }

  stats(): Map<string, VisitStats> {
    const rows = this.db
      .prepare(
        `SELECT slug, count, at AS lastAt, device AS lastDevice FROM (
           SELECT slug, at, device,
                  COUNT(*) OVER (PARTITION BY slug) AS count,
                  ROW_NUMBER() OVER (PARTITION BY slug ORDER BY at DESC) AS rn
           FROM visits
         ) WHERE rn = 1`,
      )
      .all() as unknown as (VisitStats & { slug: string })[];
    return new Map(rows.map(({ slug, ...s }) => [slug, s]));
  }

  onModuleDestroy() {
    this.db.close();
  }
}
