// js/logica.js · Reglas puras: leer campos, filtrar, ordenar. Sin acceso a la página: solo recibe y devuelve datos.
// Los nombres de propiedad son los de la API v5 (names.common, codes.alpha_3, capitals, flag.url_svg…).
// Algunos territorios (ej. Abjasia) traen alpha_3 vacío (""): con || caemos al nombre y el id nunca queda vacío.
export const idDe = (p) => p.codes?.alpha_3 || p.names.common;
// Nombre en español (names.translations.spa); si el país no lo trae, el nombre común en inglés.
export const nombreDe = (p) => p.names.spa?.common || p.names.common;
export const oficialDe = (p) => p.names.spa?.official || p.names.official || '';
export const poblacionDe = (p) => (typeof p.population === 'number' ? p.population : null);
export const banderaDe = (p) => p.flag?.url_svg || p.flag?.url_png || '';   // algunos países traen la URL vacía
export const banderaPngDe = (p) => p.flag?.url_png || '';
export const altBandera = (p) => p.flag?.description || `Bandera de ${nombreDe(p)}`;

export const capitalDe = (p) => {
  const c = p.capitals?.[0];
  return (typeof c === 'string' ? c : c?.name) || '—';
};

// currencies y languages: se leen con cuidado porque su forma exacta se confirma mirando la respuesta real.
export const monedasDe = (p) => {
  const c = p.currencies;
  if (!c) return '—';
  const pares = Array.isArray(c) ? c.map((m) => [m?.code ?? '', m]) : Object.entries(c);
  const texto = pares.map(([codigo, m]) =>
    typeof m === 'object' && m !== null
      ? `${m.name ?? codigo}${m.symbol ? ` (${m.symbol})` : ''}`
      : String(m ?? codigo));
  return texto.join(', ') || '—';
};

export const idiomasDe = (p) => {
  const l = p.languages;
  if (!l) return '—';
  const lista = Array.isArray(l) ? l : Object.values(l);
  return lista.map((x) => (typeof x === 'string' ? x : x?.name ?? x?.english_name ?? x?.native_name ?? ''))
    .filter(Boolean).join(', ') || '—';
};

const normalizar = (t) => t.trim().toLowerCase().normalize('NFD').replace(/\p{Diacritic}/gu, '');

export const filtrarPaises = (lista, { texto, region }) => {
  const buscado = normalizar(texto);
  return lista
    .filter((p) => [nombreDe(p), p.names.common, oficialDe(p)].some((n) => normalizar(n).includes(buscado)))
    .filter((p) => region === '' || p.region === region);
};

export const ordenarPaises = (lista, orden) =>
  [...lista].sort((a, b) =>
    orden === 'poblacion'
      ? (poblacionDe(b) ?? 0) - (poblacionDe(a) ?? 0)
      : nombreDe(a).localeCompare(nombreDe(b), 'es'));

export const soloFavoritos = (lista, ids) => lista.filter((p) => ids.includes(idDe(p)));
