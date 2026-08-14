<script>
  import { actual } from '../lib/store.svelte.js'
  import { formatearARS } from '../lib/format.js'
  import GastoCard from '../components/GastoCard.svelte'

  let { onCargar } = $props()

  const total = $derived(actual.gastos.reduce((s, g) => s + g.monto, 0))
  const porPersona = $derived(
    actual.asistentes.length > 0 ? Math.round(total / actual.asistentes.length) : 0
  )
  const ultimos = $derived([...actual.gastos].reverse())
</script>

{#if actual.gastos.length === 0}
  <div class="empty">
    <div class="fire-circle">
      <span class="material-symbols-outlined">outdoor_grill</span>
    </div>
    <h2>¡El fuego está listo!</h2>
    <p class="sub">Empieza a cargar los gastos del asado para ver el resumen y dividir las cuentas.</p>
    <button class="cta" onclick={onCargar}>
      <span class="material-symbols-outlined">add</span>
      Cargar primer gasto
    </button>
  </div>
{:else}
  <div class="resumen">
    <div class="card">
      <div class="block">
        <span class="label">Total Acumulado</span>
        <span class="value">{formatearARS(total)}</span>
      </div>
      <div class="block">
        <span class="label">Por Persona</span>
        <span class="value">{formatearARS(porPersona)}</span>
      </div>
    </div>

    <h2 class="section-title">Últimos Gastos</h2>
    <ul class="list">
      {#each ultimos as gasto (gasto.id)}
        <GastoCard {gasto} />
      {/each}
    </ul>
  </div>
{/if}

<style>
  .empty {
    display: flex;
    flex-direction: column;
    align-items: center;
    text-align: center;
    gap: 12px;
    padding: 48px 8px;
  }

  .fire-circle {
    width: 120px;
    height: 120px;
    border-radius: 50%;
    background: rgba(228, 177, 72, 0.15);
    display: flex;
    align-items: center;
    justify-content: center;
    margin-bottom: 8px;
  }

  .fire-circle .material-symbols-outlined {
    font-size: 56px;
    color: var(--accent);
  }

  h2 {
    font-size: 22px;
    margin: 0;
  }

  .sub {
    margin: 0;
    color: rgba(48, 31, 24, 0.65);
    font-size: 15px;
    max-width: 260px;
  }

  .cta {
    margin-top: 16px;
    display: flex;
    align-items: center;
    gap: 8px;
    padding: 16px 24px;
    border-radius: var(--radius-lg);
    background: var(--accent);
    color: var(--primary);
    font-weight: 800;
    font-size: 16px;
  }

  .resumen {
    display: flex;
    flex-direction: column;
  }

  .card {
    display: flex;
    background: var(--primary);
    color: var(--bg);
    border-radius: var(--radius-lg);
    padding: 20px;
    gap: 16px;
  }

  .block {
    flex: 1;
    display: flex;
    flex-direction: column;
    gap: 4px;
  }

  .block + .block {
    border-left: 1px solid rgba(253, 250, 234, 0.15);
    padding-left: 16px;
  }

  .label {
    font-size: 12px;
    text-transform: uppercase;
    letter-spacing: 0.04em;
    color: rgba(253, 250, 234, 0.65);
  }

  .value {
    font-size: 22px;
    font-weight: 800;
    color: var(--accent);
  }

  .section-title {
    font-size: 16px;
    margin: 20px 0 8px;
  }

  .list {
    list-style: none;
    margin: 0;
    padding: 0;
    display: flex;
    flex-direction: column;
    gap: 10px;
  }
</style>
