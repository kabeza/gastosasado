<script>
  import { actual } from '../lib/store.svelte.js'
  import { formatearARS } from '../lib/format.js'
  import { categoriaPorId } from '../lib/constants.js'

  function totalCentavos(gastos) {
    return gastos.reduce((s, g) => s + g.monto, 0)
  }
</script>

<!-- Puente temporal: lista básica para verificar la carga. Se rediseña en la etapa 4. -->

{#if actual.gastos.length === 0}
  <h2>Resumen</h2>
  <p>Sin gastos todavía. Cargá el primero desde "+ Gasto".</p>
{:else}
  <h2>Resumen</h2>
  <p>Total: {formatearARS(totalCentavos(actual.gastos))}</p>
  <ul>
    {#each actual.gastos as g (g.id)}
      <li>
        {g.pagador} — {g.concepto || categoriaPorId(g.categoria)?.label || 'Sin categoría'} — {formatearARS(g.monto)}
      </li>
    {/each}
  </ul>
{/if}
