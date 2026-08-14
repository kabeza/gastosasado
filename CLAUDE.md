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

- Self-hosted, en una **subcarpeta** del dominio propio.
- Requiere configurar `base` en Vite a esa subcarpeta (valor pendiente de definir con el usuario).
