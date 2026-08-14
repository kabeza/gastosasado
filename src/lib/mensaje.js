// Construye el mensaje de WhatsApp a partir de un evento (actual o guardado).
import { formatearARS, formatearFecha, fechaHoyISO } from './format.js'

export function construirMensaje({ titulo, fecha, gastos, asistentes, transferencias }) {
  const fechaStr = formatearFecha(fecha || fechaHoyISO())
  const total = (gastos || []).reduce((s, g) => s + (g.monto || 0), 0)
  const n = asistentes?.length || 0
  const promedio = n > 0 ? Math.round(total / n) : 0

  const lineas = [`🍖 ${titulo} — ${fechaStr}`]

  lineas.push('', 'Gastos')
  for (const g of gastos || []) {
    lineas.push(`· ${g.concepto || 'Gasto'} — ${g.pagador}: ${formatearARS(g.monto)}`)
  }

  lineas.push('', `Total de gastos = ${formatearARS(total)}`)
  lineas.push(`Gasto (promedio) por persona = ${formatearARS(promedio)}`)

  lineas.push('', 'Transferencias Pendientes')
  if (transferencias?.length > 0) {
    for (const t of transferencias) {
      lineas.push(`· ${t.de} le debe a ${t.a}: ${formatearARS(t.monto)}`)
    }
  } else {
    lineas.push('✅ Cuentas saldadas')
  }

  return lineas.join('\n')
}
