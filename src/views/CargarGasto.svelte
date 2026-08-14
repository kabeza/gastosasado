<script>
  import { actual, agregarGasto } from '../lib/store.svelte.js'
  import { CATEGORIAS } from '../lib/constants.js'
  import { parsePesos, formatearARS } from '../lib/format.js'

  let { onAgregado } = $props()

  let montoTexto = $state('')
  let pagador = $state('')
  let concepto = $state('')
  let categoriaId = $state(null)
  let aplicaATodos = $state(true)
  let excluidos = $state([])

  const montoCentavos = $derived(parsePesos(montoTexto))
  const puedeAgregar = $derived(montoCentavos > 0 && pagador.trim() !== '')

  function toggleCategoria(id) {
    categoriaId = categoriaId === id ? null : id
  }

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
    const ok = agregarGasto({
      pagador: pagador.trim(),
      concepto: concepto.trim(),
      categoria: categoriaId,
      monto: montoCentavos,
      excluidos: aplicaATodos ? [] : excluidos
    })
    if (ok) {
      montoTexto = ''
      pagador = ''
      concepto = ''
      categoriaId = null
      aplicaATodos = true
      excluidos = []
      onAgregado?.()
    }
  }
</script>

<div class="form">
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

  <!-- Quién pagó -->
  <section>
    <label for="pagador">¿Quién pagó?</label>
    <input id="pagador" type="text" placeholder="Nombre" bind:value={pagador} />
    {#if actual.asistentes.length > 0}
      <div class="chips">
        {#each actual.asistentes as nombre (nombre)}
          <button
            class="chip"
            class:seleccionado={pagador.trim() === nombre}
            onclick={() => { pagador = nombre }}
          >
            {nombre}
          </button>
        {/each}
      </div>
    {/if}
  </section>

  <!-- Qué compró -->
  <section>
    <label for="concepto">¿Qué compró?</label>
    <input id="concepto" type="text" placeholder="ej. vino y gaseosas" bind:value={concepto} />
  </section>

  <!-- Categoría -->
  <section>
    <label>Categoría <span class="opcional">(opcional)</span></label>
    <div class="categorias">
      {#each CATEGORIAS as cat (cat.id)}
        <button class="cat" class:activa={categoriaId === cat.id} onclick={() => toggleCategoria(cat.id)}>
          <span class="material-symbols-outlined">{cat.icon}</span>
          <span>{cat.label}</span>
        </button>
      {/each}
    </div>
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
    Agregar al Ticket
  </button>
</div>

<style>
  .form {
    display: flex;
    flex-direction: column;
    gap: 24px;
    padding-bottom: 16px;
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

  .opcional {
    font-weight: 400;
    color: rgba(48, 31, 24, 0.5);
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

  .categorias {
    display: grid;
    grid-template-columns: 1fr 1fr;
    gap: 8px;
  }

  .cat {
    display: flex;
    align-items: center;
    gap: 8px;
    padding: 10px 12px;
    border: 1px solid rgba(48, 31, 24, 0.15);
    border-radius: var(--radius-sm);
    background: #fff;
    font-size: 14px;
  }

  .cat.activa {
    background: var(--accent);
    border-color: var(--accent);
    font-weight: 700;
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

  .submit:disabled {
    opacity: 0.4;
    cursor: not-allowed;
  }
</style>
