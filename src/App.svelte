<script>
  import Header from './components/Header.svelte'
  import BottomNav from './components/BottomNav.svelte'
  import Resumen from './views/Resumen.svelte'
  import CargarGasto from './views/CargarGasto.svelte'
  import Cuentas from './views/Cuentas.svelte'
  import Historial from './views/Historial.svelte'
  import { reiniciarActual, borrarGasto as borrarGastoStore } from './lib/store.svelte.js'

  let current = $state('resumen')
  let gastoEditando = $state(null)
  let mainEl = $state(null)

  $effect(() => {
    void current
    mainEl?.scrollTo(0, 0)
  })

  function go(view) {
    if (view === 'cargar') gastoEditando = null
    current = view
  }

  function editarGasto(g) {
    gastoEditando = g
    current = 'cargar'
  }

  function borrarGasto(id) {
    if (!window.confirm('¿Borrar este gasto?')) return
    borrarGastoStore(id)
  }

  function onGastoGuardado() {
    const eraEdicion = gastoEditando != null
    gastoEditando = null
    // Alta nueva: quedarse en la pantalla para seguir cargando. Edición: volver.
    if (eraEdicion) current = 'resumen'
  }

  function reiniciar() {
    if (!window.confirm('¿Reiniciar el evento? Se borrarán los gastos cargados.')) return
    reiniciarActual()
    current = 'resumen'
  }
</script>

<Header {current} onHistory={() => go(current === 'historial' ? 'resumen' : 'historial')} onHome={() => go('resumen')} />

<main bind:this={mainEl}>
  {#if current === 'resumen'}
    <Resumen onCargar={() => go('cargar')} onEditar={editarGasto} onBorrar={borrarGasto} />
  {:else if current === 'cargar'}
    <CargarGasto gastoInicial={gastoEditando} onAgregado={onGastoGuardado} onIrAsistentes={() => go('resumen')} />
  {:else if current === 'cuentas'}
    <Cuentas />
  {:else if current === 'historial'}
    <Historial onAbrir={() => go('cuentas')} />
  {/if}
</main>

<BottomNav {current} onNavigate={go} onReiniciar={reiniciar} />
