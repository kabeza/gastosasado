// Genera una imagen (PNG vía canvas) con el resumen del asado, para compartir.
import { NOMBRE_APP, VERSION, DESARROLLADOR } from './meta.js'
import { formatearARS } from './format.js'

const ANCHO = 1080
const PAD = 72
const CREMA = '#fdfaea'
const MARRON = '#301f18'
const OCRE = '#e4b148'
const ROJO = '#e5504d'
const GRIS = 'rgba(48, 31, 24, 0.12)'
const TEXTO_SUAVE = '#8a7465'
const VERDE = '#2ecc71'

function fuente(px, negrita = false) {
  return `${negrita ? '700' : '400'} ${px}px Nunito, system-ui, sans-serif`
}

function envolver(ctx, texto, maxAncho) {
  const palabras = String(texto).split(/\s+/)
  const lineas = []
  let linea = ''
  for (const palabra of palabras) {
    const prueba = linea ? `${linea} ${palabra}` : palabra
    if (ctx.measureText(prueba).width > maxAncho && linea) {
      lineas.push(linea)
      linea = palabra
    } else {
      linea = prueba
    }
  }
  if (linea) lineas.push(linea)
  return lineas
}

function cargarLogo(src) {
  return new Promise((resolve) => {
    const img = new Image()
    img.onload = () => resolve(img)
    img.onerror = () => resolve(null)
    img.src = src
  })
}

