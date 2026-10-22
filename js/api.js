import { API_KEY, BASE_URL } from "./config.js";

const CAMPOS = [
  "names.common",
  "names.official",
  "names.translations",
  "codes.alpha_3",
  "capitals",
  "flag.url_svg",
  "flag.description",
  "population",
  "region",
  "subregion",
  "currencies",
  "languages",
].join(",");
const URL_PAISES = `${BASE_URL}?response_fields=${CAMPOS}&limit=100`;

export const pedirJSON = async (url) => {
  const respuesta = await fetch(url, {
    headers: { Authorization: `Bearer ${API_KEY}` },
  }); // 1.ª espera
  if (!respuesta.ok) {
    let detalle = "";
    try {
      detalle = (await respuesta.json()).errors?.[0]?.message ?? "";
    } catch {
      /* sin cuerpo JSON */
    }
    throw new Error(
      `Error HTTP ${respuesta.status}${detalle ? ": " + detalle : ""}`,
    );
  }
  return respuesta.json();
};

const CLAVE_CACHE = "explorador-paises:cache-v5-es";
const leerCache = () => {
  try {
    return JSON.parse(sessionStorage.getItem(CLAVE_CACHE) ?? "null");
  } catch {
    return null;
  }
};
const guardarCache = (lista) => {
  try {
    sessionStorage.setItem(CLAVE_CACHE, JSON.stringify(lista));
  } catch {
    /* sin espacio */
  }
};

const reducir = (p) => ({
  ...p,
  names: {
    common: p.names?.common,
    official: p.names?.official,
    spa: p.names?.translations?.spa ?? null,
  },
});

export const obtenerPaises = async () => {
  const guardado = leerCache();
  if (Array.isArray(guardado) && guardado.length > 0) return guardado;

  const todos = [];
  let offset = 0;
  let hayMas = true;
  while (hayMas) {
    const { data } = await pedirJSON(`${URL_PAISES}&offset=${offset}`);
    todos.push(...data.objects.map(reducir));
    offset += data.meta.count;
    hayMas = data.meta.more && data.meta.count > 0;
  }
  guardarCache(todos);
  return todos;
};
