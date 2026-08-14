// Liquidación del asado. Todo en CENTAVOS (enteros) para evitar errores de
// punto flotante. Pura: recibe asistentes/gastos y devuelve el resultado,
// sin tocar el estado.

// - `asistentes`: string[] (puede incluir personas que no hicieron ningún gasto).
// - `gastos`: [{ pagador, monto, excluidos: string[] }] — `excluidos` son los
//   asistentes que NO participan de ese gasto.
export function liquidar({ asistentes, gastos }) {
  const partes = new Map()
  const pagado = new Map()

  for (const nombre of asistentes) {
    partes.set(nombre, 0)
    pagado.set(nombre, 0)
  }

  for (const g of gastos) {
    const monto = Math.round(Number(g.monto) || 0)
    if (monto <= 0) continue

    pagado.set(g.pagador, (pagado.get(g.pagador) ?? 0) + monto)

    const excluidos = new Set(g.excluidos ?? [])
    const k = asistentes.filter((n) => !excluidos.has(n))
    if (k.length === 0) continue

    // Reparto exacto: base = floor(monto/k); los primeros `resto` llevan +1.
    const base = Math.floor(monto / k.length)
    const resto = monto - base * k.length
    k.forEach((nombre, i) => {
      partes.set(nombre, (partes.get(nombre) ?? 0) + base + (i < resto ? 1 : 0))
    })
  }

  const total = gastos.reduce((s, g) => s + (Math.round(Number(g.monto) || 0)), 0)

  const balances = []
  for (const nombre of asistentes) {
    balances.push({ nombre, balance: (pagado.get(nombre) ?? 0) - (partes.get(nombre) ?? 0) })
  }

  return { total, balances, transferencias: transferenciasMinimas(balances) }
}

// Greedy: empareja deudores con acreedores de mayor a menor para saldar todo
// con la menor cantidad de movimientos.
function transferenciasMinimas(balances) {
  const deudores = []
  const acreedores = []
  for (const { nombre, balance } of balances) {
    if (balance < 0) deudores.push({ nombre, deuda: -balance })
    else if (balance > 0) acreedores.push({ nombre, credito: balance })
  }
  deudores.sort((a, b) => b.deuda - a.deuda)
  acreedores.sort((a, b) => b.credito - a.credito)

  const transferencias = []
  let i = 0
  let j = 0
  while (i < deudores.length && j < acreedores.length) {
    const monto = Math.min(deudores[i].deuda, acreedores[j].credito)
    transferencias.push({ de: deudores[i].nombre, a: acreedores[j].nombre, monto })
    deudores[i].deuda -= monto
    acreedores[j].credito -= monto
    if (deudores[i].deuda === 0) i++
    if (acreedores[j].credito === 0) j++
  }
  return transferencias
}
