# ---- deps ----
FROM node:24-alpine AS deps
WORKDIR /app
COPY package.json package-lock.json ./
COPY prisma ./prisma
RUN npm ci

# ---- build ----
FROM node:24-alpine AS builder
WORKDIR /app
COPY --from=deps /app/node_modules ./node_modules
COPY . .
ENV NEXT_TELEMETRY_DISABLED=1
# La BD no es accesible durante el build: las paginas ISR capturan el error y
# se regeneran al primer request en runtime.
RUN npx prisma generate && npm run build

# ---- migraciones + seed (prisma CLI y better-auth para hashear passwords) ----
FROM node:24-alpine AS migrator
WORKDIR /mig
RUN npm init -y >/dev/null 2>&1 && npm install prisma@6 @prisma/client@6 better-auth@1 >/dev/null 2>&1

# ---- runner ----
FROM node:24-alpine AS runner
WORKDIR /app
ENV NODE_ENV=production NEXT_TELEMETRY_DISABLED=1 PORT=3000 HOSTNAME=0.0.0.0
RUN addgroup -S nodejs && adduser -S nextjs -G nodejs
COPY --from=builder /app/.next/standalone ./
COPY --from=builder /app/.next/static ./.next/static
COPY --from=builder /app/public ./public
COPY --from=builder /app/prisma ./prisma
COPY --from=migrator /mig/node_modules ./mig/node_modules
COPY entrypoint.sh ./entrypoint.sh
# Enlazar paquetes de mig que el trace de standalone no incluyó (p. ej. better-auth
# para el seed): solo los ausentes, sin tocar los trazados por Next.
RUN for d in /app/mig/node_modules/*; do b=$(basename "$d"); \
      [ -e "/app/node_modules/$b" ] || ln -s "$d" "/app/node_modules/$b"; done && \
    chmod +x ./entrypoint.sh && mkdir -p /data/uploads && chown -R nextjs:nodejs /data /app
USER nextjs
EXPOSE 3000
CMD ["./entrypoint.sh"]
