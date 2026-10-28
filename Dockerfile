# syntax=docker/dockerfile:1
FROM node:24-trixie-slim AS build
WORKDIR /app
COPY package.json package-lock.json ./
COPY apps/api/package.json apps/api/
COPY apps/web/package.json apps/web/
RUN npm ci --no-audit --no-fund
COPY apps apps
# The web build imports the sample cafe only in dev, but Vite still resolves the path.
COPY content/cafes/kopi-senja/cafe.json content/cafes/kopi-senja/cafe.json
RUN npm run build
# Production dependencies only, installed here so the runtime image needs no package manager.
RUN rm -rf node_modules apps/*/node_modules && npm ci --omit=dev --no-audit --no-fund -w apps/api

FROM node:24-trixie-slim
ENV NODE_ENV=production
WORKDIR /app
# npm, yarn and corepack are never used at runtime and carry most of the base image's CVEs.
RUN rm -rf /usr/local/lib/node_modules /usr/local/bin/npm /usr/local/bin/npx /usr/local/bin/corepack /usr/local/bin/yarn* /opt/yarn-*
COPY --from=build /app/package.json ./
COPY --from=build /app/node_modules node_modules
COPY --from=build /app/apps/api/package.json apps/api/
COPY --from=build /app/apps/api/dist apps/api/dist
COPY --from=build /app/apps/web/dist apps/web/dist
# content/ and data/ come from volumes so adding a cafe needs no rebuild.
RUN mkdir -p content data && chown node:node data
USER node
EXPOSE 3000
CMD ["node", "apps/api/dist/main.js"]
