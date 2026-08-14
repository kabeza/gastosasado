<script>
  import { formatearARS } from '../lib/format.js'

  let { gasto, onEditar, onBorrar } = $props()

  const titulo = $derived(gasto.concepto || 'Gasto')
</script>

<li class="card">
  <span class="icon material-symbols-outlined">receipt_long</span>
  <div class="body">
    <span class="titulo">{titulo}</span>
    <span class="pagador">pagó {gasto.pagador}</span>
  </div>
  <span class="monto">{formatearARS(gasto.monto)}</span>
  <div class="acciones">
    <button class="act" onclick={() => onEditar?.(gasto)} aria-label="Editar gasto">
      <span class="material-symbols-outlined">edit</span>
    </button>
    <button class="act" onclick={() => onBorrar?.(gasto.id)} aria-label="Borrar gasto">
      <span class="material-symbols-outlined">delete</span>
    </button>
  </div>
</li>

<style>
  .card {
    display: flex;
    align-items: center;
    gap: 12px;
    background: var(--surface);
    border: 1px solid var(--border);
    border-radius: var(--radius-sm);
    padding: 12px 14px;
  }

  .icon {
    font-size: 24px;
    color: var(--accent);
    flex-shrink: 0;
  }

  .body {
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
  }

  .pagador {
    font-size: 12px;
    color: var(--muted);
  }

  .monto {
    font-weight: 800;
    font-size: 15px;
    flex-shrink: 0;
  }

  .acciones {
    display: flex;
    flex-direction: column;
    flex-shrink: 0;
  }

  .act {
    display: flex;
    align-items: center;
    justify-content: center;
    padding: 2px;
    color: var(--muted-strong);
  }

  .act .material-symbols-outlined {
    font-size: 18px;
  }
</style>
