<script>
  let { current, onHistory } = $props()

  const titles = {
    resumen: 'Resumen',
    cargar: 'Cargar gasto',
    cuentas: 'Cuentas',
    historial: 'Historial'
  }
</script>

<header>
  <div class="logo">
    <img src="gastoslogo.png" alt="Gastos Asado" />
    <span class="brand">GASTOS ASADO</span>
  </div>
  <span class="title">{titles[current] ?? ''}</span>
  <button class="history" onclick={onHistory} aria-label="Historial">
    <span class="material-symbols-outlined">history</span>
  </button>
</header>

<style>
  header {
    display: flex;
    align-items: center;
    gap: 10px;
    padding: 12px 16px;
    border-bottom: 1px solid rgba(48, 31, 24, 0.08);
    background: var(--bg);
  }

  .logo {
    display: flex;
    align-items: center;
    gap: 8px;
    flex-shrink: 0;
  }

  .logo img {
    height: 44px;
    width: auto;
    flex-shrink: 0;
  }

  .brand {
    font-weight: 800;
    font-size: 13px;
    letter-spacing: 0.02em;
    white-space: nowrap;
  }

  .title {
    margin-left: auto;
    font-weight: 700;
    font-size: 15px;
    white-space: nowrap;
  }

  .history {
    display: flex;
    align-items: center;
    flex-shrink: 0;
    color: var(--primary);
    padding: 4px;
  }
</style>
