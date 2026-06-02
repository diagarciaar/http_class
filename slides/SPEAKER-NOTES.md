# 🎤 Speaker Notes — HTTP & APIs Workshop

## Tiempos

| Bloque | Duración | Acumulado |
|--------|----------|-----------|
| HTTP Fundamentals | 15 min | 15 min |
| Status Codes | 10 min | 25 min |
| REST para Frontend | 15 min | 40 min |
| Demo en vivo | 12 min | 52 min |
| Cierre + Ejercicio | 8 min | 60 min |

---

## Bloque 1: HTTP — Lo que pasa antes de tu .then() (15 min)

### Slide 1: Título
- "HTTP & APIs: Lo que pasa entre tu fetch() y el JSON"
- Romper el hielo: "¿Cuántos de ustedes han googleado 'CORS error'?" (todos levantan la mano)

### Slide 2: El modelo mental incorrecto
- Dibujar en pizarra: `fetch() → JSON` vs la realidad
- DNS → TCP → TLS → HTTP Request → Response → Parse
- "Si no entiendes qué pasa aquí, estás debuggeando a ciegas"

### Slide 3: DevTools Network Tab
- ABRIR DevTools en vivo, hacer una request
- Mostrar: Timing (TTFB, Content Download), Headers, Preview
- "Si no usas Network tab, estás adivinando"

### Slide 4: Anatomía de un Request
- Mostrar raw request: METHOD URL HTTP/1.1 + Headers + Body
- "fetch() construye esto por ti, pero DEBES saber qué está enviando"
- Mencionar que Angular HttpClient abstrae aún más

### Slide 5: Anatomía de un Response
- Status Line + Headers + Body
- "El body NO es lo único que importa — los headers te dan metadata crucial"
- Ejemplo: X-Total-Count para paginación, Retry-After para rate limiting

### Slide 6: HTTP Methods
- Tabla: GET, POST, PUT, PATCH, DELETE
- Safe: GET, HEAD, OPTIONS (no modifican estado)
- Idempotent: GET, PUT, DELETE (repetir = mismo resultado)
- "¿Por qué importa? RETRY LOGIC"

### Slide 7: Idempotencia
- Analogía: "Presionar el botón del ascensor 10 veces no llama 10 ascensores"
- PUT es idempotente → safe de reintentar
- POST NO es idempotente → reintentar puede crear duplicados
- "Por eso el retry interceptor SOLO reintenta GET/PUT/DELETE"

### Slide 8: Headers importantes
- Content-Type: "Le dices al server QUÉ le estás enviando"
- Authorization: "Bearer token — tu credencial"
- Accept: "Le dices al server QUÉ formato quieres de vuelta"
- Cache-Control: "Cuánto tiempo cachear"

### Slide 9-10: CORS
- "El error que todos googlean y nadie entiende"
- Same-Origin Policy: browser bloquea cross-origin por SEGURIDAD
- CORS = el SERVER dice "acepto requests de este origen"
- Preflight OPTIONS: browser pregunta antes de enviar
- "NO es un bug. NO se arregla desde el frontend."

---

## Bloque 2: Status Codes (10 min)

### Slide 11: Los rangos
- 2xx = éxito (el server hizo lo que pediste)
- 3xx = redirección (el recurso se movió)
- 4xx = TÚ la cagaste (bad request, no auth, not found)
- 5xx = ELLOS la cagaron (server error)
- "El status code es un CONTRATO. Si el backend devuelve 200 con error en body, está ROTO."

### Slide 12: Los que usarás todos los días
- 200 OK, 201 Created, 204 No Content
- 400 Bad Request, 401 Unauthorized, 403 Forbidden
- 404 Not Found, 422 Unprocessable, 429 Too Many Requests
- 500 Internal Error, 503 Service Unavailable

### Slide 13-14: Manejo en frontend
- ANTI-PATTERN: `catch(e) { alert("Error") }`
- PATTERN: Switch por rango, acción específica por código
- 401 → refresh token, 403 → mensaje permisos, 503 → retry

### Slide 15: Error handling robusto
- Interceptors centralizan la lógica
- Cada status tiene una estrategia
- El componente NO debería saber de HTTP errors

---

## Bloque 3: REST para Frontend (15 min)

### Slide 16: ¿Qué es REST?
- Recursos + Verbos + Representaciones
- NO es "URLs bonitas" — es un estilo arquitectónico
- Constraints: Stateless, Client-Server, Cacheable, Uniform Interface

### Slide 17: Leer una API
- Convenciones: /users (plural), /users/123 (recurso específico)
- Jerarquía: /users/123/orders (sub-recursos)
- Si ves /getUsers o /deleteUser?id=1 → la API está mal diseñada

### Slide 18: Paginación
- offset/limit: simple pero problemas con datos que cambian
- cursor-based: más robusto para infinite scroll
- json-server usa _page/_limit + X-Total-Count header

### Slide 19: Filtrado y Sorting
- Query params: ?status=active&sort=-createdAt
- URLSearchParams para construir correctamente
- HttpParams en Angular (inmutable, chainable)

### Slide 20: Caching
- Cache-Control header
- ETag + If-None-Match → 304 Not Modified
- React Query/SWR/TanStack Query hacen esto por ti
- Angular: interceptor custom o signal-based cache

### Slide 21: Optimistic Updates
- Actualizar UI ANTES de confirmación del server
- Si falla → rollback
- Requiere entender idempotencia (PUT safe, POST no)

### Slide 22: Rate Limiting
- 429 Too Many Requests
- Header Retry-After te dice cuánto esperar
- Frontend: debounce en búsquedas, throttle en scroll

### Slide 23: Autenticación
- Bearer tokens en Authorization header
- Refresh flow: access token corto + refresh token largo
- NUNCA localStorage para tokens sensibles → httpOnly cookies

---

## Bloque 4: Demo en Vivo (12 min)

### Secuencia:
1. Abrir la app Angular + DevTools Network tab
2. **Methods tab**: Click cada botón, mostrar en Network:
   - GET → query params en URL
   - POST → body en request, 201 en response
   - PUT vs PATCH → body completo vs parcial
   - DELETE → 200/204
3. **Errors tab**: Mostrar cómo cada status se maneja diferente
4. **CORS tab**: Provocar error CORS, mostrar preflight
5. **Auth tab**: Login → token en memoria → request con Bearer → refresh flow

### Tips para la demo:
- Tener Network tab abierto SIEMPRE
- Filtrar por XHR para no ver ruido
- Mostrar Headers tab de cada request
- Hacer zoom en la consola para que se vea

---

## Bloque 5: Cierre (8 min)

### Checklist del frontend que entiende HTTP
- ✅ Usa el verbo correcto (no todo es POST)
- ✅ Maneja status codes (no todo es catch → alert)
- ✅ Entiende CORS (no googlea "disable CORS")
- ✅ Implementa retry con backoff (no spamea el server)
- ✅ Cachea responses (no hace GET innecesarios)
- ✅ Guarda tokens de forma segura (no localStorage)

### Presentar el ejercicio
- Explicar brevemente qué deben implementar
- Mostrar que los tests ya están escritos (TDD)
- "Hagan npm test — todo falla. Su trabajo es hacerlo pasar."
- Deadline: [definir]

### Q&A
- Abrir para preguntas
- Si no hay: "¿Alguien ha tenido un bug de CORS en producción? Cuéntenme."
