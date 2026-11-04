// js/app.js · La interfaz: DOM y eventos. Datos en api.js, reglas en logica.js, storage en favoritos.js.
import { obtenerPaises } from './api.js';
import { idDe, nombreDe, oficialDe, poblacionDe, banderaDe, banderaPngDe, altBandera, capitalDe, monedasDe, idiomasDe,
  filtrarPaises, ordenarPaises, soloFavoritos } from './logica.js';
import { leerFavoritos, guardarFavoritos, esFavorito, alternarFavorito } from './favoritos.js';

// Clases COMPLETAS por región (Tailwind solo genera las que encuentra escritas tal cual).
const REGIONES = {
  Africa:    { texto: 'África',   clase: 'bg-amber-100 text-amber-800 dark:bg-amber-900 dark:text-amber-200' },
  Americas:  { texto: 'América',  clase: 'bg-emerald-100 text-emerald-800 dark:bg-emerald-900 dark:text-emerald-200' },
  Asia:      { texto: 'Asia',     clase: 'bg-rose-100 text-rose-800 dark:bg-rose-900 dark:text-rose-200' },
  Europe:    { texto: 'Europa',   clase: 'bg-sky-100 text-sky-800 dark:bg-sky-900 dark:text-sky-200' },
  Oceania:   { texto: 'Oceanía',  clase: 'bg-violet-100 text-violet-800 dark:bg-violet-900 dark:text-violet-200' },
  Antarctic: { texto: 'Antártida', clase: 'bg-slate-200 text-slate-800 dark:bg-slate-700 dark:text-slate-200' },
};
const OTRA = { texto: 'Otra', clase: 'bg-slate-200 text-slate-800 dark:bg-slate-700 dark:text-slate-200' };

const $ = (id) => document.getElementById(id);
const esc = (t) => String(t).replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
const num = (n) => (n == null ? '—' : n.toLocaleString('es-CO'));

// --- Estado de la app: render() siempre dibuja a partir de aquí ---
let paises = [];
let cargando = true;
let error = null;
let favoritos = leerFavoritos();
let vista = 'todos';
const filtros = { texto: '', region: '', orden: 'nombre' };

// Si un país no trae bandera (URL vacía) mostramos un recuadro en vez de una imagen rota.
const SIN_BANDERA = `<div role="img" aria-label="Bandera no disponible" class="flex aspect-[3/2] w-full items-center justify-center bg-slate-200 text-4xl dark:bg-slate-700">🏳️</div>`;
const banderaHTML = (p, extra = '') => banderaDe(p)
  ? `<img src="${esc(banderaDe(p))}" data-png="${esc(banderaPngDe(p))}" alt="${esc(altBandera(p))}" loading="lazy" class="aspect-[3/2] w-full object-cover ${extra}">`
  : SIN_BANDERA;

const tarjetaHTML = (p) => {
  const id = idDe(p);
  const fav = esFavorito(favoritos, id);
  const reg = REGIONES[p.region] ?? OTRA;
  const nombre = esc(nombreDe(p));
  return `
  <article class="group relative flex flex-col overflow-hidden rounded-xl bg-white shadow-md transition hover:-translate-y-1 hover:shadow-xl dark:bg-slate-800">
    <button type="button" data-fav="${id}" aria-pressed="${fav}" aria-label="Marcar ${nombre} como favorito"
      class="absolute top-2 right-2 z-[1] rounded-full bg-white/90 px-2 py-1 text-lg text-rose-600 shadow focus-visible:ring-2 focus-visible:ring-indigo-500 dark:bg-slate-900/90">${fav ? '♥' : '♡'}</button>
    <div class="overflow-hidden">
      ${banderaHTML(p, 'transition group-hover:scale-105')}
    </div>
    <div class="flex flex-1 flex-col gap-1 p-4">
      <h3 class="text-lg font-bold break-words">${nombre}</h3>
      <p class="w-fit rounded-full px-2 py-0.5 text-xs font-medium ${reg.clase}">${reg.texto}</p>
      <p class="text-sm text-slate-500 dark:text-slate-400">Capital: ${esc(capitalDe(p))}</p>
      <p class="text-sm text-slate-500 dark:text-slate-400">${num(poblacionDe(p))} habitantes</p>
      <button type="button" data-id="${id}"
        class="mt-auto rounded-lg bg-indigo-700 px-3 py-2 text-sm font-medium text-white hover:bg-indigo-800 focus-visible:ring-2 focus-visible:ring-indigo-500">Ver detalle</button>
    </div>
  </article>`;
};

const mensaje = (texto, extra = '') =>
  `<div class="col-span-full py-10 text-center"><p class="${extra}">${texto}</p></div>`;

