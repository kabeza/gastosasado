import { mount } from 'svelte'
import { registerSW } from 'virtual:pwa-register'
import './app.css'
import './lib/store.svelte.js'
import App from './App.svelte'

const app = mount(App, { target: document.getElementById('app') })

// PWA: auto-update. Cuando se detecta un service worker nuevo, activa y recarga
// la página automáticamente para que la app instalada quede al día.
registerSW({ immediate: true })

export default app
