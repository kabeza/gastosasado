# Gastos Asado — Diseño Técnico

> Estado: **aprobado por el usuario (conversación 2026-08-14)** · Complementa a [2026-08-14-gastosasado-vision.md](2026-08-14-gastosasado-vision.md) (requisitos de producto). Este documento resuelve las secciones "pendientes" de la visión (§9 y §10).

## 1. Stack (decisiones finales)

| Área | Decisión |
|---|---|
| Frontend | **Svelte + Vite** (SPA, mobile-first) |
| PWA | **`vite-plugin-pwa`** (manifest + service worker precache) |
| Backend | **No hay** |
| Base de datos | **`localStorage`** (solo en el dispositivo) |
| Auth | **No hay** |
| Hosting | **Self-hosted**, en subcarpeta `gastosasado/` del dominio |

## 2. Configuración de ruta base (subcarpeta)

- Vite `base` se lee de una variable de entorno: `.env` con `VITE_BASE_PATH=/gastosasado/`.
- `vite.config.js` usa `base: process.env.VITE_BASE_PATH ?? '/'`.
- Todo el código usa rutas **relativas** o `import.meta.env.BASE_URL`; nada hardcodea `/gastosasado/` por dentro.
- Resultado: el usuario edita `.env` (o una variable) antes del build para apuntar a la subcarpeta que quiera, sin tocar código.

## 3. Estructura del proyecto

```
gastosasado/
├── index.html
├── package.json
├── vite.config.js            # base desde env + vite-plugin-pwa
├── .env                      # VITE_BASE_PATH=/gastosasado/
├── .env.example
├── public/
│   ├── icons/                # íconos PWA (192, 512, maskable, apple-touch)
│   └── gastoslogo.png
└── src/
    ├── main.js
    ├── App.svelte            # shell: Header + vista activa + BottomNav
    ├── lib/
    │   ├── storage.js        # lectura/escritura localStorage + prune a 10
    │   ├── store.js          # estado reactivo (evento actual + historial)
    │   ├── liquidacion.js    # reparto, neto, transferencias mínimas, redondeo
    │   └── format.js         # formato ARS (es-AR, 2 decimales)
    ├── components/
    │   ├── Header.svelte
    │   ├── BottomNav.svelte
    │   ├── GastoCard.svelte
    │   └── Asistentes.svelte
    └── views/
        ├── Resumen.svelte      # estado vacío + lista de gastos
        ├── CargarGasto.svelte  # formulario de gasto
        ├── Cuentas.svelte      # liquidación + transferencias
        └── Historial.svelte    # lista de eventos guardados
```

## 4. Modelo de datos (localStorage)

Dos claves:

- **`gastosasado.actual`** — el asado en edición (borrador):
  ```js
  { asistentes: [string], gastos: [Gasto], titulo: string, fecha: string, guardado: boolean }
  ```
- **`gastosasado.historial`** — hasta 10 eventos guardados (más recientes primero):
  ```js
  [ Evento ]
  ```

```js
// Gasto
{
  id: string,             // uuid
  pagador: string,        // nombre del asistente
  concepto: string,       // texto libre "qué compró"
  monto: number,          // en CENTAVOS (entero) — ver §5
  excluidos: string[],    // asistentes que NO participan de este gasto
}

// Evento (guardado)
{
  titulo: string,
  fecha: string,          // 'YYYY-MM-DD' — se fija en el primer guardado
  asistentes: string[],
  gastos: [Gasto],
  transferencias: [{ de: string, a: string, monto: number }] // centavos
}
```

- **Clave única de evento:** `titulo + fecha`. Guardar con la misma clave = sobrescribir.
- **Asistentes:** unión de los `pagador` de los gastos + agregados a mano. No hay registro separado de "agregado a mano" persistido de forma distinta: basta con que `actual.asistentes` contenga nombres; al cargar un gasto con un `pagador` nuevo, se agrega a `asistentes`.

## 5. Reglas de cálculo y redondeo

**Trabajar siempre en centavos (enteros)** para evitar errores de punto flotante. Convertir a pesos solo para mostrar.

1. **Reparto por gasto:** para un gasto de `M` centavos con `k` participantes (`k = asistentes − excluidos`):
   - `base = floor(M / k)`, `resto = M − base*k`.
   - Los primeros `resto` participantes (orden estable) reciben `base+1`; el resto `base`. Así la suma da exactamente `M` (el "centavo que sobra" se reparte).
2. **Balance de cada persona:** `pagado − parte` (en centavos), donde `pagado` es la suma de los gastos que esa persona pagó y `parte` la suma de sus porciones.
   - `balance > 0` → le deben; `balance < 0` → debe.
3. **Transferencias mínimas (greedy):**
   - Deudores (balance < 0) ordenados de mayor deuda a menor; acreedores (balance > 0) de mayor a menor.
   - Repetir: tomar el mayor deudor y el mayor acreedor, transferir `min(|deudor|, acreedor)`, restar, y sacar al que llegue a 0.
   - Para grupos chicos (asado) esto produce la menor cantidad de transferencias en la práctica.
4. **Promedio por persona:** `total / nº asistentes`, solo informativo.

## 6. Flujo de guardado e historial

- **Guardar:** botón "Guardar" junto al campo título en Cuentas (título obligatorio) y se guarda el evento con `fecha = hoy`. Si existe un evento con la misma `titulo + fecha`, se sobrescribe. Una vez guardado, los cambios posteriores de gastos/asistentes actualizan el evento automáticamente (vía `sincronizarGuardado` en el store).
- **Fecha al reabrir:** al abrir un evento guardado, se carga a `actual` **conservando su `titulo` y `fecha` originales**. Al regenerar, se sobrescribe con esa misma clave (no se re-stampa "hoy"). Esto resuelve el caso borde §9 de la visión.
- **Reiniciar:** limpia `gastosasado.actual` y vuelve al estado vacío. No toca `historial`.
- **Historial:** máximo 10; al guardar el 11.º se descarta el más viejo. Borrado individual por evento.

## 7. PWA

- `manifest.json` generado por `vite-plugin-pwa`: nombre **"Gastos Asado"**, short name **"G.Asado"**, theme/background `#301f18`, fondo `#fdfaea`. Ícono de la app: `public/iconoapp.png` (1024×1024), usado también como favicon y apple-touch-icon; se declara en 192, 512 y 1024.
- Service worker (Workbox) precachea los assets estáticos; los datos ya son offline por `localStorage`.
- Requiere **HTTPS** en producción (el hosting del usuario lo da).

## 8. Despliegue (self-hosted)

- `npm run build` → carpeta `dist/`.
- Subir el contenido de `dist/` a la subcarpeta `gastosasado/` del dominio (con `base` ya configurado vía `.env`).
- El usuario ejecuta build, commit y subida; Claude solo indica los pasos (ver CLAUDE.md).
