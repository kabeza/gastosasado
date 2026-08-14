# Cabeceras de caché para la PWA (nginx)

Se sirve en la subcarpeta `/gastosasado/` del dominio propio. Si tu server usa
nginx (no Apache), agregá estos bloques al `server` del sitio y recargá la
configuración (`nginx -s reload`).

Estrategia:

- `index.html` y `sw.js` → **siempre revalidar** (`no-cache`). La página carga
  siempre la versión nueva y el service worker detecta actualizaciones en cada
  visita.
- `assets/*.js|css` → tienen hash en el nombre (cambian con cada build), se
  cachean para siempre (`immutable`).

```nginx
server {
  # ... resto de tu config ...

  # Página y service worker siempre frescos
  location = /gastosasado/index.html {
    add_header Cache-Control "no-cache, no-store, must-revalidate";
    add_header Pragma "no-cache";
  }
  location = /gastosasado/sw.js {
    add_header Cache-Control "no-cache, no-store, must-revalidate";
  }

  # Assets hasheados por Vite: cachear para siempre
  location /gastosasado/assets/ {
    add_header Cache-Control "public, max-age=31536000, immutable";
  }
}
```

> Nota: `location = /gastosasado/` (sin `index.html`) con `try_files` termina
> internamente en `index.html`, así que también recibe `no-cache`. La navegación
> online siempre va a red primero (NetworkFirst del service worker); estas
> cabeceras garantizan que el navegador no sirva HTML viejo desde su propia
> caché HTTP.
