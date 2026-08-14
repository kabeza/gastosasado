# Gastos Asado — Visión del Proyecto

> Estado: **aprobada por el usuario (conversación del 2026-08-14)** · Este documento es la fuente de verdad del producto. Una sesión nueva debe poder leerlo y construir sin re-preguntar nada.

## 1. Qué es

**Gastos Asado** es una PWA (aplicación web progresiva) **mobile-first** para registrar y liquidar los gastos de un asado. Se usa desde el teléfono, funciona sin backend ni cuenta de usuario, guarda todo en el dispositivo y permite compartir el resultado por WhatsApp.

Problema que resuelve: al final de un asado, alguien pagó la carne, otro la bebida, y no siempre todos consumen lo mismo (el que no toma alcohol no debería pagar la bebida). La app calcula cuánto le corresponde a cada uno y **qué transferencias hay que hacer para que todos queden a mano**, con la menor cantidad de movimientos posible.

## 2. Flujo de uso (de punta a punta)

1. Abrir la app (estado vacío) → tocar "+ Cargar primer gasto".
2. Cargar gastos: **quién pagó**, **qué compró** (texto), **categoría** (opcional), **monto**, y **a quiénes aplica** (todos por defecto, o excluir personas).
3. Ir a "Cuentas" → se genera el resumen y la lista de transferencias, y **se guarda el evento** en el historial (pide título obligatorio; la fecha es automática).
4. Compartir el resumen por WhatsApp (texto formateado con emojis).
5. Desde el historial, volver a un asado anterior, ver su resumen, volver a compartirlo, o borrarlo.
6. "Reiniciar" limpia solo la sesión actual y vuelve al estado vacío; el historial no se toca.

## 3. Alcance y NO-objetivos (YAGNI)

**No se construye** (por decisión explícita del usuario):

- Sin backend, sin base de datos remota, sin cuentas/login/autenticación.
- Sin acceso a los contactos del teléfono.
- Sin presupuesto estimado ni barra de progreso de presupuesto.
- El listado final NO muestra desglose por persona; solo muestra transferencias ("quién le paga a quién y cuánto") + total.
- Sin soporte multiusuario colaborativo (cada dispositivo tiene su propio historial local).
- Sin internacionalización (todo en español de Argentina).

## 4. Modelo de datos (conceptual)

Todo persiste en `localStorage` del navegador.

### Evento (asado)
- `titulo` — obligatorio, se pide al guardar.
- `fecha` — automática, día en que se carga. Se fija **una sola vez** en el primer guardado (ver §9).
- `asistentes` — lista de personas.
- `gastos` — lista de gastos.
- `transferencias` — resultado calculado de la liquidación.
- **Clave única: `titulo + fecha`**. Si se guarda un evento con la misma clave, se sobrescribe (es el mismo evento).

### Asistente (persona)
- `nombre`.
- Surge de los **pagadores** (cada vez que cargás un gasto con un nombre nuevo, se agrega) **más** personas agregadas a mano (invitados que no compraron nada).
- Editable y borrable.

### Gasto
- `pagador` — nombre de quien pagó (obligatorio; debe ser un asistente, nuevo o existente).
- `concepto` — texto libre "qué compró" (ej. "vino y gaseosas").
- `categoria` — **opcional**. Valores fijos: `carne`, `leña`, `ensalada`, `fernet`, `hielo`, `picada`, `pan`, `otros`.
- `monto` — ARS, 2 decimales.
- `aplicaA` — conjunto de asistentes a los que aplica el gasto. Por defecto **todos**; se pueden **excluir** personas (ej. Ana no toma alcohol → excluirla de "bebidas").

### Liquidación (resultado calculado)
- `total` — suma de todos los montos.
- `promedioPorPersona` — `total / cantidad de asistentes` (solo informativo).
- `transferencias` — lista de `{de: nombre, a: nombre, monto}` con la **menor cantidad de movimientos**.

## 5. Reglas de cálculo (liquidación)

1. **Reparto por gasto:** cada gasto se divide en partes iguales entre los asistentes a los que aplica. Ej.: carne $40.000 para 4 personas → $10.000 c/u; bebida $20.000 para 3 → $6.666,67 c/u.
2. **Parte de cada persona:** suma de sus porciones en todos los gastos que le aplican.
3. **Neto:** `pagado − parte`. Positivo = le deben; negativo = debe.
4. **Transferencias mínimas:** emparejar deudores con acreedores para saldar todo con la menor cantidad de movimientos.
5. **Moneda y redondeo:** ARS, 2 decimales. Si una división da decimales infinitos, redondear a centavos y **ajustar la diferencia** (el centavo que sobra) en una de las personas para que la suma cierre exacta.
6. **Promedio por persona:** `total / nº asistentes`, sin considerar exclusiones. Es solo un dato informativo para el resumen y el mensaje de WhatsApp.

## 6. Pantallas y flujo (SPA)

