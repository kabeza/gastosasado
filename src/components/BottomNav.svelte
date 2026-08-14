<script>
  let { current, onNavigate, onReiniciar } = $props()

  const items = [
    { key: 'resumen', label: 'Resumen', icon: 'home' },
    { key: 'cargar', label: '+ Gasto', icon: 'add_circle' },
    { key: 'cuentas', label: 'Cuentas', icon: 'receipt_long' }
  ]
</script>

<nav>
  {#each items as item (item.key)}
    <button class:active={current === item.key} onclick={() => onNavigate(item.key)}>
      <span class="material-symbols-outlined">{item.icon}</span>
      <span class="label">{item.label}</span>
    </button>
  {/each}
  <button class="danger" onclick={onReiniciar}>
    <span class="material-symbols-outlined">restart_alt</span>
    <span class="label">Reiniciar</span>
  </button>
</nav>

<style>
  nav {
    display: flex;
    flex-shrink: 0;
    background: var(--bg);
    border-top: 1px solid var(--border);
    padding-bottom: env(safe-area-inset-bottom);
  }

  button {
    flex: 1;
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: 2px;
    padding: 8px 0;
    color: var(--muted);
    font-size: 11px;
  }

  button.active {
    color: var(--primary);
  }

  button.danger {
    color: var(--danger);
  }

  .material-symbols-outlined {
    font-size: 22px;
  }
</style>
