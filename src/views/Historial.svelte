<script>
  import { historial, abrirEvento, borrarEvento } from '../lib/store.svelte.js'
  import { formatearARS, formatearFecha } from '../lib/format.js'
  import { construirMensaje } from '../lib/mensaje.js'

  let { onAbrir } = $props()

  function totalEvento(evento) {
    return (evento.gastos || []).reduce((s, g) => s + (g.monto || 0), 0)
  }

  function abrir(evento) {
    abrirEvento(evento)
    onAbrir?.()
  }

  function compartir(evento) {
    const mensaje = construirMensaje({
      titulo: evento.titulo,
      fecha: evento.fecha,
      gastos: evento.gastos,
      asistentes: evento.asistentes,
      transferencias: evento.transferencias
    })
    window.open('https://wa.me/?text=' + encodeURIComponent(mensaje), '_blank')
  }

  function borrar(idx, titulo) {
    if (!window.confirm(`¿Borrar el evento "${titulo}"?`)) return
    borrarEvento(idx)
  }
</script>

{#if historial.length === 0}
  <div class="empty">
    <span class="material-symbols-outlined">history</span>
    <p>No hay eventos guardados todavía.</p>
    <p class="hint">Guardá un asado desde "Cuentas" (botón Guardar) y va a aparecer acá.</p>
  </div>
{:else}
  <ul class="lista">
    {#each historial as evento, idx (evento.titulo + evento.fecha)}
      <li class="card">
        <div class="info">
          <button class="titulo" onclick={() => abrir(evento)} aria-label={`Abrir ${evento.titulo}`}>
            {evento.titulo}
          </button>
          <span class="meta">{formatearFecha(evento.fecha)} · {formatearARS(totalEvento(evento))}</span>
        </div>
        <div class="acciones">
          <button class="act" onclick={() => abrir(evento)} aria-label="Abrir">
            <span class="material-symbols-outlined">visibility</span>
          </button>
          <button class="act" onclick={() => compartir(evento)} aria-label="Compartir">
            <span class="material-symbols-outlined">share</span>
          </button>
          <button class="act danger" onclick={() => borrar(idx, evento.titulo)} aria-label="Borrar">
            <span class="material-symbols-outlined">delete</span>
          </button>
        </div>
      </li>
    {/each}
  </ul>
{/if}

<style>
  .empty {
    display: flex;
    flex-direction: column;
    align-items: center;
    text-align: center;
    gap: 8px;
    padding: 48px 8px;
  }

  .empty .material-symbols-outlined {
    font-size: 48px;
    color: rgba(48, 31, 24, 0.35);
  }

  .empty p {
    margin: 0;
    color: rgba(48, 31, 24, 0.6);
  }

  .empty .hint {
    font-size: 13px;
    max-width: 280px;
  }

  .lista {
    list-style: none;
    margin: 0;
    padding: 0;
    display: flex;
    flex-direction: column;
    gap: 10px;
  }

  .card {
    display: flex;
    align-items: center;
    gap: 10px;
    background: #fff;
    border: 1px solid rgba(48, 31, 24, 0.08);
    border-radius: var(--radius-sm);
    padding: 14px;
  }

  .info {
    flex: 1;
    min-width: 0;
    display: flex;
    flex-direction: column;
    gap: 2px;
  }

  .titulo {
    font-weight: 700;
    font-size: 15px;
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
    text-align: left;
    padding: 0;
    color: var(--primary);
  }

  .meta {
    font-size: 12px;
    color: rgba(48, 31, 24, 0.55);
  }

  .acciones {
    display: flex;
    align-items: center;
    gap: 4px;
    flex-shrink: 0;
  }

  .act {
    display: flex;
    align-items: center;
    justify-content: center;
    padding: 6px;
    color: rgba(48, 31, 24, 0.55);
  }

  .act.danger {
    color: var(--danger);
  }

  .act .material-symbols-outlined {
    font-size: 20px;
  }
</style>