### Shell global
- **Cabecera:** logo grande a la izquierda (imagen de botella / vaso de fernet / fogata + texto "GASTOS ASADO"); título de la sección a la derecha; **ícono de historial en el extremo superior derecho**.
- **Barra de navegación inferior fija**, 4 ítems con ícono y etiqueta: **Resumen · + Gasto · Cuentas · Reiniciar**.

### A. Resumen — estado vacío
- Ilustración central de una parrilla con fuego dentro de un círculo.
- Título "¡El fuego está listo!".
- Subtítulo "Empieza a cargar los gastos del asado para ver el resumen y dividir las cuentas."
- Botón central grande "+ Cargar primer gasto".

### B. Resumen de Gastos — con datos
- Tarjeta oscura superior con "Total Acumulado" y "Por Persona".
- Lista "Últimos Gastos": tarjetas con ícono de categoría, nombre/concepto, quién pagó, monto y etiqueta de categoría.
- (Sin barra de presupuesto.)

### C. Cargar Gasto — formulario
- Selector numérico grande para el monto.
- "¿Quién pagó?": input de búsqueda **entre asistentes ya cargados** + chips de acceso rápido; para uno nuevo se escribe el nombre a mano. **Sin** lectura de contactos del teléfono.
- "¿Qué compró?": input de texto descriptivo.
- Selector de categorías (opcional): botones grandes con íconos — carne, leña, ensalada, fernet, hielo, picada, pan, otros.
- Sección de **aplicación**: todos por defecto; opción de excluir asistentes específicos.
- Botón de acción "Agregar al Ticket" con ícono de flecha.

### D. Cuentas Claras — liquidación
- Tarjeta de resumen: total gastado, cantidad de personas y costo promedio por persona.
- Sección "Transferencias Pendientes": tarjetas blancas con texto grande "Persona A le debe a Persona B" y el monto destacado en rojo.
- "Cuentas saldadas": texto tachado en gris con ícono de check (personas con neto 0).
- Botones: "Compartir por WhatsApp" (verde) y "Reiniciar Evento" (contorno rojo al final).

### Historial (desde el ícono de la cabecera)
- Lista de eventos guardados (últimos 10).
- Seleccionar uno → ver su resumen/transferencias, volver a compartir, o borrarlo.
- Permite borrar eventos individualmente.

## 7. Sistema de diseño

- **Tipografía:** Nunito (sans-serif), pesos variados para jerarquía.
- **Colores:**
  - Fondo: crema muy claro `#fdfaea`.
  - Primario/textos: marrón oscuro `#301f18`.
  - Acento: dorado/ocre `#e4b148`.
  - Deudas/montos negativos: rojo suave.
  - Éxito/WhatsApp: verde `#2ecc71`.
- **Bordes:** esquinas redondeadas de 8–16 px en tarjetas y botones.
- **Iconografía:** íconos de línea minimalistas (Material Symbols o Lucide).
- **Layout:** mobile-first, viewport objetivo 390–430 px. SPA con transiciones suaves entre vistas.
- **Logo:** usar [gastoslogo.png](../../../gastoslogo.png) como referencia de marca.

## 8. Comportamiento y persistencia

- **Persistencia:** `localStorage`. Sin backend.
- **Historial:** máximo **10 eventos** (los más recientes; los más viejos se descartan).
- **Guardado:** ocurre al **generar el resumen/lista de transferencias** (pantalla Cuentas). En ese momento se pide título (obligatorio) y la fecha se toma como el día actual. Se guarda/sobrescribe según la clave `titulo + fecha`.
- **Actualización:** si después se edita/borra un gasto o asistente y se **regenera** el resumen/transferencias, el evento guardado se actualiza (no se duplica).
- **Reiniciar:** limpia solo lo cargado en la sesión actual y vuelve al estado vacío; **no** modifica el historial.
- **Edición/borrado:** todo es editable/borrable en cualquier momento — gastos, asistentes y eventos — con recálculo automático de la liquidación.

## 9. Casos borde y decisiones pendientes

- **Fecha al reabrir un evento viejo:** la fecha es "el día de carga". Si se abre un evento guardado días atrás, se edita y se regenera, tomar "hoy" como fecha cambiaría la clave y crearía un duplicado. **Decisión propuesta (a confirmar en diseño):** la fecha se fija la primera vez que se guarda y se mantiene al reabrir/regenerar.
- **Colisión título + fecha:** si coincide, se asume que es el mismo evento y se sobrescribe (confirmado por el usuario).
- **Ajuste del centavo:** al dividir montos, el redondeo debe repartir la diferencia para que la suma de transferencias cierre exacta (sin perder/generar centavos).

## 10. Decisiones técnicas pendientes (siguiente fase)

Por definir y documentar aparte (ver §del diseño técnico):

- **Frontend:** framework / build tool (vanilla JS vs. framework ligero).
- **PWA:** service worker, manifest, instalación, funcionamiento offline.
- **Hosting:** dónde se sirve la app (hosting estático).
- **Backend/BD:** ya definido — **no hay** (todo `localStorage`).
- **Auth:** ya definido — **no hay**.
