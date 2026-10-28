import 'reflect-metadata';
import { Logger } from '@nestjs/common';
import { NestFactory } from '@nestjs/core';
import type { NestExpressApplication } from '@nestjs/platform-express';
import { AppModule } from './app.module.js';
import { configureApp } from './app.setup.js';
import { loadConfig } from './config.js';

async function bootstrap() {
  const config = loadConfig();
  const app = await NestFactory.create<NestExpressApplication>(AppModule.register(config), { bodyParser: false });
  configureApp(app, config);
  const port = Number(process.env.PORT ?? 3000);
  await app.listen(port);

  const log = new Logger('Bootstrap');
  log.log(`Siap di http://localhost:${port}  (konten: ${config.contentDir})`);
  if (!config.adminPassword) log.warn('ADMIN_PASSWORD kosong: /admin tidak bisa dibuka');
  if (!config.pitch) log.warn('PITCH_NAME / PITCH_WHATSAPP kosong: pitch bar tidak tampil');
  if (!config.publicUrl) log.warn('PUBLIC_URL kosong: link preview memakai host dari request');
}

void bootstrap();
