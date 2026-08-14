const CLAVE_ACTUAL = 'gastosasado.actual'
const CLAVE_HISTORIAL = 'gastosasado.historial'
export const MAX_EVENTOS = 10

function leerJSON(clave, fallback) {
  try {
    const raw = localStorage.getItem(clave)
    if (raw == null) return fallback
    return JSON.parse(raw)
  } catch {
    return fallback
  }
}

function escribirJSON(clave, valor) {
  try {
    localStorage.setItem(clave, JSON.stringify(valor))
    return true
  } catch {
    return false
  }
}

function normalizarActual(a) {
  if (!a || typeof a !== 'object') return { asistentes: [], gastos: [], titulo: '', fecha: '', guardado: false }
  const out = { asistentes: [], gastos: [], titulo: '', fecha: '', guardado: false }
  if (Array.isArray(a.asistentes)) out.asistentes = a.asistentes
  if (Array.isArray(a.gastos)) out.gastos = a.gastos
  if (typeof a.titulo === 'string') out.titulo = a.titulo
  if (typeof a.fecha === 'string') out.fecha = a.fecha
  if (typeof a.guardado === 'boolean') out.guardado = a.guardado
  return out
}

export function leerActual() {
  return normalizarActual(leerJSON(CLAVE_ACTUAL, null))
}

export function guardarActual(actual) {
  return escribirJSON(CLAVE_ACTUAL, actual)
}

export function leerHistorial() {
  const h = leerJSON(CLAVE_HISTORIAL, [])
  return Array.isArray(h) ? h.slice(0, MAX_EVENTOS) : []
}

export function guardarHistorial(historial) {
  const h = Array.isArray(historial) ? historial.slice(0, MAX_EVENTOS) : []
  return escribirJSON(CLAVE_HISTORIAL, h)
}
