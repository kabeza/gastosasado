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
        // Navegaciones siempre frescas: online = red primero (NetworkFirst),
        // offline = fallback al index.html precacheado.
        // navigateFallback:null y directoryIndex:null evitan que el precache /
        // NavigationRoute (cache-first) ensombrezca la ruta NetworkFirst.
        workbox: {
          navigateFallback: null,
          directoryIndex: null,
          runtimeCaching: [
            {
              urlPattern: ({ request }) => request.mode === 'navigate',
              handler: 'NetworkFirst',
              options: {
                cacheName: 'paginas',
                precacheFallback: { fallbackURL: 'index.html' }
              }
            }
          ]
        },
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
