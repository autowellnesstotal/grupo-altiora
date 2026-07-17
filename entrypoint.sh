#!/bin/sh
set -e
echo "[altiora] aplicando migraciones..."
./mig/node_modules/.bin/prisma migrate deploy --schema ./prisma/schema.prisma
echo "[altiora] iniciando Next.js..."
exec node server.js
