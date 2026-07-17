# Altiora — Sitio + Portal (Next.js)

Aplicación **Next.js 15** de Grupo Altiora: sitio público de inversión inmobiliaria (bienes
adjudicados y cesiones de derechos) + **portal de acreditados «Órbita»** con base de datos real.

## Stack

- Next.js 15 (App Router, `output: standalone`) · Tailwind CSS v4 · next-intl (ES/EN)
- PostgreSQL + Prisma · better-auth (roles: admin / agente / inversionista, sin registro público)
- sharp (re-encode WebP de fotos al subir) · zod (validación en server actions)
- Deploy: Docker (Easypanel en VPS Hostinger) → https://grupoaltiora.cloud

## Desarrollo local

```bash
cp .env.example .env       # llenar valores (BD, secreto, SEED_ADMIN_PASSWORD)
npm install                # incluye prisma generate
npx prisma migrate dev     # migraciones
SEED_DEMO=1 npm run db:seed  # admin + catálogo demo + cuentas demo (solo dev)
npm run build && node .next/standalone/server.js
node scripts/smoke.mjs     # 22 pruebas (páginas, roles, rate limit)
```

> `SEED_DEMO=1` crea cuentas demo con contraseñas conocidas — **nunca** usarlo en producción.

## Rutas

- Público (ISR): `/` · `/catalogo` · `/propiedad/[slug]` · `/acceso` · `/aviso-de-privacidad` (+ `/en/*`)
- Portal (dinámico, RBAC): `/portal` · `/portal/inventario` (agente) · `/portal/boveda` ·
  `/portal/brujula` · `/portal/estado-cuenta` (inversionista) · `/portal/admin/usuarios` (admin)

## Notas

- Cifras y propiedades son **datos de demostración** (no reales); todo va con `noindex`.
- Los archivos en `legacy/` son el mockup estático previo (referencia de diseño).
- Lighthouse local: Inicio 94 móvil / 100 desktop · Catálogo 96 móvil.

© 2026 Grupo Altiora · CDMX
