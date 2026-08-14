import { defineConfig, loadEnv } from 'vite'
import { svelte } from '@sveltejs/vite-plugin-svelte'
import { VitePWA } from 'vite-plugin-pwa'

export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd(), '')
  return {
    base: env.VITE_BASE_PATH || '/',
    plugins: [
      svelte(),
      VitePWA({
        registerType: 'autoUpdate',
        includeAssets: ['iconoapp.png', 'gastoslogo.png'],
        manifest: {
          name: 'Gastos Asado',
          short_name: 'G.Asado',
          description: 'Cargá y dividí los gastos de tu asado',
          theme_color: '#301f18',
          background_color: '#fdfaea',
          display: 'standalone',
          start_url: '.',
          icons: [
            { src: 'iconoapp.png', sizes: '192x192', type: 'image/png', purpose: 'any' },
            { src: 'iconoapp.png', sizes: '512x512', type: 'image/png', purpose: 'any' },
            { src: 'iconoapp.png', sizes: '1024x1024', type: 'image/png', purpose: 'any' }
          ]
        }
      })
    ]
  }
})
