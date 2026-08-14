<div align="center">

<img src="gastoslogo.png" alt="Gastos Asado" width="120" />

# 🔥 Gastos Asado

**Cargá, dividí y liquidá los gastos del asado sin dramas.**

PWA mobile-first, offline y sin backend. Cada uno paga lo justo, las transferencias se calculan solas y el resumen se comparte por WhatsApp con un toque.

[![Svelte 5](https://img.shields.io/badge/Svelte-5-FF3E00?logo=svelte&logoColor=white)](https://svelte.dev)
[![Vite](https://img.shields.io/badge/Vite-6-646CFF?logo=vite&logoColor=white)](https://vitejs.dev)
[![PWA](https://img.shields.io/badge/PWA-offline-5A0FC8?logo=pwa&logoColor=white)](https://web.dev/progressive-web-apps/)
[![Sin backend](https://img.shields.io/badge/backend-ninguno-2ea44f)]()
[![localStorage](https://img.shields.io/badge/datos-localStorage-444444)]()

</div>

---

## ✨ Qué hace

| | |
|---|---|
| 👥 **Asistentes** | Cargá quiénes van (nombre + Enter). Se pueden agregar, renombrar o quitar en cualquier momento. |
| 💸 **Cargar gastos** | Quién pagó, qué compró y cuánto. Enter para agregar y seguís cargando de corrido. Excluí a quien no participa de un gasto. |
| 📊 **Resumen** | Total acumulado y por persona al instante. Editá o borrá cualquier gasto. |
| ⚖️ **Cuentas** | Liquidación automática: quién le debe cuánto a quién, con la **mínima cantidad de transferencias**. |
| 📤 **Compartir** | Resumen listo para WhatsApp, en texto o como **imagen**. |
| 🗂️ **Historial** | Todos los asados guardados. Abrí, compartí o borrá. |
| 📱 **Instalable** | PWA: se instala en el teléfono, funciona **offline** y se **auto-actualiza**. |
| 🌗 **Tema** | Claro / oscuro automático. |

## 🧮 Cómo liquida

Todo en centavos (enteros) para evitar errores de punto flotante.

1. **Reparto exacto** — cada gasto se divide entre quienes participan: `base = ⌊monto / k⌋` y los centavos sobrantes van a los primeros.
2. **Balance** — `balance = lo que pagó − lo que le corresponde`.
3. **Transferencias mínimas** — se emparejan deudores y acreedores de mayor a menor (greedy), así se salda todo con la menor cantidad de movimientos.

> La suma de transferencias no es el total gastado: es el dinero que realmente cambia de manos (total menos la parte de quien ya pagó).

## 🛠️ Stack

- **Svelte 5** (runes) + **Vite**
- **vite-plugin-pwa** — service worker + manifest
- 100% cliente: `localStorage`, sin backend, sin base de datos, sin auth

## 🚀 Desarrollo

```bash
npm install
npm run dev
```

## 📦 Build y despliegue

Se sirve en una subcarpeta del dominio propio (definida en `.env`):

```bash
# .env
VITE_BASE_PATH=/gastosasado/

npm run build   # genera dist/
```

La PWA se auto-actualiza: cada build regenera el service worker y la app instalada recarga sola al detectar cambios. Para que cargue siempre sin caché, el server debe servir `index.html` y `sw.js` con `no-cache` y los assets hasheados con `immutable`:

- **Apache** — `public/.htaccess` (se copia solo a `dist/`)
- **nginx** — ver [docs/cache-nginx.md](docs/cache-nginx.md)

## 📁 Estructura

```
src/
├── views/          # Pantallas: Resumen, CargarGasto, Cuentas, Historial
├── components/     # Header, BottomNav, Asistentes, GastoCard
└── lib/            # liquidación, store, formato, imágenes, mensajes
```