export async function generarImagenResumen({ titulo, fecha, gastos, total, promedio, transferencias }) {
  const canvas = document.createElement('canvas')
  const ctx = canvas.getContext('2d')
  canvas.width = ANCHO

  const anchoContenido = ANCHO - PAD * 2
  const ops = []
  let y = 0

  const agregarTexto = (texto, px, negrita, color, { x = PAD, maxAncho = anchoContenido, lh, alinear = 'left', extra = 0 } = {}) => {
    ctx.font = fuente(px, negrita)
    for (const linea of envolver(ctx, texto, maxAncho)) {
      ops.push({ tipo: 'texto', x, y, texto: linea, px, negrita, color, alinear })
      y += lh
    }
    y += extra
  }

  const agregarLinea = (color = GRIS, { x = PAD, ancho = anchoContenido, grosor = 2, espacio = 24 } = {}) => {
    ops.push({ tipo: 'linea', x, y, x2: x + ancho, color, grosor })
    y += espacio
  }

  const saltar = (px) => { y += px }

  saltar(PAD)

  // Header: logo (proporción original) + nombre de la app centrado verticalmente
  const logo = await cargarLogo('gastoslogo.png')
  const logoAlto = 120
  let logoAncho = 0
  if (logo) {
    logoAncho = Math.round((logo.width / logo.height) * logoAlto)
    ops.push({ tipo: 'imagen', img: logo, x: PAD, y, w: logoAncho, h: logoAlto })
  }

  const pxApp = 52
  const altoApp = 64
  const altoHeader = Math.max(logoAlto, altoApp)
  const tituloX = PAD + logoAncho + (logoAncho ? 28 : 0)
  ops.push({
    tipo: 'texto',
    x: tituloX,
    y: y + (altoHeader - altoApp) / 2,
    texto: NOMBRE_APP.toUpperCase(),
    px: pxApp,
    negrita: true,
    color: MARRON,
    alinear: 'left'
  })
  y += altoHeader

  agregarLinea(OCRE, { grosor: 3 })
  saltar(12)

  agregarTexto(titulo, 60, true, MARRON, { lh: 74 })
  agregarTexto(fecha, 28, false, TEXTO_SUAVE, { lh: 40 })
  saltar(8)

  // Gastos
  agregarTexto('Gastos', 40, true, OCRE, { lh: 52 })
  agregarLinea(GRIS)
  saltar(4)

  for (const g of gastos) {
    const monto = formatearARS(g.monto)
    ctx.font = fuente(32, true)
    const montoAncho = ctx.measureText(monto).width
    const maxIzq = anchoContenido - montoAncho - 28
    ctx.font = fuente(32, false)
    const lineas = envolver(ctx, `${g.concepto || 'Gasto'} — ${g.pagador}`, maxIzq)
    const lhItem = 46
    lineas.forEach((l, i) => {
      ops.push({ tipo: 'texto', x: PAD, y, texto: l, px: 32, negrita: false, color: MARRON, alinear: 'left' })
      if (i === 0) ops.push({ tipo: 'texto', x: PAD + anchoContenido, y, texto: monto, px: 32, negrita: true, color: MARRON, alinear: 'right' })
      y += lhItem
    })
  }
  saltar(8)

  // Totales
  agregarTexto(`Total de gastos = ${formatearARS(total)}`, 36, true, MARRON, { lh: 50 })
  agregarTexto(`Gasto (promedio) por persona = ${formatearARS(promedio)}`, 36, true, MARRON, { lh: 50 })
  saltar(8)

  // Transferencias
  agregarTexto('Transferencias Pendientes', 40, true, OCRE, { lh: 52 })
  agregarLinea(GRIS)
  saltar(4)

  if (transferencias.length > 0) {
    for (const t of transferencias) {
      const monto = formatearARS(t.monto)
      ctx.font = fuente(32, true)
      const montoAncho = ctx.measureText(monto).width
      const maxIzq = anchoContenido - montoAncho - 28
      ctx.font = fuente(32, false)
      const lineas = envolver(ctx, `${t.de} le debe a ${t.a}`, maxIzq)
      const lhItem = 46
      lineas.forEach((l, i) => {
        ops.push({ tipo: 'texto', x: PAD, y, texto: l, px: 32, negrita: false, color: MARRON, alinear: 'left' })
        if (i === 0) ops.push({ tipo: 'texto', x: PAD + anchoContenido, y, texto: monto, px: 32, negrita: true, color: ROJO, alinear: 'right' })
        y += lhItem
      })
    }
  } else {
    agregarTexto('Cuentas saldadas', 32, false, VERDE, { lh: 46 })
  }
  saltar(20)

  // Footer
  agregarLinea(GRIS, { grosor: 1, espacio: 20 })
  agregarTexto(`Desarrollado por ${DESARROLLADOR} · v${VERSION}`, 26, false, TEXTO_SUAVE, {
    x: ANCHO / 2,
    maxAncho: anchoContenido,
    lh: 38,
    alinear: 'center'
  })
  saltar(PAD)

  // Dibujar
  canvas.height = Math.round(y)
  ctx.textBaseline = 'top'
  ctx.fillStyle = CREMA
  ctx.fillRect(0, 0, ANCHO, canvas.height)

  for (const op of ops) {
    if (op.tipo === 'texto') {
      ctx.font = fuente(op.px, op.negrita)
      ctx.fillStyle = op.color
      ctx.textAlign = op.alinear
      ctx.fillText(op.texto, op.x, op.y)
    } else if (op.tipo === 'linea') {
      ctx.strokeStyle = op.color
      ctx.lineWidth = op.grosor
      ctx.beginPath()
      ctx.moveTo(op.x, op.y)
      ctx.lineTo(op.x2, op.y)
      ctx.stroke()
    } else if (op.tipo === 'imagen') {
      ctx.drawImage(op.img, op.x, op.y, op.w, op.h)
    }
  }

  return await new Promise((resolve) => {
    canvas.toBlob((blob) => {
      resolve(new File([blob], 'gastos-asado.png', { type: 'image/png' }))
    }, 'image/png')
  })
}

export async function compartirImagen(file) {
  try {
    if (navigator.share && navigator.canShare?.({ files: [file] })) {
      await navigator.share({ files: [file], title: file.name })
      return
    }
  } catch (err) {
    if (err?.name === 'AbortError') return
  }

  // Fallback: descargar la imagen
  const url = URL.createObjectURL(file)
  const a = document.createElement('a')
  a.href = url
  a.download = file.name
  document.body.appendChild(a)
  a.click()
  a.remove()
  URL.revokeObjectURL(url)
}
