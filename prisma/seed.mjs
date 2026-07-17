/**
 * Seed (JS plano: corre con `node prisma/seed.mjs`, también dentro del contenedor).
 *
 * - SIEMPRE: usuario admin (contraseña desde SEED_ADMIN_PASSWORD, mínimo 12) y
 *   6 propiedades demo del catálogo (contenido de demostración, sin credenciales).
 * - SOLO con SEED_DEMO=1: usuarios demo (agente/inversionista) con contraseñas
 *   conocidas + estado de cuenta + hilo de Brújula. NUNCA activar en producción.
 */
import { PrismaClient } from "@prisma/client";
import { hashPassword } from "better-auth/crypto";
import crypto from "node:crypto";

const prisma = new PrismaClient();
const id = () => crypto.randomUUID().replace(/-/g, "").slice(0, 24);

async function upsertUser({ name, email, password, role }) {
  const existing = await prisma.user.findUnique({ where: { email } });
  if (existing) return existing;
  const userId = id();
  const hash = await hashPassword(password);
  const user = await prisma.user.create({
    data: {
      id: userId,
      name,
      email,
      emailVerified: true,
      role,
      accounts: {
        create: { id: id(), accountId: userId, providerId: "credential", password: hash },
      },
    },
  });
  console.log(`  usuario ${role}: ${email}`);
  return user;
}

const DEMO_PROPS = [
  { clave: "ALT-0426", tipo: "Casa sola", categoria: "ADJUDICADO", ubicacion: "Roma Norte, CDMX", estado: "CDMX", precio: 5363000, avaluo: 6180000, hue: 208 },
  { clave: "ALT-1903", tipo: "Departamento", categoria: "ADJUDICADO", ubicacion: "Santa Cruz Atoyac, CDMX", estado: "CDMX", precio: 4794000, avaluo: 5240000, hue: 26 },
  { clave: "ALT-2206", tipo: "Casa sola", categoria: "CESION", ubicacion: "Valle de Aragón, Edo. Méx.", estado: "Estado de México", precio: null, avaluo: 3900000, hue: 158, precioOculto: true },
  { clave: "ALT-0088", tipo: "Casa en condominio", categoria: "ADJUDICADO", ubicacion: "El Marqués, Querétaro", estado: "Querétaro", precio: 5856000, avaluo: 6400000, hue: 262 },
  { clave: "ALT-1725", tipo: "Local comercial", categoria: "CESION", ubicacion: "Álvaro Obregón, CDMX", estado: "CDMX", precio: 3700000, avaluo: 4150000, hue: 14 },
  { clave: "ALT-0512", tipo: "Terreno", categoria: "ADJUDICADO", ubicacion: "Zapopan, Jalisco", estado: "Jalisco", precio: 2293500, avaluo: 2700000, hue: 186 },
];

const slugify = (input) =>
  input
    .toLowerCase()
    .normalize("NFD")
    .replace(/[̀-ͯ]/g, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)/g, "");

async function main() {
  console.log("Sembrando datos...");

  const adminPassword = process.env.SEED_ADMIN_PASSWORD;
  if (!adminPassword || adminPassword.length < 12) {
    throw new Error("Define SEED_ADMIN_PASSWORD (mínimo 12 caracteres) para sembrar el admin.");
  }

  await upsertUser({
    name: "Administrador Altiora",
    email: process.env.SEED_ADMIN_EMAIL || "admin@grupoaltiora.cloud",
    password: adminPassword,
    role: "admin",
  });

  let agente = null;
  for (const p of DEMO_PROPS) {
    await prisma.property.upsert({
      where: { clave: p.clave },
      update: {},
      create: {
        clave: p.clave,
        slug: `${slugify(p.tipo)}-${slugify(p.ubicacion)}-${p.clave.toLowerCase()}`,
        tipo: p.tipo,
        categoria: p.categoria,
        ubicacion: p.ubicacion,
        estado: p.estado,
        precio: p.precio,
        avaluo: p.avaluo,
        precioOculto: Boolean(p.precioOculto),
        hue: p.hue,
        status: "PUBLICADA",
      },
    });
  }
  console.log(`  ${DEMO_PROPS.length} propiedades demo`);

  if (process.env.SEED_DEMO === "1") {
    console.log("  SEED_DEMO=1 → sembrando cuentas demo (NO usar en producción)");
    agente = await upsertUser({
      name: "Agente Demo",
      email: "agente@demo.altiora",
      password: "AgenteDemo#2026",
      role: "agente",
    });
    const inversionista = await upsertUser({
      name: "Inversionista Demo",
      email: "inversionista@demo.altiora",
      password: "InversionDemo#2026",
      role: "inversionista",
    });

    const existingStatement = await prisma.statement.findFirst({
      where: { userId: inversionista.id },
    });
    if (!existingStatement) {
      await prisma.statement.create({
        data: {
          userId: inversionista.id,
          titulo: "Cesión de derechos · ALT-2206",
          saldo: 1250000,
          lines: {
            create: [
              { fecha: new Date("2026-05-15"), concepto: "Aportación inicial", abono: 1500000 },
              { fecha: new Date("2026-06-01"), concepto: "Honorarios de gestión", cargo: 150000 },
              { fecha: new Date("2026-07-01"), concepto: "Gastos judiciales", cargo: 100000 },
            ],
          },
        },
      });
      console.log("  estado de cuenta demo");
    }

    const thread = await prisma.messageThread.upsert({
      where: { userId: inversionista.id },
      update: {},
      create: { userId: inversionista.id },
    });
    const msgCount = await prisma.message.count({ where: { threadId: thread.id } });
    if (msgCount === 0 && agente) {
      await prisma.message.create({
        data: {
          threadId: thread.id,
          authorId: agente.id,
          body: "Buen día. Soy tu asesor patrimonial. ¿Sobre qué propiedad necesitas apoyo legal o fiscal?",
        },
      });
    }
  }

  console.log("Seed completo.");
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
