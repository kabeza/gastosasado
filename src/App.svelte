<script>
  import Header from './components/Header.svelte'
  import BottomNav from './components/BottomNav.svelte'
  import Resumen from './views/Resumen.svelte'
  import CargarGasto from './views/CargarGasto.svelte'
  import Cuentas from './views/Cuentas.svelte'
  import Historial from './views/Historial.svelte'
  import { reiniciarActual } from './lib/store.svelte.js'

  let current = $state('resumen')
  let mainEl = $state(null)

  $effect(() => {
    void current
    mainEl?.scrollTo(0, 0)
  })

  function go(view) {
    current = view
  }

  function reiniciar() {
    if (!window.confirm('¿Reiniciar el evento? Se borrarán los gastos cargados.')) return
    reiniciarActual()
    current = 'resumen'
  }
</script>

<Header {current} onHistory={() => go('historial')} />

<main bind:this={mainEl}>
  {#if current === 'resumen'}
    <Resumen onCargar={() => go('cargar')} />
  {:else if current === 'cargar'}
    <CargarGasto onAgregado={() => go('resumen')} />
  {:else if current === 'cuentas'}
    <Cuentas onReiniciar={reiniciar} />
  {:else if current === 'historial'}
    <Historial />
  {/if}
</main>

<BottomNav {current} onNavigate={go} onReiniciar={reiniciar} />
