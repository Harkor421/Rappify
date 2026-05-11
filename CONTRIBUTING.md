# Contribuir a Rappify

Gracias por tu interés. Este es un proyecto comunitario y open source.

## Antes de empezar

- Lee el [README](./README.md) para entender el alcance.
- Revisa los [issues abiertos](https://github.com) para no duplicar trabajo.
- Para cambios grandes, abre primero un issue para discutir el enfoque.

## Setup local

```bash
git clone <tu-fork>
cd RappiOfertas
npm install
cp .env.example .env.local   # opcional pero recomendado para dev
npm run dev
```

## Estilo de código

- **TypeScript estricto** — sin `any` salvo justificación clara.
- **CSS Modules** — un `<Componente>.module.css` por componente.
- **Sin librerías de UI** pesadas — preferimos vanilla CSS + Framer Motion.
- **Comentarios mínimos** — el código debe explicarse solo. Comenta solo el *por qué* no obvio.
- Antes de un PR:
  ```bash
  npm run typecheck
  npm run lint
  npm run format
  ```

## Estructura de PRs

- Una feature/fix por PR.
- Título descriptivo en presente: `add filtro por categoría`, `fix overflow en mobile`.
- Si afecta UI, incluye screenshot o GIF.

## Áreas donde puedes ayudar

- Mejoras de UI/UX, accesibilidad, animaciones
- Nuevos filtros u órdenes
- Soporte multi-país (otros mercados de Rappi)
- Tests (Vitest)
- Documentación

## Código de conducta

Sé amable. Asume buena fe. Da feedback técnico, no personal.
