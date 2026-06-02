# 🏋️ Ejercicio: HTTP Client Resiliente en Angular

## Objetivo

Construir un servicio `TaskService` y un set de interceptors que demuestren dominio de HTTP desde el frontend.

## Contexto

Se te da una API mock (json-server) con endpoints de tareas que **simula errores**. Tu trabajo es consumir esta API de forma resiliente.

## Setup

```bash
cd starter
npm install
npm run mock-server   # Terminal 1: API en puerto 3001
npm start             # Terminal 2: Angular en puerto 4200
npm test              # Correr tests (todos fallan inicialmente)
```

## Requisitos

### 1. TaskService (`src/app/services/task.service.ts`)

Implementar un servicio que consuma la API de tareas:

- `getTasks(options?)` — GET /tasks con paginación y filtros
  - Soportar `?_page=N&_limit=N` para paginación
  - Soportar `?status=pending|completed` para filtrado
  - Soportar `?_sort=field&_order=asc|desc` para sorting
  - Retornar `{ data: Task[], total: number }` (total viene del header `X-Total-Count`)

- `getTask(id)` — GET /tasks/:id

- `createTask(task)` — POST /tasks
  - Retornar el task creado (status 201)

- `updateTask(id, task)` — PUT /tasks/:id (reemplazo completo)

- `patchTask(id, changes)` — PATCH /tasks/:id (parcial)

- `deleteTask(id)` — DELETE /tasks/:id

- `completeTask(id)` — PATCH /tasks/:id con `{ status: 'completed', completedAt: new Date().toISOString() }`

### 2. Retry Interceptor (`src/app/interceptors/retry.interceptor.ts`)

- Solo reintentar métodos idempotentes (GET, PUT, DELETE)
- Solo reintentar en status 503, 502, 504, o error de red (status 0)
- Máximo 3 reintentos
- Exponential backoff: 1s, 2s, 4s

### 3. Error Interceptor (`src/app/interceptors/error.interceptor.ts`)

- Parsear errores como `ProblemDetails` (RFC 7807) cuando el body tenga `type` y `title`
- En 401: intentar refresh y reintentar request original
- En 429: loggear el header `Retry-After`
- Propagar el error para que el componente pueda manejarlo

### 4. Auth Interceptor (`src/app/interceptors/auth.interceptor.ts`)

- Agregar `Authorization: Bearer <token>` a todas las requests excepto `/auth/*`
- Obtener token del `AuthService`

## Modelos

```typescript
interface Task {
  id: number;
  title: string;
  description: string;
  status: 'pending' | 'completed';
  priority: 'low' | 'medium' | 'high';
  createdAt: string;
  completedAt?: string;
}

interface ProblemDetails {
  type: string;
  title: string;
  status: number;
  detail: string;
  instance?: string;
}
```

## Tests

Los tests ya están escritos en `src/app/services/task.service.spec.ts` y `src/app/interceptors/*.spec.ts`. Tu trabajo es hacer que pasen.

```bash
npm test              # Todos deben pasar al terminar
```

## Criterios de Evaluación

| Criterio | Peso |
|----------|------|
| Todos los tests pasan | 40% |
| Status codes correctos en cada operación | 20% |
| Retry solo en métodos idempotentes | 15% |
| Error handling diferenciado por status | 15% |
| Código limpio y tipado | 10% |

## Bonus

- [ ] Implementar `AbortController` para cancelar requests en vuelo
- [ ] Agregar cache con `ETag` / `If-None-Match` para GET requests
- [ ] Request deduplication (misma URL en vuelo = misma promise)
