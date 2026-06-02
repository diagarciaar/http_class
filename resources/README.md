# 📚 Recursos — HTTP & APIs Workshop

## RFCs Esenciales

| RFC | Tema | Link |
|-----|------|------|
| RFC 9110 | HTTP Semantics (reemplaza RFC 7231) | https://httpwg.org/specs/rfc9110.html |
| RFC 9111 | HTTP Caching | https://httpwg.org/specs/rfc9111.html |
| RFC 9457 | Problem Details (reemplaza RFC 7807) | https://www.rfc-editor.org/rfc/rfc9457 |
| RFC 6750 | Bearer Token Usage | https://www.rfc-editor.org/rfc/rfc6750 |
| RFC 6585 | Additional HTTP Status Codes (429) | https://www.rfc-editor.org/rfc/rfc6585 |

## Documentación Angular

- [HttpClient Guide](https://angular.dev/guide/http)
- [Interceptors (functional)](https://angular.dev/guide/http/interceptors)
- [Testing HTTP requests](https://angular.dev/guide/http/testing)

## Herramientas

| Herramienta | Uso | Link |
|-------------|-----|------|
| DevTools Network Tab | Inspeccionar requests en el browser | Built-in |
| httpie | CLI para hacer requests (más legible que curl) | https://httpie.io |
| Postman / Insomnia | GUI para probar APIs | https://postman.com |
| json-server | Mock API REST en 30 segundos | https://github.com/typicode/json-server |
| MSW (Mock Service Worker) | Mock APIs en tests y desarrollo | https://mswjs.io |
| Hoppscotch | Alternativa open-source a Postman | https://hoppscotch.io |

## Libros Recomendados

- **"HTTP: The Definitive Guide"** — David Gourley (O'Reilly)
- **"RESTful Web APIs"** — Leonard Richardson (O'Reilly)
- **"Designing Web APIs"** — Brenda Jin (O'Reilly)

## Videos

- [HTTP Crash Course (Traversy Media)](https://www.youtube.com/watch?v=iYM2zFP3Zn0)
- [CORS in 100 Seconds (Fireship)](https://www.youtube.com/watch?v=4KHiSt0oLJ0)
- [REST API Design Best Practices](https://www.youtube.com/watch?v=1Wl-rtew1_E)

## APIs Públicas para Practicar

| API | Descripción | CORS |
|-----|-------------|------|
| JSONPlaceholder | Fake REST API | ✅ |
| httpbin.org | Echo service para probar HTTP | ✅ |
| reqres.in | Fake API con auth | ✅ |
| pokeapi.co | Pokémon API (paginación real) | ✅ |
| dog.ceo/dog-api | API de perros (simple) | ✅ |

## Status Codes — Quick Reference

```
2xx SUCCESS
  200 OK                    → Request exitosa
  201 Created               → Recurso creado (POST)
  204 No Content            → Éxito sin body (DELETE)

3xx REDIRECTION
  301 Moved Permanently     → URL cambió para siempre
  304 Not Modified          → Cache válido (ETag match)

4xx CLIENT ERROR
  400 Bad Request           → Request malformada
  401 Unauthorized          → No autenticado (token falta/expiró)
  403 Forbidden             → Autenticado pero sin permisos
  404 Not Found             → Recurso no existe
  409 Conflict              → Conflicto de estado (ej: ya existe)
  422 Unprocessable Entity  → Validación falló
  429 Too Many Requests     → Rate limited

5xx SERVER ERROR
  500 Internal Server Error → Bug en el server
  502 Bad Gateway           → Proxy/LB no puede conectar al backend
  503 Service Unavailable   → Server sobrecargado/mantenimiento
  504 Gateway Timeout       → Backend no respondió a tiempo
```

## Cheat Sheet: Angular HttpClient

```typescript
// GET con query params
this.http.get<Product[]>('/api/products', {
  params: new HttpParams().set('page', '1').set('limit', '10'),
  observe: 'response', // Para acceder a headers
});

// POST con body
this.http.post<Product>('/api/products', { name: 'New', price: 9.99 });

// PUT (reemplazo completo)
this.http.put<Product>('/api/products/1', fullProduct);

// PATCH (parcial)
this.http.patch<Product>('/api/products/1', { price: 19.99 });

// DELETE
this.http.delete<void>('/api/products/1');

// Interceptor funcional
export const myInterceptor: HttpInterceptorFn = (req, next) => {
  const modified = req.clone({ setHeaders: { 'X-Custom': 'value' } });
  return next(modified).pipe(
    catchError(err => { /* handle */ return throwError(() => err); })
  );
};

// Registrar interceptors
provideHttpClient(withInterceptors([authInterceptor, retryInterceptor]))
```
