# CLAUDE.md

## Proyecto

**Gastos Asado** — PWA mobile-first para cargar y liquidar los gastos de un asado. Persistencia 100% en `localStorage`; sin backend ni autenticación.

- Visión y requisitos completos: [docs/superpowers/specs/2026-08-14-gastosasado-vision.md](docs/superpowers/specs/2026-08-14-gastosasado-vision.md)
- Principios de implementación: [AGENTS.md](AGENTS.md)

## Stack

- Svelte + Vite
- `vite-plugin-pwa` (service worker + manifest)
- Sin backend · sin base de datos remota · sin auth

## Reglas de operación (críticas)

- **Solo el usuario ejecuta** commits, builds, compilaciones, instalaciones de dependencias y despliegues.
- **Claude solo indica qué hacer**: da pasos, comandos y configuraciones. Claude no ejecuta `git`, `npm install`, `npm run build`, ni despliega.

## Despliegue

- Self-hosted, en una **subcarpeta** del dominio propio (`/gastosasado/`, definida en `.env` → `VITE_BASE_PATH`).
- `base` de Vite se toma de `VITE_BASE_PATH`; si cambia la subcarpeta, editar `.env` y rebuildear.
- **Cache / actualización PWA** (importante para que la app instalada se actualice sola):
  - Service worker: `registerType: 'autoUpdate'` + `registerSW({ immediate: true })` en `src/main.js`. Cada build regenera `sw.js` con manifest de precache nuevo.
  - Navegaciones: `NetworkFirst` (vite.config.js → `workbox.runtimeCaching`). Online = red primero; offline = fallback a `index.html` cacheado.
  - Cabeceras del server: `index.html` y `sw.js` deben servirse con `Cache-Control: no-cache`; `assets/*.js|css` con `max-age=31536000, immutable`. Ver [public/.htaccess](public/.htaccess) (Apache) y [docs/cache-nginx.md](docs/cache-nginx.md) (nginx).
