// Convierte un monto en pesos mexicanos a letra (formato notarial):
// 12500 → "Doce mil quinientos pesos 00/100 M.N."

const UNIDADES = [
  "", "un", "dos", "tres", "cuatro", "cinco", "seis", "siete", "ocho", "nueve",
  "diez", "once", "doce", "trece", "catorce", "quince", "dieciséis",
  "diecisiete", "dieciocho", "diecinueve", "veinte",
];
const DECENAS = [
  "", "", "veinte", "treinta", "cuarenta", "cincuenta", "sesenta", "setenta",
  "ochenta", "noventa",
];
const CENTENAS = [
  "", "ciento", "doscientos", "trescientos", "cuatrocientos", "quinientos",
  "seiscientos", "setecientos", "ochocientos", "novecientos",
];

function centenasALetra(n: number): string {
  if (n === 0) return "";
  if (n === 100) return "cien";
  let out = "";
  const c = Math.floor(n / 100);
  const resto = n % 100;
  if (c > 0) out += CENTENAS[c] + " ";
  if (resto <= 20) {
    out += UNIDADES[resto];
  } else if (resto < 30) {
    out += resto === 21 ? "veintiún" : "veinti" + UNIDADES[resto - 20];
  } else {
    const d = Math.floor(resto / 10);
    const u = resto % 10;
    out += DECENAS[d];
    if (u > 0) out += " y " + UNIDADES[u];
  }
  return out.trim();
}

function seccionALetra(n: number): string {
  // 0..999 con "un" → "una" no aplica aquí (pesos son masculinos)
  return centenasALetra(n);
}

/** Parte entera (0..999,999,999) a letra. */
function enteroALetra(n: number): string {
  if (n === 0) return "cero";
  const millones = Math.floor(n / 1_000_000);
  const miles = Math.floor((n % 1_000_000) / 1000);
  const cientos = n % 1000;

  const parts: string[] = [];
  if (millones > 0) {
    parts.push(millones === 1 ? "un millón" : `${seccionALetra(millones)} millones`);
  }
  if (miles > 0) {
    parts.push(miles === 1 ? "mil" : `${seccionALetra(miles)} mil`);
  }
  if (cientos > 0) {
    parts.push(seccionALetra(cientos));
  }
  return parts.join(" ").replace(/\s+/g, " ").trim();
}

/** 12500 → "Doce mil quinientos pesos 00/100 M.N." */
export function pesosALetra(monto: number): string {
  const entero = Math.floor(monto);
  const centavos = Math.round((monto - entero) * 100);
  const letra = enteroALetra(entero);
  const capital = letra.charAt(0).toUpperCase() + letra.slice(1);
  const cc = String(centavos).padStart(2, "0");
  const pesos = entero === 1 ? "peso" : "pesos";
  // "un millón/millones de pesos" cuando el monto es de millones exactos
  const de = /mill[oó]n(es)?$/.test(letra) ? "de " : "";
  return `${capital} ${de}${pesos} ${cc}/100 M.N.`;
}

/** 12500 → "$12,500.00" */
export function pesosFormato(monto: number): string {
  return new Intl.NumberFormat("es-MX", {
    style: "currency",
    currency: "MXN",
    minimumFractionDigits: 2,
  }).format(monto);
}
