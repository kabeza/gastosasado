import * as storage from './storage.js'

// Estado compartido reactivo (Svelte 5 runes). Se comparte entre todos los
// componentes que lo importan y se persiste en localStorage tras cada cambio.
export const actual = $state(storage.leerActual())
export const historial = $state(storage.leerHistorial())

function guardarActual() {
  storage.guardarActual($state.snapshot(actual))
}

function guardarHistorial() {
  storage.guardarHistorial($state.snapshot(historial))
}

function nuevoId() {
  if (globalThis.crypto?.randomUUID) return globalThis.crypto.randomUUID()
  return `gasto-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`
}

export function agregarAsistente(nombre) {
  const limpio = String(nombre ?? '').trim()
  if (!limpio) return false
  if (actual.asistentes.includes(limpio)) return false
  actual.asistentes.push(limpio)
  guardarActual()
  return true
}

// `gasto.monto` se recibe en centavos (entero).
export function agregarGasto(gasto) {
  const pagador = String(gasto?.pagador ?? '').trim()
  const monto = Math.round(Number(gasto?.monto) || 0)
  if (!pagador || monto <= 0) return false

  const nuevo = {
    id: gasto.id ?? nuevoId(),
    pagador,
    concepto: String(gasto?.concepto ?? '').trim(),
    categoria: gasto?.categoria ?? null,
    monto,
    excluidos: Array.isArray(gasto?.excluidos) ? gasto.excluidos.slice() : []
  }

  actual.gastos.push(nuevo)
  if (!actual.asistentes.includes(pagador)) {
    actual.asistentes.push(pagador)
  }
  guardarActual()
  return true
}

export function reiniciarActual() {
  actual.asistentes = []
  actual.gastos = []
  guardarActual()
}
