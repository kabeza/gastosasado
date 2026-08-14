// Estado del tema claro/oscuro. Al primer arranque usa la preferencia del
// sistema; la elección del usuario se guarda en localStorage.

const CLAVE = 'gastosasado.tema'

function sistemaOscuro() {
  return window.matchMedia?.('(prefers-color-scheme: dark)').matches ?? false
}

function leerTema() {
  try {
    const guardado = localStorage.getItem(CLAVE)
    if (guardado === 'light' || guardado === 'dark') return guardado
  } catch {
    /* localStorage no disponible */
  }
  return sistemaOscuro() ? 'dark' : 'light'
}

// Objeto exportado: se muta `.valor`, nunca se reasigna la exportación.
export const tema = $state({ valor: leerTema() })

function aplicar(t) {
  document.documentElement.setAttribute('data-theme', t)
  const meta = document.querySelector('meta[name="theme-color"]')
  if (meta) meta.content = t === 'dark' ? '#1a1512' : '#301f18'
}

aplicar(tema.valor)

export function alternarTema() {
  tema.valor = tema.valor === 'dark' ? 'light' : 'dark'
  try {
    localStorage.setItem(CLAVE, tema.valor)
  } catch {
    /* sin persistencia */
  }
  aplicar(tema.valor)
}
