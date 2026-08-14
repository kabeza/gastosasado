<script>
  import { onMount } from 'svelte'
  import { actual, guardarEvento } from '../lib/store.svelte.js'
  import { liquidar } from '../lib/liquidacion.js'
  import { formatearARS, formatearFecha, fechaHoyISO } from '../lib/format.js'

  let { onReiniciar } = $props()

  const res = $derived(liquidar({ asistentes: actual.asistentes, gastos: actual.gastos }))
  const nPersonas = $derived(actual.asistentes.length)
  const promedio = $derived(nPersonas > 0 ? Math.round(res.total / nPersonas) : 0)
  const saldadas = $derived(res.balances.filter((b) => b.balance === 0).map((b) => b.nombre))

  // Auto-guardar: al entrar (si ya hay título) y al dejar el campo de título.
  function guardarSiCorresponde() {
    const titulo = String(actual.titulo ?? '').trim()
    if (titulo && actual.gastos.length > 0) guardarEvento()
  }

  onMount(() => {
    guardarSiCorresponde()
  })

  function construirMensaje() {
    const fecha = formatearFecha(actual.fecha || fechaHoyISO())
    const lineas = [`🍖 ${actual.titulo} — ${fecha}`, '', `Total: ${formatearARS(res.total)}`]
    if (nPersonas > 0) {
      lineas.push(`Por persona: ${formatearARS(promedio)} (${nPersonas})`)
    }
    lineas.push('')
    if (res.transferencias.length > 0) {
      lineas.push('💸 Transferencias:')
      for (const t of res.transferencias) {
        lineas.push(`· ${t.de} le debe a ${t.a}: ${formatearARS(t.monto)}`)
      }
    } else {
      lineas.push('✅ Cuentas saldadas')
    }
    return lineas.join('\n')
  }

  function compartir() {
    window.open('https://wa.me/?text=' + encodeURIComponent(construirMensaje()), '_blank')
  }
</script>

{#if actual.gastos.length === 0}
  <div class="empty">
    <h2>Cuentas</h2>
    <p>Cargá gastos para ver la liquidación.</p>
  </div>
{:else}
  <div class="cuentas">
    <section class="titulo">
      <label for="titulo">Título del asado</label>
      <input
        id="titulo"
        type="text"
        placeholder="ej. Asado del sábado"
        bind:value={actual.titulo}
        onblur={guardarSiCorresponde}
      />
    </section>

    <div class="resumen">
      <span class="resumen-label">Total gastado</span>
      <span class="resumen-total">{formatearARS(res.total)}</span>
      <span class="resumen-meta">
        {nPersonas} {nPersonas === 1 ? 'persona' : 'personas'} · {formatearARS(promedio)} c/u
      </span>
    </div>

    <h2 class="section-title">Transferencias Pendientes</h2>
    {#if res.transferencias.length > 0}
      <ul class="transferencias">
        {#each res.transferencias as t}
          <li>
            <span class="texto">{t.de} le debe a {t.a}</span>
            <span class="monto">{formatearARS(t.monto)}</span>
          </li>
        {/each}
      </ul>
    {:else}
      <p class="nota">No hay transferencias pendientes.</p>
    {/if}

    {#if saldadas.length > 0}
      <div class="saldadas">
        <span class="material-symbols-outlined">check_circle</span>
        <span class="saldadas-texto">Cuentas saldadas: {saldadas.join(', ')}</span>
      </div>
    {/if}

    <div class="acciones">
      <button class="whatsapp" onclick={compartir}>
        <span class="material-symbols-outlined">share</span>
        Compartir por WhatsApp
      </button>
      <button class="reiniciar" onclick={onReiniciar}>Reiniciar Evento</button>
    </div>
  </div>
{/if}

<style>
  .empty {
    text-align: center;
    padding: 48px 8px;
  }

  .empty h2 {
    font-size: 22px;
  }

  .empty p {
    color: rgba(48, 31, 24, 0.6);
  }

  .cuentas {
    display: flex;
    flex-direction: column;
  }

  .titulo {
    display: flex;
    flex-direction: column;
    gap: 8px;
    margin-bottom: 16px;
  }

  .titulo label {
    font-weight: 700;
    font-size: 14px;
  }

  .titulo input {
    font: inherit;
    font-size: 16px;
    padding: 12px;
    border: 1px solid rgba(48, 31, 24, 0.15);
    border-radius: var(--radius-sm);
    background: #fff;
    color: var(--primary);
  }

  .resumen {
    display: flex;
    flex-direction: column;
    gap: 4px;
    background: #fff;
    border: 1px solid rgba(48, 31, 24, 0.08);
    border-radius: var(--radius-sm);
    padding: 16px;
  }

  .resumen-label {
    font-size: 13px;
    color: rgba(48, 31, 24, 0.6);
  }

  .resumen-total {
    font-size: 28px;
    font-weight: 800;
  }

  .resumen-meta {
    font-size: 13px;
    color: rgba(48, 31, 24, 0.6);
  }

  .section-title {
    font-size: 16px;
    margin: 20px 0 8px;
  }

  .transferencias {
    list-style: none;
    margin: 0;
    padding: 0;
    display: flex;
    flex-direction: column;
    gap: 8px;
  }

  .transferencias li {
    display: flex;
    justify-content: space-between;
    align-items: center;
    gap: 12px;
    background: #fff;
    border: 1px solid rgba(48, 31, 24, 0.08);
    border-radius: var(--radius-sm);
    padding: 14px;
  }

  .texto {
    font-size: 15px;
    font-weight: 700;
  }

  .monto {
    color: var(--danger);
    font-weight: 800;
    flex-shrink: 0;
  }

  .nota {
    margin: 0;
    color: rgba(48, 31, 24, 0.6);
    font-size: 14px;
  }

  .saldadas {
    display: flex;
    align-items: center;
    gap: 8px;
    margin-top: 12px;
    color: rgba(48, 31, 24, 0.5);
    font-size: 14px;
  }

  .saldadas .material-symbols-outlined {
    color: var(--success);
  }

  .saldadas-texto {
    text-decoration: line-through;
  }

  .acciones {
    display: flex;
    flex-direction: column;
    gap: 10px;
    margin-top: 20px;
  }

  .whatsapp {
    display: flex;
    align-items: center;
    justify-content: center;
    gap: 8px;
    padding: 14px;
    border-radius: var(--radius-lg);
    background: var(--success);
    color: #fff;
    font-weight: 800;
    font-size: 15px;
  }

  .reiniciar {
    padding: 14px;
    border-radius: var(--radius-lg);
    border: 1px solid var(--danger);
    color: var(--danger);
    font-weight: 700;
    font-size: 15px;
    background: none;
  }
</style>
