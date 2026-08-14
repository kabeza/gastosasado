const formatoARS = new Intl.NumberFormat('es-AR', {
  style: 'currency',
  currency: 'ARS',
  minimumFractionDigits: 2,
  maximumFractionDigits: 2
})

// centavos (entero) -> string ARS, ej. 1666667 -> "$ 16.666,67"
export function formatearARS(centavos) {
  const valor = Number(centavos) || 0
  const negativo = valor < 0
  const s = formatoARS.format(Math.abs(valor) / 100)
  return negativo ? `-${s}` : s
}

// centavos -> pesos (number)
export function centavosAPesos(centavos) {
  return (Number(centavos) || 0) / 100
}

// pesos (number) -> centavos enteros (redondea al centavo)
export function pesosACentavos(pesos) {
  return Math.round((Number(pesos) || 0) * 100)
}

// texto -> centavos enteros. Acepta "1500", "1500,50", "1500.50", "1.500,50".
export function parsePesos(texto) {
  let s = String(texto ?? '').trim().replace(/\s/g, '').replace(/[$]/g, '')
  if (!s) return 0

  let decimal = null
  if (s.includes(',') && s.includes('.')) decimal = ','
  else if (s.includes(',')) decimal = ','
  else if (s.includes('.')) decimal = '.'

  if (decimal) {
    const [entero, dec] = s.split(decimal)
    const enteroLimpio = entero.replace(/[.,]/g, '')
    const decLimpio = (dec || '').replace(/\D/g, '').slice(0, 2).padEnd(2, '0')
    s = `${enteroLimpio || '0'}.${decLimpio}`
  } else {
    s = s.replace(/[.,]/g, '')
  }

  const n = parseFloat(s)
  return Number.isFinite(n) ? Math.round(n * 100) : 0
}
