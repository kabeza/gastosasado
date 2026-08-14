<script>
  import { actual, guardarEvento } from '../lib/store.svelte.js'
  import { liquidar } from '../lib/liquidacion.js'
  import { formatearARS, formatearFecha, fechaHoyISO } from '../lib/format.js'
  import { generarImagenResumen, compartirImagen } from '../lib/imagen.js'
  import { construirMensaje } from '../lib/mensaje.js'

  const res = $derived(liquidar({ asistentes: actual.asistentes, gastos: actual.gastos }))
  const nPersonas = $derived(actual.asistentes.length)
  const promedio = $derived(nPersonas > 0 ? Math.round(res.total / nPersonas) : 0)
  const saldadas = $derived(res.balances.filter((b) => b.balance === 0).map((b) => b.nombre))

  const tituloInicial = actual.titulo
  let tituloTxt = $state(tituloInicial ?? '')
  let feedback = $state('')
  let compartirComoImagen = $state(false)

  function guardar() {
    const t = tituloTxt.trim()
    if (!t) {
      feedback = 'Escribí un título para el asado'
      return
    }
    actual.titulo = t
    guardarEvento()
    feedback = 'Guardado ✓ (los cambios siguientes se actualizan solos)'
  }

  async function compartir() {
    if (!actual.guardado || !actual.titulo) {
      feedback = 'Guardá el título del asado antes de compartir'
      return
    }
    if (tituloTxt.trim() !== actual.titulo) {
      feedback = 'Guardá los cambios del título antes de compartir'
      return
    }

    if (compartirComoImagen) {
      try {
        const file = await generarImagenResumen({
          titulo: actual.titulo,
          fecha: formatearFecha(actual.fecha || fechaHoyISO()),
          gastos: actual.gastos,
          total: res.total,
          promedio,
          transferencias: res.transferencias
        })
        await compartirImagen(file)
      } catch (err) {
        console.error(err)
        feedback = 'No se pudo generar la imagen. Reintentá.'
      }
      return
    }

    const mensaje = construirMensaje({
      titulo: actual.titulo,
      fecha: actual.fecha,
      gastos: actual.gastos,
      asistentes: actual.asistentes,
      transferencias: res.transferencias
    })
    window.open('https://wa.me/?text=' + encodeURIComponent(mensaje), '_blank')
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
      <div class="titulo-row">
        <input
          id="titulo"
          type="text"
          placeholder="ej. Asado del sábado"
          bind:value={tituloTxt}
        />
        <button class="guardar" onclick={guardar}>
          <span class="material-symbols-outlined">check</span>
          Guardar
        </button>
      </div>
      {#if feedback}
        <p class="feedback">{feedback}</p>
      {/if}
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

    <label class="img-check">
      <input type="checkbox" bind:checked={compartirComoImagen} />
      Compartir como imagen
    </label>

    <button class="whatsapp" onclick={compartir}>
      <span class="material-symbols-outlined">{compartirComoImagen ? 'image' : 'share'}</span>
      {compartirComoImagen ? 'Compartir imagen' : 'Compartir por WhatsApp'}
    </button>
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
    color: var(--muted);
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

  .titulo-row {
    display: flex;
    align-items: center;
    gap: 8px;
  }

  .titulo-row input {
    flex: 1;
    min-width: 0;
    font: inherit;
    font-size: 16px;
    padding: 12px;
    border: 1px solid var(--border-strong);
    border-radius: var(--radius-sm);
    background: var(--surface);
    color: var(--primary);
  }

  .guardar {
    display: flex;
    align-items: center;
    gap: 4px;
    padding: 12px 14px;
    border-radius: var(--radius-sm);
    background: var(--accent);
    color: var(--on-accent);
    font-weight: 800;
    font-size: 14px;
    flex-shrink: 0;
  }

  .guardar .material-symbols-outlined {
    font-size: 18px;
  }

  .feedback {
    margin: 0;
    font-size: 13px;
    color: var(--success);
    font-weight: 600;
  }

  .resumen {
    display: flex;
    flex-direction: column;
    gap: 4px;
    background: var(--surface);
    border: 1px solid var(--border);
    border-radius: var(--radius-sm);
    padding: 16px;
  }

  .resumen-label {
    font-size: 13px;
    color: var(--muted);
  }

  .resumen-total {
    font-size: 28px;
    font-weight: 800;
  }

  .resumen-meta {
    font-size: 13px;
    color: var(--muted);
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
    background: var(--surface);
    border: 1px solid var(--border);
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
    color: var(--muted);
    font-size: 14px;
  }

  .saldadas {
    display: flex;
    align-items: center;
    gap: 8px;
    margin-top: 12px;
    color: var(--muted);
    font-size: 14px;
  }

  .saldadas .material-symbols-outlined {
    color: var(--success);
  }

  .saldadas-texto {
    text-decoration: line-through;
  }

  .img-check {
    display: flex;
    align-items: center;
    gap: 8px;
    margin-top: 20px;
    font-size: 14px;
    font-weight: 600;
  }

  .img-check input {
    width: 20px;
    height: 20px;
    accent-color: var(--success);
  }

  .whatsapp {
    display: flex;
    align-items: center;
    justify-content: center;
    gap: 8px;
    margin-top: 12px;
    padding: 14px;
    border-radius: var(--radius-lg);
    background: var(--success);
    color: var(--on-success);
    font-weight: 800;
    font-size: 15px;
  }
</style>
