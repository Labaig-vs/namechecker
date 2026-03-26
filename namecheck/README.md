# NameCheck

Proyecto de ejemplo para desplegar con GitHub Pages y Vercel (o Netlify).

Estructura:

- `index.html` -> Interfaz web del verificador de nombres.
- `api/check.js` -> Función serverless (Vercel) que actúa de puente con EUIPO/OEPM.

## Uso local

1. Sitúa `namecheck/` en tu workspace.
2. Abre `namecheck/index.html` en tu navegador.

## Uso en Vercel

1. Crea un proyecto en Vercel y apunta al repositorio.
2. Asegúrate de que la ruta de funciones está activada (por defecto `/api/check`).
3. La UI hace un `fetch('/api/check?nombre=...')`.

## API

- **GET** `/api/check?nombre=...`
  - `nombre` (requerido)
  - Respuesta: `{ risk: 'green|amber|red', conflicts: [...] }`
