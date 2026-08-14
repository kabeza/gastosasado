<script>
  import { actual, agregarGasto, editarGasto } from '../lib/store.svelte.js'
  import { parsePesos, formatearARS } from '../lib/format.js'

  let { onAgregado, gastoInicial, onIrAsistentes } = $props()

  const esEdicion = $derived(!!gastoInicial)

  // centavos -> texto "1500,50" (parseable por parsePesos)
  function centavosATexto(centavos) {
    const c = Math.round(Number(centavos) || 0)
    const entero = Math.floor(c / 100)
    const dec = String(c % 100).padStart(2, '0')
    return `${entero},${dec}`
  }

  let montoTexto = $state(gastoInicial ? centavosATexto(gastoInicial.monto) : '')
  let pagador = $state(gastoInicial?.pagador ?? '')
  let concepto = $state(gastoInicial?.concepto ?? '')
  let aplicaATodos = $state(gastoInicial ? !(gastoInicial.excluidos?.length > 0) : true)
  let excluidos = $state(gastoInicial?.excluidos?.slice() ?? [])

  const montoCentavos = $derived(parsePesos(montoTexto))
  // Un concepto idéntico al nombre de un asistente es un error de carga.
  const conceptoEsNombre = $derived(
    concepto.trim() !== '' &&
      actual.asistentes.some((n) => n.toLowerCase() === concepto.trim().toLowerCase())
  )
  const puedeAgregar = $derived(montoCentavos > 0 && pagador.trim() !== '' && !conceptoEsNombre)

  function toggleExcluido(nombre) {
    if (excluidos.includes(nombre)) {
      excluidos = excluidos.filter((n) => n !== nombre)
    } else {
      excluidos = [...excluidos, nombre]
    }
  }

  function toggleTodos() {
    aplicaATodos = !aplicaATodos
    if (aplicaATodos) excluidos = []
  }

  function enviar() {
    if (!puedeAgregar) return
    const datos = {
      pagador: pagador.trim(),
      concepto: concepto.trim(),
      monto: montoCentavos,
      excluidos: aplicaATodos ? [] : excluidos
    }
    const ok = esEdicion ? editarGasto(gastoInicial.id, datos) : agregarGasto(datos)
    if (ok) {
      montoTexto = ''
      pagador = ''
      concepto = ''
      aplicaATodos = true
      excluidos = []
      onAgregado?.()
    }
  }
</script>

{#if actual.asistentes.length === 0}
  <div class="guard">
    <h2>Primero cargá a los asistentes</h2>
    <p>Necesitás al menos una persona para poder cargar un gasto.</p>
    <button class="submit" onclick={onIrAsistentes}>Ir a asistentes</button>
  </div>
{:else}
  <div class="form">
    <!-- Quién pagó -->
    <section>
      <label>¿Quién pagó?</label>
      <div class="chips">
        {#each actual.asistentes as nombre (nombre)}
          <button class="chip" class:seleccionado={pagador === nombre} onclick={() => { pagador = nombre }}>
            {nombre}
          </button>
        {/each}
      </div>
    </section>

    <!-- Qué compró -->
    <section>
      <label for="concepto">¿Qué compró?</label>
      <input id="concepto" type="text" placeholder="ej. vino y gaseosas" bind:value={concepto} />
      {#if conceptoEsNombre}
        <p class="error">Eso parece un nombre de persona, no un gasto.</p>
      {/if}
    </section>

    <!-- Monto -->
    <section>
      <label for="monto">Monto</label>
      <div class="monto">
        <span class="simbolo">$</span>
        <input id="monto" type="text" inputmode="decimal" placeholder="0,00" bind:value={montoTexto} />
      </div>
      {#if montoCentavos > 0}
        <p class="preview">= {formatearARS(montoCentavos)}</p>
      {/if}
    </section>

    <!-- A quiénes aplica -->
    <section>
      <div class="aplica-row">
        <label for="aplica-todos">Aplica a todos</label>
        <input id="aplica-todos" type="checkbox" checked={aplicaATodos} onchange={toggleTodos} />
      </div>
      {#if !aplicaATodos && actual.asistentes.length > 0}
        <p class="hint">Marcá quiénes <strong>NO</strong> participan de este gasto:</p>
        <div class="chips">
          {#each actual.asistentes as nombre (nombre)}
            <button class="chip" class:excluido={excluidos.includes(nombre)} onclick={() => toggleExcluido(nombre)}>
              {nombre}
            </button>
          {/each}
        </div>
      {/if}
    </section>

    <button class="submit" disabled={!puedeAgregar} onclick={enviar}>
      <span class="material-symbols-outlined">arrow_forward</span>
      {esEdicion ? 'Guardar cambios' : 'Agregar al Ticket'}
    </button>
  </div>
{/if}

<style>
  .form {
    display: flex;
    flex-direction: column;
    gap: 24px;
    padding-bottom: 16px;
  }

  .guard {
    display: flex;
    flex-direction: column;
    align-items: center;
    text-align: center;
    gap: 12px;
    padding: 48px 8px;
  }

  .guard h2 {
    font-size: 20px;
    margin: 0;
  }

  .guard p {
    margin: 0;
    color: rgba(48, 31, 24, 0.6);
  }

  section {
    display: flex;
    flex-direction: column;
    gap: 8px;
  }

  label {
    font-weight: 700;
    font-size: 14px;
  }

  input[type='text'] {
    font: inherit;
    font-size: 16px;
    padding: 12px;
    border: 1px solid rgba(48, 31, 24, 0.15);
    border-radius: var(--radius-sm);
    background: #fff;
    color: var(--primary);
  }

  .chips {
    display: flex;
    flex-wrap: wrap;
    gap: 8px;
  }

  .chip {
    padding: 8px 14px;
    border-radius: 999px;
    border: 1px solid rgba(48, 31, 24, 0.2);
    font-size: 14px;
  }

  .chip.seleccionado {
    background: var(--accent);
    border-color: var(--accent);
    color: var(--primary);
    font-weight: 700;
  }

  .chip.excluido {
    text-decoration: line-through;
    opacity: 0.45;
  }

  .monto {
    display: flex;
    align-items: center;
    border-bottom: 2px solid var(--accent);
  }

  .monto .simbolo {
    font-size: 28px;
    font-weight: 800;
    color: var(--accent);
  }

  .monto input {
    flex: 1;
    font-size: 32px;
    font-weight: 800;
    border: none;
    background: none;
    color: var(--primary);
    padding: 8px 4px;
  }

  .monto input:focus {
    outline: none;
  }

  .preview {
    margin: 0;
    font-size: 13px;
    color: rgba(48, 31, 24, 0.6);
  }

  .error {
    margin: 0;
    font-size: 13px;
    color: var(--danger);
    font-weight: 600;
  }

  .aplica-row {
    display: flex;
    align-items: center;
    justify-content: space-between;
  }

  .aplica-row input[type='checkbox'] {
    width: 22px;
    height: 22px;
    accent-color: var(--accent);
  }

  .hint {
    margin: 0;
    font-size: 13px;
    color: rgba(48, 31, 24, 0.6);
  }

  .submit {
    display: flex;
    align-items: center;
    justify-content: center;
    gap: 8px;
    padding: 16px;
    border-radius: var(--radius-lg);
    background: var(--accent);
    color: var(--primary);
    font-size: 16px;
    font-weight: 800;
  }

  .guard .submit {
    width: 100%;
  }

  .submit:disabled {
    opacity: 0.4;
    cursor: not-allowed;
  }
</style>