const render = () => {
  $('contador-favs').textContent = favoritos.length;
  document.querySelectorAll('[data-vista]').forEach((b) =>
    b.setAttribute('aria-current', b.dataset.vista === vista ? 'page' : 'false'));

  if (cargando) {
    $('contador').textContent = '';
    $('grilla').innerHTML = mensaje('Cargando países…', 'animate-pulse');
    return;
  }
  if (error) {
    $('contador').textContent = '';
    $('grilla').innerHTML = `<div class="col-span-full py-10 text-center">
      <p class="text-red-700 dark:text-red-400">No pudimos cargar los países (${esc(error)}).</p>
      <button type="button" data-reintentar class="mt-3 rounded-lg bg-indigo-700 px-4 py-2 font-medium text-white hover:bg-indigo-800">Reintentar</button></div>`;
    return;
  }

  const base = vista === 'favoritos' ? soloFavoritos(paises, favoritos) : paises;
  const lista = ordenarPaises(filtrarPaises(base, filtros), filtros.orden);
  $('contador').textContent = `${lista.length} de ${base.length} países`;

  if (lista.length === 0) {
    $('grilla').innerHTML = mensaje(vista === 'favoritos' && favoritos.length === 0
      ? 'Aún no tienes favoritos. Toca el ♡ de cualquier país para guardarlo.'
      : 'Ningún país coincide con tu búsqueda.');
    return;
  }
  $('grilla').innerHTML = lista.map(tarjetaHTML).join('');
};

const cargar = async () => {
  cargando = true; error = null; render();      // pinta "Cargando…" ANTES de esperar
  try {
    paises = await obtenerPaises();
  } catch (e) {
    error = e.message || 'sin conexión';
  } finally {
    cargando = false;                           // bien o mal, ya no estamos cargando
    render();
  }
};

const abrirModal = (id) => {
  const p = paises.find((x) => idDe(x) === id);
  if (!p) return;
  $('modal-bandera').innerHTML = banderaHTML(p);
  $('modal-titulo').textContent = nombreDe(p);
  $('modal-oficial').textContent = oficialDe(p);
  const fila = (k, v) => `<dt class="font-semibold">${k}</dt><dd>${esc(v)}</dd>`;
  $('modal-datos').innerHTML = [
    fila('Región', `${(REGIONES[p.region] ?? OTRA).texto}${p.subregion ? ' · ' + p.subregion : ''}`),
    fila('Capital', capitalDe(p)),
    fila('Población', num(poblacionDe(p))),
    fila('Monedas', monedasDe(p)),
    fila('Idiomas', idiomasDe(p)),
  ].join('');
  $('modal').showModal();                       // fondo, Esc y foco atrapado: gratis
};

// --- Eventos ---
$('btn-menu').addEventListener('click', () => {
  $('menu').classList.toggle('hidden');
  $('btn-menu').setAttribute('aria-expanded', !$('menu').classList.contains('hidden'));
});

document.querySelectorAll('[data-vista]').forEach((b) =>
  b.addEventListener('click', () => {
    vista = b.dataset.vista;
    $('menu').classList.add('hidden');
    $('btn-menu').setAttribute('aria-expanded', 'false');
    render();
  }));

$('form-busqueda').addEventListener('submit', (e) => e.preventDefault());
$('buscador').addEventListener('input', (e) => { filtros.texto = e.target.value; render(); });
$('region').addEventListener('change', (e) => { filtros.region = e.target.value; render(); });
$('orden').addEventListener('change', (e) => { filtros.orden = e.target.value; render(); });

// Delegación: UN solo listener para todo lo que se genera dentro de la grilla.
$('grilla').addEventListener('click', (e) => {
  if (e.target.closest('[data-reintentar]')) return cargar();
  const fav = e.target.closest('[data-fav]');
  if (fav) {
    favoritos = alternarFavorito(favoritos, fav.dataset.fav);
    guardarFavoritos(favoritos);
    return render();
  }
  const det = e.target.closest('[data-id]');
  if (det) abrirModal(det.dataset.id);
});

// Cerrar al hacer clic en el fondo oscuro (el dialog no tiene padding, así que el clic cayó en el ::backdrop).
$('modal').addEventListener('click', (e) => { if (e.target === $('modal')) $('modal').close(); });

// Si una imagen no carga: primero probamos la versión PNG y, si tampoco, mostramos el recuadro.
// El evento "error" de las imágenes no sube por el DOM, por eso se escucha en la fase de captura (true).
document.addEventListener('error', (e) => {
  const img = e.target;
  if (!(img instanceof HTMLImageElement) || img.dataset.png === undefined) return;
  const png = img.dataset.png;
  if (png && img.dataset.intento !== 'png' && img.src !== png) {
    img.dataset.intento = 'png';
    img.src = png;
  } else {
    img.outerHTML = SIN_BANDERA;
  }
}, true);

cargar();
