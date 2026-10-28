import { resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

export interface AppConfig {
  contentDir: string;
  webDist: string;
  dataDir: string;
  /** Absolute origin used for share-preview URLs, e.g. https://namamu.my.id */
  publicUrl: string | null;
  adminPassword: string | null;
  pitch: { name: string; whatsapp: string } | null;
}

export const CONFIG = Symbol('CONFIG');

// Paths default to the repo layout; the Docker image keeps the same relative layout.
export function loadConfig(env: NodeJS.ProcessEnv = process.env): AppConfig {
  const root = fileURLToPath(new URL('../../../', import.meta.url));
  const pitchName = env.PITCH_NAME?.trim();
  const pitchWa = env.PITCH_WHATSAPP?.trim();
  if (pitchWa && !/^62\d{8,13}$/.test(pitchWa)) {
    throw new Error('PITCH_WHATSAPP harus format 62xxxxxxxxxx');
  }
  return {
    contentDir: resolve(env.CONTENT_DIR ?? resolve(root, 'content')),
    webDist: resolve(env.WEB_DIST ?? resolve(root, 'apps/web/dist')),
    dataDir: resolve(env.DATA_DIR ?? resolve(root, 'data')),
    publicUrl: env.PUBLIC_URL?.replace(/\/+$/, '') || null,
    adminPassword: env.ADMIN_PASSWORD || null,
    pitch: pitchName && pitchWa ? { name: pitchName, whatsapp: pitchWa } : null,
  };
}
