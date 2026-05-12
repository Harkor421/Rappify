<div align="center">

<img src="./public/logo.png" alt="Rappify" width="160" />

# Rappify

**Encuentra los mejores descuentos de Rappi cerca de ti.**
App 100% frontend, sin backend, open source.

[![License: MIT](https://img.shields.io/badge/License-MIT-orange.svg)](./LICENSE)
[![TypeScript](https://img.shields.io/badge/TypeScript-strict-3178C6?logo=typescript&logoColor=white)](https://www.typescriptlang.org/)
[![React](https://img.shields.io/badge/React-18-61DAFB?logo=react&logoColor=black)](https://react.dev)
[![Vite](https://img.shields.io/badge/Vite-5-646CFF?logo=vite&logoColor=white)](https://vite.dev)
[![No Backend](https://img.shields.io/badge/no--backend-22c55e)](#-arquitectura)
[![PRs Welcome](https://img.shields.io/badge/PRs-welcome-FF441F.svg)](./CONTRIBUTING.md)

[**rappify.co**](https://rappify.co) · [Repo](https://github.com/Harkor421/Rappify) · [Reportar bug](https://github.com/Harkor421/Rappify/issues)

</div>

---

## Características

- **Productos en oferta directamente** (no solo restaurantes), ordenados por % descuento
- **Filtro por categoría** — Hamburguesa, Sushi, Pizza, Mexicana, Pollo, y 25+ más
- **Geocoding** de cualquier dirección en Colombia (OpenStreetMap)
- **Detección de ubicación** del navegador como atajo
- **Caché en localStorage** — apertura instantánea, banner cuando data tiene más de 5 min
- **Sin backend** — desplegable a cualquier hosting estático (Vercel, Netlify, Pages…)
- **Tus datos no salen** de tu navegador. Cada usuario usa su propio token.
- **UI animada** con tema blanco / naranja Rappi y dot grid reactivo al cursor

## Quick start

```bash
git clone https://github.com/Harkor421/Rappify.git
cd RappiOfertas
npm install
npm run dev
```

Abre <http://localhost:3000> y listo — Rappify viene con un **token público de
demo** ya cableado, así que funciona sin configuración adicional.

## Credenciales

Por defecto la app usa una **cuenta pública compartida** definida en
[`src/config.ts`](./src/config.ts). Si prefieres usar tu propia cuenta:

**A) Desde la UI (recomendado)** — click en el ícono de ajustes arriba a la
derecha y pega tu `authorization` y `deviceid`. Se guardan **solo en tu
navegador** (localStorage).

**B) Variables de entorno (dev)** — crea un `.env.local` en la raíz:

```env
VITE_RAPPI_AUTH=Bearer ft.…
VITE_RAPPI_DEVICEID=tu-uuid
```

**Cómo obtener un token propio:**

1. Abre [rappi.com.co](https://www.rappi.com.co) e inicia sesión.
2. Abre DevTools (`F12`) → pestaña **Network**.
3. Refresca y filtra por `filters/`.
4. Click en cualquier request → en **Headers** copia `authorization` y `deviceid`.

## Stack

| Capa            | Herramienta                                                            |
| --------------- | ---------------------------------------------------------------------- |
| Bundler         | [Vite 5](https://vite.dev)                                             |
| UI              | [React 18](https://react.dev) + TypeScript estricto                    |
| Animaciones     | [Framer Motion](https://www.framer.com/motion/)                        |
| Iconos          | [Lucide React](https://lucide.dev)                                     |
| Estilos         | CSS Modules + design tokens (`tokens.css`)                             |
| Geocoding       | [Nominatim (OSM)](https://nominatim.openstreetmap.org)                 |
| Lint / Format   | ESLint + Prettier                                                      |

## Arquitectura

Frontend puro. Sin backend, sin base de datos, sin servidor de auth.
Las llamadas se hacen directamente desde el navegador a la API de Rappi
(que tiene CORS abierto), y la caché vive en `localStorage`.

```
[Browser] ──► api.rappi.com (catalog, brands)
[Browser] ──► nominatim.openstreetmap.org (geocoding)
[Browser] ── localStorage (cache + creds + ubicación guardada)
```

```
src/
├── api/              cliente Rappi, geocode, cache, credenciales
├── components/       Hero, ProductCard, ProductGrid, Toolbar,
│                     SettingsModal, StaleBanner, BackgroundDots, …
├── hooks/            useProducts, useDebounce
├── types/            tipos de la API de Rappi
├── utils/            format, concurrency
├── styles/           tokens.css (design tokens), global.css
├── config.ts         endpoints, TTLs, credenciales por defecto
└── App.tsx           composición
```

## Scripts

```bash
npm run dev          # Vite dev server con HMR
npm run typecheck    # TypeScript strict
npm run lint         # ESLint
npm run format       # Prettier
npm run build        # Build a dist/
npm run preview      # Sirve dist/ local
```

## Contribuir

PRs bienvenidos. Lee [CONTRIBUTING.md](./CONTRIBUTING.md) para empezar.

Áreas donde puedes ayudar:

- Mejoras de UI / UX / accesibilidad
- Nuevos filtros u órdenes
- Soporte multi-país (otros mercados de Rappi)
- Tests (Vitest)
- Optimizaciones de performance
- Documentación

## Aviso

> Rappify **no está afiliado a, patrocinado por, ni endosado por Rappi**.
> Es una herramienta open source para explorar su API pública.
> Úsalo bajo tu propia responsabilidad y respetando los términos de uso de Rappi.

## Licencia

[MIT](./LICENSE) — haz fork, modifica, despliega, comparte.

<div align="center">

⭐ Si te gusta el proyecto, dale una estrella en [GitHub](https://github.com/Harkor421/Rappify)

</div>
