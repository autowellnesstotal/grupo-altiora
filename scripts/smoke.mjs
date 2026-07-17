/**
 * Smoke tests del portal (correr con el servidor standalone arriba):
 *   node scripts/smoke.mjs [baseURL]
 * Usa curl (el fetch de undici en Windows dio falsos negativos).
 * OJO: cada corrida consume la ventana de rate limit (5 logins/min) — esperar ~65s entre corridas.
 */
import { execFileSync } from "node:child_process";
import { mkdtempSync, writeFileSync, readFileSync, rmSync } from "node:fs";
import { tmpdir } from "node:os";
import path from "node:path";

const BASE = process.argv[2] || "http://localhost:3000";
const tmp = mkdtempSync(path.join(tmpdir(), "altiora-smoke-"));
let failures = 0;

function ok(name, cond, extra = "") {
  console.log(`${cond ? "  ✅" : "  ❌"} ${name}${extra ? " · " + extra : ""}`);
  if (!cond) failures++;
}

function curl(args) {
  return execFileSync("curl", ["-s", ...args], { encoding: "utf8" });
}

function get(url, { jar, headers = false } = {}) {
  const bodyFile = path.join(tmp, "body.out");
  const args = ["-o", bodyFile, "-w", "%{http_code}\t%{redirect_url}", url];
  if (jar) args.unshift("-b", jar);
  if (headers) args.unshift("-D", path.join(tmp, "headers.out"));
  const [status, location] = curl(args).split("\t");
  return {
    status: Number(status),
    location,
    body: readFileSync(bodyFile, "utf8"),
    headers: headers ? readFileSync(path.join(tmp, "headers.out"), "utf8").toLowerCase() : "",
  };
}

function signIn(name, email, password) {
  const jar = path.join(tmp, `${name}.jar`);
  const dataFile = path.join(tmp, "login.json");
  writeFileSync(dataFile, JSON.stringify({ email, password }));
  const status = Number(
    curl([
      "-c", jar,
      "-o", path.join(tmp, "login.out"),
      "-w", "%{http_code}",
      "-X", "POST",
      "-H", "Content-Type: application/json",
      "--data", `@${dataFile}`,
      `${BASE}/api/auth/sign-in/email`,
    ])
  );
  return { status, jar };
}

console.log(`Smoke tests contra ${BASE}\n— Público:`);
{
  const home = get(`${BASE}/`, { headers: true });
  ok("Home ES 200", home.status === 200);
  ok("Home contiene manifiesto", home.body.includes("Hacemos flotar tu patrimonio"));
  ok("CSP presente", home.headers.includes("content-security-policy"));
  ok("HSTS presente", home.headers.includes("strict-transport-security"));
  ok("noindex presente", home.headers.includes("noindex"));

  const en = get(`${BASE}/en`);
  ok("Home EN 200 y traducida", en.status === 200 && en.body.includes("We float your assets"));

  const cat = get(`${BASE}/catalogo`);
  const claves = new Set(cat.body.match(/ALT-\d{4}/g) || []);
  ok("Catálogo con propiedades", cat.status === 200 && claves.size >= 6, `${claves.size} claves`);
}

console.log("— Guard sin sesión:");
{
  const portal = get(`${BASE}/portal`);
  ok("/portal → redirect a /acceso", portal.status === 307 && (portal.location || "").includes("/acceso"));
  const doc = get(`${BASE}/api/uploads/docs/x.pdf`);
  ok("Bóveda API sin sesión → 401", doc.status === 401);
}

console.log("— Roles:");
const admin = signIn("admin", "admin@grupoaltiora.cloud", process.env.SEED_ADMIN_PASSWORD || "AdminDevLocal#2026x");
ok("Login admin", admin.status === 200, `status ${admin.status}`);
const agente = signIn("agente", "agente@demo.altiora", "AgenteDemo#2026");
ok("Login agente", agente.status === 200, `status ${agente.status}`);
const inv = signIn("inv", "inversionista@demo.altiora", "InversionDemo#2026");
ok("Login inversionista", inv.status === 200, `status ${inv.status}`);
const bad = signIn("bad", "admin@grupoaltiora.cloud", "contrasena-incorrecta");
ok("Login inválido rechazado", bad.status === 401, `status ${bad.status}`);

if (admin.status === 200) {
  const p = get(`${BASE}/portal`, { jar: admin.jar });
  ok("Portal admin renderiza", p.status === 200 && p.body.includes("Administración"), `status ${p.status}`);
  const users = get(`${BASE}/portal/admin/usuarios`, { jar: admin.jar });
  ok("Admin ve usuarios", users.status === 200, `status ${users.status}`);
}
if (agente.status === 200) {
  const invPage = get(`${BASE}/portal/inventario`, { jar: agente.jar });
  ok("Agente ve inventario", invPage.status === 200, `status ${invPage.status}`);
  const adm = get(`${BASE}/portal/admin/usuarios`, { jar: agente.jar });
  ok("Agente NO ve admin (redirect a /portal)", adm.status === 307 && (adm.location || "").endsWith("/portal"), `-> ${adm.location}`);
}
if (inv.status === 200) {
  const st = get(`${BASE}/portal/estado-cuenta`, { jar: inv.jar });
  ok("Inversionista ve estado de cuenta", st.status === 200 && st.body.includes("Aportación inicial"), `status ${st.status}`);
  const invent = get(`${BASE}/portal/inventario`, { jar: inv.jar });
  ok("Inversionista NO ve inventario (redirect a /portal)", invent.status === 307 && (invent.location || "").endsWith("/portal"), `-> ${invent.location}`);
}

console.log("— Rate limit login (5/min):");
{
  let limited = false;
  for (let i = 0; i < 7; i++) {
    const r = signIn("brute", "fuerza@bruta.test", "x".repeat(16));
    if (r.status === 429) limited = true;
  }
  ok("Fuerza bruta bloqueada con 429", limited);
}

rmSync(tmp, { recursive: true, force: true });
console.log(failures === 0 ? "\nTODO OK ✅" : `\n${failures} fallas ❌`);
process.exit(failures === 0 ? 0 : 1);
