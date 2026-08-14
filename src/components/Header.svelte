<script>
  import { tema, alternarTema } from '../lib/tema.svelte.js'

  let { current, onHistory, onHome } = $props()

  const titles = {
    resumen: 'Resumen',
    cargar: 'Cargar gasto',
    cuentas: 'Cuentas',
    historial: 'Historial'
  }
</script>

<header>
  <button class="logo" onclick={onHome} aria-label="Ir al resumen">
    <img src="gastoslogo.png" alt="Gastos Asado" />
  </button>
  <span class="title">{titles[current] ?? ''}</span>
  <button class="theme" onclick={alternarTema} aria-label="Cambiar tema claro/oscuro">
    <span class="material-symbols-outlined">{tema.valor === 'dark' ? 'light_mode' : 'dark_mode'}</span>
  </button>
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
    border-bottom: 1px solid var(--border);
    background: var(--bg);
  }

  .logo {
    display: flex;
    align-items: center;
    flex-shrink: 0;
    padding: 0;
  }

  .logo img {
    height: 59px;
    width: auto;
    flex-shrink: 0;
  }

  .title {
    margin-left: auto;
    font-weight: 700;
    font-size: 15px;
    white-space: nowrap;
  }

  .theme,
  .history {
    display: flex;
    align-items: center;
    flex-shrink: 0;
    color: var(--primary);
    padding: 4px;
  }
</style>
