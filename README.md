# HTTP & APIs Workshop — Frontend Edition (Angular)

Workshop de ~60 minutos sobre HTTP, Status Codes y REST para desarrolladores frontend semisenior.

## Estructura

```
├── slides/          → Speaker notes y estructura de la presentación
├── demo/            → Proyecto Angular con ejemplos en vivo
├── exercise/
│   ├── starter/     → Boilerplate con tests TDD para los asistentes
│   └── solution/    → Solución de referencia
└── resources/       → Links, RFCs, herramientas, cheat sheets
```

## Requisitos

- Node.js 18+
- npm 10+

## Quick Start

### Demo (para presentar en vivo)

```bash
cd demo
npm install
npm start             # Levanta json-server (3000) + Angular (4200) simultáneamente
```

O por separado:
```bash
npm run mock-server   # Terminal 1: json-server en puerto 3000
npm run start:app     # Terminal 2: Angular en puerto 4200
```

### Ejercicio (para los asistentes)

```bash
cd exercise/starter
npm install
npm run mock-server   # Terminal 1: API en puerto 3001
npm run start:app     # Terminal 2: Angular en puerto 4200
npm test              # Correr tests — todos fallan inicialmente
```

## Temario (60 min)

| # | Bloque | Duración |
|---|--------|----------|
| 1 | HTTP — Lo que pasa entre tu fetch() y el JSON | 15 min |
| 2 | Status Codes — Tu contrato con el backend | 10 min |
| 3 | REST — Cómo consumir APIs correctamente | 15 min |
| 4 | Demo en vivo (Angular + DevTools) | 12 min |
| 5 | Cierre + Ejercicio | 8 min |

## Demo: Páginas disponibles

| Ruta | Qué demuestra |
|------|---------------|
| `/examples` | Todos los HTTP methods (GET, POST, PUT, PATCH, DELETE) |
| `/error-handling` | Manejo de errores por status code |
| `/cors` | CORS explicado con ejemplos reales |
| `/auth-flow` | Flujo completo de autenticación con interceptors |

## Stack

- Angular 21 (standalone components, signals, functional interceptors)
- json-server (mock API)
- Vitest (testing)
- TypeScript 5.9

## Conceptos cubiertos

- HTTP Methods (GET, POST, PUT, PATCH, DELETE) + idempotencia
- Status Codes (2xx, 4xx, 5xx) y cómo manejar cada uno
- CORS (Same-Origin Policy, Preflight, headers)
- REST (recursos, paginación, filtrado, sorting)
- Interceptors funcionales en Angular
- Auth flow (Bearer token, refresh, retry)
- Retry con exponential backoff
- Error handling con RFC 7807 (Problem Details)
