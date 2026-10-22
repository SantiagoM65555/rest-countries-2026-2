# Explorador de Países

![CI](https://github.com/TU-USUARIO/explorador-interactivo/actions/workflows/ci.yml/badge.svg)

Explorador de países del mundo: búsqueda por nombre, filtro por región, detalle en un modal y favoritos que se recuerdan al recargar.

- **API:** [REST Countries v5](https://restcountries.com/docs/countries), con llave gratuita.
- **Idioma:** nombres de países en español (traducción `spa` de la API).
- **Tecnologías:** HTML semántico, Tailwind CSS v4 (CLI), JavaScript con módulos ES, `fetch` con `async/await` y LocalStorage.

## Scripts
- `npm run dev`: Tailwind en modo watch.
- `npm run build`: genera `css/tailwind.css` minificado (lo usan el CI y Vercel).
- `npm run validar`: valida `index.html` con html-validate.

## Estructura
index.html          HTML semántico
src/entrada.css     entrada de Tailwind
js/config.js        llave y URL base de la API
js/api.js           datos: fetch con paginación
js/logica.js        reglas puras (filtrar, ordenar)
js/favoritos.js     LocalStorage
js/app.js           interfaz: DOM y eventos
docs/               notas de la API y bitácora de IA

## Flujo de trabajo
Todo cambio entra a `main` por rama y Pull Request; el CI (build + validación de HTML) debe estar en verde y Vercel publica una preview por cada PR.
