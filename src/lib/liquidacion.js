import { formatearARS } from './format.js'

// Liquidación del asado. Todo en CENTAVOS (enteros) para evitar errores de
// punto flotante. Pura: recibe asistentes/gastos y devuelve el resultado,
// sin tocar el estado.

// - `asistentes`: string[] (puede incluir personas que no hicieron ningún gasto).
// - `gastos`: [{ pagador, monto, excluidos: string[] }] — `excluidos` son los
//   asistentes que NO participan de ese gasto.
// - `traza`: booleano opcional. Si es true, devuelve `traza` (string[]) con el
//   paso a paso del cálculo, para depurar la pantalla de Cuentas.
export function liquidar({ asistentes, gastos, traza = false }) {
  const log = traza ? [] : null
  const partes = new Map()
  const pagado = new Map()

  for (const nombre of asistentes) {
    partes.set(nombre, 0)
    pagado.set(nombre, 0)
  }

  let nGasto = 0
  for (const g of gastos) {
    const monto = Math.round(Number(g.monto) || 0)
    if (monto <= 0) continue
    nGasto++

    pagado.set(g.pagador, (pagado.get(g.pagador) ?? 0) + monto)

    const excluidos = new Set(g.excluidos ?? [])
    const k = asistentes.filter((n) => !excluidos.has(n))
    if (k.length === 0) continue

    // Reparto exacto: base = floor(monto/k); los primeros `resto` llevan +1.
    const base = Math.floor(monto / k.length)
    const resto = monto - base * k.length
    const cuotas = []
    k.forEach((nombre, i) => {
      const cuota = base + (i < resto ? 1 : 0)
      partes.set(nombre, (partes.get(nombre) ?? 0) + cuota)
      cuotas.push(`${nombre} ${formatearARS(cuota)}`)
    })

    if (log) {
      log.push(`Gasto ${nGasto}: ${g.pagador} pagó ${formatearARS(monto)}`)
      log.push(`  Participan: ${k.join(', ')}${excluidos.size ? ` (excluidos: ${[...excluidos].join(', ')})` : ''}`)
      log.push(`  Reparto (base ${formatearARS(base)}${resto ? ` + ${resto}×$0,01` : ''}): ${cuotas.join(' · ')}`)
    }
  }

  const total = gastos.reduce((s, g) => s + (Math.round(Number(g.monto) || 0)), 0)

  const balances = []
  for (const nombre of asistentes) {
    const balance = (pagado.get(nombre) ?? 0) - (partes.get(nombre) ?? 0)
    balances.push({ nombre, balance })
    if (log) {
      log.push(`Balance ${nombre}: pagó ${formatearARS(pagado.get(nombre) ?? 0)} − parte ${formatearARS(partes.get(nombre) ?? 0)} = ${balance > 0 ? '+' : ''}${formatearARS(balance)}`)
    }
  }

  const { transferencias, detalle } = transferenciasMinimas(balances, log)
  if (log) log.push(...detalle)

  const resultado = { total, balances, transferencias }
  if (log) resultado.traza = log
  return resultado
}

// Greedy: empareja deudores con acreedores de mayor a menor para saldar todo
// con la menor cantidad de movimientos.
function transferenciasMinimas(balances, log = null) {
  const deudores = []
  const acreedores = []
  for (const { nombre, balance } of balances) {
    if (balance < 0) deudores.push({ nombre, deuda: -balance })
    else if (balance > 0) acreedores.push({ nombre, credito: balance })
  }
  deudores.sort((a, b) => b.deuda - a.deuda)
  acreedores.sort((a, b) => b.credito - a.credito)

  const detalle = []
  if (log) {
    detalle.push(
      `Deudores (mayor→menor): ${deudores.map((d) => `${d.nombre} ${formatearARS(d.deuda)}`).join(', ') || '—'}`
    )
    detalle.push(
      `Acreedores (mayor→menor): ${acreedores.map((c) => `${c.nombre} ${formatearARS(c.credito)}`).join(', ') || '—'}`
    )
  }

  const transferencias = []
  let i = 0
  let j = 0
  let paso = 0
  while (i < deudores.length && j < acreedores.length) {
    const monto = Math.min(deudores[i].deuda, acreedores[j].credito)
    transferencias.push({ de: deudores[i].nombre, a: acreedores[j].nombre, monto })
    deudores[i].deuda -= monto
    acreedores[j].credito -= monto
    paso++
    if (log) {
      const restante = acreedores[j].credito
      detalle.push(
        `${paso}) ${deudores[i].nombre} → ${acreedores[j].nombre} ${formatearARS(monto)}` +
          (restante > 0 ? ` (le queda cobrar ${formatearARS(restante)})` : ' (saldado)')
      )
    }
    if (deudores[i].deuda === 0) i++
    if (acreedores[j].credito === 0) j++
  }

  if (log) {
    const suma = transferencias.reduce((s, t) => s + t.monto, 0)
    detalle.push(`Suma de transferencias: ${formatearARS(suma)}`)
  }

  return { transferencias, detalle }
}
