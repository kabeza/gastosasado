<script>
  import { formatearARS } from '../lib/format.js'
  import { categoriaPorId } from '../lib/constants.js'

  let { gasto } = $props()

  const cat = $derived(categoriaPorId(gasto.categoria))
  const icon = $derived(cat?.icon ?? 'receipt_long')
  const titulo = $derived(gasto.concepto || cat?.label || 'Gasto')
</script>

<li class="card">
  <span class="icon material-symbols-outlined">{icon}</span>
  <div class="body">
    <span class="titulo">{titulo}</span>
    <span class="pagador">pagó {gasto.pagador}</span>
    {#if cat}
      <span class="tag">{cat.label}</span>
    {/if}
  </div>
  <span class="monto">{formatearARS(gasto.monto)}</span>
</li>

<style>
  .card {
    display: flex;
    align-items: center;
    gap: 12px;
    background: #fff;
    border: 1px solid rgba(48, 31, 24, 0.08);
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
    color: rgba(48, 31, 24, 0.55);
  }

  .tag {
    align-self: flex-start;
    font-size: 11px;
    font-weight: 600;
    padding: 2px 8px;
    border-radius: 999px;
    background: rgba(228, 177, 72, 0.2);
    color: var(--primary);
    margin-top: 4px;
  }

  .monto {
    font-weight: 800;
    font-size: 15px;
    flex-shrink: 0;
  }
</style>
