# Rappify

Descubre los mejores descuentos de Rappi cerca de ti. Aplicación 100% frontend
— sin backend propio — que consulta directamente la API pública de Rappi desde
el navegador del usuario.

## Características

- Productos en oferta directamente, no solo restaurantes
- Geocoding automático de cualquier dirección en Colombia (OpenStreetMap)
- Detección de ubicación del navegador como atajo
- Caché agresivo en localStorage (5 min para tiendas, 30 min para productos)
- Filtros y orden por % descuento, precio, popularidad, envío gratis, Prime
- Sin backend — desplegable a cualquier hosting estático (Vercel, Netlify, Pages…)
- Tus datos no salen de tu navegador. Cada usuario usa su propio token.
- UI animada y limpia con tema blanco/naranja Rappi

## Empezar

```bash
npm install
cp .env.example .env.local  # opcional: pega tu Bearer/deviceid para dev
npm run dev
```

Abre <http://localhost:3000>. La primera vez te pedirá tus credenciales de
Rappi (botón de ajustes arriba a la derecha) — ver instrucciones en el modal.

## Credenciales

La API de Rappi requiere un token de sesión por usuario. Cómo obtenerlo:

1. Abre [rappi.com.co](https://www.rappi.com.co) e inicia sesión.
2. Abre DevTools (`F12`) → pestaña **Network**.
3. Refresca y filtra por `filters/`.
4. Click en cualquier request → en **Headers** copia:
   - `authorization` (empieza con `Bearer ft.…`)
   - `deviceid` (UUID)
5. Pégalos en el botón de ajustes de la app — se guardan **solo en tu navegador**.

## Stack

| Capa | Herramienta |
| --- | --- |
| Bundler | [Vite 5](https://vite.dev) |
| UI | [React 18](https://react.dev) + TypeScript estricto |
| Animaciones | [Framer Motion](https://www.framer.com/motion/) |
| Iconos | [Lucide React](https://lucide.dev) |
| Estilos | CSS Modules + variables CSS |
| Geocoding | [Nominatim (OSM)](https://nominatim.openstreetmap.org) |
| Lint/Format | ESLint + Prettier |

## Estructura

```
src/
├── api/              cliente Rappi, geocode, cache (localStorage), credenciales
├── components/       Hero, ProductCard, ProductGrid, Toolbar, SettingsModal, …
├── hooks/            useProducts, useDebounce
├── types/            tipos de la API de Rappi
├── utils/            format, concurrency
├── styles/           tokens.css (design tokens), global.css
├── config.ts         endpoints, TTLs, defaults
└── App.tsx           composición
```

## Contribuir

Ver [CONTRIBUTING.md](./CONTRIBUTING.md).

```bash
npm run dev          # dev server
npm run typecheck    # verificación de tipos
npm run lint         # ESLint
npm run format       # Prettier
npm run build        # build de producción a dist/
```

## Aviso

Este proyecto no está afiliado a, patrocinado por, ni endosado por Rappi. Es
una herramienta de exploración personal de su API pública. Úsalo bajo tu propia
responsabilidad y respetando los términos de uso de Rappi.

## Licencia

[MIT](./LICENSE)
