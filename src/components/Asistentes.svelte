<script>
  import { actual, agregarAsistente, renombrarAsistente, borrarAsistente } from '../lib/store.svelte.js'

  let { titulo = 'Asistentes' } = $props()

  let nuevo = $state('')
  let editando = $state(null)
  let nombreTxt = $state('')

  function agregar() {
    const limpio = nuevo.trim()
    if (limpio) {
      agregarAsistente(limpio)
      nuevo = ''
    }
  }

  function onKeydown(e) {
    if (e.key === 'Enter') {
      e.preventDefault()
      agregar()
    }
  }

  function empezarRenombrar(nombre) {
    editando = nombre
    nombreTxt = nombre
  }

  function confirmarRename() {
    const limpio = nombreTxt.trim()
    if (limpio && editando) renombrarAsistente(editando, limpio)
    editando = null
    nombreTxt = ''
  }

  function cancelarRename() {
    editando = null
    nombreTxt = ''
  }

  function borrar(nombre) {
    if (!window.confirm(`¿Borrar a ${nombre}? Se borrarán sus gastos.`)) return
    borrarAsistente(nombre)
  }
</script>

<div class="asistentes">
  {#if titulo}
    <h2 class="title">{titulo} ({actual.asistentes.length})</h2>
  {/if}

  <div class="add-row">
    <input
      type="text"
      placeholder="Nombre y Enter para agregar"
      bind:value={nuevo}
      onkeydown={onKeydown}
    />
    <button class="add-btn" onclick={agregar} aria-label="Agregar persona">
      <span class="material-symbols-outlined">person_add</span>
    </button>
  </div>

  {#if actual.asistentes.length > 0}
    <div class="chips">
      {#each actual.asistentes as nombre (nombre)}
        {#if editando === nombre}
          <div class="edit">
            <input type="text" bind:value={nombreTxt} onkeydown={(e) => e.key === 'Enter' && confirmarRename()} />
            <button class="icon-btn ok" onclick={confirmarRename} aria-label="Confirmar">
              <span class="material-symbols-outlined">check</span>
            </button>
            <button class="icon-btn" onclick={cancelarRename} aria-label="Cancelar">
              <span class="material-symbols-outlined">close</span>
            </button>
          </div>
        {:else}
          <div class="chip">
            <span class="nombre">{nombre}</span>
            <button class="icon-btn" onclick={() => empezarRenombrar(nombre)} aria-label="Renombrar">
              <span class="material-symbols-outlined">edit</span>
            </button>
            <button class="icon-btn" onclick={() => borrar(nombre)} aria-label="Borrar">
              <span class="material-symbols-outlined">close</span>
            </button>
          </div>
        {/if}
      {/each}
    </div>
  {/if}
</div>

<style>
  .asistentes {
    display: flex;
    flex-direction: column;
    gap: 10px;
    margin: 20px 0 4px;
  }

  .title {
    font-size: 16px;
    margin: 0;
  }

  .add-row {
    display: flex;
    align-items: center;
    gap: 6px;
  }

  .add-row input {
    flex: 1;
    min-width: 0;
    font: inherit;
    font-size: 14px;
    padding: 10px 14px;
    border: 1px solid rgba(48, 31, 24, 0.15);
    border-radius: 999px;
    background: #fff;
    color: var(--primary);
  }

  .add-row input:focus {
    outline: none;
    border-color: var(--accent);
  }

  .add-btn {
    display: flex;
    align-items: center;
    justify-content: center;
    width: 38px;
    height: 38px;
    border-radius: 50%;
    background: var(--accent);
    color: var(--primary);
    flex-shrink: 0;
  }

  .add-btn .material-symbols-outlined {
    font-size: 20px;
  }

  .chips {
    display: flex;
    flex-wrap: wrap;
    gap: 8px;
  }

  .chip {
    display: flex;
    align-items: center;
    gap: 4px;
    padding: 6px 8px 6px 14px;
    border-radius: 999px;
    background: #fff;
    border: 1px solid rgba(48, 31, 24, 0.12);
    font-size: 14px;
  }

  .nombre {
    font-weight: 600;
  }

  .icon-btn {
    display: flex;
    align-items: center;
    justify-content: center;
    padding: 2px;
    color: rgba(48, 31, 24, 0.45);
  }

  .icon-btn.ok {
    color: var(--success);
  }

  .icon-btn .material-symbols-outlined {
    font-size: 16px;
  }

  .edit {
    display: flex;
    align-items: center;
    gap: 4px;
    padding: 4px 6px;
    border-radius: 999px;
    border: 1px solid var(--accent);
    background: #fff;
  }

  .edit input {
    font: inherit;
    font-size: 14px;
    border: none;
    background: none;
    width: 96px;
    padding: 4px;
    color: var(--primary);
  }

  .edit input:focus {
    outline: none;
  }
</style>
