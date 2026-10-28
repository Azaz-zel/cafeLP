# syntax=docker/dockerfile:1
FROM node:24-slim AS build
WORKDIR /app
COPY package.json package-lock.json ./
COPY apps/api/package.json apps/api/
COPY apps/web/package.json apps/web/
RUN npm ci --no-audit --no-fund
COPY apps apps
# The web build imports the sample cafe only in dev, but Vite still resolves the path.
COPY content/cafes/kopi-senja/cafe.json content/cafes/kopi-senja/cafe.json
RUN npm run build

FROM node:24-slim
ENV NODE_ENV=production
WORKDIR /app
COPY package.json package-lock.json ./
COPY apps/api/package.json apps/api/
COPY apps/web/package.json apps/web/
RUN npm ci --omit=dev --no-audit --no-fund -w apps/api && npm cache clean --force
COPY --from=build /app/apps/api/dist apps/api/dist
COPY --from=build /app/apps/web/dist apps/web/dist
# content/ and data/ come from volumes so adding a cafe needs no rebuild.
RUN mkdir -p content data && chown node:node data
USER node
EXPOSE 3000
CMD ["node", "apps/api/dist/main.js"]
