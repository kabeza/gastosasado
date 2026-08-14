import * as storage from './storage.js'
import { liquidar } from './liquidacion.js'
import { fechaHoyISO } from './format.js'

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

// Si el evento ya fue guardado, cualquier cambio posterior actualiza el evento
// guardado en el historial (aunque no se comparta por WhatsApp).
function sincronizarGuardado() {
  if (actual.guardado) guardarEvento()
}

export function agregarAsistente(nombre) {
  const limpio = String(nombre ?? '').trim()
  if (!limpio) return false
  if (actual.asistentes.includes(limpio)) return false
  actual.asistentes.push(limpio)
  guardarActual()
  sincronizarGuardado()
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
    monto,
    excluidos: Array.isArray(gasto?.excluidos) ? gasto.excluidos.slice() : []
  }

  actual.gastos.push(nuevo)
  if (!actual.asistentes.includes(pagador)) {
    actual.asistentes.push(pagador)
  }
  guardarActual()
  sincronizarGuardado()
  return true
}

export function editarGasto(id, datos) {
  const idx = actual.gastos.findIndex((g) => g.id === id)
  if (idx < 0) return false

  const pagador = String(datos?.pagador ?? '').trim()
  const monto = Math.round(Number(datos?.monto) || 0)
  if (!pagador || monto <= 0) return false

  const gasto = actual.gastos[idx]
  gasto.pagador = pagador
  gasto.concepto = String(datos?.concepto ?? '').trim()
  gasto.monto = monto
  gasto.excluidos = Array.isArray(datos?.excluidos) ? datos.excluidos.slice() : []

  if (!actual.asistentes.includes(pagador)) {
    actual.asistentes.push(pagador)
  }
  guardarActual()
  sincronizarGuardado()
  return true
}

export function borrarGasto(id) {
  const antes = actual.gastos.length
  actual.gastos = actual.gastos.filter((g) => g.id !== id)
  if (actual.gastos.length === antes) return false
  guardarActual()
  sincronizarGuardado()
  return true
}

export function renombrarAsistente(viejo, nuevo) {
  const v = String(viejo ?? '').trim()
  const n = String(nuevo ?? '').trim()
  if (!v || !n || v === n) return false
  if (actual.asistentes.includes(n)) return false

  const i = actual.asistentes.indexOf(v)
  if (i < 0) return false
  actual.asistentes[i] = n

  for (const g of actual.gastos) {
    if (g.pagador === v) g.pagador = n
    if (Array.isArray(g.excluidos)) {
      const j = g.excluidos.indexOf(v)
      if (j >= 0) g.excluidos[j] = n
    }
  }
  guardarActual()
  sincronizarGuardado()
  return true
}

export function borrarAsistente(nombre) {
  const n = String(nombre ?? '').trim()
  if (!n || !actual.asistentes.includes(n)) return false

  actual.asistentes = actual.asistentes.filter((a) => a !== n)
  actual.gastos = actual.gastos.filter((g) => g.pagador !== n)
  for (const g of actual.gastos) {
    if (Array.isArray(g.excluidos)) {
      g.excluidos = g.excluidos.filter((e) => e !== n)
    }
  }
  guardarActual()
  sincronizarGuardado()
  return true
}

export function reiniciarActual() {
  actual.asistentes = []
  actual.gastos = []
  actual.titulo = ''
  actual.fecha = ''
  actual.guardado = false
  guardarActual()
}

// Guarda el evento actual en el historial (sobrescribe por titulo+fecha).
// Fija la fecha la primera vez y la conserva al regenerar (no se re-stampa).
export function guardarEvento() {
  const titulo = String(actual.titulo ?? '').trim()
  if (!titulo || actual.gastos.length === 0) return false

  actual.guardado = true
  if (!actual.fecha) {
    actual.fecha = fechaHoyISO()
  }
  guardarActual()

  const { transferencias } = liquidar({
    asistentes: actual.asistentes,
    gastos: actual.gastos
  })

  const evento = {
    titulo,
    fecha: actual.fecha,
    asistentes: [...actual.asistentes],
    gastos: actual.gastos.map((g) => ({ ...g })),
    transferencias
  }

  const idx = historial.findIndex((e) => e.titulo === titulo && e.fecha === actual.fecha)
  if (idx >= 0) {
    historial[idx] = evento
  } else {
    historial.unshift(evento)
  }
  if (historial.length > storage.MAX_EVENTOS) {
    historial.splice(storage.MAX_EVENTOS)
  }
  guardarHistorial()
  return true
}

// Carga un evento guardado en `actual` (conserva su titulo y fecha para que al
// regenerar se sobrescriba en el historial y no se duplique).
export function abrirEvento(evento) {
  if (!evento || !Array.isArray(evento.gastos)) return false
  actual.asistentes = Array.isArray(evento.asistentes) ? [...evento.asistentes] : []
  actual.gastos = evento.gastos.map((g) => ({ ...g }))
  actual.titulo = String(evento.titulo ?? '')
  actual.fecha = String(evento.fecha ?? '')
  actual.guardado = true
  guardarActual()
  return true
}

export function borrarEvento(idx) {
  if (idx < 0 || idx >= historial.length) return false
  historial.splice(idx, 1)
  guardarHistorial()
  return true
}
